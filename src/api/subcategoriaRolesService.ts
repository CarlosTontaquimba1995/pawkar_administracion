import axios from 'axios';
import {
    SubcategoriaRol,
    AsignarRolResponse,
    BulkAsignarRolesRequest,
    BulkAsignarRolesResponse,
    EliminarRolResponse,
    ObtenerRolesResponse
} from '../types/subcategoriaRoles.types';
import { Role } from '@/types/role.types';

const API_URL = 'http://localhost:8080/api/subcategoria-roles';

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
            console.error('No se recibió respuesta del servidor');
        } else {
            console.error('Error al realizar la petición:', error.message);
        }
        return Promise.reject(error);
    }
);

const subcategoriaRolesService = {
    /**
     * Asigna un rol a una subcategoría
     * @param subcategoriaId ID de la subcategoría
     * @param rolId ID del rol a asignar
     * @param token Token de autenticación
     * @returns Promesa con la respuesta de la operación
     */
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
        const response = await api.post<AsignarRolResponse>(
            `/subcategoria/${subcategoriaId}/rol/${rolId}`,
            {}
        );
        return response.data;
    },

    /**
     * Elimina un rol de una subcategoría
     * @param subcategoriaId ID de la subcategoría
     * @param rolId ID del rol a eliminar
     * @param token Token de autenticación
     * @returns Promesa con la respuesta de la operación
     */
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
        const response = await api.delete<EliminarRolResponse>(
            `/subcategoria/${subcategoriaId}/rol/${rolId}`
        );
        return response.data;
    },

    /**
     * Obtiene los roles de una subcategoría por su ID
     * @param subcategoriaId ID de la subcategoría
     * @param token Token de autenticación
     * @returns Promesa con la lista de roles
     */
    /**
     * Obtiene los roles de una subcategoría por su ID
     * @param subcategoriaId ID de la subcategoría
     * @returns Promesa con la lista de roles
     */
    async getRolesPorSubcategoriaId(
        subcategoriaId: number
    ): Promise<ObtenerRolesResponse> {
        const response = await api.get<ObtenerRolesResponse>(
            `/subcategoria/${subcategoriaId}`
        );
        console.log(response.data);
        return response.data;
    },

    /**
     * Obtiene los roles de una subcategoría por su nombre
     * @param nombreSubcategoria Nombre de la subcategoría
     * @param token Token de autenticación
     * @returns Promesa con la lista de roles
     */
    /**
     * Obtiene los roles de una subcategoría por su nombre
     * @param nombreSubcategoria Nombre de la subcategoría
     * @returns Promesa con la lista de roles
     */
    async getRolesPorNombreSubcategoria(
        nombreSubcategoria: string
    ): Promise<ObtenerRolesResponse> {
        const response = await api.get<ObtenerRolesResponse>(
            `/subcategoria/nombre/${encodeURIComponent(nombreSubcategoria)}`
        );
        return response.data;
    },

    /**
     * Asigna múltiples roles a una subcategoría en una sola operación
     * @param data Datos para la asignación masiva
     * @param token Token de autenticación
     * @returns Promesa con la respuesta de la operación
     */
    /**
     * Asigna múltiples roles a una subcategoría en una sola operación
     * @param data Datos para la asignación masiva
     * @returns Promesa con la respuesta de la operación
     */
    async asignarMultiplesRoles(
        data: BulkAsignarRolesRequest
    ): Promise<BulkAsignarRolesResponse> {
        const response = await api.post<BulkAsignarRolesResponse>('/bulk', data);
        return response.data;
    },

    /**
     * Obtiene los roles de una subcategoría (método alternativo)
     * @deprecated Usar getRolesPorSubcategoriaId o getRolesPorNombreSubcategoria en su lugar
     */
    /**
     * Obtiene los roles de una subcategoría (método alternativo)
     * @deprecated Usar getRolesPorSubcategoriaId o getRolesPorNombreSubcategoria en su lugar
     */
    /**
     * Obtiene los roles de una subcategoría (método alternativo)
     * @deprecated Usar getRolesPorSubcategoriaId o getRolesPorNombreSubcategoria en su lugar
     */
    async getSubcategoriaRoles(subcategoriaId: number): Promise<Role[]> {
        const response = await subcategoriaRolesService.getRolesPorSubcategoriaId(subcategoriaId);
        return response.data || [];
    },

    /**
     * Obtiene todas las relaciones subcategoría-rol
     * @param token Token de autenticación
     * @returns Promesa con la lista de relaciones subcategoría-rol
     */
    /**
     * Obtiene todas las relaciones subcategoría-rol
     * @returns Promesa con la lista de relaciones subcategoría-rol
     */
    async getAllSubcategoriaRoles(): Promise<SubcategoriaRol[]> {
        const response = await api.get<{ data: SubcategoriaRol[] }>('/');
        return response.data.data;
    },

  /**
   * Crea una nueva relación subcategoría-rol
   * @param subcategoriaId ID de la subcategoría
   * @param rolId ID del rol
   * @param token Token de autenticación
   * @returns Promesa con la relación creada
   */
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
        const response = await api.post<{ data: SubcategoriaRol }>(
            '/',
            { subcategoriaId, rolId }
        );
        return response.data.data;
    },

  /**
   * Elimina una relación subcategoría-rol
   * @param subcategoriaId ID de la subcategoría
   * @param rolId ID del rol
   * @param token Token de autenticación
   */
  /**
   * Elimina una relación subcategoría-rol
   * @param subcategoriaId ID de la subcategoría
   * @param rolId ID del rol
   */
    async deleteSubcategoriaRol(
        subcategoriaId: number,
        rolId: number
    ): Promise<void> {
        await api.delete(`/subcategoria/${subcategoriaId}/rol/${rolId}`);
    }
};

export default subcategoriaRolesService;
