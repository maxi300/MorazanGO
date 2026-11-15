import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import { COLORS } from '../../config/constants';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async () => {
    if (!telefono.trim() || !password) {
      showToast('Ingresa tu teléfono y contraseña.', 'error');
      return;
    }
    setCargando(true);
    try {
      await login(telefono.trim(), password);
      // La navegación cambia sola — AppNavigator reacciona al estado de "usuario"
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.contenido}>
        <Text style={styles.logoEmoji}>🚗</Text>
        <Text style={styles.logo}>MorazánGo</Text>
        <Text style={styles.subtitulo}>Tu viaje, a un toque de distancia</Text>

        <View style={styles.form}>
          <Text style={styles.etiqueta}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="+503 7800 1111"
            placeholderTextColor={COLORS.textMuted}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={manejarLogin}
          />

          <Button titulo="Iniciar sesión" onPress={manejarLogin} cargando={cargando} style={{ marginTop: 28 }} />

          <TouchableOpacity onPress={() => navigation.navigate('Registro')} style={{ marginTop: 20 }}>
            <Text style={styles.enlace}>
              ¿No tienes cuenta? <Text style={styles.enlaceResaltado}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  contenido: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoEmoji: { fontSize: 48, textAlign: 'center' },
  logo: { fontSize: 30, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginTop: 4 },
  subtitulo: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, marginBottom: 44 },
  form: { gap: 4 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.text
  },
  enlace: { textAlign: 'center', color: COLORS.textMuted, fontSize: 14 },
  enlaceResaltado: { color: COLORS.primary, fontWeight: '700' }
});
