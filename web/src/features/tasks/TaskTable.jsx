import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/ui/Badge.jsx';
import { formatDate, cn } from '../../lib/utils.js';
import { Edit2, Trash2 } from 'lucide-react';

export function TaskTable({
  tasks = [],
  onToggleComplete,
  onEdit,
  onDelete,
  hideProjectColumn = false,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full bg-white border border-surface-border rounded-md overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-header border-b border-surface-border text-[11px] font-mono uppercase tracking-wider text-graphite-500 font-semibold">
              <th className="py-2.5 px-3 w-10 text-center">Done</th>
              <th className="py-2.5 px-3">Task Name</th>
              {!hideProjectColumn && <th className="py-2.5 px-3">Project</th>}
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-xs text-graphite-900">
            {tasks.map((t) => {
              const isCompleted = t.status === 'COMPLETED';
              return (
                <tr
                  key={t.id}
                  className={cn(
                    'hover:bg-zinc-50/70 transition-colors group',
                    isCompleted && 'bg-zinc-50/40 text-graphite-400'
                  )}
                >
                  {/* Complete Checkbox with Signature Motion Path Checkmark */}
                  <td className="py-2.5 px-3 text-center">
                    <motion.button
                      type="button"
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.88 }}
                      onClick={() => onToggleComplete(t)}
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-colors mx-auto',
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
                  </td>

                  {/* Task Name & Description */}
                  <td className="py-2.5 px-3 max-w-sm">
                    <span
                      className={cn(
                        'font-medium text-graphite-900 transition-colors',
                        isCompleted && 'line-through text-graphite-400 font-normal'
                      )}
                    >
                      {t.name}
                    </span>
                    {t.description && (
                      <p className="text-[11px] text-graphite-500 truncate mt-0.5">{t.description}</p>
                    )}
                  </td>

                  {/* Project Tag */}
                  {!hideProjectColumn && (
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Link
                        to={`/projects/${t.projectId}`}
                        className="font-mono text-[11px] text-graphite-600 hover:text-accent hover:underline flex items-center gap-1"
                      >
                        {t.projectName || 'Project'}
                      </Link>
                    </td>
                  )}

                  {/* Priority */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <TaskPriorityBadge priority={t.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <TaskStatusBadge status={t.status} />
                  </td>

                  {/* Due Date */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-graphite-600 whitespace-nowrap">
                    {formatDate(t.dueDate)}
                  </td>

                  {/* Actions with hover reveal */}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(t)}
                        title="Edit Task"
                        className="p-1 rounded text-graphite-400 opacity-40 group-hover:opacity-100 hover:text-graphite-900 hover:bg-zinc-100 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t)}
                        title="Delete Task"
                        className="p-1 rounded text-graphite-400 opacity-40 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
