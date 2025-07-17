export interface ResetPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface ResetPasswordRequest {
  oldPassword: string;
  newPassword: string;
  userId: number;
}

export interface ResetPasswordResponse {
  message: string;
  status: string;
}
