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
import { tasksApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { Feather } from '@expo/vector-icons';

export function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;

  const [task, setTask] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true);
        const res = await tasksApi.getTask(taskId);
        if (res.success && res.data) {
          const t = res.data;
          setTask(t);
          setName(t.name);
          setDescription(t.description || '');
          setPriority(t.priority);
          setStatus(t.status);
          setDueDate(t.dueDate || '');
        }
      } catch (err) {
        setError(err.message || 'Unable to load task.');
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError('Task name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await tasksApi.updateTask(taskId, {
        name: name.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDate || null,
      });

      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to update task.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', `Permanently delete task "${task?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await tasksApi.deleteTask(taskId);
            navigation.goBack();
          } catch (err) {
            alert(err.message || 'Failed to delete task.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

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

      {task?.projectName ? (
        <View style={styles.projectHeader}>
          <Text style={styles.projectLabel}>Project</Text>
          <Text style={styles.projectName}>{task.projectName}</Text>
        </View>
      ) : null}

      {/* Task Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Task Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Task title"
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
          placeholder="Notes..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Status Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.segmentedRow}>
          {statusOptions.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.segment, status === s && styles.segmentActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.segmentText, status === s && styles.segmentTextActive]}>
                {s === 'IN_PROGRESS' ? 'IN PROGRESS' : s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Priority Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.segmentedRow}>
          {priorityOptions.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.segment, priority === p && styles.segmentActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.segmentText, priority === p && styles.segmentTextActive]}>
                {p}
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

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.buttonDisabled]}
          onPress={handleUpdate}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.7}>
          <Feather name="trash-2" size={16} color="#BE123C" />
        </TouchableOpacity>
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectHeader: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  projectLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  projectName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
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
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
