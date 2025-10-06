import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para detectar cuando un elemento entra en el viewport
 * @param {Object} options - Opciones para el IntersectionObserver
 * @param {number} options.threshold - Umbral de intersección (0-1)
 * @param {string} options.rootMargin - Margen del root
 * @returns {Object} { ref, isIntersecting, hasIntersected }
 */
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting;
        setIsIntersecting(isCurrentlyIntersecting);
        
        // Si el elemento ha entrado en el viewport al menos una vez, marcarlo
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
};

export default useIntersectionObserver;
