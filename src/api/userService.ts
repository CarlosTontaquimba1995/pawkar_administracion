import axios from 'axios';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserListResponse,
  DeleteUserResponse,
  UserQueryParams,
  ChangePasswordRequest,
  ResetPasswordRequest
} from '../types/user.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/usuarios');

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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle different HTTP status codes
      switch (error.response.status) {
        case 401:
          console.error('No autorizado: Por favor inicie sesión nuevamente');
          break;
        case 403:
          console.error('Acceso denegado: No tiene permisos para realizar esta acción');
          break;
        case 404:
          console.error('Usuario no encontrado');
          break;
        default:
          console.error('Error en la solicitud:', error.message);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor');
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    return Promise.reject(error);
  }
);

const userService = {
  /**
   * Obtiene todos los usuarios
   * @param params Parámetros de consulta opcionales (paginación, búsqueda, etc.)
   */
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await api.get<UserListResponse>('', { params });
    return response.data;
  },

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario a buscar
   */
  async getUserById(id: number): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/${id}`);
    return response.data;
  },

  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username Nombre de usuario a buscar
   */
  async getUserByUsername(username: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`/username/${username}`);
    return response.data;
  },

  /**
   * Crea un nuevo usuario
   * @param userData Datos del usuario a crear
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await api.post<UserResponse>('', userData);
    return response.data;
  },

  /**
   * Actualiza un usuario existente
   * @param id ID del usuario a actualizar
   * @param userData Datos actualizados del usuario
   */
  async updateUser(id: number, userData: UpdateUserRequest): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`/${id}`, userData);
    return response.data;
  },

  /**
   * Elimina un usuario
   * @param id ID del usuario a eliminar
   */
  async deleteUser(id: number): Promise<DeleteUserResponse> {
    const response = await api.delete<DeleteUserResponse>(`/${id}`);
    return response.data;
  },

  /**
   * Cambia la contraseña del usuario actual
   * @param data Datos para el cambio de contraseña
   */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/change-password', data);
    return response.data;
  },

  /**
   * Solicita un restablecimiento de contraseña
   * @param email Correo electrónico del usuario
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/request-password-reset', { email });
    return response.data;
  },

  /**
   * Restablece la contraseña con un token de restablecimiento
   * @param data Datos para el restablecimiento de contraseña
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/reset-password', data);
    return response.data;
  }
};

export default userService;
