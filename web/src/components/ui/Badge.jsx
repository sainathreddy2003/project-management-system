import React from 'react';
import { cn } from '../../lib/utils.js';

export function ProjectStatusBadge({ status, className }) {
  const configs = {
    NOT_STARTED: {
      label: 'Not Started',
      styles: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    COMPLETED: {
      label: 'Completed',
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  };

  const current = configs[status] || { label: status, styles: 'bg-zinc-100 text-zinc-700 border-zinc-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium rounded border',
        current.styles,
        className
      )}
    >
      {current.label}
    </span>
  );
}

export function TaskPriorityBadge({ priority, className }) {
  const configs = {
    HIGH: {
      label: 'High',
      styles: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    MEDIUM: {
      label: 'Medium',
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    LOW: {
      label: 'Low',
      styles: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  };

  const current = configs[priority] || { label: priority, styles: 'bg-zinc-100 text-zinc-700 border-zinc-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-medium rounded border uppercase tracking-wider',
        current.styles,
        className
      )}
    >
      {current.label}
    </span>
  );
}

export function TaskStatusBadge({ status, className }) {
  const configs = {
    PENDING: {
      label: 'Pending',
      styles: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      styles: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    COMPLETED: {
      label: 'Completed',
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  };

  const current = configs[status] || { label: status, styles: 'bg-zinc-100 text-zinc-700 border-zinc-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-medium rounded border',
        current.styles,
        className
      )}
    >
      {current.label}
    </span>
  );
}
