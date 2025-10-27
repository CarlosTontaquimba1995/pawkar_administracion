import axios from 'axios';
import {
    RoleResponse,
    RoleListResponse,
    CreateRoleRequest,
    BulkCreateRolesRequest,
    BulkCreateRolesResponse,
    DeleteRoleResponse,
    UpdateRoleRequest
} from '@/types/role.types';

const API_URL = 'http://localhost:8080/api/roles';

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

const roleService = {
    /**
     * Obtiene todos los roles disponibles
     * @returns Promesa con la lista de roles
     */
    async getAllRoles(): Promise<RoleListResponse> {
        const response = await api.get<RoleListResponse>('');
        return response.data;
    },

    /**
     * Obtiene un rol por su nombre
     * @param name Nombre del rol (ej: ROLE_USER, ROLE_ADMIN)
     * @returns Promesa con los detalles del rol
     */
    async getRoleByName(name: string): Promise<RoleResponse> {
        const response = await api.get<RoleResponse>(`/${encodeURIComponent(name)}`);
        return response.data;
    },

    /**
     * Crea un nuevo rol o actualiza uno existente
     * @param roleData Datos del rol a crear o actualizar
     * @returns Promesa con el rol creado o actualizado
     */
    async createOrUpdateRole(roleData: CreateRoleRequest): Promise<RoleResponse> {
        const response = await api.post<RoleResponse>('/', roleData);
        return response.data;
    },

    /**
     * Crea o actualiza múltiples roles en una sola operación
     * @param data Datos de los roles a crear o actualizar
     * @returns Promesa con la lista de roles creados o actualizados
     */
    async bulkCreateOrUpdateRoles(data: BulkCreateRolesRequest): Promise<BulkCreateRolesResponse> {
        const response = await api.post<BulkCreateRolesResponse>('/bulk', data);
        return response.data;
    },

    /**
       * Elimina un rol existente
       * @param id ID del rol a eliminar
       */
    async deleteRole(id: number): Promise<DeleteRoleResponse> {
        const response = await api.delete<DeleteRoleResponse>(`/${id}`);
        return response.data;
    },

    /**
     * Elimina un rol por su nombre
     * @param name Nombre del rol a eliminar (ej: ROLE_USER)
     * @returns Promesa vacía que se resuelve cuando la operación es exitosa
     */
    async deleteRoleByName(name: string): Promise<void> {
        await api.delete(`/name/${encodeURIComponent(name)}`);
    },

    /**
     * Obtiene un rol por su ID
     * @param id ID del rol a buscar
     * @returns Promesa con los detalles del rol
     */
    async getRoleById(id: number): Promise<RoleResponse> {
        const response = await api.get<RoleResponse>(`/${id}`);
        return response.data;
    },

    /**
      * Actualiza un rol existente
      * @param id ID del rol a actualizar
      * @param roleData Datos actualizados del rol
      */
    async updateRole(id: number, roleData: UpdateRoleRequest): Promise<RoleResponse> {
        const response = await api.put<RoleResponse>(`/${id}`, roleData);
        return response.data;
    },

};

export default roleService;
