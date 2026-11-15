import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { obtenerSocket } from '../config/socket';
import api from '../config/api';

const RideContext = createContext(null);

export const RideProvider = ({ children }) => {
  const [viajeActivo, setViajeActivo] = useState(null);
  const [ubicacionConductor, setUbicacionConductor] = useState(null);
  const [buscandoConductor, setBuscandoConductor] = useState(false);

  useEffect(() => {
    const socket = obtenerSocket();
    if (!socket) return;

    const alAsignarConductor = (viaje) => {
      setViajeActivo(viaje);
      setBuscandoConductor(false);
    };

    const alActualizarViaje = (viaje) => {
      setViajeActivo((actual) => (actual && actual.id === viaje.id ? { ...actual, ...viaje } : actual));
      if (['finalizado', 'cancelado'].includes(viaje.estado)) {
        // Se limpia un ratito después para que la UI alcance a mostrar el estado final
        setTimeout(() => setViajeActivo(null), 4000);
      }
    };

    const alCancelar = () => {
      setBuscandoConductor(false);
      setViajeActivo((actual) => (actual ? { ...actual, estado: 'cancelado' } : actual));
      setTimeout(() => setViajeActivo(null), 3000);
    };

    const alNoHaberConductores = () => {
      setBuscandoConductor(false);
    };

    const alMoverConductor = ({ viaje_id, lat, lng }) => {
      setUbicacionConductor((actual) =>
        viajeActivo?.id === viaje_id || !actual ? { viaje_id, lat, lng } : actual
      );
    };

    socket.on('conductor_asignado', alAsignarConductor);
    socket.on('viaje_actualizado', alActualizarViaje);
    socket.on('viaje_cancelado', alCancelar);
    socket.on('sin_conductores_disponibles', alNoHaberConductores);
    socket.on('ubicacion_conductor', alMoverConductor);

    return () => {
      socket.off('conductor_asignado', alAsignarConductor);
      socket.off('viaje_actualizado', alActualizarViaje);
      socket.off('viaje_cancelado', alCancelar);
      socket.off('sin_conductores_disponibles', alNoHaberConductores);
      socket.off('ubicacion_conductor', alMoverConductor);
    };
  }, [viajeActivo?.id]);

  const crearViaje = useCallback(async (datos) => {
    setBuscandoConductor(!datos.programado_para);
    try {
      const respuesta = await api.post('/viajes', datos);
      if (!datos.programado_para) {
        setViajeActivo(respuesta.data.data);
      }
      return respuesta.data.data;
    } catch (error) {
      setBuscandoConductor(false);
      throw error;
    }
  }, []);

  const cancelarViajeActivo = useCallback(async (motivo) => {
    if (!viajeActivo) return;
    await api.put(`/viajes/${viajeActivo.id}/cancelar`, { motivo });
    setBuscandoConductor(false);
    setViajeActivo(null);
  }, [viajeActivo]);

  const refrescarViajeActivo = useCallback(async () => {
    if (!viajeActivo) return;
    const respuesta = await api.get(`/viajes/${viajeActivo.id}`);
    setViajeActivo(respuesta.data.data);
  }, [viajeActivo]);

  return (
    <RideContext.Provider
      value={{
        viajeActivo,
        ubicacionConductor,
        buscandoConductor,
        crearViaje,
        cancelarViajeActivo,
        refrescarViajeActivo,
        setViajeActivo
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => useContext(RideContext);
