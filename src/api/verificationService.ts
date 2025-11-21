import axios from 'axios';
import { getApiUrl } from '../config/api.config';

const API_URL = getApiUrl('/api/verificacion');

export interface VerificationResponse {
  success: boolean;
  message: string;
  data: {
    existenRegistros: boolean;
  };
  timestamp: string;
}

export const checkRequiredRegistrations = async (): Promise<boolean> => {
  try {
    const response = await axios.get<VerificationResponse>(`${API_URL}/existen-registros`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data.existenRegistros;
  } catch (error) {
    console.error('Error verificando registros requeridos:', error);
    return false;
  }
};
