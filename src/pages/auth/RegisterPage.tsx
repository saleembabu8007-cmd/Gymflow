import React, { useState } from 'react';
import { Dumbbell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SignUpDTO } from '../../services/interfaces';
import { Button, Input, Card } from '../../components/ui';

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
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          type="button"
          onClick={onNavigateToHome}
          className="inline-flex items-center gap-2.5 cursor-pointer group mb-2"
        >
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold">
            <Dumbbell className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">GymFlow</span>
        </button>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
          Create Your Owner Account
        </h2>
        <p className="mt-1 text-xs text-zinc-600">
          Step 1 of 2 — Account Registration
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 border border-zinc-200 bg-white">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Continue to Gym Setup
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
            <span className="text-xs text-zinc-600">Already have a gym account? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
