import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { AlertCircle, KeyRound } from 'lucide-react';

export function LoginPage() {
  const { login, sessionExpiredMessage, setSessionExpiredMessage } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isExpired = searchParams.get('expired') === 'true' || !!sessionExpiredMessage;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpiredMessage('Your session expired. Please sign in again.');
    }
  }, [searchParams, setSessionExpiredMessage]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'alex.dev@example.com');
    setValue('password', 'Password123!');
    setServerError('');
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials to access the project management system"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Expired Session Alert */}
        {isExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              {sessionExpiredMessage || 'Your session expired. Please sign in again.'}
            </span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="alex.dev@example.com"
          {...register('email', {
            required: 'Email is required.',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address.',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
          {...register('password', { required: 'Password is required.' })}
          error={errors.password?.message}
        />

        <Button type="submit" size="md" className="w-full" isLoading={submitting}>
          Sign In
        </Button>

        {/* Demo fill button for fast review */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full py-1.5 px-3 bg-surface-muted border border-surface-border rounded text-graphite-600 hover:text-graphite-900 text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-accent" />
          <span>Fill Demo Credentials (alex.dev@example.com)</span>
        </button>

        <div className="text-center pt-2 border-t border-surface-border text-xs text-graphite-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-medium underline">
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
