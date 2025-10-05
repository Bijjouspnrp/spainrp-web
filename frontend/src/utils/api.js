// Helper para URLs de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://spainrp-oficial.onrender.com';

export const apiUrl = (path) => {
  // Si la ruta ya es una URL completa, la devolvemos tal como está
  if (path.startsWith('http')) {
    return path;
  }
  
  // Normalizar la URL base (remover barra al final si existe)
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  
  // Si la ruta no empieza con /, la agregamos
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};

// Helper para hacer fetch autenticado con JWT
export const authFetch = async (path, options = {}) => {
  const token = localStorage.getItem('spainrp_token');
  
  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };
  
  // Agregar token si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(apiUrl(path), {
    ...options,
    headers
  });
};

export default apiUrl;
