import axios from 'axios';

const API_URL = 'http://localhost:8080/api/subcategorias';

const subcategoriaService = {
  async getCategories(token: string) {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCategoryById(token: string, id: number) {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }
  },

  async createCategory(token: string, categoryData: any) {
    try {
      const response = await axios.post(API_URL, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(token: string, id: number, categoryData: any) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, categoryData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  async deleteCategory(token: string, id: number) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  },

  async createSubcategoriasBulk(token: string, subcategorias: Array<{
    categoriaId: number;
    nombre: string;
    descripcion?: string;
  }>) {
    try {
      const response = await axios.post(
        `${API_URL}/subcategorias/bulk`,
        { subcategorias },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating subcategories in bulk:', error);
      throw error;
    }
  },

  async getAllSubcategorias(token: string) {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      throw error;
    }
  }
};

export default subcategoriaService;
