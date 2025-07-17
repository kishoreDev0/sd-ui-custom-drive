import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types/authentication/login';
import { loginUser } from '@/store/action/authentication/login';

export const AUTH_STORAGE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  USER: 'user',
  TOKEN: 'token',
  REMEMBER_ME: 'rememberMe',
};

const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
const isAuthenticated =
  localStorage.getItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!isAuthenticated,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      const keysToAlwaysCheck = ['user', 'token', 'auth', 'session'];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const lowerKey = key.toLowerCase();
          if (keysToAlwaysCheck.some((authKey) => lowerKey.includes(authKey))) {
            localStorage.removeItem(key);
          }
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
