import { useEffect, useRef } from 'react';
import { useBankGuarantee } from '../context/BankGuaranteeContext';
import { formatDate } from '../utils/formatDate';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { expiringSoonRecords, loading } = useBankGuarantee();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden animate-slide-down transition-colors"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Alerts & Notifications</h3>
        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
          {expiringSoonRecords.length} expiring soon
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
        {loading ? (
          <div className="p-4 text-center text-xs text-gray-500 dark:text-slate-400 font-medium">Loading notifications...</div>
        ) : expiringSoonRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">
            No active alerts. All guarantees are in good standing.
          </div>
        ) : (
          expiringSoonRecords.map((bg) => {
            const today = new Date();
            const expiry = new Date(bg.expiry_date);
            const diffTime = expiry.getTime() - today.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;

            return (
              <div key={bg.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
                    {bg.bg_number}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-350'
                        : daysLeft <= 10
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-350'
                    }`}
                  >
                    {isOverdue ? 'Expired' : `${daysLeft} days left`}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 dark:text-slate-300">
                  <span className="font-medium">{bg.bank_name}</span> ({bg.department})
                </div>
                <div className="text-[10px] text-gray-400 dark:text-slate-450 font-mono">
                  Expiry Date: {formatDate(bg.expiry_date)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
