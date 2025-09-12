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
  // Caso cookies → ruta dedicada
  if (h === '#cookies') {
    window.history.replaceState(null, '', '/cookies');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }
  if (h === '#support') {
    window.history.replaceState(null, '', '/support');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }
  // Caso terms → ruta dedicada
  if (h === '#terms') {
    window.history.replaceState(null, '', '/terms');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }
  // Caso rules → ruta dedicada
  if (h === '#rules') {
    window.history.replaceState(null, '', '/rules');
    window.dispatchEvent(new PopStateEvent('popstate'));
    return;
  }
  // Caso secciones → scroll
  const id = hashToIdMap[h];
  if (id) {
    if (window.location.pathname !== '/') {
      try { sessionStorage.setItem('scrollTarget', id); } catch (_) {}
      window.history.replaceState(null, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      const el = document.getElementById(id);
      if (el) smoothScrollWithOffset(el);
      else try { sessionStorage.setItem('scrollTarget', id); } catch (_) {}
    }
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
