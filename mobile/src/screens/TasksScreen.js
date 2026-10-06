import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { tasksApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { TaskItem } from '../components/TaskItem.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { EmptyState } from '../components/EmptyState.js';
import { Feather } from '@expo/vector-icons';

export function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setErrorMessage('');
      const params = {
        page: 1,
        pageSize: 50,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      };
      const res = await tasksApi.getTasks(params);
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      // Optimistic local update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      await tasksApi.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      fetchTasks();
      alert(err.message || 'Failed to update task.');
    }
  };

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={14} color={colors.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textLight}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateTask')}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.chipRow}>
        {statusOptions.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, statusFilter === opt.value && styles.chipActive]}
            onPress={() => setStatusFilter(opt.value)}
          >
            <Text
              style={[
                styles.chipText,
                statusFilter === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Priority Quick Filter Toggle */}
        <TouchableOpacity
          style={[styles.chip, priorityFilter === 'HIGH' && styles.chipActive]}
          onPress={() => setPriorityFilter(priorityFilter === 'HIGH' ? '' : 'HIGH')}
        >
          <Text
            style={[
              styles.chipText,
              priorityFilter === 'HIGH' && styles.chipTextActive,
            ]}
          >
            High Priority
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offline Alert */}
      {errorMessage ? (
        <OfflineBanner message={errorMessage} onRetry={fetchTasks} />
      ) : null}

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleComplete={handleToggleComplete}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          ListEmptyComponent={
            !errorMessage ? (
              <EmptyState
                icon="check-square"
                title={search || statusFilter ? 'No matching tasks' : 'No tasks created yet'}
                description={
                  search || statusFilter
                    ? 'Try adjusting your search criteria or filters.'
                    : 'Create your first task to start tracking work.'
                }
                actionText={search || statusFilter ? 'Reset Filters' : 'Create Task'}
                onAction={
                  search || statusFilter
                    ? () => {
                        setSearch('');
                        setStatusFilter('');
                        setPriorityFilter('');
                      }
                    : () => navigation.navigate('CreateTask')
                }
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accentBorder,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  loader: {
    padding: 40,
    alignItems: 'center',
  },
});
