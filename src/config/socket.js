import { io } from 'socket.io-client';
import { SOCKET_URL } from './constants';

let socket = null;

// Se conecta una sola vez, cuando el usuario inicia sesión
export const conectarSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000
  });

  socket.on('connect_error', (error) => {
    console.log('⚠️ Error de conexión al socket:', error.message);
  });

  return socket;
};

export const obtenerSocket = () => socket;

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
