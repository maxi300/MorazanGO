import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';

// variante: 'primary' | 'secondary' | 'danger' | 'ghost'
export default function Button({ titulo, onPress, cargando, deshabilitado, variante = 'primary', style }) {
  const inactivo = cargando || deshabilitado;

  return (
    <TouchableOpacity
      style={[styles.base, estilosVariante[variante], inactivo && styles.inactivo, style]}
      onPress={onPress}
      disabled={inactivo}
      activeOpacity={0.8}
    >
      {cargando ? (
        <ActivityIndicator color={variante === 'ghost' ? COLORS.primary : '#fff'} />
      ) : (
        <Text style={[styles.texto, textoVariante[variante]]}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8
  },
  texto: { fontSize: 15.5, fontWeight: '700' },
  inactivo: { opacity: 0.55 }
});

const estilosVariante = StyleSheet.create({
  primary: { backgroundColor: COLORS.primary },
  secondary: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  danger: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  ghost: { backgroundColor: 'transparent' }
});

const textoVariante = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: COLORS.text },
  danger: { color: COLORS.danger },
  ghost: { color: COLORS.primary }
});
