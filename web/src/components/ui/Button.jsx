import React from 'react';
import { cn } from '../../lib/utils.js';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-xs active:translate-y-px',
    secondary: 'bg-white text-graphite-900 border border-surface-border hover:bg-surface-muted shadow-xs',
    outline: 'border border-surface-border text-graphite-700 hover:bg-surface-muted',
    destructive: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800',
    ghost: 'text-graphite-700 hover:bg-surface-muted',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-7',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 h-9',
    lg: 'text-sm px-4 py-2.5 gap-2.5 h-10',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}
