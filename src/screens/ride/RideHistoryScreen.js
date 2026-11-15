import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import api from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../config/constants';

const ETIQUETAS_ESTADO = {
  programado: { texto: 'Programado', color: COLORS.secondary },
  buscando: { texto: 'Buscando', color: COLORS.warning },
  aceptado: { texto: 'Aceptado', color: COLORS.primary },
  en_camino: { texto: 'En camino', color: COLORS.primary },
  en_viaje: { texto: 'En curso', color: COLORS.primary },
  finalizado: { texto: 'Finalizado', color: COLORS.success },
  cancelado: { texto: 'Cancelado', color: COLORS.danger }
};

export default function RideHistoryScreen() {
  const { showToast } = useToast();
  const [pestaña, setPestaña] = useState('historial'); // 'historial' | 'programados'
  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const endpoint = pestaña === 'historial' ? '/viajes/mis-viajes' : '/viajes/programados';
      const respuesta = await api.get(endpoint);
      setViajes(respuesta.data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  }, [pestaña]);

  useEffect(() => { cargar(); }, [cargar]);

  const cancelarProgramado = async (viajeId) => {
    try {
      await api.put(`/viajes/${viajeId}/cancelar`, { motivo: 'Cancelado por el pasajero' });
      showToast('Viaje programado cancelado.', 'success');
      cargar();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const renderizarViaje = ({ item }) => {
    const etiqueta = ETIQUETAS_ESTADO[item.estado] || { texto: item.estado, color: COLORS.textMuted };
    const fecha = new Date(item.programado_para || item.creado_en).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' });

    return (
      <View style={styles.tarjeta}>
        <View style={styles.filaTope}>
          <Text style={styles.fecha}>{fecha}</Text>
          <View style={[styles.badge, { backgroundColor: etiqueta.color }]}>
            <Text style={styles.badgeTexto}>{etiqueta.texto}</Text>
          </View>
        </View>
        <Text style={styles.direccion} numberOfLines={1}>🟢 {item.origen_direccion || 'Origen'}</Text>
        <Text style={styles.direccion} numberOfLines={1}>🔴 {item.destino_direccion || 'Destino'}</Text>
        <View style={styles.filaTope}>
          <Text style={styles.tarifa}>${Number(item.tarifa_final || item.tarifa_estimada).toFixed(2)}</Text>
          {pestaña === 'programados' && (
            <TouchableOpacity onPress={() => cancelarProgramado(item.id)}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.pestañas}>
        <TouchableOpacity style={[styles.pestaña, pestaña === 'historial' && styles.pestañaActiva]} onPress={() => setPestaña('historial')}>
          <Text style={[styles.pestañaTexto, pestaña === 'historial' && styles.pestañaTextoActiva]}>Historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pestaña, pestaña === 'programados' && styles.pestañaActiva]} onPress={() => setPestaña('programados')}>
          <Text style={[styles.pestañaTexto, pestaña === 'programados' && styles.pestañaTextoActiva]}>Programados</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={viajes}
        keyExtractor={(item) => item.id}
        renderItem={renderizarViaje}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}
        ListEmptyComponent={
          !cargando && (
            <View style={styles.vacioContenedor}>
              <Text style={styles.vacioEmoji}>{pestaña === 'historial' ? '🚗' : '🕒'}</Text>
              <Text style={styles.vacio}>
                {pestaña === 'historial' ? 'Aún no tienes viajes.' : 'No tienes viajes programados.'}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  pestañas: { flexDirection: 'row', padding: 16, gap: 10 },
  pestaña: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  pestañaActiva: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pestañaTexto: { fontWeight: '600', color: COLORS.text, fontSize: 13 },
  pestañaTextoActiva: { color: '#fff' },
  lista: { padding: 16, paddingTop: 0, gap: 12, flexGrow: 1 },
  tarjeta: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  filaTope: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fecha: { fontSize: 12, color: COLORS.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  direccion: { fontSize: 13, color: COLORS.text },
  tarifa: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  cancelarTexto: { color: COLORS.danger, fontWeight: '600', fontSize: 13 },
  vacioContenedor: { alignItems: 'center', marginTop: 80 },
  vacioEmoji: { fontSize: 40, marginBottom: 10 },
  vacio: { textAlign: 'center', color: COLORS.textMuted }
});
