import axios from 'axios';
import {
    SubcategoriaRol,
    AsignarRolResponse,
    EliminarRolResponse,
    ObtenerRolesPorSubcategoriaResponse,
    BulkAsignarRolesRequest,
    BulkAsignarRolesResponse,
    ActualizarRelacionRequest,
    ActualizarRelacionResponse,
} from '../types/subcategoriaRoles.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/subcategoria-roles');

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
                case 500:
                    console.error('Error interno del servidor');
                    break;
                default:
                    console.error('Error en la petición:', error.message);
            }
        } else if (error.request) {
            console.error('No se pudo conectar con el servidor');
        } else {
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

const subcategoriaRolesService = {
    /**
     * Asigna un rol a una subcategoría
     * @param subcategoriaId ID de la subcategoría
    * @param rolId ID del rol a asignar
     * @returns Promesa con la respuesta de la operación
     */
    async asignarRolASubcategoria(
        subcategoriaId: number,
        rolId: number
    ): Promise<AsignarRolResponse> {
        try {
            const response = await api.post<AsignarRolResponse>(
                `/subcategoria/${subcategoriaId}/rol/${rolId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error al asignar rol a subcategoría:', error);
            throw error;
        }
    },

    /**
     * Elimina un rol de una subcategoría
     * @param subcategoriaId ID de la subcategoría
     * @param rolId ID del rol a eliminar
     * @returns Promesa con la respuesta de la operación
     */
    async eliminarRolDeSubcategoria(
        subcategoriaId: number,
        rolId: number
    ): Promise<EliminarRolResponse> {
        try {
            const response = await api.delete<EliminarRolResponse>(
                `/subcategoria/${subcategoriaId}/rol/${rolId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error al eliminar rol de subcategoría:', error);
            throw error;
        }
    },

    /**
     * Obtiene los roles de una subcategoría por su ID
     * @param subcategoriaId ID de la subcategoría
     * @returns Promesa con la lista de roles
     */
    async getRolesPorSubcategoriaId(
        subcategoriaId: number
    ): Promise<ObtenerRolesPorSubcategoriaResponse> {
        try {
            const response = await api.get<ObtenerRolesPorSubcategoriaResponse>(
                `/subcategoria/${subcategoriaId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles por ID de subcategoría:', error);
            throw error;
        }
    },

    /**
     * Obtiene los roles de una subcategoría por su nombre
     * @param nombreSubcategoria Nombre de la subcategoría
     * @returns Promesa con la lista de roles
     */
    async getRolesPorNombreSubcategoria(
        nombreSubcategoria: string
    ): Promise<ObtenerRolesPorSubcategoriaResponse> {
        try {
            const response = await api.get<ObtenerRolesPorSubcategoriaResponse>(
                `/subcategoria/nombre/${encodeURIComponent(nombreSubcategoria)}`
            );
            return response.data;
        } catch (error) {
            console.error('Error al obtener roles por nombre de subcategoría:', error);
            throw error;
        }
    },

    /**
     * Asigna múltiples roles a una subcategoría en una sola operación
     * @param data Datos para la asignación masiva
     * @returns Promesa con la respuesta de la operación
     */
    async asignarMultiplesRoles(
        data: BulkAsignarRolesRequest
    ): Promise<BulkAsignarRolesResponse> {
        try {
            const response = await api.post<BulkAsignarRolesResponse>(
                '/bulk',
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error al asignar múltiples roles:', error);
            throw error;
        }
    },

    /**
     * Actualiza la relación entre una subcategoría y un rol
     * @param id ID de la relación a actualizar
     * @param data Datos de la actualización
     * @returns Promesa con la respuesta de la operación
     */
    async actualizarRelacion(
        id: number,
        data: ActualizarRelacionRequest
    ): Promise<ActualizarRelacionResponse> {
        try {
            const response = await api.put<ActualizarRelacionResponse>(
                `/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error al actualizar la relación subcategoría-rol:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las relaciones subcategoría-rol
     * @returns Promesa con la lista de relaciones subcategoría-rol
     */
    async getAllSubcategoriaRoles(): Promise<SubcategoriaRol[]> {
        try {
            const response = await api.get<SubcategoriaRol[]>('/');
            return response.data;
        } catch (error) {
            console.error('Error al obtener todas las relaciones subcategoría-rol:', error);
            throw error;
        }
    },

    /**
     * Crea una nueva relación subcategoría-rol
     * @param subcategoriaId ID de la subcategoría
     * @param rolId ID del rol
     * @returns Promesa con la relación creada
     */
    async createSubcategoriaRol(
        subcategoriaId: number,
        rolId: number
    ): Promise<SubcategoriaRol> {
        try {
            const response = await api.post<SubcategoriaRol>('/', {
                subcategoriaId,
                rolId
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear relación subcategoría-rol:', error);
            throw error;
        }
    },

    /**
     * Elimina una relación subcategoría-rol
     * @param subcategoriaId ID de la subcategoría
     * @param rolId ID del rol
     */
    async deleteSubcategoriaRol(
        subcategoriaId: number,
        rolId: number
    ): Promise<void> {
        try {
            await api.delete(`/subcategoria/${subcategoriaId}/rol/${rolId}`);
        } catch (error) {
            console.error('Error al eliminar relación subcategoría-rol:', error);
            throw error;
        }
    }
};

export default subcategoriaRolesService;
