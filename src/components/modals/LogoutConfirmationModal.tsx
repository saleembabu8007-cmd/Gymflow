import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LogOut, AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => Promise<void>;
  user: User | null;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  user,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      setError(null);
      await onConfirmLogout();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoggingOut) onClose();
      }}
      title="Sign Out of GymFlow"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/70">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-neutral-900 truncate">
              {user?.name || 'Authenticated User'}
            </p>
            <p className="text-[11px] text-neutral-500 truncate">
              {user?.email || 'Active Session'}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Are you sure you want to end your current session? You will need to enter your password again to access your dashboard.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoggingOut}
            disabled={isLoggingOut}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
