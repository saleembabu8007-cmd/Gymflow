import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGym } from '../../hooks/useGym';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { Member } from '../../types';
import { formatToISODate, calculateNextPaymentDate } from '../../utils/dateUtils';
import { storage } from '../../services/storage';
import {
  Building2,
  UserPlus,
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  CreditCard,
} from 'lucide-react';
import { cn } from '../../utils/classNames';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemberSubmit?: (memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>) => Promise<Member>;
  onComplete?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onAddMemberSubmit,
  onComplete,
}) => {
  const { gym, updateGym } = useGym();
  const { currencySymbol, settings } = useGymSettings();
  const { success, error: showErrorToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Gym Name
  const [gymName, setGymName] = useState('Iron Fitness Club');
  const [isSavingGym, setIsSavingGym] = useState(false);

  // Step 2: First Member
  const [memberName, setMemberName] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberFee, setMemberFee] = useState('1500');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Track if modal just opened to prevent re-renders from resetting step
  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Opened freshly
      setGymName(gym?.name || 'Iron Fitness Club');
      setStep(1);
      setMemberName('');
      setMemberPhone('');
      setMemberFee(String(settings?.defaultMonthlyFee || 1500));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, gym?.name, settings?.defaultMonthlyFee]);

  // Handler for Step 1 -> Step 2
  const handleStep1Submit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedName = gymName.trim();
    if (!trimmedName) {
      showErrorToast('Please enter your gym name');
      return;
    }

    try {
      setIsSavingGym(true);
      await updateGym({ name: trimmedName });
    } catch (err) {
      console.warn('Failed to update gym name in background', err);
    } finally {
      setIsSavingGym(false);
      setStep(2);
    }
  };

  // Handler for Step 2 (Add Member)
  const handleStep2Submit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!memberName.trim()) {
      showErrorToast('Please enter a member name, or click skip.');
      return;
    }
    if (!memberPhone.trim()) {
      showErrorToast('Please enter a phone number, or click skip.');
      return;
    }

    try {
      setIsAddingMember(true);
      const today = formatToISODate(new Date());
      const nextDate = calculateNextPaymentDate(today, 1);
      const fee = Number(memberFee) || 1500;

      if (onAddMemberSubmit) {
        await onAddMemberSubmit({
          name: memberName.trim(),
          phone: memberPhone.trim(),
          planName: 'Monthly Standard',
          monthlyFee: fee,
          durationMonths: 1,
          startDate: today,
          nextPaymentDate: nextDate,
          status: 'ACTIVE',
        });
      }

      success('Member added', `${memberName.trim()} added as your first member.`);
      setStep(3);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Handler to skip Step 2
  const handleSkipStep2 = () => {
    setStep(3);
  };

  // Handler for Step 3 -> Go to Today
  const handleFinish = () => {
    try {
      localStorage.setItem('gymflow_onboarding_completed', 'true');
      storage.setOnboarded(true);
    } catch {}

    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  step === s
                    ? 'w-7 bg-neutral-900'
                    : step > s
                    ? 'w-4 bg-emerald-600'
                    : 'w-4 bg-neutral-200'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 font-medium">
            Step {step} of 3
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: GYM NAME                                                          */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div className="space-y-1 text-left">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-950 tracking-tight">
                What's your gym name?
              </h2>
              <p className="text-xs text-neutral-500">
                This will appear on payment receipts, reminder messages, and member invoices.
              </p>
            </div>

            <div className="space-y-1.5">
              <Input
                id="input-onboarding-gym-name"
                label="Gym Name *"
                placeholder="e.g. Iron Fitness Club"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                autoFocus
                required
                className="text-base font-semibold"
              />
            </div>

            <div className="pt-2">
              <Button
                id="btn-onboarding-step1-continue"
                type="submit"
                size="lg"
                isLoading={isSavingGym}
                disabled={!gymName.trim() || isSavingGym}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-2xs cursor-pointer"
              >
                Continue
              </Button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ADD FIRST MEMBER                                                  */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="space-y-1 text-left">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center mb-3">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-950 tracking-tight">
                Add your first member
              </h2>
              <p className="text-xs text-neutral-500">
                Add a member to immediately see how payment tracking and reminders work.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <Input
                id="input-onboarding-member-name"
                label="Member Name *"
                placeholder="e.g. Rahul Verma"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                autoFocus
              />

              <Input
                id="input-onboarding-member-phone"
                label="Phone Number *"
                placeholder="e.g. +91 98765 43210"
                value={memberPhone}
                onChange={(e) => setMemberPhone(e.target.value)}
              />

              <Input
                id="input-onboarding-member-fee"
                label={`Monthly Fee (${currencySymbol})`}
                type="number"
                placeholder="1500"
                value={memberFee}
                onChange={(e) => setMemberFee(e.target.value)}
              />
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                id="btn-onboarding-skip-member"
                onClick={handleSkipStep2}
                className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Skip for now
              </button>

              <Button
                id="btn-onboarding-add-member"
                type="submit"
                size="md"
                isLoading={isAddingMember}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 shadow-2xs cursor-pointer"
              >
                Add Member
              </Button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: READY                                                             */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="text-center py-3 space-y-5">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">
                You're ready.
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                GymFlow will help you keep track of who has paid and who needs to pay.
              </p>
            </div>

            <div className="pt-3">
              <Button
                id="btn-onboarding-go-to-today"
                type="button"
                size="lg"
                onClick={handleFinish}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold shadow-2xs cursor-pointer"
              >
                Go to Today
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
