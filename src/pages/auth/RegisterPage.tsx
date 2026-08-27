import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { SignUpDTO } from '../../services/interfaces';
import { Button, Input, StepProgress } from '../../components/ui';
import { AuthLayout } from '../../layouts/AuthLayout';

interface RegisterPageProps {
  onSignUpSubmit: (dto: SignUpDTO) => Promise<void>;
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSignUpSubmit,
  onNavigateToLogin,
  onNavigateToHome,
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
      setError('Passwords do not match. Please re-enter your password.');
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
        setInfoMessage('Account created! Please check your email to confirm your registration, then click Sign In below.');
        setError(null);
      } else {
        setError(msg || 'Sign up failed. Please try again.');
        setInfoMessage(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Your Owner Account"
      subtitle={
        <StepProgress
          currentStep={1}
          totalSteps={2}
          labels={['Account Registration', 'Workspace Setup']}
          className="mt-2 mb-2"
        />
      }
    >
      {infoMessage && (
        <div className="mb-6 p-3.5 bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-800)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success-600)]" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Full Name"
            placeholder="e.g. Vikram Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            type="email"
            label="Email Address"
            placeholder="owner@yourgym.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Must be at least 6 characters"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <div>
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            Continue to Gym Setup
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-neutral-200 text-center">
        <span className="text-[length:var(--text-caption-size)] text-neutral-600">Already have a gym account? </span>
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="text-[length:var(--text-caption-size)] font-bold text-neutral-900 hover:text-[var(--color-brand-600)] transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </AuthLayout>
  );
};
