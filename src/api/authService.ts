import axios from 'axios';
import { LoginRequest, LoginResponse } from '../types/auth.types';

const API_URL = 'http://localhost:8080/api/auth';

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
