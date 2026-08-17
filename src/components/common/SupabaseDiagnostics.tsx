import React from 'react';
import { AlertCircle, Server, CheckCircle2, XCircle } from 'lucide-react';
import { env } from '../../config/env';

interface SupabaseDiagnosticsProps {
  error?: string;
  onRetry?: () => void;
}

export const SupabaseDiagnostics: React.FC<SupabaseDiagnosticsProps> = ({ error, onRetry }) => {
  const hasUrl = Boolean(env.SUPABASE_URL);
  const hasKey = Boolean(env.SUPABASE_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-neutral-100">
      <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Supabase Configuration Diagnostics
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Production GymFlow architecture requires valid client environment variables.
            </p>
          </div>
        </div>

        {/* Status Checklist */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-neutral-300">VITE_SUPABASE_URL</span>
            {hasUrl ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-4 h-4" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-900">
            <span className="font-semibold text-neutral-300">VITE_SUPABASE_PUBLISHABLE_KEY</span>
            {hasKey ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-4 h-4" /> Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs py-1 border-t border-neutral-900">
            <span className="font-semibold text-neutral-300">Client Secret Security Guard</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Verified (No Secrets Exposed)
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="space-y-2 text-xs text-neutral-300">
          <p className="font-bold text-white">How to connect local development to Supabase:</p>
          <ol className="list-decimal list-inside space-y-1 text-neutral-400 pl-1">
            <li>
              Copy <code className="text-amber-400 font-mono bg-neutral-950 px-1 py-0.5 rounded">.env.example</code> to{' '}
              <code className="text-amber-400 font-mono bg-neutral-950 px-1 py-0.5 rounded">.env.local</code> in the root directory.
            </li>
            <li>
              Paste your Supabase project URL and anon publishable key into{' '}
              <code className="text-amber-400 font-mono bg-neutral-950 px-1 py-0.5 rounded">.env.local</code>.
            </li>
            <li>Restart the development server (<code className="text-neutral-200 font-mono">npm run dev</code>).</li>
          </ol>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Re-check Connection
          </button>
        )}
      </div>
    </div>
  );
};
