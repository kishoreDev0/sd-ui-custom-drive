import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';
import { AuthAPI } from '../../service/authentication/login';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    {
      email,
      password,
      api,
    }: {
      email: string;
      password: string;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const authAPI = new AuthAPI(api);
      const response = await authAPI.login(email, password);

      if (response.data.status === 'success') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.data));
        localStorage.setItem('token', response.data.data.accessToken);

        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
