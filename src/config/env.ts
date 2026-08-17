/**
 * Application Environment Configuration & Client Security Audit
 * 
 * CRITICAL SECURITY PRINCIPLE:
 * - Public client variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are exposed to browser.
 * - Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`) must NEVER be included in Vite client environment variables.
 */

const metaEnv = (import.meta as any).env || {};

const supabaseUrl = (metaEnv.VITE_SUPABASE_URL as string) || '';
const supabasePublishableKey =
  (metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (metaEnv.VITE_SUPABASE_ANON_KEY as string) ||
  '';

export const env = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_PUBLISHABLE_KEY: supabasePublishableKey,
  SUPABASE_ANON_KEY: supabasePublishableKey,
  IS_PRODUCTION: metaEnv.PROD ?? false,
  IS_DEV: metaEnv.DEV ?? true,
  IS_SUPABASE_CONFIGURED: Boolean(supabaseUrl && supabasePublishableKey),
  ENABLE_SAAS_BILLING: metaEnv.VITE_ENABLE_SAAS_BILLING === 'true',
} as const;

// Security verification guard checking no secret key leaks exist in client env
if (typeof window !== 'undefined') {
  if (
    metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    metaEnv.SUPABASE_SERVICE_ROLE_KEY ||
    metaEnv.SUPABASE_SECRET_KEY ||
    metaEnv.VITE_SUPABASE_SECRET_KEY
  ) {
    console.error(
      'CRITICAL SECURITY WARNING: Supabase Secret / Service Role Key detected in client variables! Remove it immediately.'
    );
  }
}
