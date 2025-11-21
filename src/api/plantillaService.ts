import axios from 'axios';
import {
  CreatePlantillaRequest,
  CreateMultiplePlantillasRequest,
  PlantillaResponse,
  PlantillaListResponse,
  DeletePlantillaResponse
} from '../types/plantilla.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/plantillas');

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

const plantillaService = {
  /**
   * Obtiene todas las plantillas registradas
   */
  async getAllPlantillas(): Promise<PlantillaListResponse> {
    const response = await api.get<PlantillaListResponse>('');
    return response.data;
  },

  /**
   * Obtiene una plantilla específica por ID de equipo y jugador
   * @param equipoId ID del equipo
   * @param jugadorId ID del jugador
   */
  async getPlantillaById(equipoId: number, jugadorId: number): Promise<PlantillaResponse> {
    const response = await api.get<PlantillaResponse>(`/${equipoId}/${jugadorId}`);
    return response.data;
  },

  /**
   * Obtiene todas las plantillas de un equipo específico
   * @param equipoId ID del equipo
   */
  async getPlantillasByEquipo(equipoId: number): Promise<PlantillaListResponse> {
    const response = await api.get<PlantillaListResponse>(`/equipo/${equipoId}`);
    return response.data;
  },

  /**
   * Crea una nueva plantilla
   * @param plantillaData Datos de la plantilla a crear
   */
  async createPlantilla(plantillaData: CreatePlantillaRequest): Promise<PlantillaResponse> {
    const response = await api.post<PlantillaResponse>('/', plantillaData);
    return response.data;
  },

  /**
   * Crea múltiples plantillas en una sola petición
   * @param plantillasData Datos de las plantillas a crear
   */
  async createMultiplePlantillas(plantillasData: CreateMultiplePlantillasRequest): Promise<PlantillaListResponse> {
    const response = await api.post<PlantillaListResponse>('/bulk', plantillasData);
    return response.data;
  },

  /**
   * Elimina una plantilla existente
   * @param equipoId ID del equipo
   * @param jugadorId ID del jugador
   */
  async deletePlantilla(equipoId: number, jugadorId: number): Promise<DeletePlantillaResponse> {
    const response = await api.delete<DeletePlantillaResponse>(`/${equipoId}/${jugadorId}`);
    return response.data;
  }
};

export default plantillaService;
