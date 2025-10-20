import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

export interface Player {
  id: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
  estado: string;
}

interface PlayerData {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  documentoIdentidad: string;
}

export interface BulkCreateResponse {
  success: boolean;
  message: string;
  data?: Array<PlayerData & { id: number }>;
  timestamp: string;
  error?: string;
  status?: number;
}

export const getPlayers = async (): Promise<Player[]> => {
  try {
    const response = await axios.get(`${API_URL}/jugadores`);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const registerPlayers = async (players: PlayerData[], token: string): Promise<BulkCreateResponse> => {
  try {
    const response = await axios.post(
      `${API_URL}/jugadores/bulk`,
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
};
