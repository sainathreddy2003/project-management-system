import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { projectsApi } from '../api/projects.js';
import { tasksApi } from '../api/tasks.js';
import { ProjectStatusBadge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { AnimatedNumber } from '../components/ui/AnimatedNumber.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, cn } from '../lib/utils.js';
import { TaskTable } from '../features/tasks/TaskTable.jsx';
import { TaskEditorModal } from '../features/tasks/TaskEditorModal.jsx';
import { DeleteTaskDialog } from '../features/tasks/DeleteTaskDialog.jsx';
import { ProjectEditorModal } from '../features/projects/ProjectEditorModal.jsx';
import { DeleteProjectDialog } from '../features/projects/DeleteProjectDialog.jsx';
import { TableSkeleton, EmptyState, ErrorBanner } from '../components/ui/Skeleton.jsx';
import { ArrowLeft, Edit2, Trash2, Plus, CheckSquare, Search } from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Child tasks filter
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');

  // Modals
  const [isTaskEditorOpen, setIsTaskEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [isProjectEditorOpen, setIsProjectEditorOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  const fetchProjectDetails = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const response = await projectsApi.getProject(id);
      if (response.success && response.data) {
        setProject(response.data);
      }
    } catch (err) {
      if (!isSilent) {
        setError(err.message || 'Unable to load project details.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Handle task status toggle directly from table with signature feedback
  const handleToggleTaskComplete = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

      // Optimistic update
      setProject((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((t) =>
          t.id === task.id ? { ...t, status: nextStatus } : t
        );
        const completedCount = updatedTasks.filter((t) => t.status === 'COMPLETED').length;
        const totalCount = updatedTasks.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        return {
          ...prev,
          tasks: updatedTasks,
          completedTasks: completedCount,
          progress: newProgress,
        };
      });

      await tasksApi.updateTask(task.id, { status: nextStatus });

      if (nextStatus === 'COMPLETED') {
        toast.success('Task completed', `"${task.name}"`);
      } else {
        toast.info('Task reopened', `"${task.name}"`);
      }

      // Re-fetch in background to ensure accurate calculations
      fetchProjectDetails(true);
    } catch (err) {
      fetchProjectDetails(true);
      toast.error('Update failed', err.message || 'Failed to update task status.');
    }
  };

  const handleTaskSaved = (savedTask) => {
    toast.success(
      editingTask ? 'Task updated' : 'Task created',
      `"${savedTask?.name || editingTask?.name || 'Task'}" was saved.`
    );
    fetchProjectDetails(true);
  };

  const handleTaskDeleted = () => {
    toast.success('Task deleted', `"${deletingTask?.name || 'Task'}" was removed.`);
    fetchProjectDetails(true);
  };

  const handleProjectDeleted = () => {
    toast.success('Project deleted', `"${project?.name || 'Project'}" was removed.`);
    navigate('/projects');
  };

  // Filter tasks in memory for this specific project
  const tasks = project?.tasks || [];
  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
    if (taskPriorityFilter && t.priority !== taskPriorityFilter) return false;
    if (taskSearch) {
      const term = taskSearch.toLowerCase();
      const matchName = t.name.toLowerCase().includes(term);
      const matchDesc = t.description?.toLowerCase().includes(term);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-5">
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs text-graphite-500 hover:text-graphite-900">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
        <ErrorBanner message={error || 'Project not found.'} onRetry={() => fetchProjectDetails()} />
      </div>
    );
  }

  const progress = project.progress || 0;

  return (
    <PageTransition className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-graphite-500 hover:text-accent font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-graphite-900">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-xs text-graphite-600 max-w-2xl mt-1 leading-relaxed">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsProjectEditorOpen(true)}
            className="text-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteProjectOpen(true)}
            className="text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Progress & Metadata Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 border border-surface-border rounded-md shadow-xs hover:border-zinc-300 transition-colors">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-500 block">
            Overall Progress
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1">
              <ProgressBar progress={progress} height="h-2" />
            </div>
            <span className="font-mono text-xs font-semibold text-graphite-900 w-10 text-right">
              <AnimatedNumber value={progress} />%
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-500 block">
            Tasks Completed
          </span>
          <p className="font-mono text-sm font-semibold text-graphite-900 mt-1">
            <AnimatedNumber value={project.completedTasks} />{' '}
            <span className="text-graphite-400 font-normal">/ {project.totalTasks}</span>
          </p>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-500 block">
            Kickoff Date
          </span>
          <p className="font-mono text-xs text-graphite-700 mt-1">{formatDate(project.startDate)}</p>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-500 block">
            Target Completion
          </span>
          <p className="font-mono text-xs text-graphite-700 mt-1">{formatDate(project.endDate)}</p>
        </div>
      </div>

      {/* Tasks Section Header & Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-graphite-900">Project Deliverables</h3>
            <p className="text-xs text-graphite-500">Track and manage tasks assigned to this sprint</p>
          </div>
          <Button size="sm" onClick={() => setIsTaskEditorOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Task
          </Button>
        </div>

        {/* Task Filter Toolbar with Animated Tab Pill */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 border border-surface-border rounded-md">
          {/* Status Tabs with layoutId motion pill */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((st) => {
              const isSelected = taskStatusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setTaskStatusFilter(st)}
                  className={cn(
                    'relative px-2.5 py-1 rounded font-medium transition-colors shrink-0',
                    isSelected
                      ? 'text-accent font-semibold'
                      : 'text-graphite-600 hover:text-graphite-900 hover:bg-surface-muted/60'
                  )}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="project-tab-pill"
                      className="absolute inset-0 bg-accent-subtle rounded border border-accent-border"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 30 }
                      }
                    />
                  )}
                  <span className="relative z-10">
                    {st === 'ALL'
                      ? 'All Tasks'
                      : st === 'IN_PROGRESS'
                      ? 'In Progress'
                      : st.charAt(0) + st.slice(1).toLowerCase()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Filter tasks..."
                className="pl-8 pr-2.5 py-1 text-xs bg-surface-muted/50 border border-surface-border rounded text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="px-2 py-1 text-xs bg-white border border-surface-border rounded text-graphite-700 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks Table */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={tasks.length === 0 ? 'No tasks have been added to this project yet.' : 'No tasks match current filter.'}
            description={
              tasks.length === 0
                ? 'Break down this initiative into discrete tasks with priorities and deadlines.'
                : 'Try resetting the status tab or search filter.'
            }
            actionText={tasks.length === 0 ? 'Create First Task' : undefined}
            onAction={tasks.length === 0 ? () => setIsTaskEditorOpen(true) : undefined}
          />
        ) : (
          <TaskTable
            tasks={filteredTasks}
            onToggleComplete={handleToggleTaskComplete}
            onEdit={(t) => {
              setEditingTask(t);
              setIsTaskEditorOpen(true);
            }}
            onDelete={setDeletingTask}
            hideProjectColumn={true}
          />
        )}
      </div>

      {/* Task Modal */}
      <TaskEditorModal
        isOpen={isTaskEditorOpen}
        onClose={() => {
          setIsTaskEditorOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        defaultProjectId={project.id}
        onSaved={handleTaskSaved}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
        onDeleted={handleTaskDeleted}
      />

      {/* Project Editor Modal */}
      <ProjectEditorModal
        isOpen={isProjectEditorOpen}
        onClose={() => setIsProjectEditorOpen(false)}
        project={project}
        onSaved={(updated) => {
          toast.success('Project updated', `"${updated.name}" has been updated.`);
          fetchProjectDetails(true);
        }}
      />

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        project={project}
        onDeleted={handleProjectDeleted}
      />
    </PageTransition>
  );
}
