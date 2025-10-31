import axios from 'axios';
import {
  GenerarEncuentrosRequest,
  GenerarEncuentrosResponse,
  ErrorResponse
} from '../types/generacionEncuentro.types';

const API_URL = 'http://localhost:8080/api/generacion-encuentros';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación
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

/**
 * Servicio para la generación de encuentros
 */
export const generacionEncuentroService = {
  /**
   * Genera encuentros automáticamente según los parámetros proporcionados
   * @param data Datos para la generación de encuentros
   */
  async generarEncuentros(
    data: GenerarEncuentrosRequest
  ): Promise<GenerarEncuentrosResponse> {
    try {
      const response = await api.post<GenerarEncuentrosResponse>('', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        message: 'Error al conectar con el servidor',
        timestamp: new Date().toISOString()
      } as ErrorResponse;
    }
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
      estadio: string;
    }>
  ): Promise<GenerarEncuentrosResponse> {
    return this.generarEncuentros({
      subcategoriaId,
      tipoGeneracion: 'SELECCION_MANUAL',
      encuentrosManuales
    });
  },

  // Agregar otros métodos de generación según sea necesario
};
