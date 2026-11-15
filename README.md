# MorazánGo | Aplicación para pasajeros

Aplicación móvil para que los pasajeros de MorazánGo puedan registrarse, solicitar y programar viajes, seguir su estado en tiempo real y comunicarse con el conductor. El cliente está construido con React Native y Expo; consume una API y un servicio Socket.IO que se ejecutan por separado.

> **Alcance del repositorio:** contiene la aplicación móvil de pasajeros. El backend, la aplicación del conductor y los servicios de infraestructura se mantienen en proyectos separados.

## Funcionalidades

| Área | Funcionalidad |
| --- | --- |
| Cuenta | Registro e inicio de sesión con teléfono y contraseña |
| Ubicación | Solicitud de permiso, ubicación actual y selección de origen |
| Búsqueda | Autocompletado de lugares de El Salvador con Google Places y destinos recientes |
| Solicitud de viaje | Selección de origen, destino, zona, tipo de vehículo y método de pago |
| Programación | Solicitud de viajes para una fecha posterior |
| Seguimiento | Estado del viaje y ubicación del conductor mediante Socket.IO |
| Comunicación | Historial de mensajes y chat asociado al viaje |
| Historial | Consulta de viajes anteriores y programados; cancelación de viajes programados |
| Calificación | Envío de estrellas y comentario al finalizar un viaje |
| Pagos | Efectivo y administración de tarjetas mediante Stripe |

Las zonas y tipos de vehículo disponibles se encuentran definidos en la configuración de la aplicación.

## Tecnologías

- **React Native 0.88** y **Expo SDK 58**
- **React Navigation 7** para navegación por pestañas y flujos de pantallas
- **Axios** para consumir la API REST
- **Socket.IO Client** para actualizaciones en tiempo real
- **Expo SecureStore** para persistir la sesión del usuario
- **Expo Location** y **React Native Maps** para ubicación y mapas
- **Google Places** para autocompletado de direcciones
- **Stripe React Native SDK** para agregar y administrar tarjetas

## Arquitectura de la aplicación

```text
App.js
├── Proveedores de sesión, viajes, notificaciones y pagos
└── AppNavigator
    ├── Autenticación: inicio de sesión y registro
    └── Aplicación autenticada
        ├── Inicio: mapa y solicitud de viaje
        ├── Historial: viajes realizados y programados
        ├── Perfil: datos del usuario y métodos de pago
        └── Flujo del viaje: búsqueda, seguimiento, chat y calificación

src/config/
├── api.js       Cliente Axios y token Bearer
├── constants.js URLs, claves públicas y opciones de viaje
└── socket.js    Conexión autenticada de Socket.IO

src/context/
├── AuthContext.js  Sesión y autenticación
├── RideContext.js  Estado y eventos del viaje activo
└── ToastContext.js Notificaciones dentro de la aplicación
```

La sesión se restaura desde SecureStore al iniciar la app. El cliente Axios agrega el token como `Authorization: Bearer ...`; Socket.IO se conecta con el mismo token. El contexto del viaje escucha eventos del backend como `conductor_asignado`, `viaje_actualizado`, `ubicacion_conductor` y `mensaje_chat`.

## Requisitos

- Node.js y npm
- Expo Go compatible con Expo SDK 58 para ejecutar las funciones compatibles
- Un backend MorazánGo activo y accesible por la red
- Para las funciones de mapas y búsqueda: claves de Google configuradas
- Para pagos con tarjeta: un development build y configuración de Stripe en el backend

## Instalación y ejecución

Desde la carpeta del proyecto:

```bash
npm install
npx expo start
```

Abre el QR con Expo Go o con un development build compatible. También están disponibles los scripts:

```bash
npm run android
npm run ios
npm run web
```

`npm run ios` requiere un entorno de desarrollo iOS compatible. Para probar en un teléfono físico, el teléfono y la computadora deben poder comunicarse por la misma red.

## Configuración de servicios

### Backend REST y Socket.IO

