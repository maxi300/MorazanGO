import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../config/constants';

export default function LoadingScreen({ mensaje }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.logo}>🚗</Text>
      <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 12 }} />
      {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  logo: { fontSize: 44 },
  mensaje: { marginTop: 14, color: COLORS.textMuted, fontSize: 13 }
});
