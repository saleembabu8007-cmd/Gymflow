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

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setGymName(gym?.name || 'Iron Fitness Club');
      setStep(1);
      setMemberName('');
      setMemberPhone('');
      setMemberFee(String(settings?.defaultMonthlyFee || 1500));
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, gym?.name, settings?.defaultMonthlyFee]);

  const handleStep1Submit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedName = gymName.trim();
    if (!trimmedName) {
      showErrorToast('Gym Name Required', 'Please enter your gym name.');
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

  const handleStep2Submit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!memberName.trim()) {
      showErrorToast('Name Required', 'Please enter a member name, or click skip.');
      return;
    }
    if (!memberPhone.trim()) {
      showErrorToast('Phone Required', 'Please enter a phone number, or click skip.');
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

      success('Member Enrolled', `${memberName.trim()} enrolled as your first member.`);
      setStep(3);
    } catch (err: any) {
      showErrorToast("Couldn't add member", err.message || 'Please check details and try again.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleSkipStep2 = () => {
    setStep(3);
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('gymflow_onboarding_completed', 'true');
      storage.setOnboarded(true);
    } catch {
      // Ignore localStorage errors
    }

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
      <div className="space-y-5 p-5 sm:p-6 select-none font-sans">
        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  step === s
                    ? 'w-7 bg-neutral-950'
                    : step > s
                    ? 'w-4 bg-[var(--color-success-500)]'
                    : 'w-4 bg-neutral-200'
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 font-bold">
            Step {step} of 3
          </span>
        </div>

        {/* STEP 1: GYM NAME */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-950 tracking-tight font-display">
                What's your gym name?
              </h2>
              <p className="text-xs text-neutral-500">
                This will appear on payment receipts, WhatsApp reminders, and invoices.
              </p>
            </div>

            <Input
              label="Gym Name"
              placeholder="e.g. Iron Fitness Club"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              autoFocus
              required
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSavingGym}
                disabled={!gymName.trim() || isSavingGym}
              >
                Continue
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: ADD FIRST MEMBER (OPTIONAL) */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-950 tracking-tight font-display">
                Add your first member
              </h2>
              <p className="text-xs text-neutral-500">
                Add a member to immediately see how payment tracking and reminders work.
              </p>
            </div>

            <Input
              label="Member Full Name"
              placeholder="e.g. Rahul Sharma"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              autoFocus
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Monthly Membership Fee"
              type="number"
              prefixText={currencySymbol}
              value={memberFee}
              onChange={(e) => setMemberFee(e.target.value)}
              leftIcon={<CreditCard className="w-4 h-4" />}
            />

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSkipStep2}
                disabled={isAddingMember}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isAddingMember}
                disabled={isAddingMember || !memberName.trim() || !memberPhone.trim()}
              >
                Add Member & Continue
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: WORKSPACE READY */}
        {step === 3 && (
          <div className="py-3 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center mx-auto border border-[var(--color-success-200)] shadow-2xs">
              <CheckCircle2 className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-neutral-950 tracking-tight font-display">
                Your GymFlow workspace is ready!
              </h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                You're all set to manage members, record payments, and send automated WhatsApp reminders.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleFinish}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Open Today Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
