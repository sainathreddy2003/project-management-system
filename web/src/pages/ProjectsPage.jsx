import React, { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects.js';
import { ProjectFilters } from '../features/projects/ProjectFilters.jsx';
import { ProjectTable } from '../features/projects/ProjectTable.jsx';
import { ProjectEditorModal } from '../features/projects/ProjectEditorModal.jsx';
import { DeleteProjectDialog } from '../features/projects/DeleteProjectDialog.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TableSkeleton, EmptyState, ErrorBanner } from '../components/ui/Skeleton.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Plus, FolderKanban, ChevronLeft, ChevronRight } from 'lucide-react';

export function ProjectsPage() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const fetchProjects = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page: targetPage,
        pageSize: 10,
        search: search.trim() || undefined,
        status: status || undefined,
        sortBy,
        sortOrder: 'desc',
      };
      const response = await projectsApi.getProjects(params);
      if (response.success && response.data) {
        setProjects(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Couldn't load your projects. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, sortBy]);

  useEffect(() => {
    fetchProjects(1);
  }, [fetchProjects]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSortBy('createdAt');
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setIsEditorOpen(true);
  };

  const handleSaved = (savedProj) => {
    toast.success(
      editingProject ? 'Project updated' : 'Project created',
      `"${savedProj?.name || editingProject?.name || 'Project'}" has been saved.`
    );
    fetchProjects(pagination.page);
  };

  const handleDeleted = () => {
    toast.success('Project deleted', `"${deletingProject?.name || 'Project'}" was removed.`);
    fetchProjects(pagination.page);
  };

  const hasFilterActive = !!search || !!status;

  return (
    <PageTransition className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-graphite-900">Projects</h1>
          <p className="text-xs text-graphite-500 mt-1">
            Manage active work and track project progress across team initiatives.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleResetFilters}
      />

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={() => fetchProjects(pagination.page)} />}

      {/* Loading Skeleton */}
      {loading && <TableSkeleton rows={5} cols={6} />}

      {/* Content & Tables */}
      {!loading && !error && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title={hasFilterActive ? 'No projects match these filters.' : "You haven't created a project yet."}
          description={
            hasFilterActive
              ? 'Try adjusting your search criteria or resetting the active status filter.'
              : 'Create your first project to organize deliverables, assign tasks, and track milestones.'
          }
          actionText={hasFilterActive ? 'Clear Filters' : 'Create Project'}
          onAction={hasFilterActive ? handleResetFilters : handleOpenCreate}
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <>
          <ProjectTable
            projects={projects}
            onEdit={handleOpenEdit}
            onDelete={setDeletingProject}
          />

          {/* Pagination bar */}
          <div className="flex items-center justify-between text-xs text-graphite-500 px-1 pt-1 font-mono">
            <span>
              Showing {projects.length} of {pagination.total} projects &bull; Page {pagination.page} of{' '}
              {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchProjects(pagination.page - 1)}
                className="h-7 px-2"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProjects(pagination.page + 1)}
                className="h-7 px-2"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Project Editor Modal */}
      <ProjectEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        project={editingProject}
        onSaved={handleSaved}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
        onDeleted={handleDeleted}
      />
    </PageTransition>
  );
}
