export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  username: string;
  email: string;
  role: string;
  expiresAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}