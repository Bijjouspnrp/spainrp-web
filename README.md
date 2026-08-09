<p align="center">
  <img src="./assets/Veil Logo.png" width="120" height="120" alt="Veil Logo" />
</p>

<h1 align="center">V E I L</h1>

<p align="center">
  <strong>Privacidad absoluta. Sin concesiones.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blueviolet?style=flat-square" />
  <img src="https://img.shields.io/badge/Expo_SDK-56-blue?style=flat-square&logo=expo" />
  <img src="https://img.shields.io/badge/React_Native-0.85-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/E2EE-Curve25519%20%2B%20NaCl-success?style=flat-square&logo=letsencrypt" />
  <img src="https://img.shields.io/badge/License-ISC-yellow?style=flat-square" />
</p>

<p align="center">
  <em>La vigilancia masiva es la norma. Veil es la excepción.</em><br/>
  <em>Sin puertas traseras. Sin servidores que almacenen tus datos. Protegiendo tu derecho a la intimidad.</em>
</p>

---

## 🧬 ¿Qué es Veil?

**Veil** es un mensajero cifrado de extremo a extremo (E2EE) construido con React Native / Expo. Está diseñado para personas que valoran su privacidad al máximo y desean comunicarse sin que nadie — ni siquiera el servidor — pueda leer, almacenar o rastrear sus conversaciones.

### Filosofía de diseño

| Principio | Implementación |
|---|---|
| **Zero-Knowledge Server** | El Relé Ciego solo reenvía blobs cifrados. No almacena claves, textos ni metadatos |
| **E2EE Real** | Cifrado `nacl.box` (Curve25519 + XSalsa20 + Poly1305) en cada mensaje |
| **Identidad Local** | Las claves privadas nunca salen del dispositivo. Se almacenan en el Keychain nativo |
| **Efímero por Diseño** | Mensajes autodestructibles con temporizador configurable |
| **Sin Registros** | No necesitas email, teléfono ni ningún dato personal |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          VEIL ARCHITECTURE                             │
│                                                                        │
│  ┌─────────────┐         ┌──────────────┐         ┌─────────────┐     │
│  │  DEVICE A   │  WSS    │  BLIND RELAY │  WSS    │  DEVICE B   │     │
│  │             │ ──────► │              │ ──────► │             │     │
│  │  🔐 E2EE    │ cipher  │  🚫 NO LOGS  │ cipher  │  🔐 E2EE    │     │
│  │  Encrypt()  │ text    │  RAM-Only    │ text    │  Decrypt()  │     │
│  │             │ ◄────── │  Forward()   │ ◄────── │             │     │
│  └─────────────┘         └──────────────┘         └─────────────┘     │
│                                                                        │
│  ╔══════════════════════════════════════════════════════════════╗      │
│  ║  El Relé Ciego NUNCA ve el contenido de los mensajes.       ║      │
│  ║  Solo reenvía blobs cifrados entre las claves públicas.     ║      │
│  ╚══════════════════════════════════════════════════════════════╝      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Cifrado

