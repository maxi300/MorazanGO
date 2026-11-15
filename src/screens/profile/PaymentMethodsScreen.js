import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../config/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import { COLORS } from '../../config/constants';

const ICONO_MARCA = {
  visa: 'card', mastercard: 'card', amex: 'card'
};

export default function PaymentMethodsScreen() {
  const { createPaymentMethod } = useStripe();
  const { showToast } = useToast();
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [datosTarjeta, setDatosTarjeta] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargarTarjetas = useCallback(async () => {
    try {
      const respuesta = await api.get('/pagos/tarjetas');
      setTarjetas(respuesta.data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarTarjetas(); }, [cargarTarjetas]);

  const agregarTarjeta = async () => {
    if (!datosTarjeta?.complete) {
      showToast('Completa todos los datos de la tarjeta.', 'error');
      return;
    }
    setGuardando(true);
    try {
      const { paymentMethod, error } = await createPaymentMethod({ paymentMethodType: 'Card' });
      if (error) throw new Error(error.message);

      await api.post('/pagos/tarjetas', { payment_method_id: paymentMethod.id });
      showToast('Tarjeta agregada con éxito 💳', 'success');
      setModalVisible(false);
      setDatosTarjeta(null);
      cargarTarjetas();
    } catch (error) {
      showToast(error.message || 'No se pudo agregar la tarjeta.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarTarjeta = async (id) => {
    try {
      await api.delete(`/pagos/tarjetas/${id}`);
      setTarjetas((actual) => actual.filter((t) => t.id !== id));
      showToast('Tarjeta eliminada.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (cargando) {
    return (
      <View style={styles.cargandoContenedor}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.filaEfectivo}>
        <Ionicons name="cash-outline" size={22} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.efectivoTitulo}>Efectivo</Text>
          <Text style={styles.efectivoSubtitulo}>Siempre disponible, sin configurar nada</Text>
        </View>
      </View>

      <Text style={styles.seccionTitulo}>TARJETAS GUARDADAS</Text>

      <FlatList
        data={tarjetas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>No tienes tarjetas guardadas todavía.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.tarjetaFila}>
            <Ionicons name={ICONO_MARCA[item.tipo] || 'card-outline'} size={22} color={COLORS.text} />
            <View style={{ flex: 1 }}>
              <Text style={styles.tarjetaNumero}>{item.tipo?.toUpperCase()} •••• {item.ultimos_4}</Text>
              <Text style={styles.tarjetaVence}>Vence {String(item.vence_mes).padStart(2, '0')}/{item.vence_anio}</Text>
            </View>
            {item.es_principal && (
              <View style={styles.badgePrincipal}><Text style={styles.badgePrincipalTexto}>Principal</Text></View>
            )}
            <TouchableOpacity onPress={() => eliminarTarjeta(item.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.pieBoton}>
        <Button titulo="+ Agregar tarjeta" variante="secondary" onPress={() => setModalVisible(true)} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Agregar tarjeta</Text>
            <Text style={styles.modalSubtitulo}>Tus datos van directo a Stripe — nunca pasan por nuestros servidores.</Text>

            <CardField
              postalCodeEnabled={false}
              placeholders={{ number: '4242 4242 4242 4242' }}
              cardStyle={{ backgroundColor: COLORS.background, textColor: COLORS.text, borderRadius: 12 }}
              style={styles.cardField}
              onCardChange={setDatosTarjeta}
            />

            <Button titulo="Guardar tarjeta" onPress={agregarTarjeta} cargando={guardando} style={{ marginTop: 16 }} />
            <TouchableOpacity onPress={() => { setModalVisible(false); setDatosTarjeta(null); }} style={{ marginTop: 14 }}>
              <Text style={styles.modalCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORS.background },
  cargandoContenedor: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filaEfectivo: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.surface,
    marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border
  },
  efectivoTitulo: { fontSize: 14.5, fontWeight: '700', color: COLORS.text },
  efectivoSubtitulo: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  seccionTitulo: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginHorizontal: 20, marginTop: 24, marginBottom: 10, letterSpacing: 0.5 },
  vacio: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 },
  tarjetaFila: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface,
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border
  },
  tarjetaNumero: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  tarjetaVence: { fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 },
  badgePrincipal: { backgroundColor: '#EAF7EF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgePrincipalTexto: { fontSize: 10.5, fontWeight: '700', color: COLORS.primary },
  pieBoton: { paddingHorizontal: 20, paddingVertical: 16 },
  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContenido: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalSubtitulo: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 6, marginBottom: 18 },
  cardField: { width: '100%', height: 50 },
  modalCancelar: { textAlign: 'center', color: COLORS.textMuted, fontSize: 13.5, fontWeight: '600' }
});
