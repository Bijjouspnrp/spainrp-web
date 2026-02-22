# 📚 Documentación API Banco - SpainRP

## 🔗 URLs Base

### API Externa (Servidor de Economía)
```
Base URL: http://37.27.21.91:5021
Variable de entorno: ECONOMIA_API_URL
```

### API Interna (Este servidor)
```
Base URL: https://spainrp-web-pqog.onrender.com (o tu dominio)
```

---

## 🌐 API EXTERNA (Servidor de Economía - Puerto 5021)

### 1. Consultar Saldo de Usuario (Admin)
```http
GET http://37.27.21.91:5021/api/proxy/admin/balance/{userId}
```

**Ejemplo:**
```bash
curl http://37.27.21.91:5021/api/proxy/admin/balance/710112055985963090
```

**Respuesta esperada:**
```json
{
  "success": true,
  "userId": "710112055985963090",
  "balance": {
    "cash": 1000,
    "bank": 5000
  },
  "total": 6000
}
```

---

### 2. Consultar Saldos de Varios Usuarios
```http
POST http://37.27.21.91:5021/api/proxy/admin/balances
Content-Type: application/json

{
  "userIds": ["710112055985963090", "123456789012345678"]
}
```

**Ejemplo con curl:**
```bash
curl -X POST http://37.27.21.91:5021/api/proxy/admin/balances \
  -H "Content-Type: application/json" \
  -d '{"userIds": ["710112055985963090"]}'
```

---

### 3. Transferir Dinero
```http
POST http://37.27.21.91:5021/api/proxy/admin/transfer
Content-Type: application/json

{
  "fromId": "710112055985963090",
  "toId": "123456789012345678",
  "amount": 1000,
  "origen": "banco"
}
```

---

### 4. Realizar Trabajo
```http
POST http://37.27.21.91:5021/api/proxy/admin/trabajar
Content-Type: application/json

{
  "userId": "710112055985963090",
  "username": "bijjoupro08"
}
```

---

### 5. Cobrar Nómina
```http
POST http://37.27.21.91:5021/api/proxy/admin/cobrar-nomina
Content-Type: application/json

{
  "userId": "710112055985963090",
  "roles": ["123456789", "987654321"]
}
```

---

### 6. Modificar Saldo (Admin)
```http
POST http://37.27.21.91:5021/api/admin/setbalance
Content-Type: application/json

{
  "userId": "710112055985963090",
  "cash": 2000,
  "bank": 10000
}
```

---

### 7. Ver Saldo de Usuario (Admin - Alternativa)
```http
GET http://37.27.21.91:5021/api/admin/balance/{userId}
```

---

## 🔒 API INTERNA (Este Servidor - Proxy)

### 1. Consultar Saldo Propio (GET)
```http
GET https://spainrp-web-pqog.onrender.com/api/proxy/balance/{userId}
```

**Ejemplo:**
```bash
curl https://spainrp-web-pqog.onrender.com/api/proxy/balance/710112055985963090
```

**Respuesta (con fallback si API externa falla):**
```json
{
  "success": true,
  "userId": "710112055985963090",
  "balance": {
    "cash": 1000,
    "bank": 5000
  },
  "total": 6000,
  "message": "Datos simulados - API de economía no disponible"
}
```

---

### 2. Consultar Saldo Propio (POST)
```http
POST https://spainrp-web-pqog.onrender.com/api/proxy/balance
Content-Type: application/json

{
  "userId": "710112055985963090"
}
```

**Ejemplo con curl:**
```bash
curl -X POST https://spainrp-web-pqog.onrender.com/api/proxy/balance \
  -H "Content-Type: application/json" \
  -d '{"userId": "710112055985963090"}'
```

---

### 3. Consultar Saldo (Admin - Proxy)
```http
GET https://spainrp-web-pqog.onrender.com/api/proxy/admin/balance/{id}
```

**Ejemplo:**
```bash
curl https://spainrp-web-pqog.onrender.com/api/proxy/admin/balance/710112055985963090
```

---

### 4. Consultar Saldo (Admin - POST)
```http
POST https://spainrp-web-pqog.onrender.com/api/proxy/admin/balance
Content-Type: application/json

{
  "userId": "710112055985963090"
}
```

---

### 5. Consultar Saldos Múltiples
```http
POST https://spainrp-web-pqog.onrender.com/api/proxy/admin/balances
Content-Type: application/json

{
  "userIds": ["710112055985963090", "123456789012345678"]
}
```

---

## 🧪 Cómo Probar las APIs

### ⚡ Opción 0: Script de Prueba Automático (Recomendado)

He creado un script de prueba que puedes ejecutar:

