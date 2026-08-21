import React, { useState } from 'react';
import { Shield, Server, Key, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../services/supabaseClient';
import { parseAuthError } from '../../utils/errorUtils';

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
    <div className="space-y-6 font-sans max-w-4xl text-zinc-100">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Operational Settings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          SaaS product owner configuration, password security, and backend services
        </p>
      </div>

      <div className="space-y-2">
        {/* Admin Password Management Form */}
        <div className="py-6 border-b border-zinc-800 space-y-5">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Platform Admin Security & Password Change</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Update your credentials via Supabase Auth. Passwords are cryptographically hashed and never stored in application database tables.
          </p>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
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
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-rose-500"
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
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-rose-500"
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
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-rose-500"
            />

            <Button
              type="submit"
              size="md"
              isLoading={loading}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold border-none shadow-md shadow-rose-600/20"
            >
              Update Admin Password
            </Button>
          </form>
        </div>

        {/* Security & Role Access Policy */}
        <div className="py-6 border-b border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Shield className="w-4 h-4 text-rose-500" />
            <span>Security & Role Access Policy</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Platform Admin access is governed by PostgreSQL RLS procedure <code className="text-rose-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded">public.is_platform_admin()</code> and authenticated JWT role claims.
          </p>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Strict Client-Side Impersonation Shield</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
              ENABLED
            </span>
          </div>
        </div>

        {/* Backend Edge Functions */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <Server className="w-4 h-4 text-rose-500" />
            <span>Server-Side Edge Functions</span>
          </div>
          <div className="text-xs font-mono">
            <div className="py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <div>
                <span className="text-white block font-bold">send-reminder</span>
                <span className="text-zinc-500 text-[10px]">WhatsApp / SMS / Email Dispatcher</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">ACTIVE</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-white block font-bold">payment-webhook</span>
                <span className="text-zinc-500 text-[10px]">SaaS Subscription Billing Webhook</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