Edita `src/config/constants.js` y configura las direcciones del backend:

```js
export const API_URL = 'http://<IP-DE-LA-COMPUTADORA>:3000/api';
export const SOCKET_URL = 'http://<IP-DE-LA-COMPUTADORA>:3000';
```

Reemplaza el ejemplo por la dirección y el puerto reales del backend. En un teléfono físico, `localhost` apunta al teléfono, no a la computadora. Si la IP local cambia, actualiza ambos valores. El backend debe permitir conexiones desde el dispositivo y ofrecer las rutas REST y eventos Socket.IO que consume esta app.

### Google Maps y Places

- En `app.json`, configura `android.config.googleMaps.apiKey` con una clave habilitada para **Maps SDK for Android**.
- En `src/config/constants.js`, configura `GOOGLE_PLACES_API_KEY` con una clave habilitada para **Places API**.
- Restringe las claves de Google a las APIs y aplicaciones necesarias. La búsqueda de lugares está configurada para El Salvador.

### Stripe

Configura `STRIPE_PUBLISHABLE_KEY` en `src/config/constants.js` con una clave publicable (`pk_test_...` o `pk_live_...`). Las operaciones de servidor requieren que el backend configure Stripe por separado.

`@stripe/stripe-react-native` contiene código nativo; por eso, la pantalla de métodos de pago requiere un **development build** y no funciona en Expo Go genérico. El pago en efectivo no depende de Stripe.

## Rutas REST consumidas

La URL base de Axios termina en `/api`. Entre las rutas utilizadas por la aplicación están:

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/auth/registro` | Crear cuenta de pasajero |
| `POST` | `/auth/login` | Iniciar sesión |
| `POST` | `/viajes` | Crear o programar un viaje |
| `GET` | `/viajes/:id` | Consultar un viaje |
| `GET` | `/viajes/mis-viajes` | Consultar historial |
| `GET` | `/viajes/programados` | Consultar viajes programados |
| `PUT` | `/viajes/:id/cancelar` | Cancelar un viaje |
| `GET`, `POST` | `/viajes/:id/mensajes` | Consultar y enviar mensajes |
| `POST` | `/viajes/:id/calificar` | Calificar un viaje |
| `GET`, `POST` | `/pagos/tarjetas` | Consultar y agregar tarjetas |
| `DELETE` | `/pagos/tarjetas/:id` | Eliminar una tarjeta |

Estas rutas describen el contrato esperado por el cliente; el servicio que las implementa no está incluido en este repositorio.

## Estructura del proyecto

```text
assets/                  Iconos y recursos de la aplicación
src/
  components/            Componentes reutilizables
  config/                API, Socket.IO, constantes y claves de cliente
  context/               Estado de autenticación, viajes y notificaciones
  navigation/            Navegación autenticada y no autenticada
  screens/
    auth/                Inicio de sesión y registro
    home/                Mapa, selección de lugares y solicitud de viaje
    profile/             Perfil y métodos de pago
    ride/                Seguimiento, chat, calificación e historial
  utils/                 Utilidades para lugares recientes
App.js                   Composición de proveedores y navegación
app.json                 Configuración Expo y plataformas nativas
package.json             Dependencias y comandos
```

## Seguridad y configuración sensible

- No guardes contraseñas, tokens privados ni claves secretas en el repositorio.
- La clave secreta de Stripe (`sk_...`) debe permanecer únicamente en el backend.
- Las claves cliente de Google y la clave publicable de Stripe se incluyen en la app; restringe sus permisos y uso en sus respectivas consolas.
- El token de sesión se almacena con Expo SecureStore y se envía al backend por HTTPS en ambientes desplegados.
- Para producción, configura HTTPS/WSS y URLs de backend seguras; las direcciones HTTP locales de desarrollo no deben reutilizarse en producción.

## Estado del proyecto

Aplicación móvil cliente en desarrollo. Su funcionamiento integral depende de que estén disponibles y configurados el backend, los servicios de mapas y, para pagos con tarjeta, Stripe.
