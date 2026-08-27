import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <p className="text-[length:var(--text-caption-size)] font-medium text-neutral-600 leading-relaxed">
            Your new password has been saved. You can now use it to sign in to GymFlow.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              className="w-full"
              size="lg"
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
          : 'Choose a new strong password for your account'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="New Password"
          type="password"
          name="new-password"
          id="new-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Min 6 characters"
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        <Input
          label="Confirm New Password"
          type="password"
          name="confirm-password"
          id="confirm-password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Re-enter password"
          autoComplete="new-password"
          disabled={isSubmitting}
        />

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            id="btn-update-password"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating password...' : 'Update password'}
          </Button>

          <Button
            type="button"
            variant="tertiary"
            onClick={onNavigateToLogin}
            className="w-full"
          >
            Cancel and return to Sign In
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};
