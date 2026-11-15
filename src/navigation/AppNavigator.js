import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config/constants';
import LoadingScreen from '../components/LoadingScreen';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PlaceSearchScreen from '../screens/home/PlaceSearchScreen';
import RideTrackingScreen from '../screens/ride/RideTrackingScreen';
import ChatScreen from '../screens/ride/ChatScreen';
import RateRideScreen from '../screens/ride/RateRideScreen';
import RideHistoryScreen from '../screens/ride/RideHistoryScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ICONOS_TAB = {
  Inicio: 'home',
  Historial: 'time',
  Perfil: 'person'
};

const opcionesHeader = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false
};

function PilaAutenticacion() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registro" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Las 3 secciones principales, con pestañas abajo — así se siente una app
// "terminada" en vez de una pila de pantallas apiladas sin fin.
function Pestañas() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...opcionesHeader,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: { borderTopColor: COLORS.border, height: 58, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={`${ICONOS_TAB[route.name]}${focused ? '' : '-outline'}`} size={size - 2} color={color} />
        )
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Historial" component={RideHistoryScreen} options={{ title: 'Mis viajes' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Mi perfil' }} />
    </Tab.Navigator>
  );
}

// Encima de las pestañas se apilan las pantallas del flujo de un viaje activo —
// se sienten como una capa modal, y al volver regresan justo a donde estaban.
function PilaPrincipal() {
  return (
    <Stack.Navigator screenOptions={opcionesHeader}>
      <Stack.Screen name="MainTabs" component={Pestañas} options={{ headerShown: false }} />
      <Stack.Screen
        name="BuscarLugar"
        component={PlaceSearchScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="SeguimientoViaje"
        component={RideTrackingScreen}
        options={{ title: 'Tu viaje', headerBackVisible: false, gestureEnabled: false }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat con el conductor' }} />
      <Stack.Screen name="MetodosPago" component={PaymentMethodsScreen} options={{ title: 'Métodos de pago' }} />
      <Stack.Screen
        name="Calificar"
        component={RateRideScreen}
        options={{ title: 'Calificar viaje', headerBackVisible: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {usuario ? <PilaPrincipal /> : <PilaAutenticacion />}
    </NavigationContainer>
  );
}
