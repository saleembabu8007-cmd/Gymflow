import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Member } from '../../types';
import { useMembers } from '../../hooks/useMembers';
import { useGymSettings } from '../../hooks/useGymSettings';
import { useToast } from '../ui/Toast';
import { Save } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess?: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess,
}) => {
  const { updateMember } = useMembers();
  const { currencySymbol } = useGymSettings();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [planName, setPlanName] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setName(member.name);
      setPhone(member.phone);
      setEmail(member.email || '');
      setPlanName(member.planName);
      setMonthlyFee(String(member.monthlyFee));
      setNextPaymentDate(member.nextPaymentDate);
      setStatus(member.status);
      setNotes(member.notes || '');
    }
  }, [member?.id, isOpen]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      error('Validation Error', 'Name and phone number are required.');
      return;
    }
    const numFee = Number(monthlyFee);
    if (isNaN(numFee) || numFee <= 0) {
      error('Validation Error', 'Please enter a valid membership fee.');
      return;
    }

    try {
      setLoading(true);
      await updateMember(member.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        planName: planName.trim() || member.planName,
        monthlyFee: numFee,
        nextPaymentDate,
        status,
        notes: notes.trim() || undefined,
      });
      success('Member Updated', `${name}'s profile has been updated.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      error('Failed to update member', err?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member Profile"
      description={`Update profile and membership settings for ${member.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Phone Number *"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Plan Name"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Fee Amount (${currencySymbol}) *`}
            type="number"
            required
            value={monthlyFee}
            onChange={(e) => setMonthlyFee(e.target.value)}
            prefixText={currencySymbol}
          />
          <Input
            label="Next Payment Due Date *"
            type="date"
            required
            value={nextPaymentDate}
            onChange={(e) => setNextPaymentDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Membership Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
            options={[
              { value: 'ACTIVE', label: 'Active Membership' },
              { value: 'INACTIVE', label: 'Inactive / Expired' },
            ]}
          />
          <Input
            label="Notes / Batch (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
