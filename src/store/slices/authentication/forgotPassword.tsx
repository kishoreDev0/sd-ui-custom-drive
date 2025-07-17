import { forgotPassword } from '@/store/action/authentication/forgotPassword';
import { ForgotPasswordState } from '@/store/types/authentication/forgotPassword';
import { createSlice } from '@reduxjs/toolkit';

const initialState: ForgotPasswordState = {
  isLoading: false,
  isSuccess: false,
  error: null,
};

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    forgotPasswordState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export const { forgotPasswordState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
