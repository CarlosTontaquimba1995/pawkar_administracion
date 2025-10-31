import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshTokenResponse,
} from '../types/auth.types';

const API_URL = 'http://localhost:8080/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/signin', credentials);
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await api.post<SignupResponse>('/signup', userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await api.post<RefreshTokenResponse>('/refreshtoken', {
        refreshToken,
      });

      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // You can add a call to a logout endpoint here if available
    // await api.post('/logout');
  },

  // Helper to get the current token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Helper to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Helper to get user roles
  getCurrentUser(): { id: number; username: string; email: string; roles: string[] } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode the JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const { id, username, email, roles } = JSON.parse(jsonPayload);
      return { id, username, email, roles };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};
