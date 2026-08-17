import { IPaymentService } from './interfaces';
import { defaultServices } from './index';

export const paymentService: IPaymentService = {
  getPayments: (gymId, filter) => defaultServices.payments.getPayments(gymId, filter),
  getPaymentById: (id) => defaultServices.payments.getPaymentById(id),
  recordPayment: (payment) => defaultServices.payments.recordPayment(payment),
  deletePayment: (id) => defaultServices.payments.deletePayment(id),
  getMonthlySummary: (gymId, year, month) => defaultServices.payments.getMonthlySummary(gymId, year, month),
  getDashboardSummary: (gymId) => defaultServices.payments.getDashboardSummary(gymId),
};

export default paymentService;
