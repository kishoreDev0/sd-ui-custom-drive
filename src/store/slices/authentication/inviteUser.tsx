import { inviteUser } from '@/store/action/authentication/inviteUser';
import { InviteUserState } from '@/store/types/authentication/inviteUser';
import { createSlice } from '@reduxjs/toolkit';

const initialState: InviteUserState = {
  isLoading: false,
  isSuccess: false,
  error: null,
};

const inviteUserSlice = createSlice({
  name: 'inviteUser',
  initialState,
  reducers: {
    resetInviteUserState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(inviteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(inviteUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetInviteUserState } = inviteUserSlice.actions;
export default inviteUserSlice.reducer;
