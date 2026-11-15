// =============================================
// IMPORTANTE — lee esto antes de correr la app:
//
// Si estás probando en tu celular real con Expo Go,
// "localhost" apunta al PROPIO CELULAR, no a tu compu.
// Tienes que poner la IP de tu computadora en tu red
// WiFi local (ej: 192.168.1.55), NO "localhost".
//
// Cómo encontrar tu IP:
//   Windows: abre cmd y corre "ipconfig", busca "Dirección IPv4"
//   Mac/Linux: corre "ifconfig" o "ipconfig getifaddr en0"
//
// Tu celular y tu computadora deben estar en la MISMA red WiFi.
// =============================================

export const API_URL = 'http://172.20.10.3:3000/api';
export const SOCKET_URL = 'http://172.20.10.3:3000';

// Key de Google Places PARA LA APP (client-side) — DISTINTA a la del backend.
// Esta se restringe por "Nombre del paquete Android" / "ID de paquete iOS",
// nunca por IP (porque sale desde miles de celulares distintos).
// Necesita "Places API" habilitada en Google Cloud (además de Directions API del backend).
export const GOOGLE_PLACES_API_KEY = 'TU_GOOGLE_PLACES_API_KEY_AQUI';

// Key PÚBLICA de Stripe (empieza con pk_test_... o pk_live_...) — es seguro
// que esta viaje dentro de la app, es la contraparte de la STRIPE_SECRET_KEY
// del backend (esa sí nunca debe salir del servidor).
export const STRIPE_PUBLISHABLE_KEY = 'TU_STRIPE_PUBLISHABLE_KEY_AQUI';

// Colores de marca — cámbialos cuando definan la identidad visual final
export const COLORS = {
  primary: '#0A7C42',      // Verde — inspirado en el paisaje de Morazán/San Miguel
  secondary: '#F2A900',    // Amarillo/dorado — cálido, tipo "moto/mototaxi"
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#D97706'
};

export const ZONAS = [
  { label: 'Morazán', value: 'morazan' },
  { label: 'San Miguel', value: 'san_miguel' }
];

export const TIPOS_VEHICULO = [
  { label: 'Moto', value: 'moto', icono: '🏍️' },
  { label: 'Carro', value: 'carro', icono: '🚗' },
  { label: 'Mototaxi', value: 'mototaxi', icono: '🛺' }
];
