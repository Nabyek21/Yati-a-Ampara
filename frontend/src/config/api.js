// frontend/src/config/api.js
// Configuración centralizada de la API

// URL base del backend - cambia aquí si es necesario
export const API_BASE_URL = 
  import.meta.env?.VITE_PUBLIC_API_URL || 
  import.meta.env?.PUBLIC_API_URL ||
  'http://localhost:4000/api';

// Endpoints específicos
export const AUTH_API = `${API_BASE_URL}/auth`;
export const IA_API = `${API_BASE_URL}/ia`;

// Headers por defecto
export function getDefaultHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Función helper para fetch con manejo de errores
export async function apiCall(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      `API Error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export default {
  API_BASE_URL,
  AUTH_API,
  IA_API,
  getDefaultHeaders,
  apiCall,
};
