import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Avatar } from '../ui/Avatar';
import { Member } from '../../types';
import { useGym } from '../../hooks/useGym';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { formatToISODate, calculateNextPaymentDate, formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/currencyUtils';
import {
  CheckCircle2,
  Calendar,
  CreditCard,
  Phone,
  User,
  Plus,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';

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
  nextPaymentDate?: string;
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

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [monthlyFee, setMonthlyFee] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(formatToISODate(new Date()));
  const [nextPaymentDate, setNextPaymentDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [addedMember, setAddedMember] = useState<Member | null>(null);
  const prevIsOpenRef = React.useRef(false);

  // Initialize and synchronize smart defaults only when modal opens freshly
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Find initial active plan
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
      setAddedMember(null);
    } else if (!isOpen && prevIsOpenRef.current) {
      // Reset state when closed
      setAddedMember(null);
      setErrors({});
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, plans, settings.defaultMonthlyFee]);

  // Find currently selected plan object
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const durationMonths = selectedPlan?.durationMonths || 1;

  // Handle plan change: intelligently pre-fill fee & recalculate next payment date
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

  // Handle start date change: automatically update suggested next payment date
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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Name validation
    if (!name.trim()) {
      newErrors.name = 'Please enter the member\'s full name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // 2. Phone validation
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (cleanPhone.length < 7) {
      newErrors.phone = 'Please enter a complete phone number';
    }

    // 3. Fee validation
    const feeNum = Number(monthlyFee);
    if (!monthlyFee || isNaN(feeNum) || feeNum <= 0) {
      newErrors.monthlyFee = 'Fee must be greater than 0';
    }

    // 4. Start date validation
    if (!startDate) {
      newErrors.startDate = 'Please select a valid start date';
    }

    // 5. Next payment date validation
    if (!nextPaymentDate) {
      newErrors.nextPaymentDate = 'Please select when the next payment is due';
    }

    // 6. Optional email validation
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showErrorToast('Check Required Fields', 'Please complete all required fields correctly.');
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

      // Transition to success screen inside modal
      setAddedMember(newMember);
    } catch (err: any) {
      showErrorToast('Failed to add member', err.message || 'Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to add another member smoothly
  const handleResetForAnother = () => {
    setAddedMember(null);
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
      title={addedMember ? undefined : 'Add Member'}
      description={addedMember ? undefined : 'Add a new member and know when their next payment is due.'}
      maxWidth="md"
    >
      {addedMember ? (
        /* --- SUCCESS STATE --- */
        <div className="py-3 text-center space-y-6">
          {/* Green Check Icon & Heading */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-950 tracking-tight">
              Member added.
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xs">
              {addedMember.name} is now enrolled. Their next payment is scheduled.
            </p>
          </div>

          {/* Member Summary Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-left space-y-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Avatar name={addedMember.name} size="md" />
              <div className="min-w-0">
                <span className="font-bold text-sm text-neutral-900 block truncate">
                  {addedMember.name}
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  {addedMember.phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                  Plan & Fee
                </span>
                <span className="font-semibold text-neutral-900">
                  {addedMember.planName} · {formatCurrency(addedMember.monthlyFee, currencySymbol)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                  Next Due Date
                </span>
                <span className="font-semibold text-neutral-900">
                  {formatDate(addedMember.nextPaymentDate, { format: 'medium' })}
                </span>
              </div>
            </div>
          </div>

          {/* Success Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              id="btn-add-another-member"
              variant="outline"
              size="md"
              onClick={handleResetForAnother}
              className="w-full sm:flex-1 py-2.5 font-semibold"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Another Member
            </Button>

            <Button
              id="btn-view-new-member"
              size="md"
              onClick={() => {
                if (onViewMember) {
                  onViewMember(addedMember);
                } else {
                  onClose();
                }
              }}
              className="w-full sm:flex-1 py-2.5 font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
              leftIcon={<Eye className="w-4 h-4" />}
            >
              View Member
            </Button>
          </div>
        </div>
      ) : (
        /* --- ADD MEMBER FORM --- */
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Full name * */}
          <Input
            id="member-fullname-input"
            label="Full name *"
            placeholder="e.g. Rahul Verma"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            required
            autoFocus
          />

          {/* 2. Phone number * & Email (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="member-phone-input"
              label="Phone number *"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={errors.phone}
              required
            />

            <Input
              id="member-email-input"
              label="Email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              helperText="Optional"
            />
          </div>

          {/* 3. Membership plan * & Monthly fee * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="member-plan-select"
              label="Membership plan *"
              value={selectedPlanId}
              onChange={(e) => handlePlanChange(e.target.value)}
              options={plans.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.durationMonths} ${p.durationMonths === 1 ? 'month' : 'months'})`,
              }))}
            />

            <Input
              id="member-fee-input"
              label={`Monthly fee (${currencySymbol}) *`}
              type="number"
              min="1"
              placeholder="e.g. 1500"
              value={monthlyFee}
              onChange={(e) => {
                setMonthlyFee(e.target.value);
                if (errors.monthlyFee) setErrors((prev) => ({ ...prev, monthlyFee: undefined }));
              }}
              prefixText={currencySymbol}
              error={errors.monthlyFee}
              required
            />
          </div>

          {/* 4. Start date * & Next payment date * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="member-startdate-input"
              label="Start date *"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              error={errors.startDate}
              required
            />

            <Input
              id="member-nextpayment-input"
              label="Next payment date *"
              type="date"
              value={nextPaymentDate}
              onChange={(e) => {
                setNextPaymentDate(e.target.value);
                if (errors.nextPaymentDate) setErrors((prev) => ({ ...prev, nextPaymentDate: undefined }));
              }}
              error={errors.nextPaymentDate}
              helperText={`Suggested based on ${durationMonths} mo plan duration`}
              required
            />
          </div>

          {/* 5. Notes (optional) */}
          <Input
            id="member-notes-input"
            label="Notes"
            placeholder="e.g. Morning 7:00 AM batch, prefers UPI payment"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            helperText="Optional"
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 mt-6">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              id="btn-submit-add-member"
              type="submit"
              size="md"
              isLoading={isSubmitting}
              className="bg-neutral-900 text-white hover:bg-neutral-800 font-semibold"
            >
              {isSubmitting ? 'Adding member...' : 'Add Member'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
