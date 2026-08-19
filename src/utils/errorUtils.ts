/**
 * Human-Readable Error Handling System
 * Converts raw Supabase, PostgREST, SQLSTATE, network, or validation errors into calm, actionable human language.
 */

export function parseAppError(error: unknown, fallbackMessage: string = 'Unable to complete action right now. Please try again.'): string {
  if (!error) return fallbackMessage;

  const rawMessage = typeof error === 'string' 
    ? error 
    : (error as any)?.message || (error as any)?.details || String(error);

  const lower = rawMessage.toLowerCase();

  // 1. Network & Connection Failures
  if (
    lower.includes('fetch failed') ||
    lower.includes('networkerror') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('offline')
  ) {
    return "Couldn't connect. Please check your internet connection and try again.";
  }

  // 2. Duplicate / Conflict Errors
  if (lower.includes('unique constraint') || lower.includes('duplicate key') || lower.includes('23505')) {
    if (lower.includes('phone') || lower.includes('gym_members_phone')) {
      return 'A member with this phone number is already registered in your gym.';
    }
    if (lower.includes('email')) {
      return 'A member with this email address already exists.';
    }
    return 'This record already exists in your gym database.';
  }

  // 3. Foreign Key / Not Found Errors
  if (lower.includes('pgrst116') || lower.includes('row not found') || lower.includes('member not found')) {
    return 'The requested record was not found or has been removed.';
  }

  if (lower.includes('violates foreign key') || lower.includes('23503')) {
    return 'Unable to update record because dependent item is missing.';
  }

  // 4. SQLSTATE / Technical Database Noise (Hide SQL, schema, or RPC details)
  if (
    lower.includes('sqlstate') ||
    lower.includes('plpgsql') ||
    lower.includes('relation') ||
    lower.includes('column') ||
    lower.includes('syntax error') ||
    lower.includes('schema') ||
    lower.includes('rpc')
  ) {
    console.error('[GymFlow Database Technical Error]:', error);
    return 'Database request failed. Please try again.';
  }

  // 5. Authentication Errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials') || lower.includes('wrong password')) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  if (lower.includes('user already registered') || lower.includes('already in use') || lower.includes('already exists')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }

  if (lower.includes('password should be at least') || lower.includes('weak password') || lower.includes('password length')) {
    return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
  }

  if (lower.includes('email not confirmed') || lower.includes('unverified')) {
    return 'Please verify your email address before signing in.';
  }

  if (lower.includes('jwt expired') || lower.includes('token expired') || lower.includes('invalid token') || lower.includes('session expired')) {
    return 'Your session has expired. Please sign in again to continue.';
  }

  if (lower.includes('account suspended') || lower.includes('account inactive')) {
    return 'Your gym owner account has been suspended. Please contact support.';
  }

  // 6. External Service / WhatsApp Errors
  if (lower.includes('whatsapp') || lower.includes('deep link') || lower.includes('popup')) {
    return "Couldn't open WhatsApp draft. Please verify recipient phone number.";
  }

  // 7. Clean Return or Fallback
  if (rawMessage && !rawMessage.includes('{') && !rawMessage.includes('[object')) {
    return rawMessage;
  }

  return fallbackMessage;
}

// Backward-compatible alias for auth forms
export function parseAuthError(error: unknown): string {
  return parseAppError(error, 'Authentication failed. Please check your details and try again.');
}
