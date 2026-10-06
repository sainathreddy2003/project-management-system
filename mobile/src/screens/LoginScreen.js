import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { colors } from '../theme/colors.js';
import { Feather } from '@expo/vector-icons';

export function LoginScreen({ navigation }) {
  const { login, sessionExpiredMessage } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.dev@example.com');
    setPassword('Password123!');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Feather name="folder" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.appTitle}>PMS Mobile</Text>
          <Text style={styles.appSubtitle}>Engineering Task & Project Manager</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Session Expired Notice */}
          {sessionExpiredMessage ? (
            <View style={styles.expiredNotice}>
              <Feather name="alert-circle" size={14} color="#92400E" style={{ marginRight: 6 }} />
              <Text style={styles.expiredText}>{sessionExpiredMessage}</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorNotice}>
              <Feather name="alert-circle" size={14} color="#BE123C" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="alex.dev@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textLight}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Fill Button */}
          <TouchableOpacity style={styles.demoButton} onPress={handleFillDemo} activeOpacity={0.7}>
            <Feather name="key" size={13} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.demoButtonText}>Fill Demo Credentials (alex.dev)</Text>
          </TouchableOpacity>
        </View>

        {/* Register navigation link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  appSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  expiredNotice: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 6,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  expiredText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
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
    flex: 1,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
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
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F6',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 9,
    marginTop: 10,
  },
  demoButtonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    textDecorationLine: 'underline',
  },
});
