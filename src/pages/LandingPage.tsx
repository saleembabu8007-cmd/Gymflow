import React from 'react';
import {
  Dumbbell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  CreditCard,
  Users,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  return (
    <div className="min-h-screen bg-[var(--color-neutral-950)] text-[var(--color-neutral-100)] flex flex-col font-sans selection:bg-[var(--color-brand-500)] selection:text-[var(--color-neutral-950)]">
      {/* 1. Header Navigation */}
      <header className="border-b border-[var(--color-neutral-800)]/80 bg-[var(--color-neutral-950)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-brand-500)] text-[var(--color-neutral-950)] flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">GymFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="tertiary"
              onClick={onNavigateToLogin}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={onNavigateToRegister}
            >
              Start Subscription
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)] text-[length:var(--text-caption-size)] font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          Single Plan • Production-Ready Gym Operating System
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-4xl">
          Know exactly who has paid, who is pending, and who needs to pay today.
        </h1>

        <p className="text-lg sm:text-xl text-[var(--color-neutral-400)] max-w-2xl leading-relaxed mb-8">
          Replace paper notebooks, memory, spreadsheets, and lost WhatsApp receipts with a single digital workflow built specifically for gym owners.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-12">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onNavigateToRegister}
          >
            Create Gym Account <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onNavigateToLogin}
          >
            Owner Sign In
          </Button>
        </div>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-3 gap-6 p-6 rounded-[var(--radius-xl)] border border-[var(--color-neutral-800)]/80 bg-[var(--color-neutral-900)]/50 backdrop-blur-sm w-full max-w-3xl">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">5 Sec</div>
            <div className="text-[length:var(--text-caption-size)] text-[var(--color-neutral-400)] mt-1">Dashboard Insight</div>
          </div>
          <div className="text-center border-x border-[var(--color-neutral-800)]">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-400)]">100%</div>
            <div className="text-[length:var(--text-caption-size)] text-[var(--color-neutral-400)] mt-1">Tenant Data Isolation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">1 Click</div>
            <div className="text-[length:var(--text-caption-size)] text-[var(--color-neutral-400)] mt-1">WhatsApp Reminders</div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="py-16 bg-[var(--color-neutral-900)]/40 border-y border-[var(--color-neutral-800)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-[length:var(--text-subtitle-size)] sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Built for Gym Owners Who Want Zero Headaches
            </h2>
            <p className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)]">
              No bloated enterprise software. Only what matters: collecting revenue on time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="md:pl-6 md:border-l border-[var(--color-neutral-800)] flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-[var(--color-brand-400)]" />
                <h3 className="text-[length:var(--text-subtitle-size)] font-bold text-white">Member Directory</h3>
              </div>
              <p className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)] leading-relaxed">
                Organize members by active status, plan type, and next payment date. Search by name or phone number in seconds.
              </p>
            </div>

            <div className="md:pl-6 md:border-l border-[var(--color-neutral-800)] flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-5 h-5 text-[var(--color-brand-400)]" />
                <h3 className="text-[length:var(--text-subtitle-size)] font-bold text-white">WhatsApp Reminders</h3>
              </div>
              <p className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)] leading-relaxed">
                Send instant pre-formatted WhatsApp reminders with UPI payment link with a single tap directly to members.
              </p>
            </div>

            <div className="md:pl-6 md:border-l border-[var(--color-neutral-800)] flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-[var(--color-brand-400)]" />
                <h3 className="text-[length:var(--text-subtitle-size)] font-bold text-white">Payment Ledger</h3>
              </div>
              <p className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)] leading-relaxed">
                Track CASH, UPI, and bank collections with full timestamps, receipt records, and monthly collection totals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Single Subscription Plan Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-[length:var(--text-subtitle-size)] font-extrabold text-white tracking-tight mb-3">
            One Single Transparent Plan
          </h2>
          <p className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)]">
            No hidden tiers, no member limits. Everything included for your gym.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-[var(--radius-xl)] border border-[var(--color-brand-500)]/40 bg-[var(--color-neutral-900)]/90 relative text-left max-w-lg mx-auto">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[var(--color-brand-500)] text-[var(--color-neutral-950)] text-xs font-bold uppercase tracking-wider">
            All-Inclusive
          </div>

          <h3 className="text-xl font-bold text-white mb-1">GymFlow Pro</h3>
          <p className="text-[length:var(--text-caption-size)] text-[var(--color-neutral-400)] mb-6">Complete Gym Operations System</p>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl sm:text-5xl font-extrabold text-white">₹1,999</span>
            <span className="text-[var(--color-neutral-400)] text-[length:var(--text-body-size)]">/ month</span>
          </div>

          <ul className="space-y-3.5 mb-8">
            {[
              'Unlimited Gym Members',
              'Instant WhatsApp Payment Reminders',
              'Payment Collection Ledger & Receipt Tracking',
              'UPI QR Code Integration',
              'Multi-Device Mobile & Desktop Access',
              'PostgreSQL Row-Level Security Isolation',
            ].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[length:var(--text-body-size)] text-[var(--color-neutral-200)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-brand-400)] shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={onNavigateToRegister}
          >
            Activate Subscription & Register Gym
          </Button>
        </div>
      </section>

      {/* 5. Security & Isolation */}
      <section className="py-12 bg-[var(--color-neutral-900)]/80 border-t border-[var(--color-neutral-800)] text-[var(--color-neutral-400)] text-[length:var(--text-caption-size)] text-center">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--color-brand-400)]" />
            <span>Supabase Auth & PostgreSQL Row Level Security (RLS) Enforced</span>
          </div>
          <div>© {new Date().getFullYear()} GymFlow. All rights reserved.</div>
        </div>
      </section>
    </div>
  );
};
