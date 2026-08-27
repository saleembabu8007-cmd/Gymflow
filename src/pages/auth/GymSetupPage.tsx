import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input, Select, StepProgress, Card, Badge } from '../../components/ui';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

interface GymSetupPageProps {
  onComplete: () => void;
}

export const GymSetupPage: React.FC<GymSetupPageProps> = ({ onComplete }) => {
  const { user, createGym } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your gym name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await createGym({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        currency: formData.currency,
        timezone: formData.timezone,
      });
      onComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create gym. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Let's set up your gym"
      subtitle={
        <div className="flex flex-col items-center gap-2 w-full">
          <StepProgress
            currentStep={2}
            totalSteps={2}
            labels={['Account Registration', 'Workspace Setup']}
            className="mt-2 mb-2"
          />
          <p className="text-[length:var(--text-body-size)] text-neutral-600 mt-2 max-w-sm mx-auto text-center leading-relaxed">
            Welcome, <span className="font-semibold text-neutral-900">{user?.name || 'Gym Owner'}</span>! Enter your gym details to configure your workspace.
          </p>
        </div>
      }
    >
      {errorMessage && (
        <div className="mb-6 p-3.5 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-[length:var(--text-caption-size)] font-semibold rounded-[var(--radius-lg)] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Input
            label="Gym Name"
            placeholder="e.g. Iron Vault Fitness"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Input
            label="Contact Phone Number"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Currency"
              value={formData.currency}
              onChange={(val) => setFormData({ ...formData, currency: val })}
              options={[
                { value: 'INR', label: '₹ INR (Rupees)' },
                { value: 'USD', label: '$ USD (Dollars)' },
                { value: 'EUR', label: '€ EUR (Euros)' },
                { value: 'AED', label: 'AED (Dirhams)' },
              ]}
            />
          </div>

          <div>
            <Select
              label="Timezone"
              value={formData.timezone}
              onChange={(val) => setFormData({ ...formData, timezone: val })}
              options={[
                { value: 'Asia/Kolkata', label: 'IST (Kolkata)' },
                { value: 'UTC', label: 'UTC (GMT)' },
                { value: 'America/New_York', label: 'EST (New York)' },
                { value: 'Europe/London', label: 'BST (London)' },
              ]}
            />
          </div>
        </div>

        {/* Workspace Setup Summary */}
        <Card className="p-4 border border-[var(--color-success-200)] bg-[var(--color-success-50)] shadow-none">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-success-900)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-success-600)]" />
              GymFlow Workspace Setup
            </span>
            <Badge variant="success" icon={<ShieldCheck className="w-3 h-3" />}>Ready</Badge>
          </div>
          <p className="text-[13px] text-[var(--color-success-700)] leading-relaxed mt-1.5">
            Includes member management, WhatsApp payment reminders, and payment collection ledgers.
          </p>
        </Card>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            Complete Setup & Open Dashboard
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};
