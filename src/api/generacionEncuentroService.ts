import axios from 'axios';
import {
  GenerarEncuentrosRequest,
  GenerarEncuentrosResponse,
} from '../types/generacionEncuentro.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/generacion-encuentros');

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

const generacionEncuentroService = {
  /**
   * Genera encuentros automáticamente según los parámetros proporcionados
   * @param data Datos para la generación de encuentros
   */
  async generarEncuentros(
    data: GenerarEncuentrosRequest
  ): Promise<GenerarEncuentrosResponse> {
    const response = await api.post<GenerarEncuentrosResponse>('', data);
    return response.data;
  },

  /**
   * Genera encuentros manuales
   * @param subcategoriaId ID de la subcategoría
   * @param encuentrosManuales Lista de encuentros a crear manualmente
   */
  async generarEncuentrosManuales(
    subcategoriaId: number,
    encuentrosManuales: Array<{
      equipoLocalId: number;
      equipoVisitanteId: number;
      fecha: string;
      hora: string;
      estadioId: number;
    }>
  ): Promise<GenerarEncuentrosResponse> {
    return this.generarEncuentros({
      subcategoriaId,
      tipoGeneracion: 'SELECCION_MANUAL',
      encuentrosManuales
    });
  }
};

export default generacionEncuentroService;
