# Configuración del Logo del CNI

## 📁 Ubicación de Archivos

El logo del CNI debe estar ubicado en una de estas rutas:

### Opción 1: Carpeta Assets (Recomendada)
```
frontend/src/assets/CNIORIGINAl.png
```

### Opción 2: Carpeta Public
```
frontend/public/assets/CNIORIGINAl.png
```

### Opción 3: URL Externa
Puedes usar una URL externa modificando el archivo `cniConfig.js`:
```javascript
EXTERNAL: 'https://tu-servidor.com/logo-cni.png'
```

## 🔧 Configuración

### Modificar la Ruta del Logo

Edita el archivo `frontend/src/config/cniConfig.js`:

```javascript
export const CNI_CONFIG = {
  LOGO_PATHS: {
    LOCAL: '/src/assets/CNIORIGINAl.png',        // Ruta local
    PUBLIC: '/assets/CNIORIGINAl.png',           // Ruta desde public
    EXTERNAL: 'https://ejemplo.com/logo.png',    // URL externa
    FALLBACK: '/src/assets/cni-logo.svg'         // Fallback
  }
};
```

### Cambiar el Tamaño del Logo en PDF

```javascript
LOGO_PDF: {
  WIDTH: 30,        // Ancho en píxeles
  HEIGHT: 30,       // Alto en píxeles
  X_POSITION: 15,   // Posición X en el PDF
  Y_POSITION: 8     // Posición Y en el PDF
}
```

## 🎯 Opciones de Implementación

### 1. Imagen Local (PNG/JPG)
- ✅ Mejor calidad
- ✅ Control total
- ✅ Sin dependencias externas
- ❌ Requiere archivo en el proyecto

### 2. URL Externa
- ✅ No ocupa espacio en el proyecto
- ✅ Fácil de actualizar
- ❌ Dependiente de la conexión
- ❌ Posibles problemas de CORS

### 3. Base64 Embebido
- ✅ No requiere archivos externos
- ✅ Carga instantánea
- ❌ Aumenta el tamaño del código
- ❌ Difícil de mantener

## 🚀 Uso Rápido

1. Coloca tu imagen PNG en `frontend/src/assets/CNIORIGINAl.png`
2. El sistema la detectará automáticamente
3. Si no encuentra la imagen, usará un logo de fallback

## 🔍 Debugging

Para ver qué está pasando con el logo, abre la consola del navegador y busca:
- `[CNI] Intentando cargar logo desde: ...`
- `[CNI] Logo PNG cargado exitosamente`
- `[CNI] Usando logo de fallback`

## 📝 Notas Importantes

- La imagen debe ser PNG, JPG o SVG
- Se recomienda un tamaño de 200x200 píxeles o más
- El sistema redimensionará automáticamente la imagen
- Si hay problemas de CORS, usa la carpeta `public/` en lugar de `src/assets/`
