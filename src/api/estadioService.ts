import axios from 'axios';
import {
    CreateEstadioRequest,
    UpdateEstadioRequest,
    CreateBulkEstadiosRequest,
    EstadioResponse,
    EstadioListResponse,
    DeleteEstadioResponse,
} from '../types/estadio.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/estadios');

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

const estadioService = {
    /**
     * Obtiene todos los estadios
     */
    async getAllEstadios(): Promise<EstadioListResponse> {
        const response = await api.get<EstadioListResponse>('');
        return response.data;
    },

    /**
     * Obtiene un estadio por su ID
     * @param id ID del estadio
     */
    async getEstadioById(id: number): Promise<EstadioResponse> {
        const response = await api.get<EstadioResponse>(`/${id}`);
        return response.data;
    },

  /**
   * Crea un nuevo estadio
   * @param estadioData Datos del estadio a crear
   */
    async createEstadio(estadioData: CreateEstadioRequest): Promise<EstadioResponse> {
        const response = await api.post<EstadioResponse>('', estadioData);
        return response.data;
    },

  /**
   * Actualiza un estadio existente
   * @param id ID del estadio a actualizar
   * @param estadioData Datos actualizados del estadio
   */
    async updateEstadio(id: number, estadioData: UpdateEstadioRequest): Promise<EstadioResponse> {
        const response = await api.put<EstadioResponse>(`/${id}`, estadioData);
        return response.data;
    },

  /**
   * Elimina un estadio
   * @param id ID del estadio a eliminar
   */
    async deleteEstadio(id: number): Promise<DeleteEstadioResponse> {
        const response = await api.delete<DeleteEstadioResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Crea múltiples estadios en una sola operación
     * @param data Datos de los estadios a crear
     */
    async createBulkEstadios(data: CreateBulkEstadiosRequest): Promise<EstadioListResponse> {
        const response = await api.post<EstadioListResponse>('/bulk', data);
        return response.data;
    }
};

export default estadioService;