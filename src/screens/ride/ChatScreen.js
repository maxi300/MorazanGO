import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../../config/api';
import { obtenerSocket } from '../../config/socket';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { COLORS } from '../../config/constants';

export default function ChatScreen({ route }) {
  const { viajeId } = route.params;
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const listaRef = useRef(null);

  const cargarHistorial = useCallback(async () => {
    try {
      const respuesta = await api.get(`/viajes/${viajeId}/mensajes`);
      setMensajes(respuesta.data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargandoHistorial(false);
    }
  }, [viajeId]);

  useEffect(() => {
    cargarHistorial();

    const socket = obtenerSocket();
    if (!socket) return;

    const alRecibirMensaje = (mensaje) => {
      if (mensaje.viaje_id === viajeId) {
        setMensajes((actual) => [...actual, mensaje]);
      }
    };

    socket.on('mensaje_chat', alRecibirMensaje);
    return () => socket.off('mensaje_chat', alRecibirMensaje);
  }, [viajeId]);

  const enviarMensaje = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    const textoEnviado = texto.trim();
    setTexto('');
    try {
      const respuesta = await api.post(`/viajes/${viajeId}/mensajes`, { mensaje: textoEnviado });
      setMensajes((actual) => [...actual, respuesta.data.data]);
      setTimeout(() => listaRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      showToast(error.message, 'error');
      setTexto(textoEnviado);
    } finally {
      setEnviando(false);
    }
  };

  const renderizarMensaje = ({ item }) => {
    const esMio = item.remitente_id === usuario.id;
    return (
      <View style={[styles.burbuja, esMio ? styles.burbujaPropia : styles.burbujaAjena]}>
        <Text style={esMio ? styles.textoPropio : styles.textoAjeno}>{item.mensaje}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listaRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderizarMensaje}
        contentContainerStyle={styles.lista}
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          !cargandoHistorial && (
            <View style={styles.vacioContenedor}>
              <Text style={styles.vacioEmoji}>💬</Text>
              <Text style={styles.vacioTexto}>Aún no hay mensajes. ¡Escribe el primero!</Text>
            </View>
          )
        }
      />
      <View style={styles.barraEnvio}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={COLORS.textMuted}
          value={texto}
          onChangeText={setTexto}
          multiline
        />
        <TouchableOpacity style={styles.botonEnviar} onPress={enviarMensaje} disabled={enviando}>
          <Text style={styles.botonEnviarTexto}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  lista: { padding: 16, gap: 8, flexGrow: 1 },
  vacioContenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  vacioEmoji: { fontSize: 36, marginBottom: 8 },
  vacioTexto: { color: COLORS.textMuted, fontSize: 13 },
  burbuja: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 4 },
  burbujaPropia: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  burbujaAjena: { backgroundColor: COLORS.surface, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  textoPropio: { color: '#fff', fontSize: 14 },
  textoAjeno: { color: COLORS.text, fontSize: 14 },
  barraEnvio: {
    flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border
  },
  input: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, maxHeight: 100, fontSize: 14, color: COLORS.text
  },
  botonEnviar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center'
  },
  botonEnviarTexto: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
