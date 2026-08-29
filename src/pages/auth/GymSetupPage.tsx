import React, { useState } from 'react';
import { AlertCircle, Building2, Phone } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
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
      title="Create your gym workspace"
      subtitle={`Welcome, ${user?.name || 'Owner'}! Enter your gym details to configure your dashboard.`}
    >
      {errorMessage && (
        <div className="mb-4 p-3 bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] text-[var(--color-danger-700)] text-xs font-semibold rounded-[var(--radius-md)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-danger-600)]" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 select-none font-sans" noValidate>
        <Input
          label="Gym Name"
          required
          placeholder="e.g. Iron Fitness Club"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errorMessage) setErrorMessage(null);
          }}
          leftIcon={<Building2 className="w-4 h-4" />}
          autoFocus
        />

        <Input
          label="Contact Phone Number"
          type="tel"
          required
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            if (errorMessage) setErrorMessage(null);
          }}
          leftIcon={<Phone className="w-4 h-4" />}
          helperText="Used on member receipts and WhatsApp reminders."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Currency"
            value={formData.currency}
            onChange={(val) => setFormData({ ...formData, currency: val })}
            options={[
              { value: 'INR', label: '₹ INR (Rupees)' },
              { value: 'USD', label: '$ USD (Dollars)' },
              { value: 'EUR', label: '€ EUR (Euros)' },
              { value: 'AED', label: 'AED (Dirhams)' },
              { value: 'MYR', label: 'RM MYR (Ringgit)' },
              { value: 'GBP', label: '£ GBP (Pounds)' },
            ]}
          />

          <Select
            label="Timezone"
            value={formData.timezone}
            onChange={(val) => setFormData({ ...formData, timezone: val })}
            options={[
              { value: 'Asia/Kolkata', label: 'IST (Kolkata)' },
              { value: 'UTC', label: 'UTC (GMT)' },
              { value: 'America/New_York', label: 'EST (New York)' },
              { value: 'Europe/London', label: 'BST (London)' },
              { value: 'Asia/Dubai', label: 'GST (Dubai)' },
            ]}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading}
            size="md"
          >
            Create Gym & Open Dashboard
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};
