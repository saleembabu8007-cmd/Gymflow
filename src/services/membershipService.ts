import { IMembershipService } from './interfaces';
import { defaultServices } from './index';

export const membershipService: IMembershipService = {
  getPlans: (gymId) => defaultServices.memberships.getPlans(gymId),
  getPlanById: (planId) => defaultServices.memberships.getPlanById(planId),
  createPlan: (gymId, plan) => defaultServices.memberships.createPlan(gymId, plan),
  updatePlan: (planId, updates) => defaultServices.memberships.updatePlan(planId, updates),
  deletePlan: (planId) => defaultServices.memberships.deletePlan(planId),
  getMemberships: (gymId, filter) => defaultServices.memberships.getMemberships(gymId, filter),
  getMemberMemberships: (memberId) => defaultServices.memberships.getMemberMemberships(memberId),
  getActiveMembership: (memberId) => defaultServices.memberships.getActiveMembership(memberId),
  createMembership: (gymId, memberId, planId, details) =>
    defaultServices.memberships.createMembership(gymId, memberId, planId, details),
  renewMembership: (membershipId, extensionMonths) =>
    defaultServices.memberships.renewMembership(membershipId, extensionMonths),
  cancelMembership: (membershipId) => defaultServices.memberships.cancelMembership(membershipId),
};

export default membershipService;
