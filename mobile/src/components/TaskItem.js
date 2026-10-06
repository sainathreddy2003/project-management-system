import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors.js';
import { PriorityBadge, StatusBadge } from './Badges.js';

export function TaskItem({ task, onToggleComplete, onPress }) {
  const isCompleted = task.status === 'COMPLETED';

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      {/* Checkbox Touch Target (minimum 44px for accessibility) */}
      <TouchableOpacity
        style={styles.checkboxTouch}
        onPress={() => onToggleComplete?.(task)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
          {isCompleted && <Feather name="check" size={12} color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      {/* Task Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, isCompleted && styles.completedTitle]}
          numberOfLines={2}
        >
          {task.name}
        </Text>

        {task.projectName && (
          <Text style={styles.projectText} numberOfLines={1}>
            {task.projectName}
          </Text>
        )}

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {task.dueDate && (
            <Text style={styles.dateText}>
              Due {task.dueDate}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  completedContainer: {
    backgroundColor: '#FBFBFA',
    opacity: 0.8,
  },
  checkboxTouch: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginTop: -4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
    fontWeight: '400',
  },
  projectText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.accent,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
});
