import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../../config/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import { COLORS } from '../../config/constants';

export default function RateRideScreen({ route, navigation }) {
  const { viajeId } = route.params;
  const { showToast } = useToast();
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarCalificacion = async () => {
    setEnviando(true);
    try {
      await api.post(`/viajes/${viajeId}/calificar`, { estrellas, comentario: comentario.trim() || undefined });
      showToast('¡Gracias por tu calificación! ⭐', 'success');
      navigation.navigate('MainTabs');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.titulo}>¿Cómo estuvo tu viaje?</Text>

      <View style={styles.filaEstrellas}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setEstrellas(n)} hitSlop={8}>
            <Text style={[styles.estrella, n <= estrellas && styles.estrellaActiva]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Cuéntanos más (opcional)"
        placeholderTextColor={COLORS.textMuted}
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
      />

      <Button titulo="Enviar calificación" onPress={enviarCalificacion} cargando={enviando} />

      <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={{ marginTop: 16 }}>
        <Text style={styles.omitir}>Omitir por ahora</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background, padding: 24, justifyContent: 'center' },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  titulo: { fontSize: 20, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 24 },
  filaEstrellas: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  estrella: { fontSize: 40, color: COLORS.border },
  estrellaActiva: { color: COLORS.secondary },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, fontSize: 14, color: COLORS.text, textAlignVertical: 'top', minHeight: 90, marginBottom: 20
  },
  omitir: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13 }
});
