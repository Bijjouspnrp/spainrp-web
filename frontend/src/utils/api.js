// Helper para URLs de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://spainrp-web.onrender.com';

export const apiUrl = (path) => {
  // Si la ruta ya es una URL completa, la devolvemos tal como está
  if (path.startsWith('http')) {
    return path;
  }
  
  // Si la ruta no empieza con /, la agregamos
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${API_BASE_URL}${normalizedPath}`;
};

export default apiUrl;
