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

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister,
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* 1. Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">GymFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-sm font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Start Subscription
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5" />
          Single Plan • Production-Ready Gym Operating System
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 max-w-4xl">
          Know exactly who has paid, who is pending, and who needs to pay today.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-8">
          Replace paper notebooks, memory, spreadsheets, and lost WhatsApp receipts with a single digital workflow built specifically for gym owners.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-12">
          <button
            type="button"
            onClick={onNavigateToRegister}
            className="flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-7 py-3.5 rounded-xl text-base transition-all cursor-pointer"
          >
            Create Gym Account <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold px-6 py-3.5 rounded-xl text-base border border-zinc-800 transition-all cursor-pointer"
          >
            Owner Sign In
          </button>
        </div>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-3 gap-6 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm w-full max-w-3xl">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">5 Sec</div>
            <div className="text-xs text-zinc-400 mt-1">Dashboard Insight</div>
          </div>
          <div className="text-center border-x border-zinc-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
            <div className="text-xs text-zinc-400 mt-1">Tenant Data Isolation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">1 Click</div>
            <div className="text-xs text-zinc-400 mt-1">WhatsApp Reminders</div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="py-16 bg-zinc-900/40 border-y border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Built for Gym Owners Who Want Zero Headaches
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              No bloated enterprise software. Only what matters: collecting revenue on time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Member Directory</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Organize members by active status, plan type, and next payment date. Search by name or phone number in seconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">WhatsApp Reminders</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Send instant pre-formatted WhatsApp reminders with UPI payment link with a single tap directly to members.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-start">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-emerald-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Payment Ledger</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Track CASH, UPI, and bank collections with full timestamps, receipt records, and monthly collection totals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Single Subscription Plan Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            One Single Transparent Plan
          </h2>
          <p className="text-zinc-400 text-sm">
            No hidden tiers, no member limits. Everything included for your gym.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl border border-emerald-500/40 bg-zinc-900/90 relative text-left max-w-lg mx-auto">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold uppercase tracking-wider">
            All-Inclusive
          </div>

          <h3 className="text-xl font-bold text-white mb-1">GymFlow Pro</h3>
          <p className="text-xs text-zinc-400 mb-6">Complete Gym Operations System</p>

          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl sm:text-5xl font-extrabold text-white">₹1,999</span>
            <span className="text-zinc-400 text-sm">/ month</span>
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
              <li key={idx} className="flex items-center gap-3 text-sm text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onNavigateToRegister}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 rounded-xl text-center text-sm transition-all cursor-pointer"
          >
            Activate Subscription & Register Gym
          </button>
        </div>
      </section>

      {/* 5. Security & Isolation */}
      <section className="py-12 bg-zinc-900/80 border-t border-zinc-800 text-zinc-400 text-xs text-center">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Supabase Auth & PostgreSQL Row Level Security (RLS) Enforced</span>
          </div>
          <div>© {new Date().getFullYear()} GymFlow. All rights reserved.</div>
        </div>
      </section>
    </div>
  );
};
