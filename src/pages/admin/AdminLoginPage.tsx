import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Dumbbell } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
  onNavigateToForgotPassword,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your administrator email and password');
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
        setError("You don't have permission to access the GymFlow admin console.");
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
    <div className="min-h-screen bg-[var(--color-neutral-950)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-[var(--color-neutral-100)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-xl)] bg-[var(--color-danger-600)] text-white flex items-center justify-center font-extrabold text-sm shadow-lg">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">GymFlow</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/20 text-[var(--color-danger-400)] text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Internal Console
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-sm w-full mx-auto my-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-neutral-900)] border border-[var(--color-neutral-800)] text-[var(--color-danger-500)] flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-4">
            Platform Admin Console
          </h1>
          <p className="text-xs text-[var(--color-neutral-400)] leading-relaxed">
            Authorized GymFlow operational management access only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-danger-500)]/10 border border-[var(--color-danger-500)]/20 text-[var(--color-danger-300)] text-[length:var(--text-caption-size)] font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-400)]" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="admin-login-email"
              type="email"
              label="Admin Email Address"
              placeholder="admin@gymflow.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              variant="dark"
            />

            <div>
              <Input
                id="admin-login-password"
                type="password"
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                variant="dark"
              />
              {onNavigateToForgotPassword && (
                <div className="text-right mt-1.5">
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-[length:var(--text-caption-size)] text-[var(--color-neutral-400)] hover:text-[var(--color-danger-400)] transition-colors font-medium cursor-pointer"
                  >
                    Forgot admin password?
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={loading}
            className="bg-[var(--color-danger-600)] hover:bg-[var(--color-danger-500)] text-white font-bold border-none"
          >
            Authenticate Admin Console
          </Button>

          <div className="pt-6 border-t border-[var(--color-neutral-800)]/80 text-center">
            <button
              type="button"
              onClick={onNavigateToGymLogin}
              className="text-[length:var(--text-caption-size)] font-medium text-[var(--color-neutral-400)] hover:text-white transition-colors cursor-pointer"
            >
              Gym Owner Sign In →
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[var(--color-neutral-600)] font-medium">
        GymFlow Platform Operations • Protected by Supabase Database RLS
      </div>
    </div>
  );
};
