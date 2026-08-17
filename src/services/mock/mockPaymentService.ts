import { IPaymentService, IPaymentFilterOptions } from '../interfaces';
import { Payment } from '../../types';
import { storage } from '../storage';
import { generateUUID } from '../../utils/uuid';

export class MockPaymentService implements IPaymentService {
  async getPayments(gymId: string, filter?: IPaymentFilterOptions): Promise<Payment[]> {
    await this.delay(80);
    const payments = storage.getPayments();
    let list = payments.filter((p) => !gymId || p.gymId === gymId);

    if (!filter) return list;

    if (filter.search?.trim()) {
      const q = filter.search.toLowerCase().trim();
      const qDigits = q.replace(/[^0-9]/g, '');
      list = list.filter(
        (p) =>
          p.memberName.toLowerCase().includes(q) ||
          (qDigits.length > 0 && p.memberPhone.replace(/[^0-9]/g, '').includes(qDigits)) ||
          p.notes?.toLowerCase().includes(q) ||
          p.referenceNumber?.toLowerCase().includes(q)
      );
    }

    if (filter.memberId) {
      list = list.filter((p) => p.memberId === filter.memberId);
    }

    if (filter.paymentMethod && filter.paymentMethod !== 'ALL') {
      list = list.filter((p) => p.paymentMethod === filter.paymentMethod);
    }

    if (filter.startDate) {
      list = list.filter((p) => p.paymentDate >= filter.startDate!);
    }

    if (filter.endDate) {
      list = list.filter((p) => p.paymentDate <= filter.endDate!);
    }

    return list.sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    await this.delay(60);
    const payments = storage.getPayments();
    return payments.find((p) => p.id === id) || null;
  }

  async recordPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    await this.delay(150);
    const payments = storage.getPayments();
    const newPayment: Payment = {
      ...paymentData,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    payments.unshift(newPayment);
    storage.setPayments(payments);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}

    return newPayment;
  }

  async deletePayment(id: string): Promise<void> {
    await this.delay(100);
    const payments = storage.getPayments();
    const filtered = payments.filter((p) => p.id !== id);
    storage.setPayments(filtered);

    try {
      window.dispatchEvent(new Event('gymflow_storage_updated'));
    } catch {}
  }

  async getMonthlySummary(
    gymId: string,
    year: number = new Date().getFullYear(),
    month: number = new Date().getMonth() + 1
  ): Promise<{ totalCollected: number; transactionCount: number }> {
    await this.delay(60);
    const payments = storage.getPayments().filter((p) => !gymId || p.gymId === gymId);
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthlyPayments = payments.filter((p) => p.paymentDate.startsWith(monthPrefix));

    const totalCollected = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    return {
      totalCollected,
      transactionCount: monthlyPayments.length,
    };
  }

  async getDashboardSummary(gymId: string): Promise<{ pendingCount: number; dueSoonCount: number; collectedThisMonth: number; activeMembersCount: number }> {
    await this.delay(60);
    const members = storage.getMembers().filter((m) => !gymId || m.gymId === gymId);
    const today = new Date().toISOString().split('T')[0];

    const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
    const pendingCount = members.filter((m) => m.status === 'ACTIVE' && m.nextPaymentDate <= today).length;

    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0];

    const dueSoonCount = members.filter((m) => m.status === 'ACTIVE' && m.nextPaymentDate > today && m.nextPaymentDate <= threeDaysStr).length;

    const monthlySummary = await this.getMonthlySummary(gymId);

    return {
      pendingCount,
      dueSoonCount,
      collectedThisMonth: monthlySummary.totalCollected,
      activeMembersCount,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
