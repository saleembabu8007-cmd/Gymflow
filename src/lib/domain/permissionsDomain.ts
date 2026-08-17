import { User } from '../../types';

/**
 * Domain Logic: Authorization & Permission Checks
 */

export function isPlatformAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return (user.role as string) === 'PLATFORM_ADMIN';
}

export function isGymOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  return (user.role as string) === 'GYM_OWNER' || (user.role as string) === 'OWNER';
}

export function canManageMembers(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = user.role as string;
  return ['PLATFORM_ADMIN', 'GYM_OWNER', 'OWNER', 'ADMIN', 'STAFF', 'MANAGER'].includes(role);
}

export function canAccessSettings(user: User | null | undefined): boolean {
  if (!user) return false;
  const role = user.role as string;
  return ['PLATFORM_ADMIN', 'GYM_OWNER', 'OWNER', 'ADMIN'].includes(role);
}

export function canRecordPayments(user: User | null | undefined): boolean {
  if (!user) return false;
  return true; // All authenticated gym staff/owners can record payments
}
