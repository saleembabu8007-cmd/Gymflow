import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Select, SegmentedControl } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useGym } from '../hooks/useGym';
import { useGymSettings } from '../hooks/useGymSettings';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { Building2, CreditCard, User, LogOut, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { MembershipDuration } from '../types';

export const SettingsPage: React.FC = () => {
  const { gym, updateGym } = useGym();
  const { settings, updateSettings } = useGymSettings();
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { success, error } = useToast();

  // 1. Gym Profile state
  const [gymName, setGymName] = useState(gym?.name || '');
  const [gymPhone, setGymPhone] = useState(gym?.phone || '');
  const [gymAddress, setGymAddress] = useState(gym?.address || '');
  const [isSavingGym, setIsSavingGym] = useState(false);

  // 2. Payment Settings state
  const [currency, setCurrency] = useState(settings?.currencySymbol || '₹');
  const [defaultDuration, setDefaultDuration] = useState<MembershipDuration>(
    settings?.defaultMembershipDuration || '1_MONTH'
  );
  const [reminderTiming, setReminderTiming] = useState<number>(
    settings?.reminderDaysBeforeDue ?? 3
  );
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);

  // 3. Account state
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Keep state in sync with loaded data
  useEffect(() => {
    if (gym) {
      setGymName(gym.name || '');
      setGymPhone(gym.phone || '');
      setGymAddress(gym.address || '');
    }
  }, [gym]);

  useEffect(() => {
    if (settings) {
      setCurrency(settings.currencySymbol || '₹');
      setDefaultDuration(settings.defaultMembershipDuration || '1_MONTH');
      setReminderTiming(settings.reminderDaysBeforeDue ?? 3);
    }
  }, [settings]);

  useEffect(() => {
    if (user) {
      setOwnerName(user.name || '');
      setOwnerEmail(user.email || '');
    }
  }, [user]);

  // Section 1 Handler: Save Gym Profile
  const handleSaveGymProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) {
      error('Gym name cannot be empty');
      return;
    }
    try {
      setIsSavingGym(true);
      await updateGym({
        name: gymName.trim(),
        phone: gymPhone.trim(),
        address: gymAddress.trim(),
      });
      success('Gym Profile Updated', 'Gym name, phone, and address saved.');
    } catch (err: any) {
      error('Failed to save gym profile', err.message || 'Please check your inputs');
    } finally {
      setIsSavingGym(false);
    }
  };

  // Section 2 Handler: Save Payment Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingPaymentSettings(true);
      const currencyCodeMap: Record<string, string> = {
        '₹': 'INR',
        '$': 'USD',
        'RM': 'MYR',
        'AED': 'AED',
        '€': 'EUR',
        '£': 'GBP',
      };
      await updateSettings({
        currencySymbol: currency,
        currencyCode: currencyCodeMap[currency] || 'INR',
        defaultMembershipDuration: defaultDuration,
        reminderDaysBeforeDue: Number(reminderTiming),
      });
      success('Payment Settings Saved', 'Currency, default duration, and reminder timing updated.');
    } catch (err: any) {
      error('Failed to save payment settings', err.message);
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  // Section 3 Handler: Save Account
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      error('Owner name cannot be empty');
      return;
    }
    if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
      error('Please enter a valid email address');
      return;
    }

    try {
      setIsSavingAccount(true);
      await updateProfile({
        name: ownerName.trim(),
        email: ownerEmail.trim().toLowerCase(),
      });

      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          error('Password must be at least 6 characters');
          setIsSavingAccount(false);
          return;
        }
        await updatePassword(newPassword.trim());
        setNewPassword('');
      }

      success('Account Updated', 'Owner details and credentials saved.');
    } catch (err: any) {
      error('Failed to update account', err.message || 'Please try again');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* ========================================================================= */}
      {/* SECTION 1: GYM PROFILE                                                    */}
      {/* ========================================================================= */}
      <Card id="section-gym-profile" className="mb-6">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200/50">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <CardTitle>Gym Profile</CardTitle>
            <CardDescription>Basic information about your fitness center</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveGymProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="input-gym-name"
                label="Gym Name *"
                placeholder="e.g. Iron Fitness Club"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
              />
              <Input
                id="input-gym-phone"
                label="Phone *"
                placeholder="e.g. +91 98765 43210"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
                required
              />
            </div>

            <Input
              id="input-gym-address"
              label="Address"
              placeholder="e.g. 2nd Floor, Apex Plaza, MG Road"
              value={gymAddress}
              onChange={(e) => setGymAddress(e.target.value)}
              helperText="Displayed on member receipts and payment invoices"
            />

            <div className="flex justify-end pt-4">
              <Button
                id="btn-save-gym-profile"
                type="submit"
                size="md"
                variant="primary"
                isLoading={isSavingGym}
                className="px-6"
              >
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 2: PAYMENT SETTINGS                                               */}
      {/* ========================================================================= */}
      <Card id="section-payment-settings" className="mb-6">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200/50">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>Default billing rules and automated reminder timing</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePaymentSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Currency */}
              <Select
                id="select-currency"
                label="Currency"
                value={currency}
                onChange={(val) => setCurrency(val)}
                options={[
                  { value: '₹', label: '₹ (INR - Indian Rupee)' },
                  { value: '$', label: '$ (USD - US Dollar)' },
                  { value: 'RM', label: 'RM (MYR - Ringgit)' },
                  { value: 'AED', label: 'AED (Dirham)' },
                  { value: '€', label: '€ (EUR - Euro)' },
                  { value: '£', label: '£ (GBP - British Pound)' },
                ]}
              />

              {/* Default membership duration */}
              <Select
                id="select-default-duration"
                label="Default Membership Duration"
                value={defaultDuration}
                onChange={(val) => setDefaultDuration(val as MembershipDuration)}
                options={[
                  { value: '1_MONTH', label: '1 Month' },
                  { value: '3_MONTHS', label: '3 Months' },
                  { value: '6_MONTHS', label: '6 Months' },
                  { value: '12_MONTHS', label: '12 Months' },
                ]}
              />

              {/* Reminder timing */}
              <Select
                id="select-reminder-timing"
                label="Reminder Timing"
                value={reminderTiming}
                onChange={(val) => setReminderTiming(Number(val))}
                options={[
                  { value: 1, label: '1 day before due' },
                  { value: 2, label: '2 days before due' },
                  { value: 3, label: '3 days before due (Recommended)' },
                  { value: 5, label: '5 days before due' },
                  { value: 7, label: '7 days before due' },
                ]}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                id="btn-save-payment-settings"
                type="submit"
                size="md"
                variant="primary"
                isLoading={isSavingPaymentSettings}
                className="px-6"
              >
                Save Payment Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 3: ACCOUNT                                                        */}
      {/* ========================================================================= */}
      <Card id="section-account-settings" className="mb-6">
        <CardHeader className="flex flex-row items-center gap-3 border-b border-neutral-100 pb-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200/50">
            <User className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <CardTitle>Account</CardTitle>
            <CardDescription>Owner credentials and login security</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="input-owner-name"
                label="Owner Name *"
                placeholder="e.g. Vikram Sharma"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />

              <Input
                id="input-owner-email"
                type="email"
                label="Email *"
                placeholder="e.g. vikram@ironfitness.in"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Input
                id="input-new-password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Leave blank to keep current password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Enter a new password (min. 6 characters) only if you wish to change it"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-11 h-11 sm:w-auto sm:h-auto flex items-center justify-center -mr-2 sm:mr-0 text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                id="btn-save-account"
                type="submit"
                size="md"
                variant="primary"
                isLoading={isSavingAccount}
                className="px-6"
              >
                Save Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* LOGOUT (Clearly placed at bottom, simple and understated)                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pb-4">
        <div className="text-[length:var(--text-body-size)] text-neutral-600 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <span>Logged in as <span className="font-bold text-neutral-800">{user?.email || 'Owner'}</span></span>
          <span className="hidden sm:inline text-neutral-300">•</span>
          <button
            type="button"
            id="btn-restart-onboarding"
            onClick={() => {
              localStorage.removeItem('gymflow_onboarding_completed');
              window.location.reload();
            }}
            className="py-2 sm:py-0 min-h-[44px] sm:min-h-0 text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer text-left"
          >
            Restart First-Time Setup
          </button>
        </div>

        <Button
          id="btn-settings-logout"
          variant="tertiary"
          size="sm"
          onClick={handleLogout}
          className="text-neutral-600 hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
          leftIcon={<LogOut className="w-4 h-4" />}
        >
          Log out
        </Button>
      </div>
    </div>
  );
};
