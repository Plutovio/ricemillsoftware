import { useState } from 'react';
import { useDeliveryOrder } from '../context/DeliveryOrderContext';
import type { DeliveryOrder as DOType, DeliveryOrderFilters } from '../types/deliveryOrder';
import { RMModal } from '../components/ui/RMModal';
import { RMInput } from '../components/ui/RMInput';
import { RMSelect } from '../components/ui/RMSelect';
import { RMButton } from '../components/ui/RMButton';
import { formatCurrency } from '../utils/formatDate';

export function DeliveryOrdersPage() {
  const {
    deliveryOrders,
    doTotalCount,
    loading,
    doFilters,
    doSelectedYear,
    doAvailableYears,
    doPage,
    doPageSize,
    setDoPage,
    createDO,
    updateDO,
    deleteDO,
    setDoFilters,
    clearDoFilters,
    setDoYear,
    addDoYear,
  } = useDeliveryOrder();

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DOType | null>(null);
  
  // Form fields
  const [doNumber, setDoNumber] = useState('');
  const [doDate, setDoDate] = useState('');
  const [source, setSource] = useState<'NAN' | 'FCI'>('NAN');
  const [quantityIssued, setQuantityIssued] = useState('');
  const [formError, setFormError] = useState('');

  // Filters state
  const [filterDoNo, setFilterDoNo] = useState(doFilters.do_number || '');
  const [filterSource, setFilterSource] = useState(doFilters.source || '');

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'add_year') {
      const yrStr = window.prompt("Enter a new year (e.g. 2028):");
      if (yrStr) {
        const yr = parseInt(yrStr);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          addDoYear(yr);
        } else {
          alert("Invalid year. Please enter a 4-digit number between 2000 and 2100.");
        }
      }
      e.target.value = String(doSelectedYear);
    } else {
      setDoYear(val === 'all' ? 'all' : parseInt(val));
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: DeliveryOrderFilters = {};
    if (filterDoNo.trim()) filters.do_number = filterDoNo.trim();
    if (filterSource) filters.source = filterSource as 'NAN' | 'FCI';
    setDoFilters(filters);
  };

  const handleClearFilters = () => {
    setFilterDoNo('');
    setFilterSource('');
    clearDoFilters();
  };

  const handleOpenCreateModal = () => {
    setEditingRecord(null);
    setDoNumber('');
    setDoDate(new Date().toISOString().split('T')[0]);
    setSource('NAN');
    setQuantityIssued('');
    setFormError('');
    setFormOpen(true);
  };

  const handleOpenEditModal = (rec: DOType) => {
    setEditingRecord(rec);
    setDoNumber(rec.do_number);
    setDoDate(rec.do_date);
    setSource(rec.source);
    setQuantityIssued(String(rec.do_quantity_issued));
    setFormError('');
    setFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const qty = parseFloat(quantityIssued);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Please enter a valid quantity greater than 0.');
      return;
    }

    try {
      const payload = {
        do_number: doNumber.trim(),
        do_date: doDate,
        source,
        do_quantity_issued: qty,
      };

      if (editingRecord) {
        await updateDO(editingRecord.id, payload);
      } else {
        await createDO(payload);
      }
      setFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Verify inputs.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this Delivery Order? This will cascadingly delete all associated weighbridge allocations.')) {
      try {
        await deleteDO(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete record.');
      }
    }
  };

  // Calculations for summary metrics
  const totalIssued = deliveryOrders.reduce((sum, item) => sum + parseFloat(String(item.do_quantity_issued || 0)), 0);
  const totalReceived = deliveryOrders.reduce((sum, item) => sum + parseFloat(String(item.total_quantity || 0)), 0);
  const totalMilled = deliveryOrders.reduce((sum, item) => sum + parseFloat(String(item.quantity_to_be_milled || 0)), 0);
  const totalRemaining = deliveryOrders.reduce((sum, item) => sum + parseFloat(String(item.remaining_quantity || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Orders (DO)</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Create and manage government allocation quotas (NAN / FCI)</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Year Select Dropdown */}
          <div className="relative">
            <select
              value={doSelectedYear}
              onChange={handleYearChange}
              className="px-3 py-2 text-xs font-semibold border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-navy-500 pr-8 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[position:right_6px_center] bg-no-repeat"
            >
              {doAvailableYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr === 'all' ? 'See All Years' : `Year ${yr}`}
                </option>
              ))}
              <option value="add_year" className="text-navy-600 dark:text-navy-400 font-bold">+ Add Year...</option>
            </select>
          </div>

          <RMButton onClick={handleOpenCreateModal} variant="primary">
            + New DO
          </RMButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Total Allocated Quantity</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-navy-800 dark:text-white font-mono">{formatCurrency(totalIssued)}</span>
            <span className="text-xs text-gray-500 font-semibold font-mono">kg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Total Dhan Received</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-green-600 dark:text-green-400 font-mono">{formatCurrency(totalReceived)}</span>
            <span className="text-xs text-gray-500 font-semibold font-mono">kg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Quantity to be Milled (67%)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">{formatCurrency(totalMilled)}</span>
            <span className="text-xs text-gray-500 font-semibold font-mono">kg</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl shadow-sm transition-colors">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Remaining Balance Quota</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(totalRemaining)}</span>
            <span className="text-xs text-gray-500 font-semibold font-mono">kg</span>
          </div>
        </div>
      </div>

      {/* Filter and Content panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors shadow-sm">
        {/* Filters Panel */}
        <form onSubmit={handleApplyFilters} className="p-4 bg-gray-50/50 dark:bg-slate-900/40 border-b border-gray-200 dark:border-slate-800 flex flex-wrap items-end gap-4">
          <div className="w-48">
            <RMInput
              label="Search DO Number"
              placeholder="e.g. NAN-001"
              value={filterDoNo}
              onChange={(e) => setFilterDoNo(e.target.value)}
            />
          </div>
          <div className="w-40">
            <RMSelect
              label="Source Agency"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              options={[
                { value: 'NAN', label: 'NAN' },
                { value: 'FCI', label: 'FCI' },
              ]}
              placeholder="All Agencies"
            />
          </div>
          <div className="flex gap-2">
            <RMButton type="submit" variant="primary" className="py-2 px-4 text-xs font-semibold h-[38px]">
              Apply
            </RMButton>
            <RMButton type="button" variant="outline" onClick={handleClearFilters} className="py-2 px-4 text-xs font-semibold h-[38px]">
              Clear
            </RMButton>
          </div>
        </form>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider select-none">
                <th className="px-6 py-3">DO Number</th>
                <th className="px-6 py-3">DO Date</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3 text-right">Quantity Issued (kg)</th>
                <th className="px-6 py-3 text-right">Total Dhan Delivered (kg)</th>
                <th className="px-6 py-3 text-right">Qty to be Milled (67%)</th>
                <th className="px-6 py-3 text-right">Remaining Quota (kg)</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
              {loading && deliveryOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 font-medium font-mono text-xs">
                    Loading records...
                  </td>
                </tr>
              ) : deliveryOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 font-medium">
                    No Delivery Orders found for this search.
                  </td>
                </tr>
              ) : (
                deliveryOrders.map((doRec) => (
                  <tr key={doRec.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{doRec.do_number}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-350">{doRec.do_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        doRec.source === 'NAN' 
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40' 
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40'
                      }`}>
                        {doRec.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-gray-800 dark:text-slate-200">{formatCurrency(doRec.do_quantity_issued)}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-green-600 dark:text-green-400">{formatCurrency(doRec.total_quantity)}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-blue-600 dark:text-blue-450">{formatCurrency(doRec.quantity_to_be_milled)}</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(doRec.remaining_quantity)}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3 select-none">
                        <button
                          onClick={() => handleOpenEditModal(doRec)}
                          className="text-navy-600 dark:text-navy-400 hover:text-navy-800 dark:hover:text-navy-200 text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(doRec.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination bar */}
        {doTotalCount > doPageSize && (
          <div className="p-4 bg-gray-50/50 dark:bg-slate-900/40 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-slate-400">
            <span>Showing {deliveryOrders.length} of {doTotalCount} records</span>
            <div className="flex gap-2">
              <RMButton
                disabled={doPage === 1}
                onClick={() => setDoPage(doPage - 1)}
                variant="outline"
                className="py-1 px-3"
              >
                Previous
              </RMButton>
              <RMButton
                disabled={doPage * doPageSize >= doTotalCount}
                onClick={() => setDoPage(doPage + 1)}
                variant="outline"
                className="py-1 px-3"
              >
                Next
              </RMButton>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <RMModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingRecord ? 'Edit Delivery Order' : 'Create Delivery Order'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {formError}
            </div>
          )}

          <RMInput
            label="DO Number"
            placeholder="e.g. DO/NAN/2026/009"
            value={doNumber}
            onChange={(e) => setDoNumber(e.target.value)}
            required
          />

          <RMInput
            label="DO Date"
            type="date"
            value={doDate}
            onChange={(e) => setDoDate(e.target.value)}
            required
          />

          <RMSelect
            label="Source Agency"
            value={source}
            onChange={(e) => setSource(e.target.value as 'NAN' | 'FCI')}
            options={[
              { value: 'NAN', label: 'NAN' },
              { value: 'FCI', label: 'FCI' },
            ]}
          />

          <RMInput
            label="DO Quantity Issued (in kg)"
            type="number"
            placeholder="e.g. 50000"
            value={quantityIssued}
            onChange={(e) => setQuantityIssued(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
            <RMButton type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </RMButton>
            <RMButton type="submit" variant="primary">
              {editingRecord ? 'Save Changes' : 'Create DO'}
            </RMButton>
          </div>
        </form>
      </RMModal>
    </div>
  );
}
