import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle2, AlertCircle, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToResetPassword?: (email: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToResetPassword,
}) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch {
      setErrorMessage('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Password recovery instructions sent"
      >
        <div className="space-y-4 text-center select-none font-sans">
          <div className="w-12 h-12 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center mx-auto border border-[var(--color-success-200)] shadow-2xs">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
            If an account exists for <strong className="text-neutral-900">{email}</strong>, we have sent instructions to reset your password.
          </p>

          <div className="space-y-2 pt-3">
            {onNavigateToResetPassword && (
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={() => onNavigateToResetPassword(email)}
              >
                Enter New Password
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onNavigateToLogin}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email address to receive a recovery link"
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
          label="Email Address"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          leftIcon={<Mail className="w-4 h-4" />}
          autoFocus
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
            Send Recovery Link
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
