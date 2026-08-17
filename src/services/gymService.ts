import { IGymService } from './interfaces';
import { defaultServices } from './index';

export const gymService: IGymService = {
  getGym: (gymId) => defaultServices.gym.getGym(gymId),
  getGymByOwnerId: (ownerId) => defaultServices.gym.getGymByOwnerId(ownerId),
  createGym: (ownerId, dto) => defaultServices.gym.createGym(ownerId, dto),
  updateGym: (gymId, updates) => defaultServices.gym.updateGym(gymId, updates),
  getPlans: (gymId) => defaultServices.gym.getPlans(gymId),
  createPlan: (gymId, plan) => defaultServices.gym.createPlan(gymId, plan),
  updatePlan: (planId, updates) => defaultServices.gym.updatePlan(planId, updates),
  deletePlan: (planId) => defaultServices.gym.deletePlan(planId),
};

export default gymService;
