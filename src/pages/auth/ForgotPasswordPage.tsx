import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
      await resetPassword(email);
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
        subtitle="Password reset instructions have been sent"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <p className="text-xs font-medium text-zinc-600 leading-relaxed">
            If an account exists for <strong className="text-zinc-900">{email}</strong>, you will receive an email with a link to reset your password.
          </p>

          <div className="space-y-2 pt-2">
            {onNavigateToResetPassword && (
              <Button
                type="button"
                className="w-full"
                size="md"
                onClick={() => onNavigateToResetPassword(email)}
              >
                Enter New Password
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="md"
              onClick={onNavigateToLogin}
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
      title="Reset your password"
      subtitle="Enter your registered email address to receive a recovery link"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-rose-50 border border-rose-200/90 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Account Email"
          type="email"
          name="email"
          id="forgot-email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="e.g. vikram@ironfitness.in"
          autoComplete="email"
          disabled={isSubmitting}
        />

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            id="btn-send-reset"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending link...' : 'Send reset link'}
          </Button>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full text-center text-xs font-medium text-zinc-600 hover:text-zinc-950 flex items-center justify-center py-1.5 transition-colors cursor-pointer"
          >
            <span>Back to Sign In</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
