/**
 * Human-Readable Error Handling Helper
 * Converts raw Supabase / network errors into clear, friendly user messages.
 */

export function parseAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = typeof error === 'string' ? error : (error as any).message || String(error);
  const lower = message.toLowerCase();

  if (lower.includes('unique constraint') || lower.includes('duplicate key')) {
    if (lower.includes('phone')) return 'A member with this phone number already exists in your gym.';
    if (lower.includes('email')) return 'A member with this email address already exists.';
    return 'This record already exists in your gym database.';
  }

  // Hide technical PostgreSQL / SQLSTATE / internal RPC errors from end users
  if (
    lower.includes('sqlstate') ||
    lower.includes('plpgsql') ||
    lower.includes('relation') ||
    lower.includes('column') ||
    lower.includes('violates foreign key') ||
    lower.includes('syntax error') ||
    lower.includes('legacy')
  ) {
    return 'Unable to complete setup at this time. Please try again.';
  }

  if (lower.includes('user already registered') || lower.includes('already in use') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials') || lower.includes('wrong password')) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  if (lower.includes('password should be at least') || lower.includes('weak password') || lower.includes('password length')) {
    return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
  }

  if (lower.includes('email not confirmed') || lower.includes('unverified')) {
    return 'Please verify your email address before signing in.';
  }

  if (lower.includes('token expired') || lower.includes('invalid token') || lower.includes('expired reset')) {
    return 'Your password reset link has expired. Please request a new link.';
  }

  if (lower.includes('fetch failed') || lower.includes('networkerror') || lower.includes('failed to fetch')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  if (lower.includes('account suspended') || lower.includes('account inactive')) {
    return 'Your gym owner account has been suspended. Please contact support.';
  }

  return message || 'Authentication failed. Please try again.';
}

