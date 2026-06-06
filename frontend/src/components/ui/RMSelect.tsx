import React from 'react';

interface RMSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const RMSelect = React.forwardRef<HTMLSelectElement, RMSelectProps>(
  ({ label, error, options, placeholder = 'Select...', className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white transition-colors
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
              : 'border-gray-300 focus:border-navy-500 focus:ring-1 focus:ring-navy-200'
            }
            focus:outline-none appearance-none
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]
            bg-[length:20px] bg-[position:right_8px_center] bg-no-repeat pr-10
            ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

RMSelect.displayName = 'RMSelect';
