import { AxiosInstance, AxiosResponse } from 'axios';
import { INVITE_USER } from '../../endpoints/authentication';

export interface InviteUserResponse {
  message: string;
}

export class InviteUserAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  inviteUser = async (
    name: string,
    email: string,
    role: string,
  ): Promise<AxiosResponse<InviteUserResponse>> => {
    try {
      const response = await this.api.get(INVITE_USER, {
        params: {
          name,
          email,
          role,
        },
      });

      return response;
    } catch (error) {
      console.error('Invite User error:', error);
      throw error;
    }
  };
}
