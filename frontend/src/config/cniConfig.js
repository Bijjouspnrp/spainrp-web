// Configuración del CNI
export const CNI_CONFIG = {
  // Rutas de imágenes
  LOGO_PATHS: {
    // Ruta local (recomendada)
    LOCAL: '/src/assets/CNIORIGINAl.png',
    
    // Ruta desde public (alternativa)
    PUBLIC: '/assets/CNIORIGINAl.png',
    
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
  // Prioridad: LOCAL -> PUBLIC -> EXTERNAL -> FALLBACK
  return CNI_CONFIG.LOGO_PATHS.LOCAL;
};

// Función para verificar si una imagen existe
export const checkImageExists = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};
