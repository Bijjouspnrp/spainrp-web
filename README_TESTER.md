# 🧪 SpainRP Web - Guía de Testing Completa

## 📋 Información General

**Proyecto:** SpainRP Web Platform  
**URL de Producción:** https://spainrp-oficial-1uly.onrender.com  
**Tipo:** Plataforma web completa para servidor de roleplay ERLC  
**Tecnologías:** React, Node.js, SQLite, Discord OAuth  

---

## 🎯 Objetivo del Testing

Verificar que todas las funcionalidades de la plataforma web de SpainRP funcionen correctamente, incluyendo:
- Autenticación y autorización
- Navegación y rutas
- Funcionalidades específicas de cada sección
- Responsive design
- Integración con APIs externas

---

## 🔐 Sistema de Autenticación

### **Login con Discord OAuth**
- **URL:** `/auth/login`
- **Proceso:** Redirige a Discord → Autorización → Retorno con token
- **Token:** Se almacena en `localStorage` como `spainrp_token`
- **Logout:** `/logout` (limpia token y redirige)

### **Roles de Usuario**
- **Usuario Normal:** Acceso a funcionalidades básicas
- **Moderador:** Acceso a panel de moderación
- **Administrador:** Acceso completo a todas las funciones

---

## 🏠 Página Principal (`/`)

### **Elementos a Verificar:**
- ✅ **Hero Section:** Título, descripción, botón de Discord
- ✅ **Estadísticas en Tiempo Real:** 
  - Miembros activos (widget Discord)
  - Miembros totales (API bot)
- ✅ **Sección de Características:** Cards con iconos y descripciones
- ✅ **Staff Section:** Información del equipo
- ✅ **ERLC Server:** Información del servidor
- ✅ **Discord Section:** Widget de Discord
- ✅ **Footer:** Enlaces, redes sociales, copyright

### **Funcionalidades Especiales:**
- **Búsqueda Global:** Barra de búsqueda en la parte superior
- **Detección de AdBlock:** Aviso si se detecta bloqueador
- **Responsive Design:** Adaptación a móvil/tablet

---

## 🛒 BlackMarket (`/blackmarket`)

### **Funcionalidades a Testear:**
- ✅ **Navegación:** Sin navbar (pantalla completa)
- ✅ **Tema Oscuro/Claro:** Botón de cambio de tema (👻)
- ✅ **DiscordUserBar:** Barra de usuario en la parte superior
- ✅ **Contenido:** Simulación de mercado negro
- ✅ **Responsive:** Adaptación a diferentes pantallas

### **Elementos UI:**
- Botón de tema en la esquina superior derecha
- Barra de usuario con avatar de Discord
- Contenido principal del mercado

---

## 📰 Noticias (`/news`)

### **⚠️ ESTADO ACTUAL: EN DESARROLLO**
- **Aviso visible:** "🚧 Noticias RP está en desarrollo - Esperando finalización de BijjouPro08 🚧"
- **Funcionalidades limitadas** hasta completar desarrollo

### **Funcionalidades Disponibles:**
- ✅ **Autenticación requerida:** Solo usuarios logueados
- ✅ **Formulario de publicación:** (Solo para reporteros autorizados)
- ✅ **Lista de noticias:** Visualización de noticias existentes
- ✅ **Sistema de reacciones:** Emojis en noticias
- ✅ **Sistema de comentarios:** Comentarios en noticias
- ✅ **Filtros y búsqueda:** Por autor, etiquetas, contenido

### **Campos del Formulario:**
- Título de la noticia
- Contenido/descripción
- Empresa/Compañía (opcional)
- Logo de empresa (archivo)
- Etiquetas/emojis
- Imágenes (URL o archivo)
- Sistema de permisos para publicación

---

## 📈 StockMarket (`/stockmarket`)

### **Funcionalidades a Testear:**
- ✅ **Simulación de mercado de valores**
- ✅ **Gráficos de precios en tiempo real**
- ✅ **Portfolio de usuario**
- ✅ **Historial de transacciones**
- ✅ **Sistema de compra/venta**

### **Elementos UI:**
- Dashboard principal con estadísticas
- Lista de acciones disponibles
- Gráficos interactivos
- Formularios de transacción

---

## 🎮 Apps Menu (`/apps`)

### **Menú Principal de Aplicaciones:**
- ✅ **TinderRP:** Sistema de citas en el servidor
- ✅ **BancoCentralRP:** Simulación bancaria
- ✅ **MinijuegosRP:** Juegos y entretenimiento
- ✅ **SimuladorTienda:** Gestión de tiendas
- ✅ **MDT Policial:** Sistema policial

---

## 💕 TinderRP (`/apps/tinder`)

### **⚠️ ESTADO ACTUAL: EN DESARROLLO**
- **Aviso visible:** "🚧 TinderRP está en desarrollo - Funcionalidades limitadas 🚧"

