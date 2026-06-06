import React from 'react';

interface RMDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const RMDatePicker = React.forwardRef<HTMLInputElement, RMDatePickerProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
              : 'border-gray-300 focus:border-navy-500 focus:ring-1 focus:ring-navy-200'
            }
            focus:outline-none font-mono
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

RMDatePicker.displayName = 'RMDatePicker';
