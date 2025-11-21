import axios from 'axios';
import {
    Encuentro,
    CreateEncuentroRequest,
    CreateMultipleEncuentrosRequest,
    UpdateEncuentroRequest,
    EncuentroResponse,
    EncuentroListResponse,
    EncuentroPageResponse,
    EncuentroSearchParams
} from '../types/encuentro.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/encuentros');

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

const encuentroService = {
    /**
     * Obtiene todos los encuentros
     */
    async getAllEncuentros(): Promise<Encuentro[]> {
        const response = await api.get<EncuentroListResponse>('/');
        return response.data.data;
    },

    /**
     * Obtiene un encuentro por su ID
     * @param id ID del encuentro
     */
    async getEncuentroById(id: number): Promise<EncuentroResponse> {
        const response = await api.get<EncuentroResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Crea un nuevo encuentro
     * @param encuentroData Datos del encuentro a crear
     */
    async createEncuentro(encuentroData: CreateEncuentroRequest): Promise<EncuentroResponse> {
        const response = await api.post<EncuentroResponse>('', encuentroData);
        return response.data;
    },

    /**
     * Crea múltiples encuentros en una sola petición
     * @param encuentrosData Datos de los encuentros a crear
     */
    async createMultipleEncuentros(encuentrosData: CreateMultipleEncuentrosRequest): Promise<Encuentro[]> {
        const response = await api.post<EncuentroListResponse>('/bulk', encuentrosData);
        return response.data.data;
    },

    /**
     * Actualiza un encuentro existente
     * @param id ID del encuentro a actualizar
     * @param encuentroData Datos actualizados del encuentro
     */
    async updateEncuentro(id: number, encuentroData: UpdateEncuentroRequest): Promise<EncuentroResponse> {
        const response = await api.put<EncuentroResponse>(`/${id}`, encuentroData);
        return response.data;
    },

    /**
     * Elimina un encuentro existente
     * @param id ID del encuentro a eliminar
     */
    async deleteEncuentro(id: number): Promise<void> {
        await api.delete(`/${id}`);
    },

    /**
     * Obtiene encuentros por subcategoría
     * @param subcategoriaId ID de la subcategoría
     * @param page Número de página (opcional)
     * @param size Tamaño de página (opcional)
     */
    async getEncuentrosBySubcategoria(
        subcategoriaId: number,
        page: number = 0,
        size: number = 10
    ): Promise<EncuentroPageResponse['data']> {
        const response = await api.get<EncuentroPageResponse>(
            `/subcategoria/${subcategoriaId}`,
            { params: { page, size } }
        );
        return response.data.data;
    },

    /**
     * Busca encuentros con parámetros de búsqueda
     * @param searchParams Parámetros de búsqueda
     */
    async searchEncuentros(
        searchParams: EncuentroSearchParams
    ): Promise<EncuentroPageResponse['data']> {
        const response = await api.post<EncuentroPageResponse>(
            '/search',
            searchParams
        );
        return response.data.data;
    },

    /**
     * Busca encuentros con parámetros de consulta
     * @param params Parámetros de búsqueda
     */
    async searchEncuentrosByQuery(
        params: EncuentroSearchParams
    ): Promise<EncuentroPageResponse['data']> {
        const { page = 0, size = 10, ...restParams } = params;
        const response = await api.get<EncuentroPageResponse>(
            '/search',
            { params: { page, size, ...restParams } }
        );
        return response.data.data;
    },

    /**
     * Obtiene encuentros por equipo
     * @param equipoId ID del equipo
     * @param page Número de página (opcional)
     * @param size Tamaño de página (opcional)
     */
    async getEncuentrosByEquipo(
        equipoId: number,
        page: number = 0,
        size: number = 10
    ): Promise<EncuentroPageResponse['data']> {
        const response = await api.get<EncuentroPageResponse>(
            `/equipo/${equipoId}`,
            { params: { page, size } }
        );
        return response.data.data;
    }
};

export default encuentroService;
