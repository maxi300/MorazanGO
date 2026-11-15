import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { obtenerLugaresRecientes, agregarLugarReciente } from '../../utils/recentPlaces';
import { useToast } from '../../context/ToastContext';
import { COLORS, GOOGLE_PLACES_API_KEY } from '../../config/constants';

export default function PlaceSearchScreen({ route, navigation }) {
  const { titulo, onSeleccionar, permitirUbicacionActual } = route.params;
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [recientes, setRecientes] = useState([]);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  useEffect(() => {
    obtenerLugaresRecientes().then(setRecientes);
  }, []);

  const confirmarLugar = useCallback(async (lugar) => {
    await agregarLugarReciente(lugar);
    onSeleccionar(lugar);
    navigation.goBack();
  }, [onSeleccionar, navigation]);

  const usarUbicacionActual = async () => {
    setCargandoUbicacion(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Necesitas darle permiso de ubicación a la app.', 'error');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = posicion.coords;
      const resultados = await Location.reverseGeocodeAsync({ latitude, longitude });
      const direccion = resultados[0]
        ? [resultados[0].street, resultados[0].city || resultados[0].subregion].filter(Boolean).join(', ')
        : 'Mi ubicación actual';
      confirmarLugar({ lat: latitude, lng: longitude, direccion });
    } catch {
      showToast('No se pudo obtener tu ubicación.', 'error');
    } finally {
      setCargandoUbicacion(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={[styles.encabezado, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.tituloEncabezado}>{titulo}</Text>
      </View>

      <GooglePlacesAutocomplete
        placeholder="Busca una calle, negocio o lugar..."
        fetchDetails
        onPress={(data, details) => {
          if (!details) return;
          confirmarLugar({
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            direccion: data.description
          });
        }}
        onFail={(error) => console.log('Places error:', error)}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'es',
          components: 'country:sv' // Restringido a El Salvador
        }}
        styles={{
          container: styles.autocompleteContenedor,
          textInputContainer: styles.autocompleteInputContenedor,
          textInput: styles.autocompleteInput,
          listView: styles.autocompleteLista,
          row: styles.autocompleteFila,
          separator: styles.autocompleteSeparador
        }}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={2}
        textInputProps={{ placeholderTextColor: COLORS.textMuted, autoFocus: true }}
      />

      {permitirUbicacionActual && (
        <TouchableOpacity style={styles.filaUbicacionActual} onPress={usarUbicacionActual} disabled={cargandoUbicacion}>
          <View style={styles.iconoUbicacion}>
            {cargandoUbicacion ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="navigate" size={18} color={COLORS.primary} />}
          </View>
          <Text style={styles.filaUbicacionTexto}>Usar mi ubicación actual</Text>
        </TouchableOpacity>
      )}

      {recientes.length > 0 && (
        <>
          <Text style={styles.seccionTitulo}>Recientes</Text>
          <FlatList
            data={recientes}
            keyExtractor={(item, i) => `${item.direccion}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.filaReciente} onPress={() => confirmarLugar(item)}>
                <View style={styles.iconoReciente}>
                  <Ionicons name="time-outline" size={18} color={COLORS.textMuted} />
                </View>
                <Text style={styles.filaRecienteTexto} numberOfLines={1}>{item.direccion}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.surface },
  encabezado: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  botonAtras: { padding: 4 },
  tituloEncabezado: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  autocompleteContenedor: { flex: 0, paddingHorizontal: 16 },
  autocompleteInputContenedor: {
    backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, height: 48
  },
  autocompleteInput: { fontSize: 15, color: COLORS.text, backgroundColor: 'transparent' },
  autocompleteLista: { borderRadius: 12, marginTop: 4 },
  autocompleteFila: { paddingVertical: 12, paddingHorizontal: 12 },
  autocompleteSeparador: { height: 1, backgroundColor: COLORS.border },
  filaUbicacionActual: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: 8
  },
  iconoUbicacion: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EAF7EF', justifyContent: 'center', alignItems: 'center' },
  filaUbicacionTexto: { fontSize: 14.5, fontWeight: '600', color: COLORS.primary },
  seccionTitulo: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', paddingHorizontal: 16, marginTop: 16, marginBottom: 4, letterSpacing: 0.5 },
  filaReciente: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  iconoReciente: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  filaRecienteTexto: { fontSize: 14.5, color: COLORS.text, flex: 1 }
});
