import axios, { AxiosError } from 'axios';
import {
  SancionResponse,
  SancionListResponse,
  CreateSancionRequest,
  UpdateSancionRequest,
  SancionQueryParams
} from '@/types/sancion.types';

const API_URL = 'http://localhost:8080/api/sanciones';

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
        case 400:
          console.error('Error en la solicitud:', error.response.data?.message || 'Datos inválidos');
          break;
        case 401:
          console.error('No autorizado: Por favor inicie sesión nuevamente');
          break;
        case 403:
          console.error('Acceso denegado: No tiene permisos para realizar esta acción');
          break;
        case 404:
          console.error('Recurso no encontrado:', error.response.data?.message || 'No se encontró el recurso solicitado');
          break;
        default:
          console.error('Error en la petición:', error.message);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      console.error('Error al realizar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

const sancionesService = {
  /**
   * Obtiene todas las sanciones
   * @param params Parámetros opcionales de paginación y ordenamiento
   */
  async getSanciones(params?: SancionQueryParams): Promise<SancionListResponse> {
    try {
      const response = await api.get<SancionListResponse>('', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching sanciones:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Obtiene una sanción por su ID
   * @param id ID de la sanción
   */
  async getSancionById(id: number): Promise<SancionResponse> {
    try {
      const response = await api.get<SancionResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching sanción ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Crea una nueva sanción
   * @param sancionData Datos de la sanción a crear
   */
  async createSancion(sancionData: CreateSancionRequest): Promise<SancionResponse> {
    try {
      const response = await api.post<SancionResponse>('', sancionData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating sanción:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Actualiza una sanción existente
   * @param id ID de la sanción a actualizar
   * @param sancionData Datos actualizados de la sanción
   */
  async updateSancion(id: number, sancionData: UpdateSancionRequest): Promise<SancionResponse> {
    try {
      const response = await api.put<SancionResponse>(`/${id}`, sancionData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error updating sanción ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Elimina una sanción
   * @param id ID de la sanción a eliminar
   */
  async deleteSancion(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete<{ success: boolean; message: string }>(`/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error deleting sanción ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Obtiene las sanciones de un jugador específico
   * @param jugadorId ID del jugador
   */
  async getSancionesByJugador(jugadorId: number): Promise<SancionListResponse> {
    try {
      const response = await api.get<SancionListResponse>(`/jugador/${jugadorId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching sanciones for jugador ${jugadorId}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Obtiene las sanciones de un encuentro específico
   * @param encuentroId ID del encuentro
   */
  async getSancionesByEncuentro(encuentroId: number): Promise<SancionListResponse> {
    try {
      const response = await api.get<SancionListResponse>(`/encuentro/${encuentroId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching sanciones for encuentro ${encuentroId}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Obtiene las sanciones por tipo
   * @param tipoSancion Tipo de sanción a buscar (ej: TARJETA_AMARILLA, TARJETA_ROJA)
   */
  async getSancionesByTipo(tipoSancion: string): Promise<SancionListResponse> {
    try {
      const response = await api.get<SancionListResponse>(`/tipo/${encodeURIComponent(tipoSancion)}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching sanciones of type ${tipoSancion}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  }
};

export default sancionesService;
