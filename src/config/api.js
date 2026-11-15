import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from './constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

// Le pega el token a cada request automáticamente, si existe
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extrae siempre un mensaje de error legible, venga de donde venga
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.errores?.[0] ||
      (error.code === 'ECONNABORTED'
        ? 'El servidor tardó demasiado en responder.'
        : 'No se pudo conectar con el servidor. Revisa tu conexión.');
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
