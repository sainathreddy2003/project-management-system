import React from 'react';
import { cn } from '../../lib/utils.js';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button.jsx';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse bg-zinc-200/80 rounded', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="w-full bg-white border border-surface-border rounded-md overflow-hidden">
      <div className="h-10 bg-surface-header border-b border-surface-border px-4 flex items-center gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-24" />
        ))}
      </div>
      <div className="divide-y divide-surface-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-12 px-4 flex items-center gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 w-full max-w-[140px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, actionText, onAction, className }) {
  return (
    <div
      className={cn(
        'w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-dashed border-surface-border rounded-md',
        className
      )}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-graphite-500 mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-graphite-900">{title}</h3>
      <p className="text-xs text-graphite-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function ErrorBanner({ message, onRetry, className }) {
  return (
    <div
      className={cn(
        'w-full p-4 bg-rose-50 border border-rose-200 rounded-md flex items-center justify-between gap-3 text-rose-800',
        className
      )}
    >
      <div className="flex items-center gap-2.5 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
        <span>{message || 'Could not load data. Check your connection and try again.'}</span>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          className="text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
