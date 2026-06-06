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

  const columns = [
    { key: 'bg_number', label: 'BG Number', sortable: true },
    { key: 'bank_name', label: 'Bank Name', sortable: true },
    { key: 'branch_name', label: 'Branch Name', sortable: true },
    { key: 'ifsc_code', label: 'IFSC Code', sortable: false },
    { key: 'account_no', label: 'Account No.', sortable: false },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'amount_of_bg', label: 'Amount of BG', sortable: true },
    { key: 'pdc', label: 'PDC', sortable: false },
    { key: 'total_amount', label: 'Total Amount', sortable: false },
    { key: 'quantity', label: `Quantity (${quantityUnit})`, sortable: false },
    { key: 'issue_date', label: 'Issue Date', sortable: true },
    { key: 'expiry_date', label: 'Expiry Date', sortable: true },
    { key: 'no_of_days', label: 'No. of Days', sortable: false },
    { key: 'cheque_number', label: 'Cheque Number', sortable: false },
    { key: 'date_of_issue_of_cheque', label: 'Cheque Date', sortable: false },
    { key: 'bank_name_of_cheque', label: 'Cheque Bank', sortable: false },
    { key: 'account_no_of_cheque', label: 'Cheque Account', sortable: false },
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
      return 'bg-red-50 hover:bg-red-100/70 border-l-4 border-l-red-500';
    }
    if (daysLeft <= 30) {
      return 'bg-amber-50/70 hover:bg-amber-100/70 border-l-4 border-l-amber-500';
    }
    return 'hover:bg-gray-50 border-l-4 border-l-transparent';
  };

  return (
    <div className="space-y-4">
      {/* Table Container with Horizontal Scroll */}
      <div className="table-container shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase select-none">
                <th className="px-4 py-3 border-r border-gray-200">Actions</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 border-r border-gray-200 ${
                      col.sortable ? 'cursor-pointer hover:bg-gray-200 group' : ''
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
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && records.length === 0 ? (
                <tr>
                  <td colSpan={18} className="px-6 py-10 text-center text-sm text-gray-500">
                    Loading bank guarantees...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={18} className="px-6 py-10 text-center text-sm text-gray-400">
                    No bank guarantee records found for this year or filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((bg) => (
                  <tr key={bg.id} className={`text-xs transition-colors ${getRowClass(bg)}`}>
                    {/* Actions Column */}
                    <td className="px-4 py-3 font-medium border-r border-gray-200 flex gap-2 justify-center">
                      <button
                        onClick={() => onEdit(bg)}
                        className="text-navy-600 hover:text-navy-900 font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => onDelete(bg.id)}
                        className="text-red-600 hover:text-red-900 font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </td>

                    {/* Formatted Data Columns */}
                    <td className="px-4 py-3 font-mono font-semibold text-gray-950 border-r border-gray-200">
                      {bg.bg_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-200">
                      {bg.bank_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 border-r border-gray-200">
                      {bg.branch_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 border-r border-gray-200">
                      {bg.ifsc_code}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-600 border-r border-gray-200">
                      {bg.account_no}
                    </td>
                    <td className="px-4 py-3 text-gray-600 border-r border-gray-200">
                      {bg.department}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-900 border-r border-gray-200">
                      ₹ {formatCurrency(bg.amount_of_bg)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-600 border-r border-gray-200">
                      ₹ {formatCurrency(bg.pdc)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-800 border-r border-gray-200">
                      ₹ {formatCurrency(bg.total_amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-900 border-r border-gray-200 font-semibold">
                      {convertQuantity(bg.quantity, quantityUnit).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 border-r border-gray-200">
                      {formatDate(bg.issue_date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700 border-r border-gray-200 font-medium">
                      {formatDate(bg.expiry_date)}
                    </td>
                    <td className="px-4 py-3 font-mono text-right text-gray-600 border-r border-gray-200">
                      {bg.no_of_days}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 border-r border-gray-200">
                      {bg.cheque_number || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 border-r border-gray-200">
                      {formatDate(bg.date_of_issue_of_cheque)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 border-r border-gray-200">
                      {bg.bank_name_of_cheque || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 border-r border-gray-200">
                      {bg.account_no_of_cheque || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 rounded-lg shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-750 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-750 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{' '}
                of <span className="font-semibold">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
