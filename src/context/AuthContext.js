import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../config/api';
import { conectarSocket, desconectarSocket } from '../config/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la app, revisa si ya había una sesión guardada
  useEffect(() => {
    const restaurarSesion = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const usuarioGuardado = await SecureStore.getItemAsync('usuario');
        if (token && usuarioGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
          conectarSocket(token);
        }
      } catch (error) {
        console.log('Error restaurando sesión:', error.message);
      } finally {
        setCargando(false);
      }
    };
    restaurarSesion();
  }, []);

  const login = async (telefono, password) => {
    const respuesta = await api.post('/auth/login', { telefono, password });
    const { token, usuario: usuarioLogueado } = respuesta.data.data;

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('usuario', JSON.stringify(usuarioLogueado));

    setUsuario(usuarioLogueado);
    conectarSocket(token);
    return usuarioLogueado;
  };

  const registrar = async (datos) => {
    const respuesta = await api.post('/auth/registro', { ...datos, rol: 'pasajero' });
    const { token, usuario: usuarioNuevo } = respuesta.data.data;

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('usuario', JSON.stringify(usuarioNuevo));

    setUsuario(usuarioNuevo);
    conectarSocket(token);
    return usuarioNuevo;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('usuario');
    desconectarSocket();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
