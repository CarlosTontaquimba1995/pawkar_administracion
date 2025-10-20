import axios from 'axios';

const API_URL = 'http://localhost:8080/api/jugadores';

export interface Player {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
  estado: string;
}

export interface PlayerData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
}

interface PlayersResponse {
  content: Player[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

const playerService = {
  async getPlayers(
    token: string, 
    page: number = 0, 
    size: number = 10, 
    search: string = ''
  ): Promise<PlayersResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(API_URL, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  async getPlayerById(token: string, id: number): Promise<Player> {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching player with id ${id}:`, error);
      throw error;
    }
  },

  async registerPlayers(players: PlayerData[], token: string) {
    try {
      const response = await axios.post(
        `${API_URL}/bulk`,
        { jugadores: players },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  },

  async updatePlayer(
    token: string, 
    id: number, 
    playerData: PlayerData
  ): Promise<ApiResponse<Player>> {
    try {
      const response = await axios.put(
        `${API_URL}/${id}`,
        playerData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  async deletePlayer(token: string, id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error(`Error deleting player with id ${id}:`, error);
      throw error;
    }
  }
};

export default playerService;