```
┌──────────────────────────────────────────────────────────────┐
│                    ENCRYPTION PIPELINE                        │
│                                                              │
│  Texto Plano ──► JSON.stringify ──► nacl.box() ──► Base64   │
│       │              │                  │             │       │
│  "Hola mundo"   { text, type,    Curve25519 +    Payload    │
│                   burnTimer }    XSalsa20-Poly1305  cifrado  │
│                                      │                       │
│                              ┌───────┴───────┐              │
│                              │  Private Key  │              │
│                              │  (Keychain)   │              │
│                              │  +            │              │
│                              │  Public Key   │              │
│                              │  (Destinatario)│              │
│                              └───────────────┘              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
Veil/
├── 📱 app/                          # Pantallas (Expo Router)
│   ├── _layout.tsx                  #   Router Guard + NavigationGuard
│   ├── index.tsx                    #   Pantalla de Bienvenida (Onboarding)
│   ├── identity.tsx                 #   Generación de Identidad Criptográfica
│   ├── identity-created.tsx         #   Confirmación de Identidad + Patrón Visual
│   ├── requests.tsx                 #   Bandeja de Solicitudes de Mensajes
│   │
│   ├── (tabs)/                      # Pestañas Principales
│   │   ├── _layout.tsx              #     Tab Bar flotante con BlurView
│   │   ├── index.tsx                #     Lista de Chats (Home)
│   │   ├── scan.tsx                 #     Escáner QR + PIN de Contacto
│   │   └── profile.tsx              #     Perfil, Ajustes y Danger Zone
│   │
│   └── chat/
│       └── [id].tsx                 #   Chat E2EE individual (dynamic route)
│
├── 🧩 components/                   # Componentes reutilizables
│   ├── AnimatedPressable.tsx        #   Botón con animación de escala
│   ├── Button.tsx                   #   Botón primario/secundario
│   ├── DecryptedText.tsx            #   Efecto typewriter "descifrado"
│   ├── GlassCard.tsx                #   Tarjeta glassmorphism
│   ├── GlobalProgress.tsx           #   Indicador de carga global
│   ├── IconButton.tsx               #   Botón de icono (lucide)
│   ├── IdentityPattern.tsx          #   Patrón visual SVG único por clave
│   ├── Screen.tsx                   #   Envoltorio de pantalla base
│   ├── ScreenHeader.tsx             #   Cabecera con título + botón back
│   ├── SecureStatus.tsx             #   Badge de estado de seguridad
│   ├── SignatureFooter.tsx          #   Pie de página "Privacy is a Right"
│   ├── ToastProvider.tsx            #   Sistema de notificaciones toast
│   └── TrustBadge.tsx               #   Badge de verificación de confianza
│
├── 🎨 design/                       # Sistema de diseño
│   ├── icons.ts                     #   Mapa de iconos (lucide-react-native)
│   ├── motion.ts                    #   Constantes de animación (spring/timing)
│   ├── tokens.ts                    #   Colores, espaciado, tipografía
│   └── typography.ts                #   Estilos tipográficos
│
├── 🔗 hooks/
│   └── useThemeColors.ts            #   Hook de colores del tema activo
│
├── 🔒 lib/                          # Núcleo criptográfico
│   ├── config.ts                    #   Configuración del relay
│   │
│   ├── crypto/                      # Motor de cifrado
│   │   ├── identity.ts              #     Generación de par de claves Curve25519
│   │   ├── message.ts               #     Encrypt/Decrypt con nacl.box
│   │   ├── sodium.ts                #     Helpers de libsodium
│   │   ├── types.ts                 #     Tipos criptográficos
│   │   └── validation.ts            #     Validación de claves y firmas
│   │
│   ├── i18n/                        # Internacionalización
│   │   ├── index.ts                 #     Motor i18n (detección de idioma)
│   │   ├── en.ts                    #     Cadenas en inglés
│   │   └── es.ts                    #     Cadenas en español
│   │
│   ├── identity/                    # Gestión de Identidad
│   │   ├── identity-service.ts      #     CRUD de identidad + purgeIdentity
│   │   └── identity-pattern.ts      #     Generación de patrón visual único
│   │
│   └── storage/                     # Almacenamiento seguro
│       ├── database.ts              #     SQLite (expo-sqlite) para identidad
│       └── keychain.ts              #     Keychain nativo (claves privadas)
│
├── 📦 store/                        # Estado global (Zustand)
│   ├── app-store.ts                 #   Esquema de color (dark/light)
│   ├── contacts-store.ts            #   Contactos (persist → AsyncStorage)
│   ├── identity-store.ts            #   Identidad del usuario
│   ├── messages-store.ts            #   Mensajes (persist → AsyncStorage)
│   ├── relay-store.ts               #   Conexión Socket.IO + lógica de relay
│   ├── settings-store.ts            #   Preferencias (persist → AsyncStorage)
│   └── toast-store.ts               #   Estado de notificaciones toast
│
├── 🖥️ veil-relay/                   # Servidor Relé Ciego
│   ├── server.js                    #   Express + Socket.IO (RAM-Only)
│   └── package.json                 #   Dependencias del relay
│
└── 📄 Configuración
    ├── app.json                     #   Configuración de Expo
    ├── package.json                 #   Dependencias del proyecto
    ├── tsconfig.json                #   Configuración de TypeScript
    ├── metro.config.js              #   Bundler Metro
    └── babel.config.js              #   Transpilación Babel
```

---

