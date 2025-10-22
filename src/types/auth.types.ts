export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  role: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    refreshToken: string;
  };
  timestamp: string;
  path?: string;
  error?: string;
  status?: number;
}

export interface LoginResponse extends AuthResponse {}
export interface SignupResponse extends Omit<AuthResponse, 'data'> {}
export interface RefreshTokenResponse extends AuthResponse {}
