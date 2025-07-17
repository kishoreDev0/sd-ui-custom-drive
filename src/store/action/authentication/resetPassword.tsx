import { ResetPasswordAPI } from '@/store/service/authentication/resetPassword';
import { ResetPasswordRequest } from '@/store/types/authentication/resetPassword';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    {
      resetPayload,
      api,
    }: {
      resetPayload: ResetPasswordRequest;
      api: AxiosInstance;
    },
    { rejectWithValue },
  ) => {
    try {
      const resetPasswordAPI = new ResetPasswordAPI(api);
      const response = await resetPasswordAPI.resetPassword(resetPayload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
