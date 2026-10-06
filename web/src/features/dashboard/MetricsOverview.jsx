import React from 'react';
import { FolderKanban, CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';

export function MetricsOverview({ metrics = {} }) {
  const cards = [
    {
      label: 'Total Projects',
      value: metrics.totalProjects ?? 0,
      sublabel: `${metrics.projectsInProgress ?? 0} in progress`,
      icon: FolderKanban,
      color: 'text-graphite-700',
    },
    {
      label: 'Total Tasks',
      value: metrics.totalTasks ?? 0,
      sublabel: `${metrics.tasksDueToday ?? 0} due today`,
      icon: CheckCircle2,
      color: 'text-graphite-700',
    },
    {
      label: 'Tasks Completed',
      value: metrics.completedTasks ?? 0,
      sublabel: `${metrics.completionPercentage ?? 0}% overall completion`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      label: 'Tasks In Progress',
      value: metrics.inProgressTasks ?? 0,
      sublabel: 'Active development',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      label: 'Pending Tasks',
      value: metrics.pendingTasks ?? 0,
      sublabel: `${metrics.overdueTasks ?? 0} overdue`,
      icon: AlertCircle,
      color: metrics.overdueTasks > 0 ? 'text-rose-600' : 'text-graphite-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-3.5 bg-white border border-surface-border rounded-md shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-graphite-500 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-medium text-graphite-500 truncate">
                {c.label}
              </span>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${c.color}`} />
            </div>
            <div>
              <div className="text-2xl font-mono font-semibold tracking-tight text-graphite-900">
                {c.value}
              </div>
              <p className="text-[11px] text-graphite-500 mt-0.5 truncate">{c.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
