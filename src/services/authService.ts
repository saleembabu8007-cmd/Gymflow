import { IAuthService } from './interfaces';
import { defaultServices } from './index';

export const authService: IAuthService = {
  getCurrentUser: () => defaultServices.auth.getCurrentUser(),
  login: (email, password) => defaultServices.auth.login(email, password),
  signUp: (dto) => defaultServices.auth.signUp(dto),
  registerOwner: (dto) => defaultServices.auth.registerOwner(dto),
  logout: () => defaultServices.auth.logout(),
  resetPassword: (email) => defaultServices.auth.resetPassword(email),
  updatePassword: (newPassword, token) => defaultServices.auth.updatePassword(newPassword, token),
  updateProfile: (updates) => defaultServices.auth.updateProfile(updates),
};

export default authService;
