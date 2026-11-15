# MorazánGo — App Pasajero

## Antes de correrla

1. **Instala la app "Expo Go"** en tu celular (Google Play / App Store) — es gratis.
2. Tu celular y tu computadora deben estar en la **misma red WiFi**.
3. Abre `src/config/constants.js` y cambia `API_URL` y `SOCKET_URL` por la IP de tu computadora en esa red (NO "localhost" — desde el celular, localhost es el propio celular). Cómo encontrarla:
   - Windows: `ipconfig` en cmd, busca "Dirección IPv4"
   - Mac: `ipconfig getifaddr en0`
4. Asegúrate de que tu backend (`morazango-backend-zip`) esté corriendo con `npm start`.

## ⚠️ Pago con tarjeta — necesita un "development build", no funciona en Expo Go normal

Todo lo demás de la app corre en la app "Expo Go" que bajas de la tienda. **La pantalla de tarjetas es la excepción** — el SDK de Stripe tiene código nativo, así que Expo Go (la app genérica) no lo soporta. El resto de la app (mapa, viajes, chat, etc.) sigue funcionando en Expo Go sin problema; solo "Métodos de pago" fallará ahí.

Para probar el pago con tarjeta, necesitas generar tu propia versión de Expo Go personalizada ("development build"), una sola vez:

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

(o `--platform ios` para iPhone — para iOS necesitas cuenta de Apple Developer, para Android no). Esto genera un `.apk`/`.ipa` que instalas en tu celular UNA vez, y a partir de ahí `npx expo start` funciona igual que siempre pero abriendo esa app en vez de Expo Go.

**Mientras tanto**, puedes seguir probando todo lo demás en Expo Go normal — pagar en efectivo funciona siempre, sin necesitar nada de esto.

## Google Places — para el buscador de destino (tipo Uber)

La app ahora tiene un buscador de direcciones con autocompletado real (calles, negocios, parques de El Salvador) y lugares recientes, igual que Uber. Esto necesita **otra key de Google, distinta a la del backend**:

1. En el mismo proyecto de Google Cloud, habilita **"Places API"** (además de "Maps SDK for Android" que ya configuraste)
2. Crea una API key nueva (o reutiliza una, pero mejor separada) restringida por "Nombre del paquete Android" (`com.morazango.pasajero`) y, para iOS, por "ID de paquete" — nunca sin restricción, porque esta key sí viaja dentro de la app y cualquiera podría verla
3. Pégala en `src/config/constants.js` → `GOOGLE_PLACES_API_KEY`

Sin esta key, el buscador de destino no va a devolver resultados (pero el resto de la app sigue funcionando).

## ⚠️ Google Maps en Android — obligatorio, sin esto el mapa sale en blanco

A diferencia de iOS (que usa Apple Maps automáticamente, sin configurar nada), **Android necesita sí o sí una API key de Google Maps** para mostrar el mapa, incluso solo para probar en Expo Go. Sin esto, vas a ver un cuadriculado gris en vez del mapa.

1. Ve a [console.cloud.google.com](https://console.cloud.google.com) (puedes usar el mismo proyecto que ya creaste para el backend)
2. Busca y habilita **"Maps SDK for Android"**
3. Ve a "Credenciales" → crea una API key (o reutiliza la del backend, pero mejor crear una nueva restringida solo a esta API)
4. Abre `app.json` y pega la key en `android.config.googleMaps.apiKey`

En iPhone no necesitas hacer nada de esto — funciona directo.

## Instalar y correr

```bash
npm install
npx expo start
```

Te va a salir un código QR en la terminal. Escanéalo con la cámara de tu celular (iOS) o con la app Expo Go (Android), y la app se abre sola.

## Google Maps (opcional para probar, necesario para producción)

El mapa funciona sin configurar nada extra mientras pruebas con Expo Go (usa Apple Maps en iOS, y en Android puede pedir una key de Google Maps para funcionar completo). Para producción, edita `app.json`:
- `android.config.googleMaps.apiKey` — necesita la **"Maps SDK for Android"** habilitada en Google Cloud (distinta a la key del backend, que usa la Directions API)

## Estructura del proyecto

```
src/
  config/       → constants.js (URLs), api.js (axios), socket.js (Socket.io)
  context/      → AuthContext (sesión), RideContext (viaje activo), ToastContext (notificaciones)
  components/   → Button, LoadingScreen, ToastHost, RadarBuscando — piezas reutilizables
  navigation/   → AppNavigator (pestañas abajo + pilas de viaje encima)
  screens/
    auth/       → Login, Registro
    home/       → Mapa + pedir viaje
    ride/       → Seguimiento en vivo, Chat, Calificar, Historial
    profile/    → Perfil del usuario
```

## Sobre la experiencia de usuario

- **Notificaciones**: los errores y avisos usan un banner tipo "toast" que aparece arriba y se esconde solo — no interrumpen como una alerta nativa. Solo quedan 2 diálogos bloqueantes de verdad (cancelar viaje, cerrar sesión), porque son decisiones que sí ameritan detener al usuario.
- **Navegación**: 3 pestañas fijas abajo (Inicio, Historial, Perfil) — el flujo de un viaje activo (seguimiento, chat, calificar) se abre encima como una capa, y regresa a donde estabas al cerrarla.
- **Áreas seguras**: los botones flotantes del mapa respetan el notch/Dynamic Island del iPhone automáticamente.

## Publicar en las tiendas (cuando esté lista)

Con Expo, no necesitas Android Studio ni Xcode para generar el build final:

```bash
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

Esto requiere cuenta de Expo (gratis) y, para publicar de verdad, cuenta de Google Play ($25 pago único) y/o Apple Developer ($99/año).
