import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { projectsApi } from '../api/services.js';
import { colors } from '../theme/colors.js';
import { Feather } from '@expo/vector-icons';

export function CreateProjectScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await projectsApi.createProject({
        name: name.trim(),
        description: description.trim() || null,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      });

      navigation.goBack();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? (
        <View style={styles.errorNotice}>
          <Feather name="alert-circle" size={14} color="#BE123C" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Project Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Inventory ERP Modernization"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Scope, technical specs, or sprint goals..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
        />
      </View>

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
                {s === 'IN_PROGRESS' ? 'IN PROGRESS' : s.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Kickoff Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-10-06"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Target End Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2026-11-15"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Create Project</Text>
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
    fontSize: 10,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
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
