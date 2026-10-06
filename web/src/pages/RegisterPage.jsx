import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');
      await registerAuth(data.fullName, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing projects, tracking sprints, and organizing tasks"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Full Name"
          required
          placeholder="Alex Chen"
          {...register('fullName', {
            required: 'Full name is required.',
            minLength: { value: 2, message: 'Name must be at least 2 characters.' },
          })}
          error={errors.fullName?.message}
        />

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
          placeholder="Minimum 6 characters"
          {...register('password', {
            required: 'Password is required.',
            minLength: { value: 6, message: 'Password must be at least 6 characters long.' },
          })}
          error={errors.password?.message}
        />

        <Button type="submit" size="md" className="w-full" isLoading={submitting}>
          Create Account
        </Button>

        <div className="text-center pt-2 border-t border-surface-border text-xs text-graphite-500">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium underline">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
