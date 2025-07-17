import { AxiosInstance, AxiosResponse } from 'axios';
import { REGISTER_USER } from '../../endpoints/authentication';
import {
  RegisterRequest,
  RegisterResponse,
} from '@/store/types/authentication/registerForm';

export class RegisterAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  registerUser = async (
    userData: RegisterRequest,
  ): Promise<AxiosResponse<RegisterResponse>> => {
    try {
      const response = await this.api.post(REGISTER_USER, userData);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
}
