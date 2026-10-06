import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatusBadge } from '../../components/ui/Badge.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { formatDate } from '../../lib/utils.js';
import { Edit2, Trash2, ArrowUpRight } from 'lucide-react';

export function ProjectTable({
  projects = [],
  onEdit,
  onDelete,
}) {
  return (
    <div className="w-full bg-white border border-surface-border rounded-md overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-header border-b border-surface-border text-[11px] font-mono uppercase tracking-wider text-graphite-500 font-semibold">
              <th className="py-2.5 px-4">Project</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-center">Tasks</th>
              <th className="py-2.5 px-3">Progress</th>
              <th className="py-2.5 px-3">Kickoff</th>
              <th className="py-2.5 px-3">Target End</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-xs text-graphite-900">
            {projects.map((p) => {
              const progress = p.progress || 0;
              return (
                <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors group">
                  {/* Name and Description */}
                  <td className="py-3 px-4 max-w-xs">
                    <Link
                      to={`/projects/${p.id}`}
                      className="font-medium text-graphite-900 group-hover:text-accent transition-colors flex items-center gap-1.5"
                    >
                      <span className="truncate">{p.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-accent" />
                    </Link>
                    {p.description && (
                      <p className="text-[11px] text-graphite-500 truncate mt-0.5">{p.description}</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <ProjectStatusBadge status={p.status} />
                  </td>

                  {/* Tasks count */}
                  <td className="py-3 px-3 text-center font-mono text-[11px] whitespace-nowrap">
                    <span className="text-graphite-900 font-medium">{p.completedTasks}</span>
                    <span className="text-graphite-400"> / {p.totalTasks}</span>
                  </td>

                  {/* Progress bar */}
                  <td className="py-3 px-3 min-w-[130px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar progress={progress} height="h-1.5" />
                      </div>
                      <span className="font-mono text-[11px] text-graphite-600 w-8 text-right">
                        {progress}%
                      </span>
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="py-3 px-3 font-mono text-[11px] text-graphite-600 whitespace-nowrap">
                    {formatDate(p.startDate)}
                  </td>

                  {/* End Date */}
                  <td className="py-3 px-3 font-mono text-[11px] text-graphite-600 whitespace-nowrap">
                    {formatDate(p.endDate)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        title="Edit Project"
                        className="p-1 rounded text-graphite-400 opacity-40 group-hover:opacity-100 hover:text-graphite-900 hover:bg-zinc-100 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        title="Delete Project"
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
