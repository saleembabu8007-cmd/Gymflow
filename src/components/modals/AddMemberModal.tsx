import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { TwoTierNumber } from '../ui/TwoTierNumber';
import { Member } from '../../types';
import { useGym } from '../../hooks/useGym';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { formatToISODate, calculateNextPaymentDate, formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import { parseAppError } from '../../utils/errorUtils';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Mail,
  FileText,
  Plus,
} from 'lucide-react';
import { cn } from '../../utils/classNames';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemberSubmit: (memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>) => Promise<Member>;
  onViewMember?: (member: Member) => void;
  onMemberAdded?: (member: Member) => void;
}

interface FormErrors {
  name?: string;
  phone?: string;
  monthlyFee?: string;
  startDate?: string;
  email?: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onAddMemberSubmit,
  onViewMember,
  onMemberAdded,
}) => {
  const { plans } = useGym();
  const { currencySymbol, settings } = useGymSettings();
  const { success, error: showErrorToast } = useToast();

  // Wizard Step: 1 (Personal Info) -> 2 (Membership & Fee) -> 3 (Success)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [monthlyFee, setMonthlyFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(formatToISODate(new Date()));
  const [nextPaymentDate, setNextPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [addedMember, setAddedMember] = useState<Member | null>(null);
  const prevIsOpenRef = React.useRef(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      const defaultPlan = plans[0];
      const initialPlanId = defaultPlan?.id || 'plan_1m';
      const initialDuration = defaultPlan?.durationMonths || 1;
      const initialFee = String(defaultPlan?.defaultFee || settings.defaultMonthlyFee || 1500);
      const initialStartDate = formatToISODate(new Date());
      const initialNextDate = calculateNextPaymentDate(initialStartDate, initialDuration);

      setSelectedPlanId(initialPlanId);
      setMonthlyFee(initialFee);
      setStartDate(initialStartDate);
      setNextPaymentDate(initialNextDate);
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setErrors({});
      setCurrentStep(1);
      setAddedMember(null);
    } else if (!isOpen && prevIsOpenRef.current) {
      setAddedMember(null);
      setErrors({});
      setCurrentStep(1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, plans, settings.defaultMonthlyFee]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const durationMonths = selectedPlan?.durationMonths || 1;

  // Plan Selection Handler
  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setMonthlyFee(String(plan.defaultFee));
      const calculatedNext = calculateNextPaymentDate(startDate || formatToISODate(new Date()), plan.durationMonths);
      setNextPaymentDate(calculatedNext);
    }
    if (errors.monthlyFee) {
      setErrors((prev) => ({ ...prev, monthlyFee: undefined }));
    }
  };

  // Start Date Handler
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    if (newStartDate) {
      const calculatedNext = calculateNextPaymentDate(newStartDate, durationMonths);
      setNextPaymentDate(calculatedNext);
    }
    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: undefined }));
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim()) {
      newErrors.name = "Please enter member's full name";
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (cleanPhone.length < 7) {
      newErrors.phone = 'Please enter a complete phone number';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    const feeNum = Number(monthlyFee);
    if (!monthlyFee || isNaN(feeNum) || feeNum <= 0) {
      newErrors.monthlyFee = 'Fee must be greater than 0';
    }

    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const feeNumber = Number(monthlyFee) || 1500;
      const planTitle = selectedPlan?.name || '1 Month Standard';

      const newMember = await onAddMemberSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        planName: planTitle,
        durationMonths,
        monthlyFee: feeNumber,
        startDate,
        nextPaymentDate,
        status: 'ACTIVE',
        notes: notes.trim() || undefined,
      });

      success('Member added', `${newMember.name} has been enrolled successfully.`);
      if (onMemberAdded) onMemberAdded(newMember);
      setAddedMember(newMember);
    } catch (err: any) {
      const userFriendlyError = parseAppError(err, "Couldn't add member. Please check the details and try again.");
      showErrorToast("Couldn't add member", userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setAddedMember(null);
    setCurrentStep(1);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    const defaultPlan = plans[0];
    const initialPlanId = defaultPlan?.id || 'plan_1m';
    const initialDuration = defaultPlan?.durationMonths || 1;
    const initialFee = String(defaultPlan?.defaultFee || settings.defaultMonthlyFee || 1500);
    const initialStartDate = formatToISODate(new Date());
    const initialNextDate = calculateNextPaymentDate(initialStartDate, initialDuration);

    setSelectedPlanId(initialPlanId);
    setMonthlyFee(initialFee);
    setStartDate(initialStartDate);
    setNextPaymentDate(initialNextDate);
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={!isSubmitting}
    >
      <div className="p-5 sm:p-6 select-none font-sans">
        {addedMember ? (
          /* ========================================================================= */
          /* SUCCESS STATE                                                             */
          /* ========================================================================= */
          <div className="py-4 text-center space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[var(--color-success-50)] text-[var(--color-success-600)] flex items-center justify-center border border-[var(--color-success-200)] shadow-2xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-neutral-950 tracking-tight font-display">
                Member Enrolled
              </h3>
              <p className="text-xs text-neutral-500 max-w-xs">
                {addedMember.name} has been enrolled in {addedMember.planName}.
              </p>
            </div>

            {/* Member Snapshot Card */}
            <div className="p-4 rounded-[var(--radius-lg)] bg-neutral-50/80 border border-neutral-200/80 text-left flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={addedMember.name} size="md" />
                <div className="min-w-0">
                  <div className="font-bold text-sm text-neutral-900 truncate">
                    {addedMember.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono mt-0.5">
                    {addedMember.phone}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <TwoTierNumber
                  value={formatCurrency(Number(addedMember.monthlyFee) || 0, currencySymbol)}
                  caption={`Due ${formatDate(addedMember.nextPaymentDate, { format: 'short' })}`}
                  size="sm"
                  align="right"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              {onViewMember && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    onClose();
                    onViewMember(addedMember);
                  }}
                >
                  View Member Profile
                </Button>
              )}
              <Button
                variant="secondary"
                fullWidth
                onClick={handleResetForAnother}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Another
              </Button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2-STEP PROGRESSIVE DISCLOSURE FORM                                        */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Header & Step Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
              <div>
                <h2 className="text-lg font-bold text-neutral-950 tracking-tight font-display">
                  Add Member
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {currentStep === 1 ? 'Step 1 of 2 · Member Details' : 'Step 2 of 2 · Membership Plan'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors',
                    currentStep === 1
                      ? 'bg-neutral-900 text-white'
                      : 'bg-[var(--color-success-500)] text-white'
                  )}
                >
                  1
                </span>
                <span className="w-3 h-0.5 bg-neutral-200" />
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors',
                    currentStep === 2
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-400'
                  )}
                >
                  2
                </span>
              </div>
            </div>

            {currentStep === 1 ? (
              /* --- STEP 1: PERSONAL DETAILS --- */
              <form onSubmit={handleNextStep} className="space-y-4">
                <Input
                  label="Full Name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={errors.name}
                  leftIcon={<User className="w-4 h-4" />}
                  autoFocus
                />

                <Input
                  label="Phone Number"
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  error={errors.phone}
                  leftIcon={<Phone className="w-4 h-4" />}
                  helperText="Required for automated WhatsApp payment reminders."
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com (Optional)"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200/80">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Plan
                  </Button>
                </div>
              </form>
            ) : (
              /* --- STEP 2: MEMBERSHIP & PAYMENT SCHEDULE --- */
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Membership Plan"
                  value={selectedPlanId}
                  onChange={(val) => handlePlanChange(val)}
                  options={plans.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.durationMonths}mo) — ${formatCurrency(p.defaultFee, currencySymbol)}`,
                  }))}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    label="Admission Date"
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    error={errors.startDate}
                    leftIcon={<Calendar className="w-4 h-4" />}
                  />

                  <Input
                    label="Fee Amount"
                    required
                    type="number"
                    prefixText={currencySymbol}
                    placeholder="1500"
                    value={monthlyFee}
                    onChange={(e) => {
                      setMonthlyFee(e.target.value);
                      if (errors.monthlyFee) setErrors((prev) => ({ ...prev, monthlyFee: undefined }));
                    }}
                    error={errors.monthlyFee}
                  />
                </div>

                {/* Auto-Calculated Next Payment Indicator */}
                <div className="p-3 rounded-[var(--radius-md)] bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs">
                  <span className="text-neutral-500 font-medium">First renewal due:</span>
                  <span className="font-bold text-neutral-900 font-mono">
                    {formatDate(nextPaymentDate, { format: 'medium' })}
                  </span>
                </div>

                <Textarea
                  label="Notes"
                  placeholder="Medical conditions, fitness goals, or locker # (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-200/80">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setCurrentStep(1)}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Enroll Member
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
