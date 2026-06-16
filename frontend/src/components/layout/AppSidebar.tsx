import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBankGuarantee } from '../../context/BankGuaranteeContext';
import { RMBadge } from '../ui/RMBadge';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { expiringSoonRecords } = useBankGuarantee();

  const activeClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-navy-50 text-navy-800 dark:bg-navy-950 dark:text-navy-205 transition-colors";
  const inactiveClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 dark:text-slate-400 hover:text-navy-800 dark:hover:text-navy-200 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors";

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 h-screen flex flex-col justify-between select-none transition-colors duration-250">
      <div className="flex flex-col flex-1 p-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Rice Mill ERP</h1>
            <span className="text-[10px] text-gray-500 dark:text-slate-500 font-medium tracking-wider uppercase">Management Suite</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/bank-guarantees" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Bank Guarantees</span>
              </div>
              <RMBadge count={expiringSoonRecords.length} className="bg-amber-500" />
            </div>
          </NavLink>

          <NavLink 
            to="/delivery-orders" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Delivery Orders</span>
          </NavLink>

          <NavLink 
            to="/kaanta-parchi" 
            className={({ isActive }) => isActive ? activeClass : inactiveClass}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17h5" />
            </svg>
            <span>Kaanta Parchi</span>
          </NavLink>
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2 py-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-navy-100 dark:bg-navy-950 flex items-center justify-center text-navy-800 dark:text-navy-200 font-semibold text-sm">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username}</h2>
            <span className="text-[10px] text-gray-500 dark:text-slate-450 font-mono truncate block">{user?.email || 'operator@ricemill.com'}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium rounded-lg text-red-600 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout Operator</span>
        </button>
      </div>
    </aside>
  );
}