### **Funcionalidades Disponibles:**
- ✅ **Autenticación requerida:** Solo usuarios logueados
- ✅ **Creación de perfil:** Nombre, edad, Roblox, bio, ubicación, intereses
- ✅ **Búsqueda de avatar Roblox:** Integración con API de Roblox
- ✅ **Sistema de matches:** Like/dislike/superlike
- ✅ **Gestión de matches:** Lista de matches obtenidos
- ✅ **Filtros:** Por edad, género, ubicación

### **Campos del Perfil:**
- Nombre (obligatorio)
- Edad (obligatorio, mínimo 18)
- Usuario de Roblox (obligatorio)
- Ubicación
- Género
- Qué buscas (amistad, relación, etc.)
- Intereses (separados por comas)
- Bio (máximo 200 caracteres)

---

## 🏦 BancoCentralRP (`/apps/banco`)

### **Funcionalidades a Testear:**
- ✅ **Simulación bancaria completa**
- ✅ **Gestión de cuentas**
- ✅ **Transferencias entre usuarios**
- ✅ **Historial de transacciones**
- ✅ **Sistema de préstamos**
- ✅ **Dashboard financiero**

---

## 🎯 MinijuegosRP (`/apps/minijuegos`)

### **Funcionalidades a Testear:**
- ✅ **Colección de minijuegos**
- ✅ **Sistema de puntuaciones**
- ✅ **Rankings de jugadores**
- ✅ **Integración con Discord**
- ✅ **Estadísticas de juego**

---

## 🏪 SimuladorTienda (`/apps/tienda`)

### **Funcionalidades a Testear:**
- ✅ **Gestión de inventario**
- ✅ **Sistema de precios**
- ✅ **Simulación de ventas**
- ✅ **Estadísticas de negocio**
- ✅ **Gestión de empleados**

---

## 👮 MDT Policial (`/apps/mdt`)

### **Funcionalidades a Testear:**
- ✅ **Sistema de búsqueda de personas**
- ✅ **Consulta de antecedentes**
- ✅ **Sistema de arrestos**
- ✅ **Autocompletado de cargos penales**
- ✅ **Búsqueda de usuarios Discord**
- ✅ **Generación de reportes**

### **Secciones del MDT:**
1. **Búsqueda:** Por DNI, nombre, Discord ID
2. **Antecedentes:** Historial criminal de personas
3. **Arrestar:** Sistema completo de arrestos con:
   - Autocompletado de cargos (código penal)
   - Búsqueda de usuarios Discord
   - Cálculo automático de multas y tiempos
   - Generación de reportes detallados

### **Código Penal Integrado:**
- Más de 200 artículos del código penal SpainRP 2025
- Cálculo automático de multas y prisión
- Diferenciación entre tiempo IC y OOC
- Validación de códigos penales

---

## 👤 Panel de Usuario (`/panel`)

### **Funcionalidades a Testear:**
- ✅ **Dashboard personal**
- ✅ **Gestión de perfil**
- ✅ **Historial de actividad**
- ✅ **Configuraciones de cuenta**
- ✅ **Sistema de notificaciones**

### **Subsecciones:**
- **Panel principal:** Estadísticas y resumen
- **Gestión de bans:** Para moderadores
- **Logs del sistema:** Para administradores

---

## 🛡️ Panel de Administración (`/admin`)

### **⚠️ ACCESO RESTRINGIDO**
- **Solo administradores autorizados**
- **Verificación de permisos JWT**

### **Funcionalidades Administrativas:**
- ✅ **Gestión de usuarios**
- ✅ **Sistema de bans**
- ✅ **Logs del sistema**
- ✅ **Configuraciones del servidor**
- ✅ **Estadísticas avanzadas**
- ✅ **Gestión de contenido**

---

## 📋 Normativas (`/rules`)

### **Funcionalidades a Testear:**
- ✅ **4 Categorías de normativas:**
  1. **Normativas Discord:** Reglas del servidor Discord
  2. **Normativas Web:** Reglas de la plataforma web
  3. **Normativas de Roleplay:** Reglas del juego
  4. **Normativa de Empresas:** Reglas para empresas

### **Navegación:**
- **Cards interactivas** para cada categoría
- **Modal con navegación** entre secciones
- **Contenido detallado** con jerarquía de warns
- **Diseño responsive** y accesible

---

## 🆘 Soporte (`/support`)

### **Funcionalidades a Testear:**
- ✅ **Formulario de contacto**
- ✅ **FAQ (Preguntas frecuentes)**
- ✅ **Enlaces a Discord**
- ✅ **Sistema de tickets**
- ✅ **Información de contacto**

---

## 📄 Páginas Legales

