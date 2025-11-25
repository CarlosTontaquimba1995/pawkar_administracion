import axios from 'axios';
import {
  ConfiguracionResponse,
  UpdateConfiguracionRequest
} from '../types/configuracion.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/configuracion');

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
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error del servidor: Intente nuevamente más tarde');
          break;
        default:
          console.error('Error en la petición:', error.message);
      }
    } else if (error.request) {
      console.error('No se pudo conectar al servidor. Verifique su conexión a internet.');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const configuracionService = {
  /**
   * Obtiene la configuración actual del sistema
   * @returns Promise con la configuración del sistema
   */
  getConfiguracion: async (): Promise<ConfiguracionResponse> => {
    try {
      const response = await api.get('');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener la configuración');
    }
  },

  /**
   * Actualiza la configuración del sistema
   * @param configuracion Datos de la configuración a actualizar
   * @returns Promise con la configuración actualizada
   */
  updateConfiguracion: async (
    configuracion: UpdateConfiguracionRequest
  ): Promise<ConfiguracionResponse> => {
    try {
      const response = await api.put('', configuracion);
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar la configuración');
    }
  },
};

export default configuracionService;
