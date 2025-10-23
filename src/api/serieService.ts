import axios from 'axios';
import {
  CreateSerieRequest,
  CreateMultipleSeriesRequest,
  UpdateSerieRequest,
  SerieResponse,
  SerieListResponse,
  DeleteSerieResponse
} from '../types/serie.types';

const API_URL = 'http://localhost:8080/api/series';

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
          // Handle unauthorized access
          console.error('No autorizado: Por favor inicie sesión nuevamente');
          break;
        case 403:
          // Handle forbidden access
          console.error('Acceso denegado: No tiene permisos para realizar esta acción');
          break;
        case 404:
          // Handle not found
          console.error('Recurso no encontrado');
          break;
        default:
          console.error('Error en la solicitud:', error.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No se recibió respuesta del servidor');
    } else {
      // Something happened in setting up the request
      console.error('Error al configurar la solicitud:', error.message);
    }
    return Promise.reject(error);
  }
);

const serieService = {
  /**
   * Obtiene todas las series de una subcategoría específica
   * @param subcategoriaId ID de la subcategoría
   */
  async getSeriesBySubcategoria(subcategoriaId: number): Promise<SerieListResponse> {
    const response = await api.get<SerieListResponse>(`/subcategoria/${subcategoriaId}`);
    return response.data;
  },

  /**
   * Obtiene los detalles de una serie por su ID
   * @param id ID de la serie
   */
  async getSerieById(id: number): Promise<SerieResponse> {
    const response = await api.get<SerieResponse>(`/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva serie
   * @param serieData Datos de la serie a crear
   */
  async createSerie(serieData: CreateSerieRequest): Promise<SerieResponse> {
    const response = await api.post<SerieResponse>('/', serieData);
    return response.data;
  },

  /**
   * Crea múltiples series en una sola petición
   * @param seriesData Datos de las series a crear
   */
  async createMultipleSeries(seriesData: CreateMultipleSeriesRequest): Promise<SerieListResponse> {
    const response = await api.post<SerieListResponse>('/bulk', seriesData);
    return response.data;
  },

  /**
   * Actualiza una serie existente
   * @param id ID de la serie a actualizar
   * @param serieData Datos actualizados de la serie
   */
  async updateSerie(id: number, serieData: UpdateSerieRequest): Promise<SerieResponse> {
    const response = await api.put<SerieResponse>(`/${id}`, serieData);
    return response.data;
  },

  /**
   * Elimina una serie existente
   * @param id ID de la serie a eliminar
   */
  async deleteSerie(id: number): Promise<DeleteSerieResponse> {
    const response = await api.delete<DeleteSerieResponse>(`/${id}`);
    return response.data;
  }
};

export default serieService;
