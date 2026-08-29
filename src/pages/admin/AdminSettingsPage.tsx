import React, { useState } from 'react';
import { Shield, Server, Key, AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { parseAuthError } from '../../utils/errorUtils';
import { supabase } from '../../services/supabaseClient';

export const AdminSettingsPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      if (!supabase) throw new Error('Supabase client is not configured');

      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) throw updateErr;

      setSuccess('Platform admin password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 select-none font-sans max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight font-display">
          Platform Settings & Security
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          SaaS product configuration, administrator credentials, and backend security
        </p>
      </div>

      {/* Security Credentials Section */}
      <section aria-labelledby="admin-security-heading" className="space-y-3">
        <SectionHeader
          title="Admin Credentials"
          subtitle="Update administrative access password"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[var(--color-success-50)] border border-[var(--color-success-200)] text-[var(--color-success-800)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success-600)]" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter new admin password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError(null);
              }}
              helperText="Must be at least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                disabled={loading || !newPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Backend Infrastructure Overview */}
      <section aria-labelledby="infrastructure-heading" className="space-y-3">
        <SectionHeader
          title="Backend Architecture"
          subtitle="Connected Supabase and Edge service parameters"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block">Supabase Tenant Isolation</span>
              <span className="text-[11px] text-neutral-500 font-mono">Row-Level Security (RLS) policies active</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]">
              ENFORCED
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block">WhatsApp Notification Gateway</span>
              <span className="text-[11px] text-neutral-500 font-mono">Universal web api link dispatch format</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
              DIRECT LINK
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
