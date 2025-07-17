export interface ForgotPasswordState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
}
