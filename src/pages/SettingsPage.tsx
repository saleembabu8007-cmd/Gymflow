import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BottomSheet } from '../components/ui/BottomSheet';
import { SettingsRow } from '../components/ui/SettingsRow';
import { TwoTierNumber } from '../components/ui/TwoTierNumber';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useGym } from '../hooks/useGym';
import { useGymSettings } from '../hooks/useGymSettings';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils/currencyUtils';
import { MembershipPlan, MembershipDuration } from '../types';
import {
  Building2,
  CreditCard,
  User,
  LogOut,
  Eye,
  EyeOff,
  Bell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  FileText,
  Shield,
} from 'lucide-react';
import { cn } from '../utils/classNames';

type ActiveSheetType =
  | 'gym-details'
  | 'payment-reminders'
  | 'account-profile'
  | 'account-security'
  | null;

export const SettingsPage: React.FC = () => {
  const { gym, plans, updateGym, createPlan, updatePlan, deletePlan } = useGym();
  const { settings, updateSettings, currencySymbol } = useGymSettings();
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { success, error: showErrorToast } = useToast();

  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  // 1. Gym Profile state
  const [gymName, setGymName] = useState(gym?.name || '');
  const [gymPhone, setGymPhone] = useState(gym?.phone || '');
  const [gymAddress, setGymAddress] = useState(gym?.address || '');
  const [isSavingGym, setIsSavingGym] = useState(false);

  // 2. Reminder & Payment Settings state
  const [currency, setCurrency] = useState(settings?.currencySymbol || '₹');
  const [defaultDuration, setDefaultDuration] = useState<MembershipDuration>(
    settings?.defaultMembershipDuration || '1_MONTH'
  );
  const [reminderTiming, setReminderTiming] = useState<number>(
    settings?.reminderDaysBeforeDue ?? 3
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // 3. Account state
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // 4. Plan Modal State (Create / Edit)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDuration, setPlanDuration] = useState<number>(1);
  const [planFee, setPlanFee] = useState<string>('1500');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

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

  const handleCloseSheet = () => {
    setActiveSheet(null);
    setNewPassword('');
  };

  // Section 1 Handler: Save Gym Details
  const handleSaveGymProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) {
      showErrorToast('Check Gym Name', 'Gym name cannot be empty.');
      return;
    }
    try {
      setIsSavingGym(true);
      await updateGym({
        name: gymName.trim(),
        phone: gymPhone.trim(),
        address: gymAddress.trim(),
      });
      success('Gym Details Saved', 'Your gym profile has been updated.');
      handleCloseSheet();
    } catch (err: any) {
      showErrorToast('Failed to save', err.message || 'Please check your inputs.');
    } finally {
      setIsSavingGym(false);
    }
  };

  // Section 2 Handler: Save Payment & Reminder Settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
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
      success('Preferences Saved', 'Reminder and billing preferences updated.');
      handleCloseSheet();
    } catch (err: any) {
      showErrorToast('Failed to save preferences', err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Section 3 Handler: Save Account
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingAccount(true);

      if (activeSheet === 'account-profile') {
        if (!ownerName.trim()) {
          showErrorToast('Owner name required', 'Please enter your name.');
          setIsSavingAccount(false);
          return;
        }
        if (!ownerEmail.trim() || !ownerEmail.includes('@')) {
          showErrorToast('Invalid email', 'Please enter a valid email address.');
          setIsSavingAccount(false);
          return;
        }
        await updateProfile({
          name: ownerName.trim(),
          email: ownerEmail.trim().toLowerCase(),
        });
        success('Profile Updated', 'Owner details saved successfully.');
      } else if (activeSheet === 'account-security') {
        if (!newPassword.trim() || newPassword.length < 6) {
          showErrorToast('Password too short', 'Password must be at least 6 characters.');
          setIsSavingAccount(false);
          return;
        }
        await updatePassword(newPassword.trim());
        success('Password Changed', 'Your security password has been updated.');
      }

      handleCloseSheet();
    } catch (err: any) {
      showErrorToast('Failed to update account', err.message || 'Please try again.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Section 4 Handler: Membership Plans (Create / Edit / Delete)
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDuration(1);
    setPlanFee('1500');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDuration(plan.durationMonths || 1);
    setPlanFee(String(plan.defaultFee || 1500));
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      showErrorToast('Plan Name Required', 'Please enter a name for the plan.');
      return;
    }
    const numericFee = Number(planFee);
    if (!planFee || isNaN(numericFee) || numericFee <= 0) {
      showErrorToast('Invalid Fee', 'Fee must be greater than zero.');
      return;
    }

    try {
      setIsSavingPlan(true);
      if (editingPlan) {
        await updatePlan(editingPlan.id, {
          name: planName.trim(),
          durationMonths: planDuration,
          defaultFee: numericFee,
        });
        success('Plan Updated', `${planName} has been updated.`);
      } else {
        await createPlan({
          name: planName.trim(),
          durationMonths: planDuration,
          defaultFee: numericFee,
          isActive: true,
        });
        success('Plan Created', `${planName} is now available for new members.`);
      }
      setIsPlanModalOpen(false);
    } catch (err: any) {
      showErrorToast('Failed to save plan', err.message);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDeletePlan = async (planId: string, planTitle: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${planTitle}? Existing member records will remain unaffected.`)) {
      try {
        await deletePlan(planId);
        success('Plan Removed', `${planTitle} has been removed.`);
      } catch (err: any) {
        showErrorToast('Failed to remove plan', err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const durationLabels: Record<string, string> = {
    '1_MONTH': '1 Month',
    '3_MONTHS': '3 Months',
    '6_MONTHS': '6 Months',
    '12_MONTHS': '12 Months',
  };

  const isSavingSheet = isSavingGym || isSavingSettings || isSavingAccount;

  return (
    <div className="space-y-8 select-none font-sans max-w-4xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* 1. GYM INFORMATION                                                        */}
      {/* ========================================================================= */}
      <section aria-labelledby="gym-profile-heading" className="space-y-3">
        <SectionHeader
          title="Gym Information"
          subtitle="Your club identity and contact details"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          <SettingsRow
            label="Gym Name & Phone"
            value={gymName ? `${gymName} · ${gymPhone || 'No phone set'}` : 'Not set'}
            onClick={() => setActiveSheet('gym-details')}
          />
          <SettingsRow
            label="Address & Location"
            value={gymAddress || 'No address set'}
            onClick={() => setActiveSheet('gym-details')}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MEMBERSHIP PLANS                                                       */}
      {/* ========================================================================= */}
      <section aria-labelledby="membership-plans-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Membership Plans"
            count={plans.length}
            subtitle="Standard enrollment plans and fees"
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenCreatePlan}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Plan
          </Button>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {plans.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No custom plans created yet. Click "New Plan" to add one.
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 block truncate">
                      {plan.name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {plan.durationMonths || 1} {(plan.durationMonths || 1) === 1 ? 'month' : 'months'} cycle
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <TwoTierNumber
                    value={formatCurrency(Number(plan.defaultFee) || 0, currencySymbol)}
                    caption="/cycle"
                    size="xs"
                    align="right"
                  />

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(plan)}
                      aria-label={`Edit ${plan.name}`}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {plans.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        aria-label={`Deactivate ${plan.name}`}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PAYMENT & REMINDER PREFERENCES                                         */}
      {/* ========================================================================= */}
      <section aria-labelledby="preferences-heading" className="space-y-3">
        <SectionHeader
          title="Payment & Reminder Rules"
          subtitle="Currency and follow-up timing"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          <SettingsRow
            label="Currency & Billing Duration"
            value={`${currency} (${currencySymbol}) · Default ${durationLabels[defaultDuration] || defaultDuration}`}
            onClick={() => setActiveSheet('payment-reminders')}
          />
          <SettingsRow
            label="Follow-Up Reminder Timing"
            value={`Send reminder ${reminderTiming} days before due`}
            onClick={() => setActiveSheet('payment-reminders')}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACCOUNT & SECURITY                                                     */}
      {/* ========================================================================= */}
      <section aria-labelledby="account-heading" className="space-y-3">
        <SectionHeader
          title="Account & Security"
          subtitle="Owner login credentials"
        />

        <div className="bg-white border border-neutral-200/80 rounded-[var(--radius-lg)] shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          <SettingsRow
            label="Owner Profile"
            value={ownerName ? `${ownerName} · ${ownerEmail}` : ownerEmail}
            onClick={() => setActiveSheet('account-profile')}
          />
          <SettingsRow
            label="Security Password"
            value="Change password"
            onClick={() => setActiveSheet('account-security')}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER ACTIONS                                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200/80">
        <div className="text-xs text-neutral-500">
          <span>Signed in as <strong className="text-neutral-900">{user?.email || 'Owner'}</strong></span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleLogout}
          className="text-neutral-700 hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)]"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign out
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET FOR FORMS                                                    */}
      {/* ========================================================================= */}
      <BottomSheet
        isOpen={activeSheet !== null}
        onClose={handleCloseSheet}
        title={
          activeSheet === 'gym-details'
            ? 'Edit Gym Details'
            : activeSheet === 'payment-reminders'
            ? 'Edit Billing & Reminders'
            : activeSheet === 'account-profile'
            ? 'Edit Owner Profile'
            : 'Change Password'
        }
      >
        <div className="p-5 select-none font-sans space-y-4">
          {activeSheet === 'gym-details' && (
            <form id="form-gym-details" onSubmit={handleSaveGymProfile} className="space-y-4">
              <Input
                label="Gym Name"
                required
                placeholder="e.g. Iron Fitness Club"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
              />
              <Input
                label="Gym Phone Number"
                required
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
              />
              <Textarea
                label="Address"
                placeholder="e.g. 2nd Floor, Apex Plaza, MG Road"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                rows={2}
                helperText="Displayed on payment receipts and invoices."
              />
            </form>
          )}

          {activeSheet === 'payment-reminders' && (
            <form id="form-payment-reminders" onSubmit={handleSavePaymentSettings} className="space-y-4">
              <Select
                label="Currency Symbol"
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

              <Select
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

              <Select
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
                helperText="How many days before renewal to show member in Follow-Up list."
              />
            </form>
          )}

          {activeSheet === 'account-profile' && (
            <form id="form-account-profile" onSubmit={handleSaveAccount} className="space-y-4">
              <Input
                label="Owner Full Name"
                required
                placeholder="e.g. Vikram Sharma"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="e.g. vikram@ironfitness.in"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </form>
          )}

          {activeSheet === 'account-security' && (
            <form id="form-account-security" onSubmit={handleSaveAccount} className="space-y-4">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                helperText="Must be at least 6 characters"
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
            </form>
          )}

          {/* Sheet Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200/80">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseSheet}
              disabled={isSavingSheet}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={
                activeSheet === 'gym-details'
                  ? 'form-gym-details'
                  : activeSheet === 'payment-reminders'
                  ? 'form-payment-reminders'
                  : activeSheet === 'account-profile'
                  ? 'form-account-profile'
                  : 'form-account-security'
              }
              variant="primary"
              isLoading={isSavingSheet}
              disabled={isSavingSheet}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* ========================================================================= */}
      {/* MEMBERSHIP PLAN CREATE / EDIT MODAL                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
        description={editingPlan ? `Update details for ${editingPlan.name}` : 'Add a standard enrollment plan'}
        maxWidth="md"
        showCloseButton={!isSavingPlan}
      >
        <form onSubmit={handleSavePlan} className="p-5 sm:p-6 space-y-4 select-none font-sans">
          <Input
            label="Plan Name"
            required
            placeholder="e.g. 3 Months Transformation"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Duration"
              value={planDuration}
              onChange={(val) => setPlanDuration(Number(val))}
              options={[
                { value: 1, label: '1 Month' },
                { value: 2, label: '2 Months' },
                { value: 3, label: '3 Months' },
                { value: 6, label: '6 Months' },
                { value: 12, label: '12 Months (1 Year)' },
              ]}
            />

            <Input
              label="Default Fee"
              required
              type="number"
              prefixText={currencySymbol}
              placeholder="1500"
              value={planFee}
              onChange={(e) => setPlanFee(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200/80">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPlanModalOpen(false)}
              disabled={isSavingPlan}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingPlan}
              disabled={isSavingPlan}
            >
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
