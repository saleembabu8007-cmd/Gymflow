import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/ui/SearchInput';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { useToast } from '../components/ui/Toast';
import { colors, spacing, borderRadius, typography } from '../styles/tokens';
import { PAYMENT_STATUS } from '../types';
import { Dumbbell, Plus, CreditCard, Bell, Sparkles, Check, AlertCircle } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const { success, error, warning, info } = useToast();
  const [searchValue, setSearchValue] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Design System & Component Architecture"
        subtitle="Foundation tokens, typography scale, responsive primitives, and domain UI components"
      />

      {/* 1. Design Tokens: Colors & Semantic Palettes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neutral-900" />
          1. Color Palette Tokens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Neutral */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Neutrals (Balanced)</CardTitle>
              <CardDescription>Primary text, surfaces, borders, and shadows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-950 border" />
                <span className="text-xs font-mono">neutral-950 (#020617)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border" />
                <span className="text-xs font-mono">neutral-900 (#0F172A)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-500 border" />
                <span className="text-xs font-mono">neutral-500 (#64748B)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-200 border" />
                <span className="text-xs font-mono">neutral-200 (#E2E8F0)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-50 border" />
                <span className="text-xs font-mono">neutral-50 (#F8FAFC)</span>
              </div>
            </CardContent>
          </Card>

          {/* Semantic Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Semantic Status Colors</CardTitle>
              <CardDescription>Overdue, due soon, paid, and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">✓</div>
                <span className="text-xs font-mono">Success (Paid) #059669</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">!</div>
                <span className="text-xs font-mono">Warning (Due Soon/Today) #D97706</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs">✕</div>
                <span className="text-xs font-mono">Danger (Overdue) #DC2626</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">i</div>
                <span className="text-xs font-mono">Info (Actionable) #2563EB</span>
              </div>
            </CardContent>
          </Card>

          {/* Status Badges Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Domain Status Badges</CardTitle>
              <CardDescription>Standardized status badges for members</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5 items-start">
              <StatusBadge status={PAYMENT_STATUS.PAID} />
              <StatusBadge status={PAYMENT_STATUS.DUE_TODAY} />
              <StatusBadge status={PAYMENT_STATUS.DUE_SOON} />
              <StatusBadge status={PAYMENT_STATUS.OVERDUE} />
              <StatusBadge status={PAYMENT_STATUS.EXPIRED} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Reusable Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">2. Button Variants & Sizes</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Variants</span>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success" leftIcon={<Check className="w-4 h-4" />}>Success</Button>
                <Button variant="destructive" leftIcon={<AlertCircle className="w-4 h-4" />}>Destructive</Button>
                <Button variant="primary" isLoading>Loading</Button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-100">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Sizes</span>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small (32px)</Button>
                <Button size="md">Medium (40px)</Button>
                <Button size="lg">Large (48px)</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Input Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">3. Form Input Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <Input
                label="Standard Text Input"
                placeholder="Enter member name"
                helperText="Helper description text below field"
              />
              <Input
                label="Currency Prefix Input"
                placeholder="1,500"
                prefixText="₹"
              />
              <Input
                label="Validation Error State"
                defaultValue="Invalid format"
                error="Please enter a valid phone number"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Select
                label="Select Dropdown"
                options={[
                  { value: '1', label: '1 Month Membership' },
                  { value: '3', label: '3 Months Transformation' },
                  { value: '12', label: '12 Months Annual VIP' },
                ]}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Debounced Search Input</label>
                <SearchInput
                  value={searchValue}
                  onSearchChange={setSearchValue}
                  placeholder="Type to test debounced search..."
                />
                {searchValue && (
                  <p className="text-xs text-emerald-600 font-medium">Debounced Query: "{searchValue}"</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Avatars & Toast Triggers */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">4. Avatars & Toast Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Deterministic Avatar System</CardTitle>
              <CardDescription>Generates matching color palettes from initials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <Avatar name="Rahul Verma" size="xl" />
                <Avatar name="Pooja Hegde" size="lg" />
                <Avatar name="Amit Patel" size="md" />
                <Avatar name="Sneha Reddy" size="sm" />
                <Avatar name="Vikram Sharma" size="xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Toast Notification System</CardTitle>
              <CardDescription>Accessible floating status banners</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2.5">
              <Button size="sm" variant="success" onClick={() => success('Payment Saved', '₹1,500 recorded via UPI')}>
                Trigger Success Toast
              </Button>
              <Button size="sm" variant="destructive" onClick={() => error('Action Failed', 'Could not delete record')}>
                Trigger Error Toast
              </Button>
              <Button size="sm" variant="secondary" onClick={() => warning('Due Soon Alert', 'Member fee is due tomorrow')}>
                Trigger Warning
              </Button>
              <Button size="sm" variant="outline" onClick={() => info('Information', 'Backup synced with storage')}>
                Trigger Info
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};
