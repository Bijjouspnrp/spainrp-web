// Interceptor global para capturar respuestas de ban
const originalFetch = window.fetch;
let isRedirecting = false; // Prevenir redirecciones múltiples

window.fetch = async function(...args) {
  try {
    const response = await originalFetch.apply(this, args);
    
    // Interceptar respuestas 403 que contengan datos de ban
    if (response.status === 403) {
      console.log('[BAN INTERCEPTOR] Respuesta 403 detectada, verificando si es ban...');
      
      try {
        const data = await response.clone().json();
        console.log('[BAN INTERCEPTOR] Datos de respuesta 403:', data);
        
        // Verificar si es una respuesta de ban (IP o Discord)
        if (data.error === 'Banned' && (data.type || data.message)) {
          console.log('[BAN INTERCEPTOR] ✅ Usuario baneado detectado:', data);
          
          // Prevenir redirecciones múltiples
          if (isRedirecting) {
            console.log('[BAN INTERCEPTOR] ⚠️ Redirección ya en progreso, ignorando...');
            return response;
          }
          
          // Determinar el tipo de ban basado en el mensaje si no hay type
          let banType = data.type;
          if (!banType) {
            if (data.message.includes('IP')) {
              banType = 'ip';
            } else if (data.message.includes('Discord')) {
              banType = 'discord';
            } else {
              banType = 'unknown';
            }
          }
          
          // Guardar datos de ban en localStorage
          const banData = {
            type: banType,
            reason: data.reason || 'No especificada',
            bannedAt: data.bannedAt || new Date().toISOString(),
            expiresAt: data.expiresAt || null,
            message: data.message
          };
          
          localStorage.setItem('ban_error', JSON.stringify(banData));
          console.log('[BAN INTERCEPTOR] 💾 Datos de ban guardados en localStorage:', banData);
          
          // Disparar evento personalizado para notificar a otros componentes
          window.dispatchEvent(new CustomEvent('userBanned', { detail: banData }));
          
          // Marcar que estamos redirigiendo y redirigir inmediatamente a la página de ban
          isRedirecting = true;
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
