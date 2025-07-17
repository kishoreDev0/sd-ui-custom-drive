export interface RegisterState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  userId?: string;
}

export interface RegisterRequest {
  createdBy: {
    id: number;
  };
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipcode: number;
  roleId: number;
}

export interface RegisterResponse {
  status: string;
  message: string;
}
