import { useState, useEffect } from 'react';
import { useBankGuarantee } from '../context/BankGuaranteeContext';
import { bankGuaranteeApi } from '../api/bankGuaranteeApi';
import type { BankGuarantee } from '../types/bankGuarantee';
import { formatCurrency, formatDate } from '../utils/formatDate';
import { convertQuantity } from '../utils/unitConversion';

export function Dashboard() {
  const { selectedYear, setYear, availableYears, addYear, quantityUnit, expiringSoonRecords } = useBankGuarantee();
  const [yearRecords, setYearRecords] = useState<BankGuarantee[]>([]);
  const [loading, setLoading] = useState(false);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'add_year') {
      const yrStr = window.prompt("Enter a new year (e.g. 2028):");
      if (yrStr) {
        const yr = parseInt(yrStr);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          addYear(yr);
        } else {
          alert("Invalid year. Please enter a 4-digit number between 2000 and 2100.");
        }
      }
      // Reset select display to the current selectedYear
      e.target.value = String(selectedYear);
    } else {
      setYear(val === 'all' ? 'all' : parseInt(val));
    }
  };

  // Fetch all records for the selected year (without pagination) to calculate exact sums
  useEffect(() => {
    async function fetchAllForYear() {
      setLoading(true);
      try {
        const response = await bankGuaranteeApi.fetchAll({
          year: selectedYear,
          page_size: 1000, // Large number to get all records for this year
        });
        // DRF might return paginated results or raw array depending on page_size configuration
        const data = response.data;
        if (data && 'results' in data) {
          setYearRecords(data.results);
        } else {
          setYearRecords(data as any || []);
        }
      } catch {
        setYearRecords([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAllForYear();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center select-none">
        <span className="text-xs font-semibold text-gray-500 font-mono">Loading Metrics & Analytics...</span>
      </div>
    );
  }

  // Calculations
  const totalCount = yearRecords.length;
  const totalBgAmount = yearRecords.reduce((sum, r) => sum + parseFloat(r.amount_of_bg || '0'), 0);
  const totalPdcAmount = yearRecords.reduce((sum, r) => sum + parseFloat(r.pdc || '0'), 0);
  const totalQuantityKg = yearRecords.reduce((sum, r) => sum + ((r.quantity || 0) * 100), 0);
  const convertedQty = convertQuantity(totalQuantityKg, quantityUnit);

  // Filter expired / expiring soon
  const today = new Date();
  today.setHours(0,0,0,0);
  const expiredRecords = yearRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry < today;
  });

  const expiringSoonCount = yearRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  // Bank distribution
  const bankDistribution = yearRecords.reduce((acc: Record<string, { count: number; amount: number }>, r) => {
    const bank = r.bank_name || 'Other';
    if (!acc[bank]) {
      acc[bank] = { count: 0, amount: 0 };
    }
    acc[bank].count += 1;
    acc[bank].amount += parseFloat(r.amount_of_bg || '0');
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Top Welcome & Year Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Operator Dashboard</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Rice Mill Bank Guarantee & security financial metrics for {selectedYear === 'all' ? 'All Years' : selectedYear}</p>
        </div>

        {/* Year Select Dropdown */}
        <div className="flex items-center gap-2 select-none">
          <label htmlFor="year-select-dash" className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            Year:
          </label>
          <select
            id="year-select-dash"
            value={selectedYear}
            onChange={handleYearChange}
            className="text-xs font-semibold text-navy-800 dark:text-navy-100 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-navy-500 transition-colors"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr === 'all' ? 'See All' : yr}
              </option>
            ))}
            <option value="add_year" className="text-navy-600 dark:text-navy-450 font-bold">
              + Add Year...
            </option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 select-none">
        {/* Total Guarantees */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total Guarantees</span>
            <span className="p-1 rounded-lg bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono leading-none">{totalCount}</h3>
            <span className="text-[10px] text-gray-400 dark:text-slate-450 font-medium mt-1 block">Active records in {selectedYear === 'all' ? 'All Years' : selectedYear}</span>
          </div>
        </div>

        {/* Total BG Amount */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total BG Amount</span>
            <span className="p-1 rounded-lg bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14a2 2 0 110-4h4" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono leading-none">₹ {formatCurrency(totalBgAmount)}</h3>
            <span className="text-[10px] text-gray-400 dark:text-slate-450 font-medium mt-1 block">Accumulated BG capital value</span>
          </div>
        </div>

        {/* Total PDC Value */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total PDC Amount (2/3)</span>
            <span className="p-1 rounded-lg bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono leading-none">₹ {formatCurrency(totalPdcAmount)}</h3>
            <span className="text-[10px] text-gray-400 dark:text-slate-450 font-medium mt-1 block">Security cheque value coverage</span>
          </div>
        </div>

        {/* Total Quantity */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Quantity Allocation</span>
            <span className="p-1 rounded-lg bg-navy-50 dark:bg-navy-950 text-navy-700 dark:text-navy-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono leading-none">
              {convertedQty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {quantityUnit}
            </h3>
            <span className="text-[10px] text-gray-400 dark:text-slate-455 font-medium mt-1 block">Capacity equivalent (Total / 2500)</span>
          </div>
        </div>
      </div>

      {/* Expiry Alerts & Statistics distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Expiring Soon Alerts widget */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:col-span-2 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Critical Expiries & Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Bank Guarantees expired or expiring in the next 30 days</p>
            </div>
            <span className="text-xs bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
              {expiringSoonRecords.length} Active Alerts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] divide-y divide-gray-100 dark:divide-slate-800 pr-1">
            {expiringSoonRecords.length === 0 ? (
              <div className="h-full flex items-center justify-center py-12 text-xs text-gray-400 dark:text-slate-500 font-medium bg-gray-50/50 dark:bg-slate-950/20 rounded-lg">
                No active expiration alerts. All guarantees are valid.
              </div>
            ) : (
              expiringSoonRecords.map((bg) => {
                const expiry = new Date(bg.expiry_date);
                const diff = expiry.getTime() - today.getTime();
                const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft < 0;

                return (
                  <div key={bg.id} className="py-3 flex items-center justify-between hover:bg-gray-50/40 dark:hover:bg-slate-850/30 px-2 rounded-lg transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono">{bg.bg_number}</span>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">{bg.bank_name}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500">
                        Dept: <span className="font-medium text-gray-600 dark:text-slate-350">{bg.department}</span> | Expiry: <span className="font-mono">{formatDate(bg.expiry_date)}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                        isOverdue 
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300' 
                          : daysLeft <= 10 
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {isOverdue ? 'EXPIRED' : `${daysLeft} Days Left`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bank Breakdown Widget */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Bank Capital Breakdown</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Capital allocation distribution by banking institution</p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {Object.keys(bankDistribution).length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-550 font-medium">
                  No distribution data.
                </div>
              ) : (
                Object.entries(bankDistribution).map(([bank, data]) => {
                  const percentage = totalBgAmount > 0 ? (data.amount / totalBgAmount) * 100 : 0;
                  return (
                    <div key={bank} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700 dark:text-slate-200 truncate max-w-[140px]">{bank}</span>
                        <span className="font-mono text-gray-500 dark:text-slate-450">₹ {formatCurrency(data.amount)} ({data.count})</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-navy-600 dark:bg-navy-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-3 mt-4 flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-450">
            <span>Critical alerts (Expired): <strong className="text-red-600 dark:text-red-400 font-mono">{expiredRecords.length}</strong></span>
            <span>Warning status (30d): <strong className="text-amber-600 dark:text-amber-400 font-mono">{expiringSoonCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
