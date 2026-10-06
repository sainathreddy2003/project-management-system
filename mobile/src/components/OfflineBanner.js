import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors.js';

export function OfflineBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather name="wifi-off" size={16} color="#BE123C" style={styles.icon} />
        <Text style={styles.text}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
          <Feather name="rotate-cw" size={12} color="#9F1239" style={{ marginRight: 4 }} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#9F1239',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  retryText: {
    color: '#9F1239',
    fontSize: 11,
    fontWeight: '600',
  },
});
