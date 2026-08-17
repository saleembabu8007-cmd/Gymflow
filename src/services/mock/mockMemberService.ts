import { IMemberService, IMemberFilterOptions } from '../interfaces';
import { Member, Payment, PAYMENT_STATUS } from '../../types';
import { storage } from '../storage';
import { calculatePaymentStatus } from '../../utils/statusUtils';
import { getDifferenceInDays, calculateNextPaymentDate, formatToISODate } from '../../utils/dateUtils';
import { generateUUID } from '../../utils/uuid';

export class MockMemberService implements IMemberService {
  private reload(): Member[] {
    return storage.getMembers();
  }

  private decorateMember(member: Member): Member {
    const settings = storage.getSettings();
    const reminderDays = settings.reminderDaysBeforeDue || settings.reminderWindowDays || 3;
    const calculatedStatus = calculatePaymentStatus(
      member.nextPaymentDate,
      reminderDays,
      member.status === 'ACTIVE'
    );
    const daysDifference = getDifferenceInDays(member.nextPaymentDate);
    return {
      ...member,
      calculatedStatus,
      daysDifference,
    };
  }

  async getMembers(gymId: string, filter?: IMemberFilterOptions): Promise<Member[]> {
    await this.delay(60);
    const allMembers = this.reload();
    let results = allMembers
      .filter((m) => !gymId || m.gymId === gymId)
      .map((m) => this.decorateMember(m));

    if (!filter) return results;

    if (filter.search?.trim()) {
      const q = filter.search.toLowerCase().trim();
      const qDigits = q.replace(/[^0-9]/g, '');

      results = results.filter((m) => {
        const nameMatch = m.name.toLowerCase().includes(q);
        const phoneMatch =
          m.phone.toLowerCase().includes(q) ||
          (qDigits.length > 0 && m.phone.replace(/[^0-9]/g, '').includes(qDigits));
        const emailMatch = m.email ? m.email.toLowerCase().includes(q) : false;
        return nameMatch || phoneMatch || emailMatch;
      });
    }

    if (filter.status && filter.status !== 'ALL') {
      if (filter.status === 'ACTIVE') {
        results = results.filter((m) => m.status === 'ACTIVE');
      } else if (filter.status === 'PENDING') {
        results = results.filter(
          (m) =>
            m.calculatedStatus === PAYMENT_STATUS.OVERDUE ||
            m.calculatedStatus === PAYMENT_STATUS.DUE_TODAY
        );
      } else if (filter.status === 'DUE_SOON') {
        results = results.filter((m) => m.calculatedStatus === PAYMENT_STATUS.DUE_SOON);
      } else if (filter.status === 'EXPIRED') {
        results = results.filter(
          (m) =>
            m.status === 'INACTIVE' ||
            m.calculatedStatus === PAYMENT_STATUS.EXPIRED
        );
      }
    }

    // Sorting
    if (filter.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        if (filter.sortBy === 'name') return a.name.localeCompare(b.name) * order;
        if (filter.sortBy === 'monthlyFee') return (a.monthlyFee - b.monthlyFee) * order;
        if (filter.sortBy === 'nextPaymentDate') return a.nextPaymentDate.localeCompare(b.nextPaymentDate) * order;
        if (filter.sortBy === 'createdAt') return (a.createdAt || '').localeCompare(b.createdAt || '') * order;
        return 0;
      });
    }

    // Pagination support
    if (filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      results = results.slice(start, start + filter.pageSize);
    }

    return results;
  }

  async getAttentionList(gymId: string, limit: number = 50): Promise<Member[]> {
    await this.delay(60);
    const members = await this.getMembers(gymId);
    const todayStr = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const attention = members.filter(
      (m) => (m.status === 'ACTIVE' || (m.status as any) === 'active') && m.nextPaymentDate <= threeDaysStr
    );

    attention.sort((a, b) => {
      const getPriority = (date: string) => {
        if (date < todayStr) return 1;
        if (date === todayStr) return 2;
        return 3;
      };
      const prioA = getPriority(a.nextPaymentDate);
      const prioB = getPriority(b.nextPaymentDate);
      if (prioA !== prioB) return prioA - prioB;
      return a.nextPaymentDate.localeCompare(b.nextPaymentDate);
    });

    return attention.slice(0, limit);
  }

  async getMemberById(id: string): Promise<Member | null> {
    await this.delay(60);
    const members = this.reload();
    const found = members.find((m) => m.id === id);
    return found ? this.decorateMember(found) : null;
  }

  async createMember(
    gymId: string,
    memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>
  ): Promise<Member> {
    await this.delay(150);
    const members = this.reload();
    const now = new Date().toISOString();
    const newMember: Member = {
      ...memberData,
      id: generateUUID(),
      gymId,
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newMember, ...members];
    storage.setMembers(updated);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return this.decorateMember(newMember);
  }

  async updateMember(id: string, updates: Partial<Member>): Promise<Member> {
    await this.delay(120);
    const members = this.reload();
    const idx = members.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Member not found: ${id}`);

    const updatedMember: Member = {
      ...members[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    members[idx] = updatedMember;
    storage.setMembers(members);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return this.decorateMember(updatedMember);
  }

  async deleteMember(id: string): Promise<void> {
    await this.delay(100);
    const members = this.reload();
    const filtered = members.filter((m) => m.id !== id);
    storage.setMembers(filtered);

    // Cascade delete payments and reminders for this member
    const payments = storage.getPayments().filter((p) => p.memberId !== id);
    storage.setPayments(payments);

    const reminders = storage.getReminders().filter((r) => r.memberId !== id);
    storage.setReminders(reminders);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}
  }

  async markAsPaid(
    memberId: string,
    paymentDetails: {
      amount: number;
      method: any;
      paymentDate?: string;
      notes?: string;
      durationMonths?: number;
      recordedBy?: string;
    }
  ): Promise<{ member: Member; payment: Payment }> {
    await this.delay(180);
    const members = this.reload();
    const memberIndex = members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) throw new Error('Member not found');

    const member = members[memberIndex];
    const duration = paymentDetails.durationMonths || member.durationMonths || 1;
    const paymentDate = paymentDetails.paymentDate || formatToISODate(new Date());

    // Centralized renewal calculation:
    // If next payment date is in the future (> paymentDate), extend from that future date; otherwise extend from paymentDate
    const baseDate =
      member.nextPaymentDate && member.nextPaymentDate > paymentDate
        ? member.nextPaymentDate
        : paymentDate;

    const newNextDate = calculateNextPaymentDate(baseDate, duration);

    // Update member in storage
    const updatedMember: Member = {
      ...member,
      nextPaymentDate: newNextDate,
      status: 'ACTIVE',
      updatedAt: new Date().toISOString(),
    };
    members[memberIndex] = updatedMember;
    storage.setMembers(members);

    // Create payment ledger record with UUID
    const payment: Payment = {
      id: generateUUID(),
      gymId: member.gymId,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      amount: paymentDetails.amount,
      paymentDate,
      paymentMethod: paymentDetails.method,
      periodCovered: `${duration} ${duration === 1 ? 'Month' : 'Months'} Extension`,
      notes: paymentDetails.notes,
      recordedBy: paymentDetails.recordedBy || 'Gym Owner',
      createdAt: new Date().toISOString(),
    };

    // Save payment
    const paymentsList = storage.getPayments();
    storage.setPayments([payment, ...paymentsList]);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return {
      member: this.decorateMember(updatedMember),
      payment,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
