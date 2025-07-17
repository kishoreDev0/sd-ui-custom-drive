import { ForgotPasswordAPI } from '@/store/service/authentication/forgotPassword';
import { ForgotPasswordRequest } from '@/store/types/authentication/forgotPassword';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (
    {
      forgotPayload,
      api,
    }: {
      forgotPayload: ForgotPasswordRequest;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const forgotPasswordAPI = new ForgotPasswordAPI(api);
      const response = await forgotPasswordAPI.forgotPassword(forgotPayload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
