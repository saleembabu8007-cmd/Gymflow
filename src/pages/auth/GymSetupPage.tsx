import React, { useState } from 'react';
import { Building2, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input, Select, Card } from '../../components/ui';
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold tracking-wide">
            Step 2 of 2 — Gym Setup
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Let's set up your gym
          </h1>
          <p className="text-sm text-neutral-600">
            Welcome, <span className="font-semibold text-neutral-900">{user?.name || 'Gym Owner'}</span>! Enter your gym details to configure your workspace.
          </p>
        </div>

        {/* Card Form */}
        <Card className="p-6 sm:p-8 shadow-xs border border-neutral-200 bg-white">
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
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
                leftIcon={<Building2 className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div>
              <Input
                label="Contact Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                leftIcon={<Phone className="w-4 h-4 text-neutral-400" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  options={[
                    { value: 'Asia/Kolkata', label: 'IST (Kolkata)' },
                    { value: 'UTC', label: 'UTC (GMT)' },
                    { value: 'America/New_York', label: 'EST (New York)' },
                    { value: 'Europe/London', label: 'BST (London)' },
                  ]}
                />
              </div>
            </div>

            {/* Subscription Summary */}
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  GymFlow Pro Plan
                </span>
                <span className="text-emerald-700 font-bold">₹1,999 / month</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Includes unlimited member records, WhatsApp payment reminders, and payment collection ledgers.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Setup & Open Dashboard
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
