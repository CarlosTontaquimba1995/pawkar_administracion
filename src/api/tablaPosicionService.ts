import axios from 'axios';
import {
    TablaPosicion,
    TablaPosicionRequest,
    ActualizarDesdePartidoRequest,
    SearchParams,
    EquipoPosicionResponse
} from '@/types/tablaPosicion.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/tabla-posicion');

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

const tablaPosicionService = {
    /**
     * Obtiene la posición específica de un equipo en la tabla de posiciones de una subcategoría
     * @param subcategoriaId ID de la subcategoría
     * @param equipoId ID del equipo
     */
    getPosicionEquipo: async (subcategoriaId: number, equipoId: number): Promise<EquipoPosicionResponse> => {
        try {
            const response = await api.get<EquipoPosicionResponse>(`/subcategoria/${subcategoriaId}/equipo/${equipoId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener la posición del equipo:', error);
            throw error;
        }
    },

    /**
     * Obtiene la tabla de posiciones para una subcategoría específica
     * @param subcategoriaId ID de la subcategoría
     */
    async getBySubcategoria(subcategoriaId: number): Promise<TablaPosicion[]> {
        const response = await api.get(`/subcategoria/${subcategoriaId}`);
        return response.data.data;
    },

    /**
     * Busca en la tabla de posiciones con múltiples criterios
     * @param params Parámetros de búsqueda
     */
    async search(params: SearchParams): Promise<TablaPosicion[]> {
        const response = await api.get('/search', { params });
        return response.data.data;
    },

    /**
     * Crea o actualiza una posición en la tabla
     * @param posicion Datos de la posición
     */
    async saveOrUpdate(posicion: TablaPosicionRequest): Promise<TablaPosicion> {
        const method = posicion.equipoId ? 'put' : 'post';
        const response = await api[method]('', posicion);
        return response.data.data;
    },

    /**
     * Elimina una posición de la tabla
     * @param subcategoriaId ID de la subcategoría
     * @param equipoId ID del equipo
     */
    async delete(subcategoriaId: number, equipoId: number): Promise<void> {
        await api.delete(`/subcategoria/${subcategoriaId}/equipo/${equipoId}`);
    },

    /**
     * Actualiza la tabla de posiciones desde un partido
     * @param data Datos del partido para actualizar la tabla
     */
    async actualizarDesdePartido(data: ActualizarDesdePartidoRequest): Promise<void> {
        await api.post('/actualizar-desde-partido', data);
    }
};

export default tablaPosicionService;
