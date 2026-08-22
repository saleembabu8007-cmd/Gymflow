import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SignUpDTO } from '../../services/interfaces';
import { Button, Input } from '../../components/ui';
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
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-1.5 mt-1">
            <div className="h-1.5 w-10 rounded-full bg-teal-600" />
            <div className="h-1.5 w-10 rounded-full bg-slate-200" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
            Account Registration
          </span>
        </div>
      }
    >
      {infoMessage && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Must be at least 6 characters"
          />
        </div>

        <div>
          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
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

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <span className="text-sm text-slate-500">Already have a gym account? </span>
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </AuthLayout>
  );
};
