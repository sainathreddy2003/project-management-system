import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import { MetricsOverview } from '../features/dashboard/MetricsOverview.jsx';
import { ProjectStatusChart } from '../features/dashboard/ProjectStatusChart.jsx';
import { UpcomingTasksCard, RecentProjectsCard } from '../features/dashboard/UpcomingTasksCard.jsx';
import { Skeleton, ErrorBanner } from '../components/ui/Skeleton.jsx';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const firstName = user?.fullName?.split(' ')[0] || 'Developer';

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dashboardApi.getDashboard();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err.message || "Couldn't load dashboard data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-graphite-900">Dashboard</h1>
        <p className="text-xs text-graphite-500 mt-1">
          Good morning, <strong className="text-graphite-700 font-semibold">{firstName}</strong>. Here&apos;s what needs attention.
        </p>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={fetchDashboard} />}

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

      {/* Loaded Dashboard Content */}
      {data && (
        <>
          {/* Top Operational Metrics */}
          <MetricsOverview metrics={data.metrics} />

          {/* Real Recharts Visualizations */}
          <ProjectStatusChart
            statusBreakdown={data.statusBreakdown}
            priorityBreakdown={data.priorityBreakdown}
          />

          {/* Lower Grid: Tasks & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UpcomingTasksCard tasks={data.upcomingTasks} />
            <RecentProjectsCard projects={data.recentProjects} />
          </div>
        </>
      )}
    </div>
  );
}