## ⚙️ Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                        │
├─────────────────┬───────────────────────────────────────────┤
│ Frontend        │  React Native 0.85 + Expo SDK 56          │
│ Routing         │  Expo Router (file-based)                  │
│ State           │  Zustand + persist (AsyncStorage)          │
│ Cifrado         │  TweetNaCl (nacl.box / Curve25519)         │
│ Almacenamiento  │  expo-sqlite, expo-secure-store, Keychain  │
│ Comunicación    │  Socket.IO (WebSocket transport)           │
│ UI              │  lucide-react-native, expo-blur, Reanimated│
│ Server          │  Node.js + Express + Socket.IO             │
│ i18n            │  Custom (expo-localization)                 │
└─────────────────┴───────────────────────────────────────────┘
```

---

## 🔐 Características de Seguridad

### Implementadas ✅

| Característica | Descripción |
|---|---|
| 🔑 **Cifrado E2EE** | `nacl.box` (Curve25519 + XSalsa20 + Poly1305) para cada mensaje |
| 🪪 **Identidad Local** | Par de claves generado localmente; clave privada en Keychain nativo |
| 👁️ **Relé Ciego** | El servidor solo reenvía blobs opacos. Cero conocimiento |
| 🔥 **Burn After Reading** | Temporizador de autodestrucción configurable por chat |
| ✅ **Confirmaciones de Lectura** | Doble check azul/blanco con opción de desactivar |
| 📬 **Solicitudes de Mensaje** | Los desconocidos van a cola separada. Sin confirmación hasta aceptar |
| 🛡️ **Routing Guard** | Imposible acceder a cualquier pantalla sin identidad válida |
| 🗑️ **Destroy Identity** | Borrado completo de identidad, claves y datos. Doble confirmación |
| 📷 **Imágenes Cifradas** | Compresión local + cifrado E2EE + límite de 2MB |
| 💾 **Historial Persistente** | Contactos y mensajes persisten con AsyncStorage |

### Flujo de Conexión

```
    ┌────────────┐                    ┌────────────┐
    │  ALICE 📱  │                    │  BOB 📱    │
    └─────┬──────┘                    └──────┬─────┘
          │                                  │
          │  1. Genera par de claves         │  1. Genera par de claves
          │     Curve25519 localmente        │     Curve25519 localmente
          │                                  │
          │  2. Muestra QR con su            │
          │     clave pública ────────────►  │  3. Escanea el QR de Alice
          │                                  │
          │  4. Escanea el QR de Bob  ◄──────│     Muestra su QR
          │                                  │
          │         ┌─────────────┐          │
          │         │ BLIND RELAY │          │
          ├────────►│  (RAM-Only) │◄─────────┤
          │  WSS    │  Zero-Know  │  WSS     │
          │         └─────────────┘          │
          │                                  │
          │  5. Alice cifra con PubKey(Bob)   │
          │     y envía blob ──────────────► │  6. Bob descifra con
          │                                  │     PrivKey(Bob)
          │  8. Alice descifra  ◄────────────│  7. Bob cifra respuesta
          │                                  │     con PubKey(Alice)
          │                                  │
    ══════╧══════════════════════════════════╧══════
     Las claves privadas NUNCA salen del dispositivo
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** ≥ 18
- **npm** o **yarn**
- **Expo CLI** (`npx expo`)

### 1. Instalar dependencias

```bash
# App principal
cd Veil
npm install

# Servidor relé
cd veil-relay
npm install
```

### 2. Iniciar el Relé Ciego

```bash
cd veil-relay
node server.js

# Output:
# =========================================
#       VEIL BLIND RELAY RUNNING
#       Port: 3000
#       Mode: RAM-Only
# =========================================
```

### 3. Iniciar la App

```bash
# En otra terminal
npx expo start -c

# Opciones:
#   w → Abrir en navegador web
#   a → Abrir en emulador Android
#   i → Abrir en simulador iOS
#   Escanear QR → Abrir en Expo Go
```

### 4. Probar entre dispositivos

Para chatear entre PC y móvil en la misma red local:

1. Inicia el relay en tu PC
2. Abre la app web en `http://localhost:8081`
3. Abre la app en tu móvil usando la IP local (e.g., `http://192.168.1.X:8081`)
4. Crea identidades en ambos dispositivos
5. Escanea QR mutuamente o comparte PIN
6. ¡Chatea con cifrado de extremo a extremo!

---

## 📱 Pantallas de la Aplicación

