import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

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

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/signin`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Aquí podrías llamar a un endpoint de logout si existe
    // await axios.post(`${API_URL}/logout`);
  },
};
