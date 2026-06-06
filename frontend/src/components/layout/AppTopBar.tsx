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

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between select-none relative">
      <h2 className="text-base font-semibold text-gray-800 tracking-tight">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Unit Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
          <button
            onClick={() => quantityUnit !== 'kg' && toggleUnit()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              quantityUnit === 'kg'
                ? 'bg-white text-navy-800 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Kilograms (kg)
          </button>
          <button
            onClick={() => quantityUnit !== 'quintal' && toggleUnit()}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              quantityUnit === 'quintal'
                ? 'bg-white text-navy-800 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Quintals (q)
          </button>
        </div>

        {/* Dropdown Manager Button */}
        <button
          onClick={() => setShowDropdowns(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-navy-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span>Manage Dropdowns</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${
              showNotifications ? 'bg-gray-100 text-gray-800' : ''
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <RMBadge count={expiringSoonRecords.length} className="absolute -top-1 -right-1 bg-amber-500 border-2 border-white" />
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
