import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors.js';
import { StatusBadge } from './Badges.js';
import { Feather } from '@expo/vector-icons';

export function ProjectItem({ project, onPress }) {
  const progress = project.progress || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(project)} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {project.name}
        </Text>
        <StatusBadge status={project.status} />
      </View>

      {project.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>
      ) : null}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <Feather name="check-circle" size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>
            {project.completedTasks ?? 0} / {project.totalTasks ?? 0} tasks
          </Text>
        </View>
        {project.endDate ? (
          <View style={styles.metaItem}>
            <Feather name="calendar" size={12} color={colors.textMuted} />
            <Text style={styles.metaText}>Due {project.endDate}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E4E4E7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.textPrimary,
    width: 32,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
});
