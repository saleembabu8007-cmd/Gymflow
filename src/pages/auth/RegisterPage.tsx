import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { SignUpDTO } from '../../services/interfaces';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AuthLayout } from '../../layouts/AuthLayout';

interface RegisterPageProps {
  onSignUpSubmit: (dto: SignUpDTO) => Promise<void>;
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSignUpSubmit,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      await onSignUpSubmit({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('SUCCESS_EMAIL_CONFIRMATION_REQUIRED')) {
        setInfoMessage('Account created! Please check your email to confirm registration, then click Sign In.');
        setError(null);
      } else {
        setError(msg || 'Sign up failed. Please check details and try again.');
        setInfoMessage(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking gym dues and automated reminders"
    >
      {infoMessage && (
        <div className="mb-4 p-3 bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-800)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success-600)]" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 select-none font-sans" noValidate>
        <Input
          label="Full Name"
          required
          autoComplete="name"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<User className="w-4 h-4" />}
          autoFocus
        />

        <Input
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError(null);
          }}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading}
            size="md"
          >
            Create Account
          </Button>
        </div>

        <div className="pt-3 border-t border-neutral-100 text-center text-xs text-neutral-500">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="font-bold text-neutral-900 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
