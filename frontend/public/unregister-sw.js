// Script para desregistrar Service Worker completamente
console.log('[SW-CLEANUP] Iniciando limpieza de Service Worker...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('[SW-CLEANUP] Service Workers encontrados:', registrations.length);
    
    registrations.forEach(function(registration) {
      console.log('[SW-CLEANUP] Desregistrando Service Worker:', registration.scope);
      registration.unregister().then(function(success) {
        if (success) {
          console.log('[SW-CLEANUP] ✅ Service Worker desregistrado exitosamente');
        } else {
          console.log('[SW-CLEANUP] ❌ Error desregistrando Service Worker');
        }
      });
    });
    
    // Limpiar cache
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        console.log('[SW-CLEANUP] Caches encontrados:', cacheNames.length);
        cacheNames.forEach(function(cacheName) {
          console.log('[SW-CLEANUP] Eliminando cache:', cacheName);
          caches.delete(cacheName);
        });
      });
    }
    
    // Mensaje final
    setTimeout(() => {
      console.log('[SW-CLEANUP] ✅ Limpieza completada. Recarga la página.');
      alert('Service Worker eliminado. Recarga la página para aplicar cambios.');
    }, 1000);
  });
} else {
  console.log('[SW-CLEANUP] Service Worker no soportado en este navegador');
}
