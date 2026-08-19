import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { parseAuthError } from '../../utils/errorUtils';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

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
          leftIcon={<Mail className="w-4 h-4 text-neutral-400" />}
          autoComplete="email"
          disabled={isSubmitting}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-xs font-medium text-neutral-700"
            >
              Password
            </label>
            <button
              type="button"
              id="link-forgot-password"
              onClick={onNavigateToForgotPassword}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
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
            leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            id="btn-login-submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>

        {onNavigateToRegister && (
          <div className="pt-4 border-t border-neutral-100 text-center">
            <span className="text-xs text-neutral-600">Don't have a gym account? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};
