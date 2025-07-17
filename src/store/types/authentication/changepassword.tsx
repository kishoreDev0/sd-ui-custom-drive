export interface ChangePasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: null | string | unknown;
}

export interface ChangePasswordRequest {
  newPassword: string;
  resetToken: string;
}

export interface ChangePasswordResponse {
  status: string;
  message: string;
}
