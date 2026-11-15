import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../config/constants';

const ESTILOS_TIPO = {
  success: { fondo: '#16A34A', icono: '✓' },
  error: { fondo: '#DC2626', icono: '✕' },
  info: { fondo: COLORS.text, icono: 'ℹ' }
};

const DURACION_MS = 3200;

export default function ToastHost() {
  const { toast, ocultarToast } = useToast();
  const insets = useSafeAreaInsets();
  const traslado = useRef(new Animated.Value(-120)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!toast) return;

    Animated.spring(traslado, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => esconder(), DURACION_MS);

    return () => clearTimeout(timeoutRef.current);
  }, [toast?.id]);

  const esconder = () => {
    Animated.timing(traslado, { toValue: -120, duration: 220, useNativeDriver: true }).start(() => {
      if (toast) ocultarToast(toast.id);
    });
  };

  if (!toast) return null;

  const estilo = ESTILOS_TIPO[toast.tipo] || ESTILOS_TIPO.info;

  return (
    <Animated.View
      style={[
        styles.contenedor,
        { top: insets.top + 8, backgroundColor: estilo.fondo, transform: [{ translateY: traslado }] }
      ]}
    >
      <TouchableOpacity style={styles.toque} activeOpacity={0.9} onPress={esconder}>
        <Text style={styles.icono}>{estilo.icono}</Text>
        <Text style={styles.texto} numberOfLines={2}>{toast.mensaje}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute', left: 16, right: 16, borderRadius: 14, zIndex: 999,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 10
  },
  toque: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  icono: { color: '#fff', fontSize: 15, fontWeight: '800' },
  texto: { color: '#fff', fontSize: 13.5, fontWeight: '600', flex: 1 }
});
