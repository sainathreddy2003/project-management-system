import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { tasksApi, projectsApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { Feather } from '@expo/vector-icons';

export function CreateTaskScreen({ route, navigation }) {
  const defaultProjectId = route.params?.defaultProjectId;

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await projectsApi.getProjects({ page: 1, pageSize: 50 });
        if (res.success && res.data) {
          setProjects(res.data);
          if (!selectedProjectId && res.data.length > 0) {
            setSelectedProjectId(res.data[0].id);
          }
        }
      } catch {
        // Ignore background failure
      }
    }
    loadProjects();
  }, [selectedProjectId]);

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      setError('Please select a project.');
      return;
    }
    if (!name.trim()) {
      setError('Task name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await tasksApi.createTask({
        projectId: selectedProjectId,
        name: name.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDate || null,
      });

      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];
  const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? (
        <View style={styles.errorNotice}>
          <Feather name="alert-circle" size={14} color="#BE123C" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Project Selector (if not fixed) */}
      {!defaultProjectId && (
        <View style={styles.field}>
          <Text style={styles.label}>Select Project *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.projectChip,
                  selectedProjectId === p.id && styles.projectChipActive,
                ]}
                onPress={() => setSelectedProjectId(p.id)}
              >
                <Text
                  style={[
                    styles.projectChipText,
                    selectedProjectId === p.id && styles.projectChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Task Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Task Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Implement JWT middleware"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Acceptance criteria and notes..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Priority Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.segmentedRow}>
          {priorityOptions.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.segment,
                priority === p && styles.segmentActive,
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.segmentText,
                  priority === p && styles.segmentTextActive,
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Status Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.segmentedRow}>
          {statusOptions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.segment,
                status === s && styles.segmentActive,
              ]}
              onPress={() => setStatus(s)}
            >
              <Text
                style={[
                  styles.segmentText,
                  status === s && styles.segmentTextActive,
                ]}
              >
                {s === 'IN_PROGRESS' ? 'IN PROGRESS' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Due Date */}
      <View style={styles.field}>
        <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-10-15"
          placeholderTextColor={colors.textLight}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Create Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  errorNotice: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorText: {
    color: '#BE123C',
    fontSize: 12,
    fontWeight: '500',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  projectChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  projectChipActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accentBorder,
  },
  projectChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  projectChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderRadius: 6,
    padding: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
