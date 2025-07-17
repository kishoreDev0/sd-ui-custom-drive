export interface User {
  userId: number;
  roleId: number | null;
  username: string;
  email: string;
  profileUrl: string | null;
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: User;
}
