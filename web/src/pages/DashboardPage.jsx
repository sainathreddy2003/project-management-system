import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { dashboardApi } from '../api/dashboard.js';
import { tasksApi } from '../api/tasks.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { MetricsOverview } from '../features/dashboard/MetricsOverview.jsx';
import { ProjectStatusChart } from '../features/dashboard/ProjectStatusChart.jsx';
import { UpcomingTasksCard, RecentProjectsCard } from '../features/dashboard/UpcomingTasksCard.jsx';
import { Skeleton, ErrorBanner } from '../components/ui/Skeleton.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const firstName = user?.fullName?.split(' ')[0] || 'Developer';

  const fetchDashboard = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      const response = await dashboardApi.getDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err) {
      if (!isSilent) {
        setError(err.message || "Couldn't load dashboard data. Check your connection and try again.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      // Optimistic update
      setData((prev) => {
        if (!prev) return prev;
        const updatedUpcoming = prev.upcomingTasks.map((t) =>
          t.id === task.id ? { ...t, status: nextStatus } : t
        );
        return { ...prev, upcomingTasks: updatedUpcoming };
      });

      await tasksApi.updateTask(task.id, { status: nextStatus });

      if (nextStatus === 'COMPLETED') {
        toast.success('Task completed', `"${task.name}"`);
      } else {
        toast.info('Task reopened', `"${task.name}"`);
      }

      // Refresh dashboard in background to get newly computed metrics and project progress
      fetchDashboard(true);
    } catch (err) {
      fetchDashboard(true);
      toast.error('Update failed', err.message || 'Could not update task status.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-graphite-900">Dashboard</h1>
        <p className="text-xs text-graphite-500 mt-1">
          Good morning, <strong className="text-graphite-700 font-semibold">{firstName}</strong>. Here&apos;s what needs attention.
        </p>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={() => fetchDashboard()} />}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      )}

      {/* Loaded Dashboard Content with Staggered Entrance */}
      {data && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Top Operational Metrics */}
          <motion.div variants={itemVariants}>
            <MetricsOverview metrics={data.metrics} />
          </motion.div>

          {/* Real Recharts Visualizations */}
          <motion.div variants={itemVariants}>
            <ProjectStatusChart
              statusBreakdown={data.statusBreakdown}
              priorityBreakdown={data.priorityBreakdown}
            />
          </motion.div>

          {/* Lower Grid: Tasks & Projects */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UpcomingTasksCard tasks={data.upcomingTasks} onToggleComplete={handleToggleTask} />
            <RecentProjectsCard projects={data.recentProjects} />
          </motion.div>
        </motion.div>
      )}
    </PageTransition>
  );
}
