import { AxiosInstance, AxiosResponse } from 'axios';
import { CHANGE_PASSWORD } from '../../endpoints/authentication';
import { ChangePasswordResponse } from '@/store/types/authentication/changepassword';

export class ChangePasswordAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  changePassword = async (
    newPassword: string,
    resetToken: string,
  ): Promise<AxiosResponse<ChangePasswordResponse>> => {
    try {
      const response = await this.api.post(
        CHANGE_PASSWORD,
        { newPassword },
        {
          headers: {
            'reset-token': resetToken,
          },
        },
      );

      return response;
    } catch (error) {
      console.error('Change Password error:', error);
      throw error;
    }
  };
}
