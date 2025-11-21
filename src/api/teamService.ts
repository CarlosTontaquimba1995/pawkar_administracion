import axios from 'axios';
import {
  TeamResponse,
  TeamListResponse,
  TeamCountResponse,
  CreateTeamRequest,
  UpdateTeamRequest,
  CreateMultipleTeamsRequest,
  TeamQueryParams,
  TeamBySubcategoryParams,
  TeamListPageResponse
} from '../types/team.types';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/equipos');

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

const teamService = {
  /**
   * Obtiene una lista paginada de equipos con opciones de búsqueda y ordenamiento
   * @param params Parámetros de consulta (paginación, ordenamiento, búsqueda)
   */
  async getTeams(params?: TeamQueryParams): Promise<TeamListPageResponse> {
    const response = await api.get<TeamListPageResponse>('', { params });
    return response.data;
  },

  /**
   * Obtiene todos los equipos asociados a una serie específica
   * @param serieId ID de la serie
   */
  async getTeamsBySerie(serieId: number): Promise<TeamListResponse> {
    const response = await api.get<TeamListResponse>(`/serie/${serieId}`);
    return response.data;
  },

  /**
   * Obtiene todos los equipos asociados a una subcategoría específica
   * @param subcategoriaId ID de la subcategoría
   * @param params Parámetros adicionales (opcional: serieId para filtrar por serie)
   */
  async getTeamsBySubcategoria(
    subcategoriaId: number,
    params?: TeamBySubcategoryParams
  ): Promise<TeamListResponse> {
    const response = await api.get<TeamListResponse>(`/subcategoria/${subcategoriaId}`, { params });
    return response.data;
  },

  /**
   * Obtiene los detalles de un equipo por su ID
   * @param id ID del equipo
   */
  async getTeamById(id: number): Promise<TeamResponse> {
    const response = await api.get<TeamResponse>(`/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo equipo
   * @param teamData Datos del equipo a crear
   */
  async createTeam(teamData: CreateTeamRequest): Promise<TeamResponse> {
    const response = await api.post<TeamResponse>('', teamData);
    return response.data;
  },

  /**
   * Crea múltiples equipos en una sola petición
   * @param teamsData Datos de los equipos a crear
   */
  async createTeamsBulk(teamsData: CreateMultipleTeamsRequest): Promise<TeamListResponse> {
    const response = await api.post<TeamListResponse>('/bulk', teamsData);
    return response.data;
  },

  /**
   * Actualiza un equipo existente
   * @param id ID del equipo a actualizar
   * @param teamData Datos actualizados del equipo
   */
  async updateTeam(id: number, teamData: UpdateTeamRequest): Promise<TeamResponse> {
    const response = await api.put<TeamResponse>(`/${id}`, teamData);
    return response.data;
  },

  /**
   * Elimina un equipo existente
   * @param id ID del equipo a eliminar
   */
  async deleteTeam(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/${id}`);
    return response.data;
  },

  /**
   * Verifica si existen equipos registrados en el sistema
   */
  async checkTeamsExist(): Promise<boolean> {
    const response = await api.get<boolean>('/existen');
    return response.data; 
  },

  /**
   * Obtiene el conteo total de equipos registrados, con desglose por subcategoría
   */
  async getTeamsCount(): Promise<TeamCountResponse> {
    const response = await api.get<TeamCountResponse>('/count');
    return response.data;
  }
};

export default teamService;
