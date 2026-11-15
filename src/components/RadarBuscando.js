import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';
import { COLORS } from '../config/constants';

export default function RadarBuscando() {
  const anillo1 = useRef(new Animated.Value(0)).current;
  const anillo2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animar = (valor, retraso) => {
      valor.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.delay(retraso),
          Animated.timing(valor, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    };
    animar(anillo1, 0);
    animar(anillo2, 900);
  }, []);

  const estiloAnillo = (valor) => ({
    opacity: valor.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0.15, 0] }),
    transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }]
  });

  return (
    <View style={styles.contenedor}>
      <Animated.View style={[styles.anillo, estiloAnillo(anillo1)]} />
      <Animated.View style={[styles.anillo, estiloAnillo(anillo2)]} />
      <View style={styles.centro}>
        <Animated.Text style={styles.emoji}>🚗</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  anillo: {
    position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primary
  },
  centro: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 5
  },
  emoji: { fontSize: 26 }
});
