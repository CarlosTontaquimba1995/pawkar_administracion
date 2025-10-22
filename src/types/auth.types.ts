export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    refreshToken: string;
    tokenType: string;
  };
  timestamp: string;
  path?: string;
  error?: string;
  status?: number;
}
