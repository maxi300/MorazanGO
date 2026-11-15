import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import { COLORS } from '../../config/constants';

export default function RegisterScreen({ navigation }) {
  const { registrar } = useAuth();
  const { showToast } = useToast();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarRegistro = async () => {
    if (!nombre.trim() || !telefono.trim() || !password) {
      showToast('Nombre, teléfono y contraseña son obligatorios.', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    setCargando(true);
    try {
      await registrar({ nombre: nombre.trim(), telefono: telefono.trim(), email: email.trim() || undefined, password });
      showToast('¡Cuenta creada! Bienvenido a MorazánGo 🎉', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botonAtras}>
          <Text style={styles.botonAtrasTexto}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Regístrate para pedir tu primer viaje</Text>

        <View style={styles.form}>
          <Text style={styles.etiqueta}>Nombre completo</Text>
          <TextInput style={styles.input} placeholder="Juan Pérez" placeholderTextColor={COLORS.textMuted}
            value={nombre} onChangeText={setNombre} />

          <Text style={styles.etiqueta}>Teléfono</Text>
          <TextInput style={styles.input} placeholder="+503 7800 1111" placeholderTextColor={COLORS.textMuted}
            value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

          <Text style={styles.etiqueta}>Email (opcional)</Text>
          <TextInput style={styles.input} placeholder="tu@correo.com" placeholderTextColor={COLORS.textMuted}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor={COLORS.textMuted}
            value={password} onChangeText={setPassword} secureTextEntry />

          <Button titulo="Crear cuenta" onPress={manejarRegistro} cargando={cargando} style={{ marginTop: 28 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  contenido: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  botonAtras: { marginBottom: 24 },
  botonAtrasTexto: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  titulo: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitulo: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, marginBottom: 30 },
  form: { gap: 4 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text
  }
});
