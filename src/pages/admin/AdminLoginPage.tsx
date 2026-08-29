import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../hooks/useAuth';
import { parseAuthError } from '../../utils/errorUtils';

interface AdminLoginPageProps {
  onNavigateToGymLogin: () => void;
  onAdminLoginSuccess: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigateToGymLogin,
  onAdminLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login(email.trim(), password);
      const isPlatformAdmin =
        user &&
        ((user.role as string) === 'platform_admin' ||
          user.role === 'PLATFORM_ADMIN' ||
          (user.role as string) === 'ADMIN');

      if (!isPlatformAdmin) {
        setError("You don't have authorization to access the GymFlow platform admin console.");
      } else {
        onAdminLoginSuccess();
      }
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8 select-none font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <Logo size="md" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-neutral-950 text-xl tracking-tight font-display">
                GymFlow
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-900 text-white uppercase">
                Admin
              </span>
            </div>
          </div>

          <h1 className="mt-5 text-xl font-bold tracking-tight text-neutral-950 font-display">
            Platform Admin Console
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
            Authorized GymFlow operational management access only.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-6 sm:mt-8">
          <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 rounded-[var(--radius-lg)] shadow-2xs border border-neutral-200/80">
            {error && (
              <div className="mb-4 p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Admin Email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@gymflow.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                autoFocus
              />

              <Input
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
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
                  Access Admin Console
                </Button>
              </div>

              <div className="pt-3 border-t border-neutral-100 text-center text-xs">
                <button
                  type="button"
                  onClick={onNavigateToGymLogin}
                  className="text-neutral-500 hover:text-neutral-900 font-semibold cursor-pointer"
                >
                  ← Return to Gym Owner Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
