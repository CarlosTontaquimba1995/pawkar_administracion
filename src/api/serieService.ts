import axios from 'axios';

const API_URL = 'http://localhost:8080/api/series';

export interface Serie {
  serieId: number;
  subcategoriaId: number;
  subcategoriaNombre: string;
  nombreSerie: string;
}

const serieService = {
  /**
   * Fetches series by subcategory ID
   * @param token Authentication token
   * @param subcategoriaId The ID of the subcategory to fetch series for
   * @returns Promise with the list of series
   */
  async getSeriesBySubcategoria(token: string, subcategoriaId: number): Promise<Serie[]> {
    try {
      const response = await axios.get(`${API_URL}/subcategoria/${subcategoriaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching series for subcategory ${subcategoriaId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all series
   * @param token Authentication token
   * @returns Promise with the list of all series
   */
  async getAllSeries(token: string): Promise<Serie[]> {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all series:', error);
      throw error;
    }
  },

  /**
   * Fetches a single serie by ID
   * @param token Authentication token
   * @param id The ID of the serie to fetch
   * @returns Promise with the serie data
   */
  async getSerieById(token: string, id: number): Promise<Serie> {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching serie with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new serie
   * @param token Authentication token
   * @param serieData The data for the new serie
   * @returns Promise with the created serie
   */
  async createSerie(token: string, serieData: Omit<Serie, 'serieId' | 'subcategoriaNombre'>): Promise<Serie> {
    try {
      const response = await axios.post(API_URL, serieData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating serie:', error);
      throw error;
    }
  },

  /**
   * Updates an existing serie
   * @param token Authentication token
   * @param id The ID of the serie to update
   * @param serieData The updated data for the serie
   * @returns Promise with the updated serie
   */
  async updateSerie(token: string, id: number, serieData: Partial<Serie>): Promise<Serie> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, serieData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating serie with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a serie
   * @param token Authentication token
   * @param id The ID of the serie to delete
   * @returns Promise that resolves when the serie is deleted
   */
  async deleteSerie(token: string, id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting serie with id ${id}:`, error);
      throw error;
    }
  }
};

export default serieService;
