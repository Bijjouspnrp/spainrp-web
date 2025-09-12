import { useEffect, useState } from 'react';
import './ReloadModal.css';

function ReloadModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar modal si Vite va a hacer recarga completa en dev
    if (import.meta && import.meta.hot && import.meta.hot.on) {
      const off = import.meta.hot.on('vite:beforeFullReload', () => {
        setIsVisible(true);
      });
      return () => {
        if (typeof off === 'function') off();
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="reload-modal__backdrop">
      <div className="reload-modal__content">
        <h3>Nueva versión disponible</h3>
        <p>Se requiere recargar la página para aplicar los cambios.</p>
        <div className="reload-modal__actions">
          <button className="reload-modal__button" onClick={() => window.location.reload()}>Recargar</button>
          <button className="reload-modal__button secondary" onClick={() => setIsVisible(false)}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default ReloadModal;


