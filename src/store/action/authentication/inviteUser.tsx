import { InviteUserAPI } from '@/store/service/authentication/inviteUser';
import { InviteUserRequest } from '@/store/types/authentication/inviteUser';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosInstance } from 'axios';

export const inviteUser = createAsyncThunk(
  'auth/inviteUser',
  async (
    { name, email, role, api }: InviteUserRequest & { api: AxiosInstance },
    { rejectWithValue },
  ) => {
    try {
      const inviteUserAPI = new InviteUserAPI(api);
      const response = await inviteUserAPI.inviteUser(name, email, role);

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
