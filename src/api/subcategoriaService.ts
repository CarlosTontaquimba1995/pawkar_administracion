import axios from 'axios';
import {
  CreateSubcategoriaRequest,
  CreateMultipleSubcategoriasRequest,
  UpdateSubcategoriaRequest,
  SubcategoriaResponse,
  SubcategoriaListResponse,
  DeleteSubcategoriaResponse,
} from '../types/subcategoria.types';

const API_URL = 'http://localhost:8080/api/subcategorias';

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

const subcategoriaService = {
  /**
   * Obtiene todas las subcategorías disponibles
   */
  async getSubcategorias(): Promise<SubcategoriaListResponse> {
    try {
      const response = await api.get<SubcategoriaListResponse>('');
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  /**
   * Obtiene una subcategoría por su ID
   * @param id ID de la subcategoría
   */
  async getSubcategoriaById(id: number): Promise<SubcategoriaResponse> {
    try {
      const response = await api.get<SubcategoriaResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategory with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las subcategorías de una categoría específica
   * @param categoriaId ID de la categoría
   */
  async getSubcategoriasByCategoria(categoriaId: number): Promise<SubcategoriaListResponse> {
    try {
      const response = await api.get<SubcategoriaListResponse>(`/categoria/${categoriaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoriaId}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva subcategoría
   * @param subcategoriaData Datos de la subcategoría a crear
   */
  async createSubcategoria(subcategoriaData: CreateSubcategoriaRequest): Promise<SubcategoriaResponse> {
    try {
      const response = await api.post<SubcategoriaResponse>('/', subcategoriaData);
      return response.data;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },

  /**
   * Crea múltiples subcategorías en una sola petición
   * @param data Objeto con el array de subcategorías a crear
   */
  async createMultipleSubcategorias(
    data: CreateMultipleSubcategoriasRequest
  ): Promise<SubcategoriaListResponse> {
    try {
      const response = await api.post<SubcategoriaListResponse>('/bulk', data);
      return response.data;
    } catch (error) {
      console.error('Error creating multiple subcategories:', error);
      throw error;
    }
  },

  /**
   * Actualiza una subcategoría existente
   * @param id ID de la subcategoría a actualizar
   * @param subcategoriaData Datos actualizados de la subcategoría
   */
  async updateSubcategoria(
    id: number,
    subcategoriaData: UpdateSubcategoriaRequest
  ): Promise<SubcategoriaResponse> {
    try {
      const response = await api.put<SubcategoriaResponse>(`/${id}`, subcategoriaData);
      return response.data;
    } catch (error) {
      console.error(`Error updating subcategory with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una subcategoría
   * @param id ID de la subcategoría a eliminar
   */
  async deleteSubcategoria(id: number): Promise<DeleteSubcategoriaResponse> {
    try {
      const response = await api.delete<DeleteSubcategoriaResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subcategory with id ${id}:`, error);
      throw error;
    }
  },

  // Métodos legacy para mantener compatibilidad
  async getCategories(): Promise<SubcategoriaListResponse> {
    try {
      const response = await api.get<SubcategoriaListResponse>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  },

  /**
   * Obtiene los próximos eventos (subcategorías con proximo = true) de la categoría de eventos
   * @returns Lista de próximos eventos
   */
  async getProximosEventos(): Promise<SubcategoriaListResponse> {
    const response = await api.get<SubcategoriaListResponse>('/eventos/proximos');
    return response.data;
  },

  /**
   * Obtiene los eventos pasados (subcategorías con proximo = false) de la categoría de eventos
   * @returns Lista de eventos pasados
   */
  async getEventosPasados(): Promise<SubcategoriaListResponse> {
    const response = await api.get<SubcategoriaListResponse>('/eventos/pasados');
    return response.data;
  },

  // Alias para mantener compatibilidad
  createCategory: async (categoryData: any) => {
    try {
      const response = await api.post(API_URL, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Alias para mantener compatibilidad
  updateCategory: async (id: number, categoryData: any) => {
    try {
      const response = await api.put(`${API_URL}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category with id ${id}:`, error);
      throw error;
    }
  },

  // Alias para mantener compatibilidad
  deleteCategory: async (id: number) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting category with id ${id}:`, error);
      throw error;
    }
  },

  // Alias para mantener compatibilidad
  getCategoryById: async (id: number) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with id ${id}:`, error);
      throw error;
    }
  },
};

export default subcategoriaService;
