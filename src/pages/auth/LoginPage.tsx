import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { parseAuthError } from '../../utils/errorUtils';
import { AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onNavigateToForgotPassword: () => void;
  onLoginSuccess?: (path?: string) => void;
  onNavigateToRegister?: () => void;
  sessionExpiredNotice?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToForgotPassword,
  onLoginSuccess,
  onNavigateToRegister,
  sessionExpiredNotice = false,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sessionExpired, setSessionExpired] = useState(() => {
    if (sessionExpiredNotice) return true;
    try {
      const stored = sessionStorage.getItem('gymflow_session_expired');
      if (stored === 'true') {
        sessionStorage.removeItem('gymflow_session_expired');
        return true;
      }
    } catch {
      // Ignore sessionStorage access error
    }
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const user = await login(email.trim(), password);
      
      let redirectPath: string | undefined;
      try {
        const storedPath = sessionStorage.getItem('gymflow_redirect_path');
        if (storedPath && storedPath.startsWith('/app')) {
          redirectPath = storedPath;
          sessionStorage.removeItem('gymflow_redirect_path');
        }
      } catch {
        // Ignore sessionStorage read error
      }

      if (
        (user?.role as string) === 'PLATFORM_ADMIN' ||
        (user?.role as string) === 'platform_admin'
      ) {
        onLoginSuccess?.('/admin');
      } else {
        onLoginSuccess?.(redirectPath || '/app/today');
      }
    } catch (err: any) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your GymFlow owner dashboard"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {sessionExpired && !errorMessage && (
          <div
            role="status"
            className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          id="login-email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="owner@yourgym.com"
          autoComplete="email"
          disabled={isSubmitting}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              id="link-forgot-password"
              onClick={onNavigateToForgotPassword}
              className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <Input
            type="password"
            name="password"
            id="login-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            id="btn-login-submit"
            className="w-full"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>

        {onNavigateToRegister && (
          <div className="pt-5 border-t border-slate-100 text-center">
            <span className="text-sm text-slate-500">Don't have a gym account? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};
