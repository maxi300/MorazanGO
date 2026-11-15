import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';

const OPCIONES = [
  { icono: 'time-outline', texto: 'Historial de viajes', ruta: 'Historial' },
  { icono: 'card-outline', texto: 'Métodos de pago', ruta: 'MetodosPago' },
  { icono: 'notifications-outline', texto: 'Notificaciones', ruta: null },
  { icono: 'help-circle-outline', texto: 'Ayuda y soporte', ruta: null }
];

export default function ProfileScreen({ navigation }) {
  const { usuario, logout } = useAuth();

  const manejarLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{usuario?.nombre?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.nombre}>{usuario?.nombre}</Text>
        <Text style={styles.telefono}>{usuario?.telefono}</Text>
        <View style={styles.chipCalificacion}>
          <Ionicons name="star" size={14} color={COLORS.secondary} />
          <Text style={styles.calificacionTexto}>{usuario?.calificacion || '5.0'}</Text>
        </View>
      </View>

      <View style={styles.tarjetaOpciones}>
        {OPCIONES.map((opcion, i) => (
          <TouchableOpacity
            key={opcion.texto}
            style={[styles.opcion, i < OPCIONES.length - 1 && styles.opcionBorde]}
            onPress={() => opcion.ruta && navigation.navigate(opcion.ruta)}
            activeOpacity={0.6}
          >
            <View style={styles.opcionIzquierda}>
              <Ionicons name={opcion.icono} size={20} color={COLORS.text} />
              <Text style={styles.opcionTexto}>{opcion.texto}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.opcionSalir} onPress={manejarLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
        <Text style={styles.opcionSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  contenido: { paddingBottom: 40 },
  encabezado: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  avatarTexto: { color: '#fff', fontSize: 32, fontWeight: '800' },
  nombre: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  telefono: { fontSize: 13, color: COLORS.textMuted, marginTop: 3 },
  chipCalificacion: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3E2',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 10
  },
  calificacionTexto: { fontSize: 12.5, fontWeight: '700', color: COLORS.secondary },
  tarjetaOpciones: {
    marginHorizontal: 20, backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden'
  },
  opcion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  opcionBorde: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  opcionIzquierda: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opcionTexto: { fontSize: 14.5, color: COLORS.text, fontWeight: '600' },
  opcionSalir: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 24, paddingVertical: 15, borderRadius: 14, backgroundColor: '#FEF2F2'
  },
  opcionSalirTexto: { fontSize: 14.5, color: COLORS.danger, fontWeight: '700' }
});
