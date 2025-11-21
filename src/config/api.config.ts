/**
 * API Configuration
 * 
 * Centralized configuration for API base URL.
 * The base URL is read from environment variables.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not defined. Please check your .env file.'
  );
}

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint path (e.g., '/api/auth', '/api/categorias')
 * @returns The full API URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * The base URL for all API requests
 * @example 'http://localhost:8080' or 'https://api.example.com'
 */
export { API_BASE_URL };

export default {
  API_BASE_URL,
  getApiUrl,
};