```bash
# Desde la carpeta backend
cd backend
node test-banco-api.js
```

Este script probará automáticamente todos los endpoints y te mostrará un resumen con colores.

**Para personalizar:**
```bash
# Cambiar el User ID de prueba
export TEST_USER_ID="tu_user_id_aqui"
node test-banco-api.js

# Cambiar la URL de la API externa
export ECONOMIA_API_URL="http://tu-servidor:5021"
node test-banco-api.js

# Cambiar la URL de la API interna
export INTERNAL_API_URL="https://tu-dominio.com"
node test-banco-api.js
```

---

### Opción 1: Usando cURL

#### Probar API Externa directamente:
```bash
# Consultar saldo
curl http://37.27.21.91:5021/api/proxy/admin/balance/710112055985963090

# Transferir dinero
curl -X POST http://37.27.21.91:5021/api/proxy/admin/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "710112055985963090",
    "toId": "123456789012345678",
    "amount": 1000,
    "origen": "banco"
  }'
```

#### Probar API Interna (con fallback):
```bash
# GET
curl https://spainrp-web-pqog.onrender.com/api/proxy/balance/710112055985963090

# POST
curl -X POST https://spainrp-web-pqog.onrender.com/api/proxy/balance \
  -H "Content-Type: application/json" \
  -d '{"userId": "710112055985963090"}'
```

---

### Opción 2: Usando Postman

1. **Crear nueva petición GET:**
   - URL: `http://37.27.21.91:5021/api/proxy/admin/balance/710112055985963090`
   - Method: GET
   - Headers: (ninguno necesario)

2. **Crear nueva petición POST:**
   - URL: `http://37.27.21.91:5021/api/proxy/admin/transfer`
   - Method: POST
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "fromId": "710112055985963090",
     "toId": "123456789012345678",
     "amount": 1000,
     "origen": "banco"
   }
   ```

---

### Opción 3: Usando JavaScript/Fetch

```javascript
// Consultar saldo
async function consultarSaldo(userId) {
  try {
    const response = await fetch(
      `http://37.27.21.91:5021/api/proxy/admin/balance/${userId}`
    );
    const data = await response.json();
    console.log('Saldo:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usar
consultarSaldo('710112055985963090');
```

---

### Opción 4: Usando el navegador

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Probar API interna (con fallback)
fetch('https://spainrp-web-pqog.onrender.com/api/proxy/balance/710112055985963090')
  .then(res => res.json())
  .then(data => console.log('Saldo:', data))
  .catch(err => console.error('Error:', err));
```

---

## 🔍 Diagnóstico de Problemas

### Si la API Externa devuelve 404:

1. **Verificar que el servidor esté corriendo:**
   ```bash
   curl http://37.27.21.91:5021/api/health
   # o cualquier endpoint de prueba
   ```

2. **Verificar la ruta exacta:**
   - La ruta correcta es: `/api/proxy/admin/balance/{userId}`
   - NO es: `/api/admin/balance/{userId}` (esa es otra ruta)

3. **Verificar el userId:**
   - Debe ser un ID de Discord válido (18 dígitos)
   - Ejemplo válido: `710112055985963090`

### Si la API Interna devuelve fallback:

- Esto es **normal** si la API externa no está disponible
- El sistema automáticamente devuelve datos simulados
- Revisa los logs del servidor para ver el error específico

---

## 📝 Notas Importantes

1. **API Externa:** Requiere que el servidor en `37.27.21.91:5021` esté corriendo y tenga el endpoint implementado.

2. **API Interna:** Actúa como proxy y tiene fallback automático si la externa falla.

3. **Autenticación:** Algunos endpoints pueden requerir autenticación JWT o ser admin.

4. **CORS:** Si pruebas desde el navegador, verifica que CORS esté configurado correctamente.

---

## 🛠️ Endpoints Adicionales del Banco

### Black Market (API Externa)
- `GET /api/blackmarket/items` - Listar items
- `GET /api/blackmarket/inventario/{userId}` - Inventario de usuario
- `GET /api/blackmarket/saldo/{userId}` - Saldo de usuario
- `POST /api/blackmarket/purchase` - Comprar item
- `POST /api/blackmarket/sell` - Vender items
- `POST /api/blackmarket/sellone` - Vender un item

### Admin Black Market
- `POST /api/blackmarket/admin/additem` - Agregar item
- `POST /api/blackmarket/admin/removeitem` - Remover item

---

## 🔐 Variables de Entorno

```env
ECONOMIA_API_URL=http://37.27.21.91:5021
```

Si no está configurada, se usa el valor por defecto: `http://37.27.21.91:5021`

