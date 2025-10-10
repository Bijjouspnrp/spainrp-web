// Configuración del CNI
export const CNI_CONFIG = {
  // Rutas de imágenes
  LOGO_PATHS: {
    // Ruta desde public (recomendada para producción)
    PUBLIC: '/assets/CNIORIGINAl.png',
    
    // Ruta local (desarrollo)
    LOCAL: '/src/assets/CNIORIGINAl.png',
    
    // URL externa (si quieres usar una imagen desde internet)
    EXTERNAL: 'https://imgur.com/acRv3nU.png', // Ejemplo
    
    // Ruta de fallback
    FALLBACK: '/src/assets/cni-logo.svg'
  },
  
  // Configuración del logo en PDF
  LOGO_PDF: {
    WIDTH: 30,
    HEIGHT: 30,
    X_POSITION: 15,
    Y_POSITION: 8
  },
  
  // Configuración de caché
  CACHE: {
    TTL: 300000, // 5 minutos
    CLEANUP_INTERVAL: 300000 // 5 minutos
  }
};

// Función para obtener la mejor ruta de imagen disponible
export const getLogoPath = () => {
  // Prioridad: PUBLIC -> LOCAL -> EXTERNAL -> FALLBACK
  // PUBLIC funciona mejor en producción
  return CNI_CONFIG.LOGO_PATHS.PUBLIC;
};

// Función para obtener la mejor ruta de imagen con fallback automático
export const getBestLogoPath = async () => {
  const paths = [
    CNI_CONFIG.LOGO_PATHS.PUBLIC,    // Producción
    CNI_CONFIG.LOGO_PATHS.LOCAL,     // Desarrollo
    CNI_CONFIG.LOGO_PATHS.EXTERNAL,  // URL externa
    CNI_CONFIG.LOGO_PATHS.FALLBACK   // Fallback
  ];

  for (const path of paths) {
    try {
      const exists = await checkImageExists(path);
      if (exists) {
        console.log(`[CNI] ✅ Logo encontrado en: ${path}`);
        return path;
      }
    } catch (error) {
      console.warn(`[CNI] ⚠️ Error verificando ruta ${path}:`, error);
    }
  }

  console.warn('[CNI] ❌ No se encontró logo en ninguna ruta, usando fallback');
  return CNI_CONFIG.LOGO_PATHS.FALLBACK;
};

// Función para verificar si una imagen existe
export const checkImageExists = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};
