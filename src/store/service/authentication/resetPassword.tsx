import { AxiosInstance, AxiosResponse } from 'axios';
import { RESET_PASSWORD } from '../../endpoints/authentication';
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/store/types/authentication/resetPassword';

export class ResetPasswordAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  resetPassword = async (
    resetPayload: ResetPasswordRequest,
  ): Promise<AxiosResponse<ResetPasswordResponse>> => {
    try {
      const response = await this.api.post(RESET_PASSWORD, resetPayload);
      return response;
    } catch (error) {
      console.error('Reset Password error:', error);
      throw error;
    }
  };
}
