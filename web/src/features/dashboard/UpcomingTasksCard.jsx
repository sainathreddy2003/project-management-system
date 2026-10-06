import React from 'react';
import { Link } from 'react-router-dom';
import { TaskPriorityBadge, TaskStatusBadge } from '../../components/ui/Badge.jsx';
import { formatDate } from '../../lib/utils.js';
import { ArrowUpRight } from 'lucide-react';

export function UpcomingTasksCard({ tasks = [] }) {
  return (
    <div className="p-4 bg-white border border-surface-border rounded-md shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Urgent Tasks Requiring Attention
          </h4>
          <p className="text-[11px] text-graphite-500 mt-0.5">Prioritized by high impact and upcoming deadline</p>
        </div>
        <Link
          to="/tasks"
          className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1"
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
          {tasks.map((t) => (
            <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-zinc-50/60 px-1 rounded transition-colors">
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-graphite-900 truncate">{t.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] text-graphite-500 uppercase">{t.projectName}</span>
                  <span className="text-graphite-300">&bull;</span>
                  <span className="font-mono text-[10px] text-graphite-500">Due {formatDate(t.dueDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TaskPriorityBadge priority={t.priority} />
                <TaskStatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecentProjectsCard({ projects = [] }) {
  return (
    <div className="p-4 bg-white border border-surface-border rounded-md shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-surface-border pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-graphite-900 font-mono uppercase tracking-wider">
            Active Projects Overview
          </h4>
          <p className="text-[11px] text-graphite-500 mt-0.5">Sprint velocity and completion percentages</p>
        </div>
        <Link
          to="/projects"
          className="text-xs font-medium text-accent hover:text-accent-hover flex items-center gap-1"
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
              <div key={p.id} className="p-2.5 bg-surface-muted/40 border border-surface-border rounded hover:bg-surface-muted transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <Link to={`/projects/${p.id}`} className="font-medium text-graphite-900 hover:text-accent transition-colors truncate pr-2">
                    {p.name}
                  </Link>
                  <span className="font-mono text-[11px] font-semibold text-graphite-700 shrink-0">
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-graphite-500">
                  <span>{p.completedTasks} / {p.totalTasks} tasks completed</span>
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
