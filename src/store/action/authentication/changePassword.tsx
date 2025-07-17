import { ChangePasswordAPI } from '@/store/service/authentication/changepassword';
import { ChangePasswordRequest } from '@/store/types/authentication/changepassword';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      newPassword,
      resetToken,
      api,
    }: ChangePasswordRequest & { api: AxiosInstance },
    { rejectWithValue },
  ) => {
    try {
      const changePasswordAPI = new ChangePasswordAPI(api);
      const response = await changePasswordAPI.changePassword(
        newPassword,
        resetToken,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
