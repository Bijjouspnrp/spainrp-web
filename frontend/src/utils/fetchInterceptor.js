// Interceptor global para capturar respuestas de ban
const originalFetch = window.fetch;

window.fetch = async function(...args) {
  try {
    const response = await originalFetch.apply(this, args);
    
    // Interceptar respuestas 403 que contengan datos de ban
    if (response.status === 403) {
      console.log('[BAN INTERCEPTOR] Respuesta 403 detectada, verificando si es ban...');
      
      try {
        const data = await response.clone().json();
        console.log('[BAN INTERCEPTOR] Datos de respuesta 403:', data);
        
        // Verificar si es una respuesta de ban
        if (data.error === 'Banned' && data.type) {
          console.log('[BAN INTERCEPTOR] ✅ Usuario baneado detectado:', data);
          
          // Guardar datos de ban en localStorage
          const banData = {
            type: data.type,
            reason: data.reason,
            bannedAt: data.bannedAt,
            expiresAt: data.expiresAt
          };
          
          localStorage.setItem('ban_error', JSON.stringify(banData));
          console.log('[BAN INTERCEPTOR] 💾 Datos de ban guardados en localStorage:', banData);
          
          // Disparar evento personalizado para notificar a otros componentes
          window.dispatchEvent(new CustomEvent('userBanned', { detail: banData }));
          
          // Redirigir inmediatamente a la página de ban
          console.log('[BAN INTERCEPTOR] 🔄 Redirigiendo a /banned...');
          window.location.href = '/banned';
          return response;
        } else {
          console.log('[BAN INTERCEPTOR] ❌ Respuesta 403 no es de ban:', data);
        }
      } catch (jsonError) {
        // Si no es JSON válido, continuar normalmente
        console.log('[BAN INTERCEPTOR] ❌ Respuesta 403 no es JSON válido:', jsonError);
      }
    }
    
    return response;
  } catch (error) {
    console.error('[BAN INTERCEPTOR] ❌ Error en interceptor:', error);
    return originalFetch.apply(this, args);
  }
};

console.log('[BAN INTERCEPTOR] 🚀 Interceptor de bans inicializado');

export default {};
