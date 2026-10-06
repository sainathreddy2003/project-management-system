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
import { projectsApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { ProjectItem } from '../components/ProjectItem.js';
import { OfflineBanner } from '../components/OfflineBanner.js';
import { EmptyState } from '../components/EmptyState.js';
import { Feather } from '@expo/vector-icons';

export function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = useCallback(async () => {
    try {
      setErrorMessage('');
      const params = {
        page: 1,
        pageSize: 50,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      };
      const res = await projectsApi.getProjects(params);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Not Started', value: 'NOT_STARTED' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={14} color={colors.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search projects..."
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
          onPress={() => navigation.navigate('CreateProject')}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Status Filter Chips */}
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
      </View>

      {/* Offline Alert */}
      {errorMessage ? (
        <OfflineBanner message={errorMessage} onRetry={fetchProjects} />
      ) : null}

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProjectItem
              project={item}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })}
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
                icon="folder"
                title={search || statusFilter ? 'No matching projects' : 'No projects found'}
                description={
                  search || statusFilter
                    ? 'Try clearing your search term or filter.'
                    : 'Get started by creating your first project.'
                }
                actionText={search || statusFilter ? 'Clear Filters' : 'Create Project'}
                onAction={
                  search || statusFilter
                    ? () => {
                        setSearch('');
                        setStatusFilter('');
                      }
                    : () => navigation.navigate('CreateProject')
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
