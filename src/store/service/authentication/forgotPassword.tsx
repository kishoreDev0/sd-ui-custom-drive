import { FORGOT_PASSWORD } from '@/store/endpoints/authentication';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '@/store/types/authentication/forgotPassword';
import { AxiosInstance, AxiosResponse } from 'axios';

export class ForgotPasswordAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  forgotPassword = async (
    forgotPasswordPayload: ForgotPasswordRequest,
  ): Promise<AxiosResponse<ForgotPasswordResponse>> => {
    try {
      const response = await this.api.post(
        FORGOT_PASSWORD,
        forgotPasswordPayload,
      );
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };
}
