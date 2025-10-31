import axios, { AxiosResponse } from 'axios';
import {
    Estadio,
    CreateEstadioRequest,
    UpdateEstadioRequest,
    CreateBulkEstadiosRequest,
    EstadioResponse,
    ErrorResponse
} from '@/types/estadio.types';

const API_URL = 'http://localhost:8080/api/estadios';

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
 * Obtiene todos los estadios
 */
const getAllEstadios = async (): Promise<Estadio[]> => {
    try {
        const response: AxiosResponse<EstadioResponse> = await api.get('');
        return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Obtiene un estadio por su ID
 * @param id ID del estadio
 */
const getEstadioById = async (id: number): Promise<Estadio> => {
    try {
        const response: AxiosResponse<EstadioResponse> = await api.get(`/${id}`);
        return response.data.data as Estadio;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Crea un nuevo estadio
 * @param data Datos del estadio a crear
 */
const createEstadio = async (data: CreateEstadioRequest): Promise<Estadio> => {
    try {
        const response: AxiosResponse<EstadioResponse> = await api.post('', data);
        return response.data.data as Estadio;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Actualiza un estadio existente
 * @param id ID del estadio a actualizar
 * @param data Datos a actualizar
 */
const updateEstadio = async (id: number, data: UpdateEstadioRequest): Promise<Estadio> => {
    try {
        const response: AxiosResponse<EstadioResponse> = await api.put(`/${id}`, data);
        return response.data.data as Estadio;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Elimina un estadio (eliminación lógica)
 * @param id ID del estadio a eliminar
 */
const deleteEstadio = async (id: number): Promise<void> => {
    try {
        await api.delete(`/${id}`);
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Crea múltiples estadios en una sola operación
 * @param data Datos de los estadios a crear
 */
const createBulkEstadios = async (data: CreateBulkEstadiosRequest): Promise<Estadio[]> => {
    try {
        const response: AxiosResponse<EstadioResponse> = await api.post('/bulk', data);
        return response.data.data as Estadio[];
    } catch (error) {
        handleError(error);
        throw error;
    }
};

/**
 * Maneja los errores de la API
 */
const handleError = (error: unknown): void => {
    if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ErrorResponse;
        const errorMessage = errorData?.message || 'Error en la solicitud';
        throw new Error(errorMessage);
    }
    throw new Error('Error desconocido');
};

const estadioService = {
    getAllEstadios,
    getEstadioById,
    createEstadio,
    updateEstadio,
    deleteEstadio,
    createBulkEstadios,
};

export default estadioService;
