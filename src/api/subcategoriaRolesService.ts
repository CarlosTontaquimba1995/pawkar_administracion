import axios from 'axios';

const API_URL = 'http://localhost:8080/api/subcategoria-roles';

const getSubcategoriaRoles = async (subcategoriaId: number, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/subcategoria/${subcategoriaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Map the response to only return the roles array
        if (response.data && response.data.data) {
            return response.data.data.map((item: any) => ({
                id: item.rol.id,
                name: item.rol.name,
                detail: item.rol.detail
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching subcategoria roles:', error);
        throw error;
    }
};

export default {
    getSubcategoriaRoles
};
