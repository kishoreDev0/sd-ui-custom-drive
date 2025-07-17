import { RegisterAPI } from '@/store/service/authentication/registerForm';
import { RegisterRequest } from '@/store/types/authentication/registerForm';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    {
      userData,
      api,
    }: {
      userData: RegisterRequest;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const registerAPI = new RegisterAPI(api);
      const response = await registerAPI.registerUser(userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
