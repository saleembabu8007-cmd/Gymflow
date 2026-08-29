import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PlatformGymTenant } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Users,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

interface GymDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gym: PlatformGymTenant | null;
  onToggleStatus: (gymId: string, currentStatus: string) => Promise<void>;
}

export const GymDetailModal: React.FC<GymDetailModalProps> = ({
  isOpen,
  onClose,
  gym,
  onToggleStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!gym) return null;

  const isSuspended = gym.status === 'SUSPENDED';

  const handleAction = async () => {
    try {
      setIsUpdating(true);
      await onToggleStatus(gym.id, gym.status);
      setShowConfirm(false);
    } catch (e) {
      console.error('Failed to update gym status', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gym Tenant Details"
      description={`Operational tenant details for ${gym.name}`}
      maxWidth="lg"
    >
      <div className="space-y-5 text-neutral-900 font-sans p-4 sm:p-6">
        {/* Header Summary Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shrink-0">
              <Building2 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-neutral-950 truncate">{gym.name}</h3>
              <p className="text-xs text-neutral-500 font-mono">Tenant ID: {gym.id}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                gym.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {gym.status === 'ACTIVE' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{gym.status}</span>
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Gym Info & Owner Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gym Entity Information */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-2.5 text-xs">
            <h4 className="font-bold text-neutral-950 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <Building2 className="w-4 h-4 text-neutral-500" />
              <span>Gym Information</span>
            </h4>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Registered Name:</span>
                <span className="font-semibold text-neutral-900">{gym.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Contact Phone:</span>
                <span className="font-mono text-neutral-900">{gym.phone}</span>
              </div>
              {gym.address && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-neutral-500 shrink-0">Address:</span>
                  <span className="font-medium text-neutral-900 text-right">{gym.address}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Created Date:</span>
                <span className="font-mono text-neutral-900">{formatDate(gym.createdAt, { format: 'medium' })}</span>
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 space-y-2.5 text-xs">
            <h4 className="font-bold text-neutral-950 text-sm flex items-center gap-1.5 border-b border-neutral-100 pb-2">
              <User className="w-4 h-4 text-neutral-500" />
              <span>Owner Account</span>
            </h4>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Full Name:</span>
                <span className="font-semibold text-neutral-900">{gym.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Email Address:</span>
                <span className="font-mono text-neutral-900 truncate max-w-[180px]">{gym.ownerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Active Members:</span>
                <span className="font-bold text-emerald-700">{gym.memberCount} members</span>
              </div>
            </div>
          </div>
        </div>

        {/* SaaS Subscription Info */}
        <div className="p-4 rounded-2xl bg-neutral-950 text-white space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CreditCard className="w-4 h-4 text-rose-500" />
              <span>SaaS Subscription Plan</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              ₹1,999 / mo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-neutral-400 block text-[10px]">Subscription Plan</span>
              <span className="font-bold text-white text-xs">{gym.subscriptionPlan}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px]">Renewal Date</span>
              <span className="font-mono font-bold text-white text-xs">{formatDate(gym.renewalDate, { format: 'medium' })}</span>
            </div>
          </div>
        </div>

        {/* Platform Control Actions (Suspend / Reactivate) */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          {showConfirm ? (
            <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Are you sure you want to {isSuspended ? 'reactivate' : 'suspend'} <strong>{gym.name}</strong>?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="tertiary"
                  onClick={() => setShowConfirm(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant={isSuspended ? 'primary' : 'destructive'}
                  onClick={handleAction}
                  isLoading={isUpdating}
                >
                  Confirm {isSuspended ? 'Reactivate' : 'Suspend'}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant={isSuspended ? 'tertiary' : 'destructive'}
              onClick={() => setShowConfirm(true)}
            >
              {isSuspended ? 'Reactivate Gym Account' : 'Suspend Gym Account'}
            </Button>
          )}

          <Button variant="tertiary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
