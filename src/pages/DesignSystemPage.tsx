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
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressRing } from '../components/ui/ProgressRing';
import { MetricCard } from '../components/ui/MetricCard';
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
              <CardTitle className="text-sm">Avatar Atom</CardTitle>
              <CardDescription>Identity colors, photo support, and status dots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Sizes (lg, md, sm)</span>
                <div className="flex items-end gap-4">
                  <Avatar name="Amit Patel" size="lg" />
                  <Avatar name="Sneha Reddy" size="md" />
                  <Avatar name="Vikram Sharma" size="sm" />
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Identity Colors</span>
                <div className="flex items-center gap-3">
                  <Avatar name="Coral" size="md" />
                  <Avatar name="Orange" size="md" />
                  <Avatar name="Yellow" size="md" />
                  <Avatar name="Lime" size="md" />
                  <Avatar name="Cyan" size="md" />
                  <Avatar name="Violet User" size="md" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Status & Photos</span>
                <div className="flex items-center gap-4">
                  <Avatar name="Rahul Verma" size="md" status="paid" />
                  <Avatar name="Pooja Hegde" size="md" status="overdue" />
                  <Avatar 
                    name="John Doe" 
                    size="md" 
                    status="paid"
                    imageUrl="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" 
                  />
                  <Avatar 
                    name="Jane Smith" 
                    size="lg" 
                    status="overdue"
                    imageUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" 
                  />
                </div>
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

      {/* 5. Progress Indicators */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">5. Progress Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Linear Progress Bar</CardTitle>
              <CardDescription>Value-driven or fixed semantic linear bars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Sizes</span>
                  <div className="space-y-3">
                    <ProgressBar value={40} size="sm" variant="brand" />
                    <ProgressBar value={60} size="md" variant="brand" />
                    <ProgressBar value={80} size="lg" variant="brand" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">Colors (Auto-driven by value)</span>
                  <div className="space-y-3">
                    <ProgressBar value={25} variant="auto" showLabel />
                    <ProgressBar value={65} variant="auto" showLabel />
                    <ProgressBar value={90} variant="auto" showLabel />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress Ring</CardTitle>
              <CardDescription>Circular hero stats</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8 py-4">
              <div className="flex items-end justify-center gap-8 w-full">
                <ProgressRing value={25} size="sm" variant="danger" />
                <ProgressRing value={65} size="md" variant="warning" caption="Goal Progress" />
                <ProgressRing value={85} size="lg" variant="success" caption="Security Score" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. Hero Stat Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">6. Hero Stat Cards (MetricCard)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Collected This Month"
            value="₹1,24,500"
            trend={{ value: 12.5, isPositive: true }}
            caption="Total revenue collected so far this month."
            variant="brand"
            onAction={() => success('Clicked', 'View ledger clicked')}
            actionLabel="View ledger"
          />
          <MetricCard
            title="Security Status"
            progress={{ value: 92, variant: 'success' }}
            caption="All backups and data streams are healthy."
            variant="success"
            onAction={() => success('Clicked', 'View security clicked')}
            actionLabel="View security"
          />
          <MetricCard
            title="Fuel Meter"
            progress={{ value: 35, variant: 'warning' }}
            caption="Running low on operational bandwidth."
            variant="warning"
            onAction={() => warning('Clicked', 'View bandwidth clicked')}
            actionLabel="View bandwidth"
          />
        </div>
      </section>
    </div>
  );
};
