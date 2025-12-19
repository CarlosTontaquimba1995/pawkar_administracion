import axios from 'axios';
import {
    UbicacionListResponse,
    UbicacionResponse,
    CreateUbicacionRequest,
    UpdateUbicacionRequest
} from '../types/ubicacion.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/ubicaciones');

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
                    console.error('Ubicación no encontrada');
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

export const ubicacionService = {
    /**
     * Obtiene todas las ubicaciones
     */
    async getUbicaciones(): Promise<UbicacionListResponse> {
        const response = await api.get<UbicacionListResponse>('');
        return response.data;
    },

    /**
     * Obtiene una ubicación por su ID
     * @param id ID de la ubicación
     */
    async getUbicacionById(id: number): Promise<UbicacionResponse> {
        const response = await api.get<UbicacionResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Obtiene una ubicación por su nemonico
     * @param nemonico Nemonico de la ubicación (ej: "PARQUE_CENTRAL")
     */
    async getUbicacionByNemonico(nemonico: string): Promise<UbicacionResponse> {
        const response = await api.get<UbicacionResponse>(`/nemonico/${nemonico}`);
        return response.data;
    },

    /**
     * Crea una nueva ubicación
     * @param ubicacionData Datos de la ubicación a crear
     */
    async createUbicacion(ubicacionData: CreateUbicacionRequest): Promise<UbicacionResponse> {
        const response = await api.post<UbicacionResponse>('', ubicacionData);
        return response.data;
    },

    /**
     * Crea múltiples ubicaciones
     * @param ubicacionesData Datos de las ubicaciones a crear
     */
    async createUbicacionesBulk(ubicacionesData: { ubicaciones: CreateUbicacionRequest[] }): Promise<UbicacionListResponse> {
        const response = await api.post<UbicacionListResponse>('/bulk', ubicacionesData);
        return response.data;
    },

    /**
     * Actualiza una ubicación existente
     * @param id ID de la ubicación a actualizar
     * @param ubicacionData Datos actualizados de la ubicación
     */
    async updateUbicacion(id: number, ubicacionData: UpdateUbicacionRequest): Promise<UbicacionResponse> {
        const response = await api.put<UbicacionResponse>(`/${id}`, ubicacionData);
        return response.data;
    },

    /**
     * Elimina una ubicación
     * @param id ID de la ubicación a eliminar
     */
    async deleteUbicacion(id: number): Promise<void> {
        await api.delete(`/${id}`);
    },

    /**
     * Verifica si existen ubicaciones registradas
     */
    async checkUbicacionesExist(): Promise<boolean> {
        try {
            const response = await this.getUbicaciones();
            return response.data && response.data.length > 0;
        } catch (error) {
            console.error('Error al verificar ubicaciones:', error);
            return false;
        }
    }
};

export default ubicacionService;
