import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRide } from '../../context/RideContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import { COLORS } from '../../config/constants';

const TEXTOS_ESTADO = {
  buscando: 'Buscando un conductor cercano...',
  aceptado: 'Un conductor aceptó tu viaje',
  en_camino: 'El conductor va en camino',
  en_viaje: 'Viaje en curso',
  finalizado: '¡Llegaste a tu destino!',
  cancelado: 'Este viaje fue cancelado'
};

export default function RideTrackingScreen({ navigation }) {
  const { viajeActivo, ubicacionConductor, cancelarViajeActivo } = useRide();
  const { showToast } = useToast();

  // Si el contexto se vació (viaje finalizado/cancelado ya limpiado), regresa al inicio
  useEffect(() => {
    if (!viajeActivo) {
      navigation.navigate('MainTabs');
    }
  }, [viajeActivo]);

  if (!viajeActivo) return null;

  const manejarCancelar = () => {
    Alert.alert('¿Cancelar viaje?', 'Esta acción no se puede deshacer.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar', style: 'destructive',
        onPress: async () => {
          try {
            await cancelarViajeActivo('Cancelado por el pasajero');
          } catch (error) {
            showToast(error.message, 'error');
          }
        }
      }
    ]);
  };

  const puedeChatear = ['aceptado', 'en_camino', 'en_viaje'].includes(viajeActivo.estado);
  const puedeCancelar = ['buscando', 'aceptado'].includes(viajeActivo.estado);

  return (
    <View style={styles.contenedor}>
      <MapView
        style={styles.mapa}
        initialRegion={{
          latitude: Number(viajeActivo.origen_lat),
          longitude: Number(viajeActivo.origen_lng),
          latitudeDelta: 0.03,
          longitudeDelta: 0.03
        }}
      >
        <Marker coordinate={{ latitude: Number(viajeActivo.origen_lat), longitude: Number(viajeActivo.origen_lng) }} pinColor={COLORS.primary} title="Origen" />
        <Marker coordinate={{ latitude: Number(viajeActivo.destino_lat), longitude: Number(viajeActivo.destino_lng) }} pinColor={COLORS.danger} title="Destino" />
        {ubicacionConductor && (
          <Marker coordinate={{ latitude: ubicacionConductor.lat, longitude: ubicacionConductor.lng }} title="Conductor">
            <View style={styles.marcadorConductor}><Text style={{ fontSize: 20 }}>🚗</Text></View>
          </Marker>
        )}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.estadoTexto}>{TEXTOS_ESTADO[viajeActivo.estado] || viajeActivo.estado}</Text>

        {viajeActivo.conductor_nombre && (
          <View style={styles.tarjetaConductor}>
            <View style={styles.avatarConductor}>
              <Text style={styles.avatarConductorTexto}>{viajeActivo.conductor_nombre[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.conductorNombre}>{viajeActivo.conductor_nombre}</Text>
              <Text style={styles.conductorDetalle}>
                {viajeActivo.marca} {viajeActivo.modelo} · {viajeActivo.placa} · ⭐ {viajeActivo.conductor_calificacion}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.filaTarifa}>
          <Text style={styles.tarifaLabel}>Tarifa estimada</Text>
          <Text style={styles.tarifaValor}>${Number(viajeActivo.tarifa_estimada).toFixed(2)}</Text>
        </View>

        <View style={styles.filaBotones}>
          {puedeChatear && (
            <Button titulo="💬 Chat" variante="secondary" onPress={() => navigation.navigate('Chat', { viajeId: viajeActivo.id })} style={{ flex: 1 }} />
          )}
          {puedeCancelar && (
            <Button titulo="Cancelar viaje" variante="danger" onPress={manejarCancelar} style={{ flex: 1 }} />
          )}
        </View>

        {viajeActivo.estado === 'finalizado' && (
          <Button
            titulo="⭐ Calificar viaje"
            onPress={() => navigation.navigate('Calificar', { viajeId: viajeActivo.id })}
            style={{ marginTop: 12, backgroundColor: COLORS.secondary }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  mapa: { flex: 1 },
  marcadorConductor: {
    backgroundColor: '#fff', borderRadius: 20, padding: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4
  },
  panel: {
    backgroundColor: COLORS.surface, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8
  },
  estadoTexto: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  tarjetaConductor: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: 14, padding: 14, marginBottom: 14
  },
  avatarConductor: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12
  },
  avatarConductorTexto: { color: '#fff', fontWeight: '800', fontSize: 16 },
  conductorNombre: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  conductorDetalle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  filaTarifa: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tarifaLabel: { fontSize: 13, color: COLORS.textMuted },
  tarifaValor: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  filaBotones: { flexDirection: 'row', gap: 10 },
  botonSecundario: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border
  },
  botonSecundarioTexto: { fontWeight: '700', color: COLORS.text },
  botonCancelar: {
    flex: 1, backgroundColor: '#FEF2F2', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#FECACA'
  },
  botonCancelarTexto: { fontWeight: '700', color: COLORS.danger },
  botonCalificar: { backgroundColor: COLORS.secondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  botonCalificarTexto: { fontWeight: '700', color: '#fff' }
});