```
┌─────────────────────────────────────────────────────────┐
│                    USER FLOW MAP                         │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ WELCOME  │───►│   IDENTITY   │───►│  IDENTITY    │  │
│  │ Screen   │    │  Generation  │    │  CREATED     │  │
│  │ (index)  │    │              │    │  + Pattern   │  │
│  └──────────┘    └──────────────┘    └──────┬───────┘  │
│                                             │          │
│                                             ▼          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              TAB NAVIGATOR                       │   │
│  │                                                  │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │  CHATS   │  │   SCAN   │  │   PROFILE    │  │   │
│  │  │  (home)  │  │  QR/PIN  │  │  Settings    │  │   │
│  │  │          │  │          │  │  Danger Zone │  │   │
│  │  └────┬─────┘  └──────────┘  └──────────────┘  │   │
│  │       │                                         │   │
│  └───────┼─────────────────────────────────────────┘   │
│          │                                             │
│          ├──────────────────┐                          │
│          ▼                  ▼                          │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   CHAT E2EE  │  │  REQUESTS    │                   │
│  │  [id].tsx    │  │  (pending)   │                   │
│  │              │  │              │                   │
│  │  🔐 Encrypt  │  │  Accept /    │                   │
│  │  🔥 Burn     │  │  Block       │                   │
│  │  📷 Images   │  │              │                   │
│  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Stores (Estado Global)

```
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORES                            │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  identity-store│  │  contacts-store│  │ messages-store│  │
│  │                │  │   💾 PERSIST   │  │  💾 PERSIST   │  │
│  │  • identity    │  │                │  │               │  │
│  │  • isLoaded    │  │  • contacts[]  │  │  • messages[] │  │
│  │  • hydrate()   │  │  • addContact  │  │  • addMessage │  │
│  │  • setIdentity │  │  • acceptContact│ │  • updateStatus│ │
│  │  • purge()     │  │  • blockContact│  │  • cleanup()  │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  relay-store   │  │ settings-store │  │  toast-store  │  │
│  │                │  │   💾 PERSIST   │  │               │  │
│  │  • socket      │  │                │  │  • message    │  │
│  │  • isConnected │  │  • readReceipts│  │  • type       │  │
│  │  • connect()   │  │  • toggle()    │  │  • show()     │  │
│  │  • ackMessage()│  │                │  │  • dismiss()  │  │
│  │  • registerPin │  └────────────────┘  └──────────────┘  │
│  │  • resolvePin  │                                        │
│  └────────────────┘  ┌────────────────┐                    │
│                      │   app-store    │                    │
│                      │  • colorScheme │                    │
│                      └────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌐 Servidor Relé Ciego

El relay es intencionalmente **estúpido**. No sabe nada sobre los usuarios, sus mensajes ni sus relaciones.

### Eventos Socket.IO

| Evento | Dirección | Descripción |
|---|---|---|
| `register` | Cliente → Relay | Registra la clave pública del usuario |
| `register_pin` | Cliente → Relay | Crea un PIN temporal (5 min) vinculado a una clave pública |
| `resolve_pin` | Cliente → Relay | Resuelve un PIN a clave pública |
| `message` | Bidireccional | Reenvía blobs cifrados entre claves |
| `message_ack` | Bidireccional | Reenvía confirmaciones de lectura/entrega |

### Almacenamiento del Relay

```
┌──────────────────────────────────────────────┐
│            BLIND RELAY (RAM-Only)             │
│                                              │
│  connectedClients: Map<PublicKey, SocketID>   │
│  pinRegistry:      Map<PIN, {PubKey, TTL}>    │
│  pendingMessages:  Map<PubKey, CipherBlob[]>  │
│                                              │
│  ⚠️  Todo se pierde al reiniciar el servidor  │
│  ⚠️  No hay base de datos ni archivos de log  │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npx expo start -c              # Iniciar con caché limpio
npx expo start --web           # Solo web
npx expo start --android       # Solo Android

# Relay
cd veil-relay && node server.js   # Iniciar relay

# Instalar paquetes nativos
npx expo install <package>     # Instala versión compatible con SDK
```

---

## 📜 Licencia

**ISC License** — Creado con la convicción de que la privacidad es un derecho fundamental, no un privilegio.

<p align="center">
  <br/>
  <strong>🕵️ Desarrollado por un joven que se niega a rendir su privacidad.</strong>
  <br/>
  <br/>
  <em>"La privacidad no es algo que se deba sacrificar por conveniencia."</em>
</p>
