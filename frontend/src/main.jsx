import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ReloadModal from './components/ReloadModal';

// Mapeo de hash a IDs de sección
const hashToIdMap = {
  '#home': 'home',
  '#features': 'features',
  '#staff': 'staff',
  '#discord': 'discord',
  '#support': 'support',
  '#about': 'home', // si hubiera sección about específica, ajustar
};

const smoothScrollWithOffset = (el, offset = 80) => {
  const y = (el?.getBoundingClientRect()?.top || 0) + window.pageYOffset - offset;
  window.scrollTo({ top: y, behavior: 'smooth' });
};

function handleHashNavigation() {
  const h = window.location.hash;
  
  // TEMPORARILY DISABLED - This was interfering with React Router
  // TODO: Implement proper hash navigation that works with React Router
  
  // Caso secciones → scroll (only for home page)
  const id = hashToIdMap[h];
  if (id && window.location.pathname === '/') {
    const el = document.getElementById(id);
    if (el) smoothScrollWithOffset(el);
    else try { sessionStorage.setItem('scrollTarget', id); } catch (_) {}
  }
}

// Ejecutar al cargar
handleHashNavigation();

// Escuchar cambios de hash en caliente (cuando la app ya está montada)
window.addEventListener('hashchange', handleHashNavigation);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReloadModal />
    <App />
  </StrictMode>,
)
