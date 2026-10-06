import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { dashboardApi, tasksApi } from '../api/services.js';
import { useAuth } from '../context/AuthContext.js';
import { colors } from '../theme/colors.js';
import { TaskItem } from '../components/TaskItem.js';
import { ProjectItem } from '../components/ProjectItem.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { EmptyState } from '../components/EmptyState.js';
import { Feather } from '@expo/vector-icons';

export function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setErrorMessage('');
      const res = await dashboardApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleToggleTask = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await tasksApi.updateTask(task.id, { status: nextStatus });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update task.');
    }
  };

  const metrics = data?.metrics || {};
  const firstName = user?.fullName?.split(' ')[0] || 'Developer';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {/* Top Banner / Greetings */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning, {firstName}</Text>
        <Text style={styles.subtitle}>Here&apos;s your engineering workload today.</Text>
      </View>

      {/* Offline / Error Banner */}
      {errorMessage ? (
        <OfflineBanner message={errorMessage} onRetry={fetchDashboard} />
      ) : null}

      {loading && !data ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Fetching project metrics...</Text>
        </View>
      ) : null}

      {data && (
        <>
          {/* Quick Operational Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>PROJECTS</Text>
              <Text style={styles.metricValue}>{metrics.totalProjects ?? 0}</Text>
              <Text style={styles.metricSub}>{metrics.projectsInProgress ?? 0} in progress</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>COMPLETION</Text>
              <Text style={[styles.metricValue, { color: '#059669' }]}>
                {metrics.completionPercentage ?? 0}%
              </Text>
              <Text style={styles.metricSub}>{metrics.completedTasks ?? 0} done</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>PENDING</Text>
              <Text style={[styles.metricValue, { color: colors.accent }]}>
                {metrics.pendingTasks ?? 0}
              </Text>
              <Text style={styles.metricSub}>{metrics.tasksDueToday ?? 0} due today</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>OVERDUE</Text>
              <Text style={[styles.metricValue, { color: metrics.overdueTasks > 0 ? '#BE123C' : '#71717A' }]}>
                {metrics.overdueTasks ?? 0}
              </Text>
              <Text style={styles.metricSub}>Need action</Text>
            </View>
          </View>

          {/* Urgent Tasks Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Urgent Tasks</Text>
              <Text style={styles.sectionSubtitle}>Due soonest or marked high priority</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {data.upcomingTasks?.length === 0 ? (
            <EmptyState
              icon="check-circle"
              title="No urgent tasks pending"
              description="All immediate deliverables are up-to-date."
            />
          ) : (
            data.upcomingTasks?.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleTask}
                onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
              />
            ))
          )}

          {/* Active Projects Section */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <View>
              <Text style={styles.sectionTitle}>Active Projects</Text>
              <Text style={styles.sectionSubtitle}>Recent sprints and completion status</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {data.recentProjects?.length === 0 ? (
            <EmptyState
              icon="folder"
              title="No projects available"
              description="Create a project to start planning deliverables."
              actionText="Create Project"
              onAction={() => navigation.navigate('CreateProject')}
            />
          ) : (
            data.recentProjects?.map((project) => (
              <ProjectItem
                key={project.id}
                project={project}
                onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  viewAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
});
