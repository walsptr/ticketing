export type UpdatePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  logoutAllDevices: boolean;
};
