import axios from 'axios';

const API_URL = 'http://localhost:8080/api/equipos';

interface Team {
  id: number;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  jugadoresCount?: number;
  // Add other team properties as needed
}

interface PlayerCountResponse {
  success: boolean;
  message: string;
  data: {
    totalJugadores: number;
  };
  timestamp: string;
}

const teamService = {
  async checkTeamsExist(token: string): Promise<boolean> {
    try {
      console.log('🔍 Verificando existencia de equipos...');
      console.log('Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      const response = await axios.get(`${API_URL}/existen`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Respuesta de la API:', response.data);
      console.log('Tipo de respuesta:', typeof response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Error al verificar equipos:', error);
      console.error('Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  },

  async getTeams(
    token: string, 
    categoriaId?: number, 
    page: number = 0, 
    size: number = 10, 
    search?: string
  ) {
    try {
      let url = API_URL;
      const params = new URLSearchParams();

      if (categoriaId) {
        url = `${API_URL}/categoria/${categoriaId}`;
      }

      // Add pagination parameters
      params.append('page', page.toString());
      params.append('size', size.toString());

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  async getTeamById(token: string, id: number) {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching team with id ${id}:`, error);
      throw error;
    }
  },

  async createTeam(token: string, teamData: Omit<Team, 'id'>) {
    try {
      const response = await axios.post(API_URL, teamData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  async updateTeam(token: string, id: number, teamData: Partial<Team>) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, teamData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating team with id ${id}:`, error);
      throw error;
    }
  },

  async deleteTeam(token: string, id: number) {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting team with id ${id}:`, error);
      throw error;
    }
  },

  async getTeamsBySubcategoria(token: string, subcategoriaId: number, serieId?: number) {
    const params: any = {};
    if (serieId) {
      params.serieId = serieId;
    }
    
    const response = await axios.get(`${API_URL}/subcategoria/${subcategoriaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  },
  
  createTeamsBulk(token: string, teams: Array<{
    subcategoriaId: number;
    serieId: number;
    nombre: string;
    fundacion: string;
  }>) {
    return axios.post(`${API_URL}/bulk`, teams, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  },

  async getTotalPlayers(token: string): Promise<number> {
    const response = await axios.get<PlayerCountResponse>('http://localhost:8080/api/jugadores/count', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data?.success) {
      return response.data.data.totalJugadores;
    }
    
    throw new Error('Error al obtener el total de jugadores');
  }
};

export default teamService;