### **Términos de Servicio (`/terms`)**
- ✅ **Términos completos del servicio**
- ✅ **Política de privacidad**
- ✅ **Términos específicos de ERLC**
- ✅ **Secciones expandibles**

### **Cookies (`/cookies`)**
- ✅ **Política de cookies**
- ✅ **Gestión de consentimiento**
- ✅ **Configuraciones de privacidad**

---

## 🔍 Funcionalidades Globales

### **Búsqueda Global**
- ✅ **Barra de búsqueda** en la parte superior
- ✅ **Búsqueda en tiempo real**
- ✅ **Sugerencias automáticas**
- ✅ **Navegación a resultados**

### **Sistema de Notificaciones**
- ✅ **Toast notifications**
- ✅ **Notificaciones de sistema**
- ✅ **Alertas de mantenimiento**

### **Responsive Design**
- ✅ **Adaptación a móvil** (320px+)
- ✅ **Adaptación a tablet** (768px+)
- ✅ **Adaptación a desktop** (1024px+)
- ✅ **Navegación móvil optimizada**

---

## 🚨 Estados Especiales

### **Modo Mantenimiento**
- ✅ **Página de mantenimiento** con Vanta.js background
- ✅ **Barra de progreso** en tiempo real
- ✅ **Suscripción por email** para notificaciones
- ✅ **Panel administrativo** para controlar mantenimiento

### **Página de Usuario Baneado**
- ✅ **Página especial** para usuarios baneados
- ✅ **Información del ban**
- ✅ **Proceso de apelación**

### **Página 404**
- ✅ **Diseño personalizado** para páginas no encontradas
- ✅ **Navegación de regreso**
- ✅ **Búsqueda alternativa**

---

## 🧪 Checklist de Testing

### **Autenticación y Autorización**
- [ ] Login con Discord funciona correctamente
- [ ] Logout limpia la sesión
- [ ] Rutas protegidas requieren autenticación
- [ ] Panel de admin solo para administradores
- [ ] Tokens JWT se manejan correctamente

### **Navegación y Rutas**
- [ ] Todas las rutas principales funcionan
- [ ] Navegación entre secciones es fluida
- [ ] Enlaces del footer funcionan correctamente
- [ ] Búsqueda global encuentra resultados
- [ ] Responsive navigation en móvil

### **Funcionalidades Específicas**
- [ ] BlackMarket: Cambio de tema funciona
- [ ] News: Formulario de publicación (si tienes permisos)
- [ ] StockMarket: Gráficos y transacciones
- [ ] TinderRP: Creación de perfil y matches
- [ ] BancoCentralRP: Operaciones bancarias
- [ ] MinijuegosRP: Juegos funcionan
- [ ] SimuladorTienda: Gestión de tienda
- [ ] MDT Policial: Búsquedas y arrestos
- [ ] Rules: Navegación entre normativas

### **Responsive Design**
- [ ] Móvil (320px-767px): Navegación hamburguesa
- [ ] Tablet (768px-1023px): Layout adaptado
- [ ] Desktop (1024px+): Layout completo
- [ ] Elementos interactivos funcionan en touch
- [ ] Texto legible en todas las resoluciones

### **Integración con APIs**
- [ ] Discord OAuth funciona
- [ ] Widget de Discord se carga
- [ ] API de Roblox para avatares
- [ ] Estadísticas en tiempo real
- [ ] Socket.io para actualizaciones

### **Estados de Error**
- [ ] Página 404 se muestra correctamente
- [ ] Usuarios baneados ven página especial
- [ ] Errores de red se manejan gracefully
- [ ] Loading states se muestran apropiadamente

---

## 🐛 Problemas Conocidos

### **En Desarrollo**
- **Noticias RP:** Funcionalidades limitadas, en desarrollo por BijjouPro08
- **TinderRP:** Funcionalidades limitadas, en desarrollo

### **Limitaciones**
- Algunas funcionalidades requieren permisos específicos
- Integración con Discord requiere configuración del bot
- APIs externas pueden tener limitaciones de rate

---

## 📞 Contacto y Soporte

- **Discord:** https://discord.gg/sMzFgFQHXA
- **Desarrollador Principal:** BijjouPro08
- **Plataforma:** https://spainrp-oficial-1uly.onrender.com

---

## 🔄 Proceso de Testing

1. **Testing de Autenticación:** Verificar login/logout
2. **Testing de Navegación:** Probar todas las rutas
3. **Testing de Funcionalidades:** Usar cada sección completamente
4. **Testing Responsive:** Probar en diferentes dispositivos
5. **Testing de Integración:** Verificar APIs externas
6. **Testing de Estados de Error:** Probar casos edge
7. **Documentar Issues:** Reportar bugs encontrados

---

**¡Gracias por ayudar a mejorar SpainRP! 🚀**
