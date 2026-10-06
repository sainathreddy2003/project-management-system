import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/ui/Badge.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { formatDate, cn } from '../../lib/utils.js';
import { ArrowUpRight } from 'lucide-react';

export function UpcomingTasksCard({ tasks = [], onToggleComplete }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="p-4 bg-white border border-surface-border rounded-md shadow-xs hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Urgent Tasks Requiring Attention
          </h4>
          <p className="text-[11px] text-graphite-500 mt-0.5">Prioritized by high impact and upcoming deadline</p>
        </div>
        <Link
          to="/tasks"
          className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          View All <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-xs text-graphite-400 italic">
          No urgent or overdue tasks. All projects on track!
        </div>
      ) : (
        <div className="divide-y divide-surface-border">
          {tasks.map((t) => {
            const isCompleted = t.status === 'COMPLETED';
            return (
              <div
                key={t.id}
                className={cn(
                  'py-2.5 flex items-center justify-between gap-3 px-1.5 rounded transition-all group',
                  isCompleted ? 'bg-zinc-50/60 opacity-60' : 'hover:bg-zinc-50/80'
                )}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* Task Completion Checkbox */}
                  {onToggleComplete && (
                    <motion.button
                      type="button"
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                      onClick={() => onToggleComplete(t)}
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-zinc-300 hover:border-accent bg-white'
                      )}
                      title={isCompleted ? 'Mark pending' : 'Mark completed'}
                    >
                      {isCompleted && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <motion.path
                            d="M3 8.5L6.5 12L13 4.5"
                            initial={shouldReduceMotion ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                          />
                        </svg>
                      )}
                    </motion.button>
                  )}

                  <div className="overflow-hidden">
                    <p
                      className={cn(
                        'text-xs font-medium text-graphite-900 truncate transition-colors',
                        isCompleted && 'line-through text-graphite-400 font-normal'
                      )}
                    >
                      {t.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[10px] text-graphite-500 uppercase">{t.projectName}</span>
                      <span className="text-graphite-300">&bull;</span>
                      <span className="font-mono text-[10px] text-graphite-500">Due {formatDate(t.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <TaskPriorityBadge priority={t.priority} />
                  <TaskStatusBadge status={t.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RecentProjectsCard({ projects = [] }) {
  return (
    <div className="p-4 bg-white border border-surface-border rounded-md shadow-xs hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Active Projects Overview
          </h4>
          <p className="text-[11px] text-graphite-500 mt-0.5">Sprint velocity and completion percentages</p>
        </div>
        <Link
          to="/projects"
          className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
        >
          View All <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="py-8 text-center text-xs text-graphite-400 italic">
          No active projects yet.
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const progress = p.progress || 0;
            return (
              <div
                key={p.id}
                className="p-2.5 bg-surface-muted/40 border border-surface-border rounded hover:bg-surface-muted transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-medium text-graphite-900 hover:text-accent transition-colors truncate pr-2"
                  >
                    {p.name}
                  </Link>
                  <span className="font-mono text-[11px] font-semibold text-graphite-700 shrink-0">
                    {progress}%
                  </span>
                </div>
                <div className="mb-1.5">
                  <ProgressBar progress={progress} height="h-1.5" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-graphite-500">
                  <span>
                    {p.completedTasks} / {p.totalTasks} tasks completed
                  </span>
                  <span>Target: {formatDate(p.endDate)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
