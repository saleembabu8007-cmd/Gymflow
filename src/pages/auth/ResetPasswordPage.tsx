import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigateToLogin: () => void;
  targetEmail?: string;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigateToLogin,
  targetEmail,
}) => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await updatePassword(password);
      setIsSuccess(true);
    } catch {
      setErrorMessage('Failed to update password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your password has been changed successfully"
      >
        <div className="space-y-4 text-center select-none font-sans">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center mx-auto border border-[var(--color-success-200)] shadow-2xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Your new password has been saved. You can now use it to sign in to GymFlow.
          </p>

          <div className="pt-3">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={onNavigateToLogin}
            >
              Sign In to Dashboard
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle={
        targetEmail
          ? `Create a new password for ${targetEmail}`
          : 'Choose a strong password for your account'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 select-none font-sans" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
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
          autoFocus
        />

        <Input
          label="Confirm New Password"
          type={showConfirmPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
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
            isLoading={isSubmitting}
            disabled={isSubmitting}
            size="md"
          >
            Update Password
          </Button>
        </div>

        <div className="pt-3 border-t border-neutral-100 text-center text-xs">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-neutral-600 hover:text-neutral-900 font-semibold cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
