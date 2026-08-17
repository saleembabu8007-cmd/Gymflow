import { IMemberService } from './interfaces';
import { defaultServices } from './index';

export const memberService: IMemberService = {
  getMembers: (gymId, filter) => defaultServices.members.getMembers(gymId, filter),
  getAttentionList: (gymId, limit) => defaultServices.members.getAttentionList(gymId, limit),
  getMemberById: (id) => defaultServices.members.getMemberById(id),
  createMember: (gymId, member) => defaultServices.members.createMember(gymId, member),
  updateMember: (id, updates) => defaultServices.members.updateMember(id, updates),
  deleteMember: (id) => defaultServices.members.deleteMember(id),
  markAsPaid: (memberId, details) => defaultServices.members.markAsPaid(memberId, details),
};

export default memberService;
