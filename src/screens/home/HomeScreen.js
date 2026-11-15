import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, Modal
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRide } from '../../context/RideContext';
import { useToast } from '../../context/ToastContext';
import api from '../../config/api';
import Button from '../../components/Button';
import RadarBuscando from '../../components/RadarBuscando';
import { COLORS, ZONAS, TIPOS_VEHICULO } from '../../config/constants';

export default function HomeScreen({ navigation }) {
  const { crearViaje, buscandoConductor, viajeActivo } = useRide();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const mapRef = useRef(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(true);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [zona, setZona] = useState('san_miguel');
  const [tipoVehiculo, setTipoVehiculo] = useState('moto');
  const [metodoPago, setMetodoPago] = useState('efectivo'); // 'efectivo' | 'tarjeta'
  const [tieneTarjeta, setTieneTarjeta] = useState(false);
  const [programando, setProgramando] = useState(false);
  const [fechaProgramada, setFechaProgramada] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [pidiendo, setPidiendo] = useState(false);

  // Revisa si ya tiene alguna tarjeta guardada, para saber si ofrecer "Tarjeta" como opción
  useEffect(() => {
    api.get('/pagos/tarjetas')
      .then((respuesta) => setTieneTarjeta(respuesta.data.data.length > 0))
      .catch(() => setTieneTarjeta(false));
  }, []);

  // Si ya hay un viaje activo, mándalo a la pantalla de seguimiento
  useEffect(() => {
    if (viajeActivo && viajeActivo.estado !== 'buscando') {
      navigation.navigate('SeguimientoViaje');
    }
  }, [viajeActivo]);

  // Ubicación inicial del usuario, como origen por defecto
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showToast('Activa el permiso de ubicación para pedir un viaje.', 'error');
          setCargandoUbicacion(false);
          return;
        }
        const posicion = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = posicion.coords;
        const resultados = await Location.reverseGeocodeAsync({ latitude, longitude });
        const direccion = resultados[0]
          ? [resultados[0].street, resultados[0].city || resultados[0].subregion].filter(Boolean).join(', ')
          : 'Mi ubicación actual';
        setOrigen({ lat: latitude, lng: longitude, direccion });
      } catch {
        showToast('No se pudo obtener tu ubicación. Actívala en ajustes.', 'error');
      } finally {
        setCargandoUbicacion(false);
      }
    })();
  }, []);

  // Cuando hay origen Y destino, encuadra el mapa mostrando ambos marcadores
  useEffect(() => {
    if (origen && destino && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [{ latitude: origen.lat, longitude: origen.lng }, { latitude: destino.lat, longitude: destino.lng }],
        { edgePadding: { top: 100, right: 60, bottom: 320, left: 60 }, animated: true }
      );
    } else if (origen && mapRef.current) {
      mapRef.current.animateToRegion({ latitude: origen.lat, longitude: origen.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 });
    }
  }, [origen, destino]);

  const abrirBusqueda = (esOrigen) => {
    navigation.navigate('BuscarLugar', {
      titulo: esOrigen ? '¿Dónde te recogemos?' : '¿A dónde vas?',
      permitirUbicacionActual: esOrigen,
      onSeleccionar: (lugar) => (esOrigen ? setOrigen(lugar) : setDestino(lugar))
    });
  };

  const pedirViaje = async () => {
    if (!origen || !destino) {
      showToast('Selecciona un destino para continuar.', 'error');
      return;
    }
    setPidiendo(true);
    try {
      await crearViaje({
        origen_lat: origen.lat, origen_lng: origen.lng, origen_direccion: origen.direccion,
        destino_lat: destino.lat, destino_lng: destino.lng, destino_direccion: destino.direccion,
        tipo_vehiculo: tipoVehiculo, metodo_pago: metodoPago, zona,
        programado_para: programando ? fechaProgramada.toISOString() : undefined
      });

      if (programando) {
        showToast('¡Tu viaje quedó programado! 🕒', 'success');
        setDestino(null);
        setProgramando(false);
      } else {
        navigation.navigate('SeguimientoViaje');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setPidiendo(false);
    }
  };

  if (cargandoUbicacion) {
    return (
      <View style={styles.cargandoContenedor}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.cargandoTexto}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <MapView
        ref={mapRef}
        style={styles.mapa}
        initialRegion={{
          latitude: origen?.lat || 13.4833,
          longitude: origen?.lng || -88.1833,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
      >
        {origen && <Marker coordinate={{ latitude: origen.lat, longitude: origen.lng }} pinColor={COLORS.primary} title="Origen" />}
        {destino && <Marker coordinate={{ latitude: destino.lat, longitude: destino.lng }} pinColor={COLORS.danger} title="Destino" />}
      </MapView>

      <View style={styles.panel}>
        {/* Barra de origen — tipo Uber: tocar abre la búsqueda */}
        <TouchableOpacity style={styles.campoBusqueda} onPress={() => abrirBusqueda(true)}>
          <View style={[styles.puntoIndicador, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.campoBusquedaTexto} numberOfLines={1}>
            {origen?.direccion || 'Cargando ubicación...'}
          </Text>
        </TouchableOpacity>

        <View style={styles.lineaConectora} />

        {/* Barra de destino */}
        <TouchableOpacity style={styles.campoBusqueda} onPress={() => abrirBusqueda(false)}>
          <View style={[styles.puntoIndicador, { backgroundColor: COLORS.danger }]} />
          <Text style={[styles.campoBusquedaTexto, !destino && styles.campoBusquedaPlaceholder]} numberOfLines={1}>
            {destino?.direccion || '¿A dónde vas?'}
          </Text>
          {!destino && <Ionicons name="search" size={16} color={COLORS.textMuted} />}
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filaChips}>
          {TIPOS_VEHICULO.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.chipVehiculo, tipoVehiculo === t.value && styles.chipVehiculoActivo]}
              onPress={() => setTipoVehiculo(t.value)}
            >
              <Text style={styles.chipVehiculoEmoji}>{t.icono}</Text>
              <Text style={[styles.chipVehiculoTexto, tipoVehiculo === t.value && styles.chipVehiculoTextoActivo]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filaChips}>
          {ZONAS.map((z) => (
            <TouchableOpacity
              key={z.value}
              style={[styles.chipZona, zona === z.value && styles.chipZonaActiva]}
              onPress={() => setZona(z.value)}
            >
              <Text style={[styles.chipZonaTexto, zona === z.value && styles.chipZonaTextoActiva]}>{z.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.etiquetaSeccion}>Método de pago</Text>
        <View style={styles.filaMetodoPago}>
          <TouchableOpacity
            style={[styles.chipMetodo, metodoPago === 'efectivo' && styles.chipMetodoActivo]}
            onPress={() => setMetodoPago('efectivo')}
          >
            <Ionicons name="cash-outline" size={16} color={metodoPago === 'efectivo' ? '#fff' : COLORS.text} />
            <Text style={[styles.chipMetodoTexto, metodoPago === 'efectivo' && styles.chipMetodoTextoActivo]}>Efectivo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chipMetodo, metodoPago === 'tarjeta' && styles.chipMetodoActivo]}
            onPress={() => (tieneTarjeta ? setMetodoPago('tarjeta') : navigation.navigate('MetodosPago'))}
          >
            <Ionicons name="card-outline" size={16} color={metodoPago === 'tarjeta' ? '#fff' : COLORS.text} />
            <Text style={[styles.chipMetodoTexto, metodoPago === 'tarjeta' && styles.chipMetodoTextoActivo]}>
              {tieneTarjeta ? 'Tarjeta' : 'Agregar tarjeta'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filaProgramar} onPress={() => setProgramando(!programando)}>
          <Text style={styles.filaProgramarTexto}>🕒 Programar para después</Text>
          <View style={[styles.toggle, programando && styles.toggleActivo]}>
            <View style={[styles.toggleBolita, programando && styles.toggleBolitaActiva]} />
          </View>
        </TouchableOpacity>

        {programando && (
          <TouchableOpacity style={styles.selectorFecha} onPress={() => setMostrarPicker(true)}>
            <Text style={styles.selectorFechaTexto}>
              📅 {fechaProgramada.toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </TouchableOpacity>
        )}

        {mostrarPicker && (
          <DateTimePicker
            value={fechaProgramada}
            mode="datetime"
            minimumDate={new Date(Date.now() + 15 * 60 * 1000)}
            onChange={(evento, fecha) => {
              setMostrarPicker(false);
              if (fecha) setFechaProgramada(fecha);
            }}
          />
        )}

        <Button
          titulo={programando ? 'Programar viaje' : 'Pedir viaje ahora'}
          onPress={pedirViaje}
          cargando={pidiendo}
          deshabilitado={buscandoConductor || !destino}
          style={{ marginTop: 18 }}
        />
      </View>

      <Modal visible={buscandoConductor} transparent animationType="fade">
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <RadarBuscando />
            <Text style={styles.modalTitulo}>Buscando conductor...</Text>
            <Text style={styles.modalSubtitulo}>Esto puede tardar unos segundos</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  mapa: { flex: 1 },
  cargandoContenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  cargandoTexto: { marginTop: 12, color: COLORS.textMuted },
  panel: {
    backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8
  },
  campoBusqueda: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.background,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, borderWidth: 1, borderColor: COLORS.border
  },
  puntoIndicador: { width: 10, height: 10, borderRadius: 5 },
  campoBusquedaTexto: { flex: 1, fontSize: 14.5, color: COLORS.text, fontWeight: '500' },
  campoBusquedaPlaceholder: { color: COLORS.textMuted },
  lineaConectora: { width: 1, height: 10, backgroundColor: COLORS.border, marginLeft: 19, marginVertical: 2 },
  filaChips: { marginTop: 14 },
  chipVehiculo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8
  },
  chipVehiculoActivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipVehiculoEmoji: { fontSize: 16 },
  chipVehiculoTexto: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  chipVehiculoTextoActivo: { color: '#fff' },
  chipZona: {
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8
  },
  chipZonaActiva: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  chipZonaTexto: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  chipZonaTextoActiva: { color: '#fff' },
  filaProgramar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  etiquetaSeccion: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginTop: 16, marginBottom: 8, letterSpacing: 0.3 },
  filaMetodoPago: { flexDirection: 'row', gap: 8 },
  chipMetodo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9
  },
  chipMetodoActivo: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipMetodoTexto: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  chipMetodoTextoActivo: { color: '#fff' },
  filaProgramarTexto: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: COLORS.border, padding: 3 },
  toggleActivo: { backgroundColor: COLORS.primary },
  toggleBolita: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleBolitaActiva: { transform: [{ translateX: 18 }] },
  selectorFecha: { marginTop: 10, backgroundColor: COLORS.background, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  selectorFechaTexto: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modalContenido: { backgroundColor: '#fff', borderRadius: 24, padding: 36, alignItems: 'center', width: '80%' },
  modalTitulo: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 20 },
  modalSubtitulo: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 }
});
