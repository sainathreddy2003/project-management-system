import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

export const Input = forwardRef(function Input(
  { label, error, helperText, className, id, type = 'text', required, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-graphite-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={cn(
          'w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-surface-border rounded text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors',
          error && 'border-rose-400 focus:ring-rose-400 focus:border-rose-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-graphite-500">{helperText}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, helperText, options = [], className, id, required, children, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-graphite-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-surface-border rounded text-graphite-900 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors',
          error && 'border-rose-400 focus:ring-rose-400 focus:border-rose-400',
          className
        )}
        {...props}
      >
        {children
          ? children
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-graphite-500">{helperText}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className, id, required, rows = 3, ...props },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-graphite-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-3 py-2 text-xs sm:text-sm bg-white border border-surface-border rounded text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors',
          error && 'border-rose-400 focus:ring-rose-400 focus:border-rose-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-graphite-500">{helperText}</p>}
    </div>
  );
});
