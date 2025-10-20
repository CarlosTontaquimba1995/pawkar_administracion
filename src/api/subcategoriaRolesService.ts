import axios from 'axios';
import { Rol, SubcategoriaRol } from '../types/roles.types';

const API_URL = 'http://localhost:8080/api/subcategoria-roles';

const subcategoriaRolesService = {
    /**
     * Fetches roles by subcategory ID
     * @param token Authentication token
     * @param subcategoriaId The ID of the subcategory to fetch roles for
     * @returns Promise with the list of roles
     */
    async getSubcategoriaRoles(subcategoriaId: number, token: string): Promise<Rol[]> {
    try {
        const response = await axios.get<{ data: SubcategoriaRol[] }>(
            `${API_URL}/subcategoria/${subcategoriaId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.data) {
            return response.data.data.map((item) => ({
                id: item.rol.id,
                name: item.rol.name,
                detail: item.rol.detail
            }));
        }
        return [];
    } catch (error) {
            console.error(`Error fetching roles for subcategory ${subcategoriaId}:`, error);
            throw error;
        }
    },

    /**
     * Fetches all subcategoria-roles relationships
     * @param token Authentication token
     * @returns Promise with the list of all subcategoria-roles relationships
     */
    async getAllSubcategoriaRoles(token: string): Promise<SubcategoriaRol[]> {
        try {
            const response = await axios.get<{ data: SubcategoriaRol[] }>(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching all subcategoria-roles:', error);
            throw error;
        }
    },

    /**
     * Creates a new subcategoria-rol relationship
     * @param token Authentication token
     * @param subcategoriaId The ID of the subcategory
     * @param rolId The ID of the role
     * @returns Promise with the created relationship
     */
    async createSubcategoriaRol(
        token: string,
        subcategoriaId: number,
        rolId: number
    ): Promise<SubcategoriaRol> {
        try {
            const response = await axios.post<{ data: SubcategoriaRol }>(
                API_URL,
                { subcategoriaId, rolId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error creating subcategoria-rol relationship:', error);
            throw error;
        }
    },

    /**
     * Bulk assigns multiple roles to a subcategory
     * @param token Authentication token
     * @param subcategoriaId The ID of the subcategory
     * @param roleIds Array of role IDs to assign
     * @returns Promise with the bulk assignment result
     */
    async bulkAssignRoles(
        token: string,
        subcategoriaId: number,
        roleIds: number[]
    ): Promise<{
        success: boolean;
        message: string;
        data: {
            totalRolesAsignados: number;
            asignacionesExistentes: number;
            subcategoriaId: number;
            rolesAsignados: number[];
            nuevasAsignaciones: number;
        };
    }> {
        try {
            const response = await axios.post(
                `${API_URL}/bulk`,
                {
                    subcategoriaId,
                    roles: roleIds
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error in bulk role assignment:', error);
            throw error;
        }
    },

    /**
     * Deletes a subcategoria-rol relationship
     * @param token Authentication token
     * @param id The ID of the relationship to delete
     * @returns Promise that resolves when the relationship is deleted
     */
    async deleteSubcategoriaRol(token: string, id: number): Promise<void> {
        try {
            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error(`Error deleting subcategoria-rol relationship ${id}:`, error);
            throw error;
    }
    }
};

export default subcategoriaRolesService;
