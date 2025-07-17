import { AxiosInstance, AxiosResponse } from 'axios';
import { LOGIN } from '../../endpoints/authentication';
import { LoginResponse } from '../../types/authentication/login';

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  login = async (
    email: string,
    password: string,
  ): Promise<AxiosResponse<LoginResponse>> => {
    try {
      const response = await this.api.post(LOGIN, {
        email,
        password,
      });

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
}
