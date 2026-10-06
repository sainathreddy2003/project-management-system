import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { projectsApi, tasksApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { StatusBadge } from '../components/Badges.js';
import { TaskItem } from '../components/TaskItem.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { EmptyState } from '../components/EmptyState.js';
import { Feather } from '@expo/vector-icons';

export function ProjectDetailScreen({ route, navigation }) {
  const { projectId } = route.params;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProject = useCallback(async () => {
    try {
      setErrorMessage('');
      const res = await projectsApi.getProject(projectId);
      if (res.success && res.data) {
        setProject(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProject();
  };

  const handleToggleTask = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await tasksApi.updateTask(task.id, { status: nextStatus });
      fetchProject();
    } catch (err) {
      alert(err.message || 'Failed to update task.');
    }
  };

  const handleDeleteProject = () => {
    Alert.alert(
      'Delete Project',
      `Permanently delete "${project?.name}" and all of its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectsApi.deleteProject(projectId);
              navigation.goBack();
            } catch (err) {
              alert(err.message || 'Failed to delete project.');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const progress = project?.progress || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 36 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      {/* Offline Alert */}
      {errorMessage ? (
        <OfflineBanner message={errorMessage} onRetry={fetchProject} />
      ) : null}

      {project ? (
        <>
          {/* Project Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{project.name}</Text>
              <StatusBadge status={project.status} />
            </View>

            {project.description ? (
              <Text style={styles.description}>{project.description}</Text>
            ) : null}

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% Complete</Text>
            </View>

            {/* Dates / Stats */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {project.completedTasks} / {project.totalTasks} tasks completed
              </Text>
              {project.endDate ? (
                <Text style={styles.metaText}>Target: {project.endDate}</Text>
              ) : null}
            </View>

            {/* Project Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.addTaskBtn}
                onPress={() =>
                  navigation.navigate('CreateTask', { defaultProjectId: project.id })
                }
                activeOpacity={0.8}
              >
                <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.addTaskText}>Add Task</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeleteProject}
                activeOpacity={0.7}
              >
                <Feather name="trash-2" size={14} color="#BE123C" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Child Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Project Deliverables</Text>

            {project.tasks?.length === 0 ? (
              <EmptyState
                icon="check-square"
                title="No tasks in this project yet"
                description="Add tasks to define sprint milestones."
                actionText="Add First Task"
                onAction={() =>
                  navigation.navigate('CreateTask', { defaultProjectId: project.id })
                }
              />
            ) : (
              project.tasks?.map((task) => (
                <TaskItem
                  key={task.id}
                  task={{ ...task, projectName: null }}
                  onToggleComplete={handleToggleTask}
                  onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                />
              ))
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    margin: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  addTaskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 10,
  },
  addTaskText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksSection: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 10,
  },
});
