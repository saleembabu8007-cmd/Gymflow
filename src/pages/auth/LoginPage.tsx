import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { parseAuthError } from '../../utils/errorUtils';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sessionExpired] = useState(() => {
    if (sessionExpiredNotice) return true;
    try {
      const stored = sessionStorage.getItem('gymflow_session_expired');
      if (stored === 'true') {
        sessionStorage.removeItem('gymflow_session_expired');
        return true;
      }
    } catch {
      // Ignore sessionStorage error
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
        // Ignore sessionStorage error
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
      title="Welcome back"
      subtitle="Sign in to manage your gym members and dues"
    >
      <form onSubmit={handleSubmit} className="space-y-4 select-none font-sans" noValidate>
        {sessionExpired && !errorMessage && (
          <div
            role="status"
            className="p-3 bg-[var(--color-warning-50)] border border-[var(--color-warning-200)] text-[var(--color-warning-800)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-warning-600)]" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

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

        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
            disabled={isSubmitting}
            size="md"
          >
            Sign In
          </Button>
        </div>

        {onNavigateToRegister && (
          <div className="pt-3 border-t border-neutral-100 text-center text-xs text-neutral-500">
            <span>Don't have an account? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-neutral-900 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};
