import { changePassword } from '@/store/action/authentication/changePassword';
import { ChangePasswordState } from '@/store/types/authentication/changepassword';
import { createSlice } from '@reduxjs/toolkit';

const initialState: ChangePasswordState = {
  isLoading: false,
  isSuccess: false,
  error: null,
};

const changePasswordSlice = createSlice({
  name: 'changePassword',
  initialState,
  reducers: {
    resetChangePasswordState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
