import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/classNames';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'neutral';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="p-6 text-center flex flex-col items-center">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0',
            variant === 'danger'
              ? 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)]'
              : 'bg-neutral-100 text-neutral-800'
          )}
        >
          {variant === 'danger' ? (
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          ) : (
            <HelpCircle className="w-6 h-6 stroke-[2]" />
          )}
        </div>

        <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{title}</h3>
        <p className="text-sm text-neutral-600 mt-2 mb-6 max-w-xs leading-relaxed">{description}</p>

        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
