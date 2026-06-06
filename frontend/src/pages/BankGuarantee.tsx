import { useState } from 'react';
import { useBankGuarantee } from '../context/BankGuaranteeContext';
import type { BankGuarantee as BGType, BankGuaranteeFilters } from '../types/bankGuarantee';
import { BankGuaranteeTable } from '../components/BankGuaranteeTable';
import { BankGuaranteeForm } from '../components/BankGuaranteeForm';
import { RMModal } from '../components/ui/RMModal';
import { RMInput } from '../components/ui/RMInput';
import { RMButton } from '../components/ui/RMButton';

export function BankGuaranteePage() {
  const { 
    createRecord, 
    updateRecord, 
    deleteRecord, 
    setFilters, 
    clearFilters, 
    activeFilters,
    importRecords,
    exportRecords,
    loading
  } = useBankGuarantee();

  // Filters state
  const [bankName, setBankName] = useState(activeFilters.bank_name || '');
  const [branchName, setBranchName] = useState(activeFilters.branch_name || '');
  const [bgNumber, setBgNumber] = useState(activeFilters.bg_number || '');
  const [department, setDepartment] = useState(activeFilters.department || '');
  const [expiryFrom, setExpiryFrom] = useState(activeFilters.expiry_date_from || '');
  const [expiryTo, setExpiryTo] = useState(activeFilters.expiry_date_to || '');

  // Form modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BGType | null>(null);

  // Import modal states
  const [importOpen, setImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; total_rows: number; errors: any[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Handle filter submission
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: BankGuaranteeFilters = {};
    if (bankName.trim()) filters.bank_name = bankName.trim();
    if (branchName.trim()) filters.branch_name = branchName.trim();
    if (bgNumber.trim()) filters.bg_number = bgNumber.trim();
    if (department.trim()) filters.department = department.trim();
    if (expiryFrom) filters.expiry_date_from = expiryFrom;
    if (expiryTo) filters.expiry_date_to = expiryTo;
    
    setFilters(filters);
  };

  const handleClearFilters = () => {
    setBankName('');
    setBranchName('');
    setBgNumber('');
    setDepartment('');
    setExpiryFrom('');
    setExpiryTo('');
    clearFilters();
  };

  // Handle Form onSubmit
  const handleFormSubmit = async (data: any) => {
    if (editingRecord) {
      await updateRecord(editingRecord.id, data);
    } else {
      await createRecord(data);
    }
    setFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: BGType) => {
    setEditingRecord(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this Bank Guarantee record?')) {
      try {
        await deleteRecord(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete record.');
      }
    }
  };

  // Handle Import
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
      setImportError('');
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setImporting(true);
    setImportError('');
    setImportResult(null);
    try {
      const result = await importRecords(selectedFile);
      setImportResult(result as any);
    } catch (err: any) {
      setImportError(err.response?.data?.error || 'Failed to import file. Verify header structure.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bank Guarantee Management</h2>
          <p className="text-xs text-gray-500 font-medium">Verify, import, and log financial security agreements</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Excel Button */}
          <RMButton
            variant="outline"
            onClick={exportRecords}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Excel</span>
          </RMButton>

          {/* Import Button */}
          <RMButton
            variant="outline"
            onClick={() => {
              setImportOpen(true);
              setSelectedFile(null);
              setImportResult(null);
              setImportError('');
            }}
            className="flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Import Excel/CSV</span>
          </RMButton>

          {/* Create New Button */}
          <RMButton
            variant="primary"
            onClick={() => {
              setEditingRecord(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Guarantee</span>
          </RMButton>
        </div>
      </div>

      {/* Filters Form Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <RMInput
              label="Bank Name"
              placeholder="Fuzzy search"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <RMInput
              label="Branch Name"
              placeholder="Fuzzy search"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <RMInput
              label="BG Number"
              placeholder="Exact search"
              value={bgNumber}
              onChange={(e) => setBgNumber(e.target.value)}
            />
            <RMInput
              label="Department"
              placeholder="Search dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <RMInput
              label="Expiry From"
              type="date"
              value={expiryFrom}
              onChange={(e) => setExpiryFrom(e.target.value)}
              className="font-mono text-xs"
            />
            <RMInput
              label="Expiry To"
              type="date"
              value={expiryTo}
              onChange={(e) => setExpiryTo(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-150 select-none">
            <RMButton type="button" variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </RMButton>
            <RMButton type="submit" variant="primary">
              Apply Filters
            </RMButton>
          </div>
        </form>
      </div>

      {/* Bank Guarantee List Table */}
      <BankGuaranteeTable onEdit={handleEdit} onDelete={handleDelete} />

      {/* CREATE & EDIT FORM MODAL */}
      <RMModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
        }}
        title={editingRecord ? 'Edit Bank Guarantee Record' : 'Create Bank Guarantee Record'}
        size="xl"
      >
        <BankGuaranteeForm
          record={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditingRecord(null);
          }}
        />
      </RMModal>

      {/* IMPORT EXCEL & CSV MODAL */}
      <RMModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        title="Import Guarantees from Spreadsheet"
        size="md"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 font-medium">
            Upload a `.xlsx` or `.csv` file. Columns will be matched flexibly based on names (e.g. "Bank Name", "BG Number", etc.).
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-navy-500 transition-colors relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-1.5 select-none">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-xs font-semibold text-gray-700">
                {selectedFile ? selectedFile.name : 'Choose file or drag here'}
              </div>
              {selectedFile && (
                <div className="text-[10px] text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>

          {importError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg font-mono">
              {importError}
            </div>
          )}

          {importResult && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-900 flex items-center justify-between">
                <span>Import Summary:</span>
                <span className="text-[10px] uppercase font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Success
                </span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>Total rows processed: <span className="font-semibold">{importResult.total_rows}</span></li>
                <li>Successfully imported: <span className="font-semibold text-green-600">{importResult.imported}</span></li>
                <li>Failed rows: <span className="font-semibold text-red-600">{importResult.errors.length}</span></li>
              </ul>
              {importResult.errors.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-1.5 border-t border-gray-200 pt-3">
                  <span className="text-[10px] font-bold text-red-500 uppercase block tracking-wider">Row Errors:</span>
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="text-[10px] font-mono text-red-600 leading-normal">
                      Row {err.row}: {typeof err.errors === 'object' ? JSON.stringify(err.errors) : err.errors}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 select-none">
            <RMButton type="button" variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
              Cancel
            </RMButton>
            <RMButton type="submit" variant="primary" disabled={!selectedFile || importing}>
              {importing ? 'Importing...' : 'Upload File'}
            </RMButton>
          </div>
        </form>
      </RMModal>
    </div>
  );
}
