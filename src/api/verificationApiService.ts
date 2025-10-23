import axios, { AxiosError } from 'axios';
import { VerificationResponse } from '@/types/verification.types';

const API_URL = 'http://localhost:8080/api/verificacion';

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

const verificationService = {
    /**
     * Verifica si existen registros de subcategorías y series en el sistema
     * @returns Promise que resuelve a un booleano indicando si existen registros
     */
    async checkRequiredRegistrations(): Promise<boolean> {
        try {
            const response = await api.get<VerificationResponse>('/existen-registros');
            return response.data.data.existenRegistros;
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error verificando registros requeridos:', axiosError.response?.data || axiosError.message);
            throw error;
        }
    }
};

export default verificationService;
