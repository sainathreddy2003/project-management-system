import React, { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks.js';
import { TaskFilters } from '../features/tasks/TaskFilters.jsx';
import { TaskTable } from '../features/tasks/TaskTable.jsx';
import { TaskEditorModal } from '../features/tasks/TaskEditorModal.jsx';
import { DeleteTaskDialog } from '../features/tasks/DeleteTaskDialog.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TableSkeleton, EmptyState, ErrorBanner } from '../components/ui/Skeleton.jsx';
import { Plus, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const fetchTasks = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: targetPage,
        pageSize: 20,
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        sortBy,
        sortOrder: 'desc',
      };
      const response = await tasksApi.getTasks(params);
      if (response.success && response.data) {
        setTasks(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Couldn't load tasks. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, sortBy]);

  useEffect(() => {
    fetchTasks(1);
  }, [fetchTasks]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setSortBy('createdAt');
  };

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      // Optimistic local state update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      await tasksApi.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      // Revert on failure
      fetchTasks(pagination.page);
      alert(err.message || 'Failed to update task status.');
    }
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleSaved = () => {
    fetchTasks(pagination.page);
  };

  const handleDeleted = () => {
    fetchTasks(pagination.page);
  };

  const hasFilterActive = !!search || !!status || !!priority;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-graphite-900">Tasks</h1>
          <p className="text-xs text-graphite-500 mt-1">
            Track and manage engineering deliverables across all workspace projects.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-3.5 h-3.5" />
          New Task
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={() => fetchTasks(pagination.page)} />}

      {/* Loading Skeleton */}
      {loading && <TableSkeleton rows={8} cols={7} />}

      {/* Content */}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState
          icon={CheckSquare}
          title={hasFilterActive ? 'No tasks match these filters.' : "You haven't created any tasks yet."}
          description={
            hasFilterActive
              ? 'Try widening your search terms or clearing status and priority filters.'
              : 'Add tasks to your projects to plan features, track bugs, and measure completion.'
          }
          actionText={hasFilterActive ? 'Clear Filters' : 'Create Task'}
          onAction={hasFilterActive ? handleResetFilters : handleOpenCreate}
        />
      )}

      {!loading && !error && tasks.length > 0 && (
        <>
          <TaskTable
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onDelete={setDeletingTask}
          />

          {/* Pagination bar */}
          <div className="flex items-center justify-between text-xs text-graphite-500 px-1 pt-1 font-mono">
            <span>
              Showing {tasks.length} of {pagination.total} tasks &bull; Page {pagination.page} of{' '}
              {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchTasks(pagination.page - 1)}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchTasks(pagination.page + 1)}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Task Editor Modal */}
      <TaskEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        task={editingTask}
        onSaved={handleSaved}
      />

      {/* Delete Task Confirmation Dialog */}
      <DeleteTaskDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
