import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  Plus,
  FolderGit2,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { projectsApi } from '../../api/projects.js';
import { cn } from '../../lib/utils.js';
import { Button } from '../ui/Button.jsx';
import { ProjectEditorModal } from '../../features/projects/ProjectEditorModal.jsx';
import { TaskEditorModal } from '../../features/tasks/TaskEditorModal.jsx';

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [recentProjects, setRecentProjects] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await projectsApi.getProjects({ page: 1, pageSize: 4, sortBy: 'createdAt', sortOrder: 'desc' });
        if (res.success && res.data) {
          setRecentProjects(res.data);
        }
      } catch {
        // Ignore background failure
      }
    }
    fetchRecent();
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  // Dynamic breadcrumb label
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard') return [{ label: 'Workspace', path: '/dashboard' }, { label: 'Dashboard' }];
    if (path === '/projects') return [{ label: 'Workspace', path: '/dashboard' }, { label: 'Projects' }];
    if (path.startsWith('/projects/')) return [{ label: 'Projects', path: '/projects' }, { label: 'Project Detail' }];
    if (path === '/tasks') return [{ label: 'Workspace', path: '/dashboard' }, { label: 'Tasks' }];
    return [{ label: 'Workspace' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen flex bg-[#FAF9F5] text-graphite-900 font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-graphite-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Left Sidebar ~240px */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-surface-border flex flex-col justify-between transition-transform duration-200 md:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Workspace Branding */}
          <div className="h-14 px-4 border-b border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white shadow-xs">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono text-xs font-semibold tracking-wider text-graphite-900 uppercase">
                  PMS Workspace
                </span>
                <span className="block text-[10px] text-graphite-500 font-medium">Enterprise Core</span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded md:hidden text-graphite-400 hover:text-graphite-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div className="p-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 px-3 py-1 mb-1 font-semibold">
              Platform
            </div>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors',
                      isActive
                        ? 'bg-accent-subtle text-accent font-semibold border-l-2 border-accent rounded-l-none'
                        : 'text-graphite-700 hover:bg-surface-muted hover:text-graphite-900'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-graphite-400')} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Recent Projects Section */}
          <div className="p-3 border-t border-surface-border">
            <div className="flex items-center justify-between px-3 py-1 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 font-semibold">
                Recent Projects
              </span>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                title="Create Project"
                className="text-graphite-400 hover:text-accent p-0.5"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {recentProjects.length === 0 ? (
                <div className="px-3 py-1 text-[11px] text-graphite-400 italic">No projects yet</div>
              ) : (
                recentProjects.map((p) => (
                  <NavLink
                    key={p.id}
                    to={`/projects/${p.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-1.5 text-xs text-graphite-700 hover:bg-surface-muted hover:text-graphite-900 rounded group"
                  >
                    <span className="truncate pr-2">{p.name}</span>
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : p.status === 'IN_PROGRESS'
                          ? 'bg-amber-500'
                          : 'bg-zinc-300'
                      )}
                    />
                  </NavLink>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Card & Logout Bottom Section */}
        <div className="p-3 border-t border-surface-border bg-surface-muted/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              <div className="w-7 h-7 rounded bg-zinc-200 border border-zinc-300 flex items-center justify-center font-mono text-xs font-semibold text-graphite-700 shrink-0">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-graphite-900 truncate">{user?.fullName || 'Developer'}</p>
                <p className="text-[11px] text-graphite-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded text-graphite-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-60">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-xs border-b border-surface-border px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded md:hidden text-graphite-700 hover:bg-surface-muted"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-graphite-400">/</span>}
                  {b.path ? (
                    <NavLink to={b.path} className="text-graphite-500 hover:text-graphite-900 transition-colors">
                      {b.label}
                    </NavLink>
                  ) : (
                    <span className="font-semibold text-graphite-900">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsNewTaskModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Global Quick Modals */}
      <ProjectEditorModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSaved={(newProj) => {
          setIsNewProjectModalOpen(false);
          navigate(`/projects/${newProj.id}`);
        }}
      />

      <TaskEditorModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSaved={() => {
          setIsNewTaskModalOpen(false);
          if (location.pathname === '/tasks') {
            window.location.reload();
          } else {
            navigate('/tasks');
          }
        }}
      />
    </div>
  );
}
