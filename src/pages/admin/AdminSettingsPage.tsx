import React, { useState } from 'react';
import { Shield, Server, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { parseAuthError } from '../../utils/errorUtils';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../services/supabaseClient';

export const AdminSettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase client is not configured');

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;

      setSuccess('Your platform admin password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans max-w-4xl text-neutral-900">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Platform Operational Settings</h1>
        <p className="text-[length:var(--text-caption-size)] text-neutral-500 mt-0.5">
          SaaS product owner configuration, password security, and backend services
        </p>
      </div>

      <div className="space-y-4">
        {/* Admin Password Management Form */}
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--color-brand-600)]" />
              <span>Platform Admin Security & Password Change</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-[length:var(--text-caption-size)] text-neutral-500 leading-relaxed">
              Update your credentials via Supabase Auth. Passwords are cryptographically hashed and never stored in application database tables.
            </p>

            {error && (
              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-600)] text-[length:var(--text-caption-size)] font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-[var(--radius-xl)] bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-600)] text-[length:var(--text-caption-size)] font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              id="admin-change-current-pass"
              type="password"
              label="Current Password (Optional)"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--color-brand-500)]"
            />

            <Input
              id="admin-change-new-pass"
              type="password"
              label="New Admin Password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--color-brand-500)]"
            />

            <Input
              id="admin-change-confirm-pass"
              type="password"
              label="Confirm New Password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--color-brand-500)]"
            />

            <Button
              type="submit"
              size="md"
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              Update Admin Password
            </Button>
          </form>
          </CardContent>
        </Card>

        {/* Security & Role Access Policy */}
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--color-brand-600)]" />
              <span>Security & Role Access Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[length:var(--text-caption-size)] text-neutral-500 leading-relaxed">
              Platform Admin access is governed by PostgreSQL RLS procedure <code className="text-[var(--color-brand-600)] font-mono bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">public.is_platform_admin()</code> and authenticated JWT role claims.
            </p>
            <div className="py-2 flex items-center justify-between text-[length:var(--text-caption-size)]">
              <span className="text-neutral-700 font-medium">Strict Client-Side Impersonation Shield</span>
              <Badge variant="success">ENABLED</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Backend Edge Functions */}
        <Card>
          <CardHeader className="border-b border-neutral-100 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--color-brand-600)]" />
              <span>Server-Side Edge Functions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[length:var(--text-caption-size)] font-mono">
              <div className="py-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-neutral-900 block font-bold">send-reminder</span>
                  <span className="text-neutral-500 text-[10px] font-sans">WhatsApp / SMS / Email Dispatcher</span>
                </div>
                <span className="text-[var(--color-success-600)] text-[10px] font-bold">ACTIVE</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-neutral-900 block font-bold">payment-webhook</span>
                  <span className="text-neutral-500 text-[10px] font-sans">SaaS Subscription Billing Webhook</span>
                </div>
                <span className="text-[var(--color-success-600)] text-[10px] font-bold">ACTIVE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
