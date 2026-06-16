import type { BankGuarantee } from '../types/bankGuarantee';
import { useBankGuarantee } from '../context/BankGuaranteeContext';
import { formatDate, formatCurrency } from '../utils/formatDate';
import { convertQuantity } from '../utils/unitConversion';

interface BankGuaranteeTableProps {
  onEdit: (record: BankGuarantee) => void;
  onDelete: (id: number) => void;
}

export function BankGuaranteeTable({ onEdit, onDelete }: BankGuaranteeTableProps) {
  const { 
    records, 
    loading, 
    ordering, 
    setOrdering, 
    quantityUnit,
    currentPage,
    totalCount,
    pageSize,
    setCurrentPage
  } = useBankGuarantee();

  // Summing financial and quantity values for current records list
  const totalAmountOfBg = records.reduce((sum, r) => sum + (parseFloat(String(r.amount_of_bg)) || 0), 0);
  const totalPdc = records.reduce((sum, r) => sum + (parseFloat(String(r.pdc)) || 0), 0);
  const totalTotalAmount = records.reduce((sum, r) => sum + (parseFloat(String(r.total_amount)) || 0), 0);
  const totalQuantity = records.reduce((sum, r) => sum + ((parseFloat(String(r.quantity)) || 0) * 100), 0);

  const columns = [
    { key: 'bg_number', label: 'BG Number', sortable: true },
    { key: 'bank_name', label: 'Bank Name', sortable: true },
    { key: 'branch_name', label: 'Branch Name', sortable: true },
    { key: 'ifsc_code', label: 'IFSC Code', sortable: false },
    { key: 'debit_account_no', label: 'Debit Account No.', sortable: false },
    { key: 'bg_account_no', label: 'BG Account No.', sortable: false },
    { key: 'payment_mode', label: 'Payment Mode', sortable: false },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'amount_of_bg', label: 'Amount of BG', sortable: true },
    { key: 'pdc', label: 'PDC', sortable: false },
    { key: 'total_amount', label: 'Total Amount', sortable: false },
    { key: 'quantity', label: `Quantity (${quantityUnit})`, sortable: false },
    { key: 'issue_date', label: 'Issue Date', sortable: true },
    { key: 'expiry_date', label: 'Expiry Date', sortable: true },
    { key: 'no_of_days', label: 'No. of Days', sortable: false },
    // Cheque/Online details
    { key: 'cheque_number', label: 'Cheque/Txn No.', sortable: false },
    { key: 'date_of_issue_of_cheque', label: 'Cheque/Txn Date', sortable: false },
    { key: 'bank_name_of_cheque', label: 'Cheque Bank/Online Mode', sortable: false },
    { key: 'account_no_of_cheque', label: 'Cheque Account/Online Bank', sortable: false },
    // PDC Cheque details
    { key: 'pdc_cheque_number', label: 'PDC Cheque No.', sortable: false },
    { key: 'pdc_date_of_issue_of_cheque', label: 'PDC Cheque Date', sortable: false },
    { key: 'pdc_bank_name_of_cheque', label: 'PDC Cheque Bank', sortable: false },
    { key: 'pdc_account_no_of_cheque', label: 'PDC Cheque Account', sortable: false },
  ];

  const handleSort = (key: string) => {
    if (ordering === key) {
      setOrdering(`-${key}`);
    } else {
      setOrdering(key);
    }
  };

  const getSortIcon = (key: string) => {
    if (ordering === key) {
      return (
        <svg className="w-3.5 h-3.5 ml-1 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }
    if (ordering === `-${key}`) {
      return (
        <svg className="w-3.5 h-3.5 ml-1 text-navy-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 ml-1 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  };

  // Pagination details
  const totalPages = Math.ceil(totalCount / pageSize);

  const getRowClass = (bg: BankGuarantee) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(bg.expiry_date);
    expiry.setHours(0,0,0,0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/40 border-l-4 border-l-red-500 text-red-900 dark:text-red-300';
    }
    if (daysLeft <= 30) {
      return 'bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/70 dark:hover:bg-amber-950/40 border-l-4 border-l-amber-500 text-amber-900 dark:text-amber-300';
    }
    return 'hover:bg-gray-50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent text-gray-700 dark:text-slate-350';
  };

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="table-container shadow-sm overflow-hidden border border-gray-200 dark:border-slate-800 rounded-xl transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[2200px]">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-700 dark:text-slate-300 uppercase select-none">
                <th className="px-4 py-3 border-r border-gray-200 dark:border-slate-800">Actions</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 border-r border-gray-200 dark:border-slate-800 ${
                      col.sortable ? 'cursor-pointer hover:bg-gray-250 dark:hover:bg-slate-750 group' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center">
                      <span>{col.label}</span>
                      {col.sortable && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={24} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                    Loading bank guarantees...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={24} className="px-6 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                    No bank guarantee records found for this year or filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((bg) => (
                  <tr key={bg.id} className={`text-xs transition-colors ${getRowClass(bg)}`}>
                    {/* Actions Column */}
                    <td className="px-4 py-3 font-medium border-r border-gray-200 dark:border-slate-800 flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(bg)}
                        className="text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-navy-300 font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300 dark:text-slate-700">|</span>
                      <button
                        onClick={() => onDelete(bg.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>

                    {/* Formatted Data Columns */}
                    <td className="px-4 py-3 font-mono font-semibold text-gray-950 dark:text-white border-r border-gray-200 dark:border-slate-800">
                      {bg.bg_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800">
                      {bg.bank_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      {bg.branch_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.ifsc_code}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      {bg.debit_account_no}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      {bg.bg_account_no || '—'}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800 select-none">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        bg.payment_mode === 'online'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900/40'
                          : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40'
                      }`}>
                        {bg.payment_mode || 'cheque'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      {bg.department}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800">
                      ₹ {formatCurrency(bg.amount_of_bg)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      ₹ {formatCurrency(bg.pdc)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-800 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800">
                      ₹ {formatCurrency(bg.total_amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-900 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800 font-semibold">
                      {convertQuantity(bg.quantity * 100, quantityUnit).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {formatDate(bg.issue_date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700 dark:text-slate-300 border-r border-gray-200 dark:border-slate-800 font-medium">
                      {formatDate(bg.expiry_date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-600 dark:text-slate-350 border-r border-gray-200 dark:border-slate-800">
                      {bg.no_of_days}
                    </td>
                    {/* Cheque / Online Details */}
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.payment_mode === 'online' ? (bg.online_transaction_id || '—') : (bg.cheque_number || '—')}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.payment_mode === 'online' ? formatDate(bg.online_transaction_date) : formatDate(bg.date_of_issue_of_cheque)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.payment_mode === 'online' ? (bg.online_payment_mode || '—') : (bg.bank_name_of_cheque || '—')}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.payment_mode === 'online' ? (bg.online_bank_name || '—') : (bg.account_no_of_cheque || '—')}
                    </td>
                    {/* PDC Cheque Details */}
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.pdc_cheque_number || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {formatDate(bg.pdc_date_of_issue_of_cheque)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800">
                      {bg.pdc_bank_name_of_cheque || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-slate-400 border-r border-gray-200 dark:border-slate-800 font-semibold text-gray-800 dark:text-slate-200">
                      {bg.pdc_account_no_of_cheque || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-700 text-xs font-bold text-gray-900 dark:text-white select-none">
                  <td className="px-4 py-3 font-semibold text-center border-r border-gray-200 dark:border-slate-800">
                    Total
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 font-mono text-right border-r border-gray-200 dark:border-slate-800">
                    ₹ {formatCurrency(totalAmountOfBg)}
                  </td>
                  <td className="px-4 py-3 font-mono text-right border-r border-gray-200 dark:border-slate-800">
                    ₹ {formatCurrency(totalPdc)}
                  </td>
                  <td className="px-4 py-3 font-mono text-right border-r border-gray-200 dark:border-slate-800">
                    ₹ {formatCurrency(totalTotalAmount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-right border-r border-gray-200 dark:border-slate-800">
                    {convertQuantity(totalQuantity, quantityUnit).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-slate-800"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 rounded-lg shadow-sm transition-colors">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-gray-750 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-gray-750 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-750 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-slate-400">
                Showing <span className="font-semibold text-gray-800 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold text-gray-800 dark:text-white">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of <span className="font-semibold text-gray-800 dark:text-white">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-slate-400 ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-3 py-2 text-xs font-semibold focus:z-20 ${
                      currentPage === page
                        ? 'z-10 bg-navy-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600'
                        : 'text-gray-900 dark:text-slate-300 ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-slate-400 ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
