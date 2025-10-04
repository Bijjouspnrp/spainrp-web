// Interceptor global para capturar respuestas de ban
class FetchInterceptor {
  constructor() {
    this.originalFetch = window.fetch;
    this.setupInterceptor();
  }

  setupInterceptor() {
    const self = this;
    
    window.fetch = async function(...args) {
      try {
        const response = await self.originalFetch.apply(this, args);
        
        // Interceptar respuestas 403 que contengan datos de ban
        if (response.status === 403) {
          try {
            const data = await response.clone().json();
            
            // Verificar si es una respuesta de ban
            if (data.error === 'Banned' && data.type) {
              console.log('[BAN INTERCEPTOR] Usuario baneado detectado:', data);
              
              // Guardar datos de ban en localStorage
              localStorage.setItem('ban_error', JSON.stringify({
                type: data.type,
                reason: data.reason,
                bannedAt: data.bannedAt,
                expiresAt: data.expiresAt
              }));
              
              // Redirigir a la página de ban
              window.location.href = '/banned';
              return response;
            }
          } catch (jsonError) {
            // Si no es JSON válido, continuar normalmente
            console.log('[BAN INTERCEPTOR] Respuesta 403 no es de ban:', jsonError);
          }
        }
        
        return response;
      } catch (error) {
        console.error('[BAN INTERCEPTOR] Error:', error);
        return self.originalFetch.apply(this, args);
      }
    };
  }

  // Método para limpiar el interceptor
  cleanup() {
    window.fetch = this.originalFetch;
  }
}

// Crear instancia global del interceptor
const fetchInterceptor = new FetchInterceptor();

export default fetchInterceptor;
