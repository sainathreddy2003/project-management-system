import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';

export function StatusBadge({ status }) {
  const conf = colors.status[status] || colors.status.PENDING;

  return (
    <View style={[styles.badge, { backgroundColor: conf.bg, borderColor: conf.border }]}>
      <Text style={[styles.text, { color: conf.text }]}>{conf.label}</Text>
    </View>
  );
}

export function PriorityBadge({ priority }) {
  const conf = colors.priority[priority] || colors.priority.MEDIUM;

  return (
    <View style={[styles.badge, { backgroundColor: conf.bg, borderColor: conf.border }]}>
      <Text style={[styles.text, { color: conf.text }]}>{conf.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
});
