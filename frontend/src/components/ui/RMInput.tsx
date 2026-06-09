import React from 'react';

interface RMInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const RMInput = React.forwardRef<HTMLInputElement, RMInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-gray-600 dark:text-slate-400 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-colors
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200 dark:focus:ring-red-900/40' 
              : 'border-gray-300 dark:border-slate-700 focus:border-navy-500 dark:focus:border-navy-400 focus:ring-1 focus:ring-navy-200 dark:focus:ring-navy-950'
            }
            ${props.readOnly ? 'bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-450 cursor-not-allowed' : ''}
            ${props.type === 'number' ? 'font-mono' : ''}
            focus:outline-none placeholder:text-gray-400 dark:placeholder:text-slate-500
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        {helperText && !error && <span className="text-xs text-gray-400 dark:text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

RMInput.displayName = 'RMInput';
