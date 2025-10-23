import axios from 'axios';
import {
    CategoriaListResponse,
    CategoriaResponse,
    CreateCategoriaRequest,
    CreateMultipleCategoriasRequest,
    UpdateCategoriaRequest,
    DeleteCategoriaResponse
} from '../types/categoria.types';

const API_URL = 'http://localhost:8080/api/categorias';

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

export const categoriaService = {
    /**
     * Obtiene todas las categorías
     */
    async getCategorias(): Promise<CategoriaListResponse> {
        const response = await api.get<CategoriaListResponse>('');
        return response.data;
    },

    /**
     * Obtiene una categoría por su ID
     * @param id ID de la categoría
     */
    async getCategoriaById(id: number): Promise<CategoriaResponse> {
        const response = await api.get<CategoriaResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Crea una nueva categoría
     * @param categoriaData Datos de la categoría a crear
     */
    async createCategoria(categoriaData: CreateCategoriaRequest): Promise<CategoriaResponse> {
        const response = await api.post<CategoriaResponse>('/', categoriaData);
        return response.data;
    },

    /**
     * Crea múltiples categorías
     * @param categoriasData Datos de las categorías a crear
     */
    async createCategoriasBulk(categoriasData: CreateMultipleCategoriasRequest): Promise<CategoriaListResponse> {
        const response = await api.post<CategoriaListResponse>('/bulk', categoriasData);
        return response.data;
    },

    /**
     * Actualiza una categoría existente
     * @param id ID de la categoría a actualizar
     * @param categoriaData Datos actualizados de la categoría
     */
    async updateCategoria(id: number, categoriaData: UpdateCategoriaRequest): Promise<CategoriaResponse> {
        const response = await api.put<CategoriaResponse>(`/${id}`, categoriaData);
        return response.data;
    },

    /**
     * Elimina una categoría
     * @param id ID de la categoría a eliminar
     */
    async deleteCategoria(id: number): Promise<DeleteCategoriaResponse> {
        const response = await api.delete<DeleteCategoriaResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Verifica si existen categorías registradas
     */
    async checkCategoriasExist(): Promise<boolean> {
        try {
            const response = await api.get<{ exists: boolean }>('/existen');
            return response.data.exists;
        } catch (error) {
            console.error('Error al verificar existencia de categorías:', error);
            return false;
        }
    }
};

export default categoriaService;
