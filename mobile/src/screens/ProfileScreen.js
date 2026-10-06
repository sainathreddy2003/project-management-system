import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { colors } from '../theme/colors.js';
import { Feather } from '@expo/vector-icons';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of this workspace?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0)?.toUpperCase() || 'D'}
          </Text>
        </View>

        <Text style={styles.fullName}>{user?.fullName || 'Developer'}</Text>
        <Text style={styles.email}>{user?.email || 'alex.dev@example.com'}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Full-Stack Engineer</Text>
          </View>
        </View>
      </View>

      {/* Architecture Info Section */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Architecture & Storage</Text>

        <View style={styles.infoRow}>
          <Feather name="shield" size={14} color={colors.accent} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Credential Store</Text>
            <Text style={styles.infoValue}>Expo SecureStore (Hardware Keystore)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="database" size={14} color={colors.accent} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Shared Database</Text>
            <Text style={styles.infoValue}>MySQL Relational (Port 3306)</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Feather name="server" size={14} color={colors.accent} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Backend API</Text>
            <Text style={styles.infoValue}>Node.js + Express (Port 5001)</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Feather name="log-out" size={16} color="#BE123C" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out of Workspace</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentSubtle,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'monospace',
  },
  fullName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  badgeRow: {
    marginTop: 10,
  },
  roleBadge: {
    backgroundColor: '#F4F4F5',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 6,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#BE123C',
  },
});
