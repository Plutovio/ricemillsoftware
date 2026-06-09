import { useState, useEffect } from 'react';
import { dropdownApi } from '../api/dropdownApi';
import type { DropdownOption, DropdownCategory } from '../types/dropdown';
import { RMModal } from './ui/RMModal';
import { RMInput } from './ui/RMInput';
import { RMButton } from './ui/RMButton';

interface DropdownManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: DropdownCategory; label: string; hasIfsc: boolean }[] = [
  { key: 'bank_name', label: 'Banks', hasIfsc: false },
  { key: 'branch_name', label: 'Branches', hasIfsc: true },
  { key: 'debit_account_no', label: 'Debit Accounts', hasIfsc: false },
  { key: 'department', label: 'Departments', hasIfsc: false },
  { key: 'account_no_of_cheque', label: 'Cheque Accounts', hasIfsc: false },
];

export function DropdownManager({ isOpen, onClose }: DropdownManagerProps) {
  const [activeCategory, setActiveCategory] = useState<DropdownCategory>('bank_name');
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [error, setError] = useState('');

  const activeCategoryConfig = CATEGORIES.find(c => c.key === activeCategory);

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen, activeCategory]);

  async function fetchOptions() {
    setLoading(true);
    setError('');
    try {
      const response = await dropdownApi.fetchOptions(activeCategory);
      // DRF response might be paginated or array
      const data = response.data;
      if (Array.isArray(data)) {
        setOptions(data);
      } else if (data && typeof data === 'object' && 'results' in data) {
        setOptions((data as any).results);
      } else {
        setOptions([]);
      }
    } catch {
      setOptions([]);
      setError('Failed to load options.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue.trim()) return;
    setError('');
    try {
      const meta = activeCategoryConfig?.hasIfsc && newIfsc.trim()
        ? { ifsc: newIfsc.trim().toUpperCase() }
        : undefined;

      await dropdownApi.addOption({
        category: activeCategory,
        value: newValue.trim(),
        meta
      });
      setNewValue('');
      setNewIfsc('');
      fetchOptions();
    } catch (err: any) {
      setError(err.response?.data?.value?.[0] || err.response?.data?.non_field_errors?.[0] || 'Failed to add option');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this option?')) return;
    try {
      await dropdownApi.deleteOption(id);
      fetchOptions();
    } catch {
      setError('Failed to delete option.');
    }
  }

  return (
    <RMModal isOpen={isOpen} onClose={onClose} title="Manage Dropdown Options" size="lg">
      <div className="flex gap-6 min-h-[400px]">
        {/* Left Side: Category Selection Tabs */}
        <div className="w-48 border-r border-gray-200 pr-4 flex flex-col gap-1 select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setNewValue('');
                setNewIfsc('');
              }}
              className={`text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeCategory === cat.key
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-navy-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Side: Options Management */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                {activeCategoryConfig?.label} Options
              </h3>
              <p className="text-xs text-gray-500">
                Add or remove options available in fields across the application.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Add New Option Form */}
            <form onSubmit={handleAdd} className="flex items-end gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex-1">
                <RMInput
                  label={`New ${activeCategoryConfig?.label.slice(0, -1)}`}
                  placeholder="e.g. Canara Bank"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required
                />
              </div>

              {activeCategoryConfig?.hasIfsc && (
                <div className="w-32">
                  <RMInput
                    label="IFSC Code"
                    placeholder="CNRB0001234"
                    value={newIfsc}
                    onChange={(e) => setNewIfsc(e.target.value)}
                    required
                  />
                </div>
              )}

              <RMButton type="submit" variant="primary" className="py-2.5">
                Add
              </RMButton>
            </form>

            {/* Options List */}
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[250px] overflow-y-auto">
              {loading && options.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500 font-medium">
                  Loading options...
                </div>
              ) : options.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 font-medium bg-gray-50/50">
                  No options added yet.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-2">Value</th>
                      {activeCategoryConfig?.hasIfsc && <th className="px-4 py-2">IFSC</th>}
                      <th className="px-4 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {options.map((opt) => (
                      <tr key={opt.id} className="text-xs hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{opt.value}</td>
                        {activeCategoryConfig?.hasIfsc && (
                          <td className="px-4 py-2.5 font-mono text-gray-600">
                            {opt.meta?.ifsc || '—'}
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(opt.id)}
                            className="text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-6 flex justify-end">
            <RMButton variant="outline" onClick={onClose}>
              Close
            </RMButton>
          </div>
        </div>
      </div>
    </RMModal>
  );
}
