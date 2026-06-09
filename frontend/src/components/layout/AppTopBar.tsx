import { useState } from 'react';
import { useBankGuarantee } from '../../context/BankGuaranteeContext';
import { RMBadge } from '../ui/RMBadge';
import { NotificationPanel } from '../NotificationPanel';
import { DropdownManager } from '../DropdownManager';

interface AppTopBarProps {
  title: string;
}

export function AppTopBar({ title }: AppTopBarProps) {
  const { quantityUnit, toggleUnit, expiringSoonRecords } = useBankGuarantee();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 flex items-center justify-between select-none relative transition-colors duration-250">
      <h2 className="text-base font-semibold text-gray-800 dark:text-white tracking-tight">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Unit Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5 border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => quantityUnit !== 'kg' && toggleUnit()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              quantityUnit === 'kg'
                ? 'bg-white dark:bg-slate-750 text-navy-800 dark:text-navy-100 shadow-sm border border-gray-200/50 dark:border-slate-650'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            Kilograms (kg)
          </button>
          <button
            onClick={() => quantityUnit !== 'quintal' && toggleUnit()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              quantityUnit === 'quintal'
                ? 'bg-white dark:bg-slate-750 text-navy-800 dark:text-navy-100 shadow-sm border border-gray-200/50 dark:border-slate-650'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            Quintals (q)
          </button>
        </div>

        {/* Dropdown Manager Button */}
        <button
          onClick={() => setShowDropdowns(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-slate-350 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-750 hover:text-navy-800 dark:hover:text-navy-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Manage Dropdowns</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-250 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            // Sun Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Moon Icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-250 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
              showNotifications ? 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white' : ''
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <RMBadge count={expiringSoonRecords.length} className="absolute -top-1 -right-1 bg-amber-500 border-2 border-white dark:border-slate-900" />
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </div>

      {/* Dropdown Options Manager Modal */}
      <DropdownManager isOpen={showDropdowns} onClose={() => setShowDropdowns(false)} />
    </header>
  );
}
