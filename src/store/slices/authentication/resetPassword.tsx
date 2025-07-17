import { resetPassword } from '@/store/action/authentication/resetPassword';
import { ResetPasswordState } from '@/store/types/authentication/resetPassword';
import { createSlice } from '@reduxjs/toolkit';

const initialState: ResetPasswordState = {
  isLoading: false,
  isSuccess: false,
  error: null,
};

const resetPasswordSlice = createSlice({
  name: 'resetPassword',
  initialState,
  reducers: {
    resetPasswordState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPasswordState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;
