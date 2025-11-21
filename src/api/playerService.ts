import axios, { AxiosError } from 'axios';
import {
  PlayerResponse,
  PlayerListResponse,
  PlayerCountResponse,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  CreateMultiplePlayersRequest,
  PlayerQueryParams
} from '../types/player.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/jugadores');

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

const playerService = {
  /**
   * Get paginated list of players with optional search and sorting
   * @param params Query parameters for pagination, sorting, and searching
   */
  async getPlayers(params?: PlayerQueryParams): Promise<PlayerListResponse> {
    try {
      const response = await api.get<PlayerListResponse>('', { params });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching players:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Get total count of active players
   */
  async getActivePlayersCount(): Promise<PlayerCountResponse> {
    try {
      const response = await api.get<PlayerCountResponse>('/count');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching active players count:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Get player by ID
   * @param id Player ID
   */
  async getPlayerById(id: number): Promise<PlayerResponse> {
    try {
      const response = await api.get<PlayerResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching player with id ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Create a new player
   * @param playerData Player data to create
   */
  async createPlayer(playerData: CreatePlayerRequest): Promise<PlayerResponse> {
    try {
      const response = await api.post<PlayerResponse>('', playerData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating player:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Update an existing player
   * @param id Player ID
   * @param playerData Updated player data
   */
  async updatePlayer(id: number, playerData: UpdatePlayerRequest): Promise<PlayerResponse> {
    try {
      const response = await api.put<PlayerResponse>(`/${id}`, playerData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error updating player with id ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Delete a player
   * @param id Player ID to delete
   */
  async deletePlayer(id: number): Promise<PlayerResponse> {
    try {
      const response = await api.delete<PlayerResponse>(`/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error deleting player with id ${id}:`, axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  /**
   * Create multiple players in a single request
   * @param data Object containing array of players to create
   */
  async createMultiplePlayers(data: CreateMultiplePlayersRequest): Promise<PlayerListResponse> {
    try {
      const response = await api.post<PlayerListResponse>('/bulk', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error creating multiple players:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
};

export default playerService;
