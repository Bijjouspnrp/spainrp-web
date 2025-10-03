import React, { useEffect, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaInfoCircle, FaShieldAlt, FaUserShield, FaLock, FaExclamationTriangle, FaAppStore, FaDiscord } from 'react-icons/fa';

const sectionStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '1.5rem',
  borderRadius: '12px',
  marginBottom: '1rem',
  border: '1px solid rgba(114, 137, 218, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden'
};

// Componente de sección interactiva
const InteractiveSection = ({ title, children, icon, isExpanded, onToggle, highlight = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...sectionStyle,
        background: highlight 
          ? 'rgba(255, 193, 7, 0.1)' 
          : isHovered 
            ? 'rgba(114, 137, 218, 0.1)' 
            : 'rgba(255,255,255,0.05)',
        borderColor: highlight 
          ? 'rgba(255, 193, 7, 0.3)' 
          : isHovered 
            ? 'rgba(114, 137, 218, 0.3)' 
            : 'rgba(114, 137, 218, 0.1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 8px 25px rgba(114, 137, 218, 0.15)' 
          : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggle}
    >
      {/* Efecto de brillo animado */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(114, 137, 218, 0.1), transparent)',
        transition: 'left 0.6s ease',
        animation: isHovered ? 'shimmer 1.5s ease-in-out' : 'none'
      }} />
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '1rem' : '0',
        transition: 'margin-bottom 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {icon && <span style={{ color: '#FFD700', fontSize: '18px' }}>{icon}</span>}
          <h2 style={{ 
            margin: 0, 
            color: highlight ? '#FFD700' : '#fff',
            fontSize: '1.25rem',
            fontWeight: '600',
            transition: 'color 0.3s ease'
          }}>
            {title}
          </h2>
        </div>
        <div style={{
          color: '#7289da',
          fontSize: '14px',
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>
      
      <div style={{
        maxHeight: isExpanded ? '1000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease, opacity 0.3s ease',
        opacity: isExpanded ? 1 : 0
      }}>
        {children}
      </div>
    </div>
  );
};

const Terms = () => {
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const smoothScrollWithOffset = (el, offset = 80) => {
      const y = (el?.getBoundingClientRect()?.top || 0) + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };

    const handleHash = () => {
      const h = window.location.hash;
      if (h) {
        const id = h.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          smoothScrollWithOffset(el);
          // Expandir la sección correspondiente
          setExpandedSections(prev => ({ ...prev, [id]: true }));
        }
      }
    };

    // Intento inicial tras montar
    setTimeout(handleHash, 50);
    // Escuchar cambios de hash mientras estamos en Terms
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '6rem 1rem 2rem 1rem', // Añadir padding-top para la navbar
      marginTop: '64px' // Espacio para la navbar fija
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header animado */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <h1 style={{ 
            marginBottom: '1rem',
            fontSize: '2.5rem',
            background: 'linear-gradient(135deg, #FFD700 0%, #7289da 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 'bold',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            Términos y Condiciones
          </h1>
          <p style={{ 
            opacity: 0.85, 
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            Bienvenido a SpainRP. Al acceder y utilizar nuestro sitio web y servicios, aceptas estos términos y condiciones.
            Te recomendamos leerlos detenidamente.
          </p>
          
          {/* Indicador de interacción */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#7289da',
            fontSize: '14px',
            marginTop: '1rem',
            animation: 'pulse 2s infinite'
          }}>
            <FaInfoCircle />
            <span>Haz clic en cada sección para expandir</span>
          </div>
        </div>

        <InteractiveSection
          title="1. Aceptación de los términos"
          icon={<FaShieldAlt />}
          isExpanded={expandedSections['acceptance']}
          onToggle={() => toggleSection('acceptance')}
          highlight={true}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Al utilizar este sitio, confirmas que tienes la capacidad legal para aceptar estos términos y que cumples con
              todas las leyes y regulaciones aplicables. Estos términos constituyen un acuerdo legal vinculante entre tú y SpainRP.
            </p>
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '1rem'
            }}>
              <p style={{ 
                opacity: 0.9, 
                fontWeight: 'bold', 
                color: '#FFD700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaExclamationTriangle />
                IMPORTANTE: Al iniciar sesión en el panel, aceptas automáticamente estos términos y condiciones actualizados.
              </p>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="2. Uso del servicio"
          icon={<FaUserShield />}
          isExpanded={expandedSections['service-usage']}
          onToggle={() => toggleSection('service-usage')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Te comprometes a utilizar el sitio y los servicios de forma responsable y a no llevar a cabo actividades que
              puedan dañar, interrumpir o afectar negativamente a la experiencia de otros usuarios. Cualquier intento de
              vulnerar la seguridad o explotar fallos será motivo de suspensión.
            </p>
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                💡 ¿Qué significa esto?
              </h4>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                Debes usar el sitio de manera ética, respetando a otros usuarios y no intentando romper o explotar el sistema.
              </p>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="3. Cuentas, inicio de sesión con Discord y seguridad"
          icon={<FaLock />}
          isExpanded={expandedSections['discord-auth']}
          onToggle={() => toggleSection('discord-auth')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Para acceder a áreas privadas (p. ej., el panel) utilizamos autenticación mediante Discord. Al iniciar sesión,
              aceptas que obtengamos la información básica de tu perfil de Discord necesaria para identificarte y verificar
              tu pertenencia al servidor. Eres responsable de mantener la confidencialidad de tus credenciales y de la
              seguridad del dispositivo desde el que accedes. Notifícanos inmediatamente si detectas accesos no autorizados.
            </p>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Podremos revocar el acceso a tu cuenta si incumples estos términos, las normas de la comunidad o las políticas
              de Discord.
            </p>
            
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                🔐 Datos que recopilamos de Discord:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Tu ID de usuario único</li>
                <li>Nombre de usuario y avatar</li>
                <li>Roles y permisos en el servidor</li>
                <li>Estado de verificación</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="4. Bot de Discord y permisos"
          icon={<FaShieldAlt />}
          isExpanded={expandedSections['discord-bot']}
          onToggle={() => toggleSection('discord-bot')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              El bot de Discord asociado a SpainRP puede requerir permisos para moderación, gestión de roles, lectura de
              mensajes en canales designados y otras funciones destinadas al correcto funcionamiento de la comunidad. El bot
              puede registrar eventos básicos (p. ej., unirte/abandonar, asignación de roles, ejecución de comandos) con
              fines de auditoría y mejora del servicio. No utilizamos estos datos con fines comerciales.
            </p>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              La manipulación, abuso o intento de explotación del bot resultará en sanciones y posible expulsión del
              servidor.
            </p>
            
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                🤖 Permisos del bot:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Gestión de roles y permisos</li>
                <li>Moderación de mensajes</li>
                <li>Registro de actividad</li>
                <li>Verificación de usuarios</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="5. Servidor de Roleplay (ERLC) y normas"
          icon={<FaUserShield />}
          isExpanded={expandedSections['erlc-rules']}
          onToggle={() => toggleSection('erlc-rules')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              El roleplay en ERLC debe realizarse respetando las reglas internas (incluyendo Fair Play, No RDM/VDM, respeto
              a jerarquías y coherencia de personaje). El incumplimiento de las normas de roleplay podrá conllevar sanciones
              dentro del servidor (advertencias, expulsiones temporales o permanentes) a criterio del equipo de moderación.
            </p>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Las sanciones dentro del juego o del servidor de Discord pueden aplicarse de forma independiente o conjunta
              cuando corresponda. Las decisiones del staff están orientadas a proteger la experiencia de la comunidad.
            </p>
            
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#FFD700', margin: '0 0 8px 0', fontSize: '14px' }}>
                🎮 Reglas principales de ERLC:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Fair Play - Juego limpio</li>
                <li>No RDM/VDM - Sin matar sin razón</li>
                <li>Respeto a jerarquías</li>
                <li>Coherencia de personaje</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="6. Moderación, sanciones y conducta"
          icon={<FaExclamationTriangle />}
          isExpanded={expandedSections['moderation']}
          onToggle={() => toggleSection('moderation')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              No se tolerarán conductas ilícitas, acoso, discurso de odio, doxxing, trampas, ni intentos de eludir sanciones.
              El equipo de moderación puede tomar medidas según la gravedad del caso. La reiteración de infracciones puede
              derivar en expulsión permanente.
            </p>
            
            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#e74c3c', margin: '0 0 8px 0', fontSize: '14px' }}>
                ⚠️ Conductas prohibidas:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Acoso o discurso de odio</li>
                <li>Doxxing (revelar información personal)</li>
                <li>Trampas o exploits</li>
                <li>Intentar eludir sanciones</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="7. Uso de Apps y Herramientas"
          icon={<FaAppStore />}
          isExpanded={expandedSections['apps-tools']}
          onToggle={() => toggleSection('apps-tools')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              SpainRP ofrece diversas aplicaciones y herramientas para mejorar tu experiencia en la comunidad. 
              Al utilizar estas herramientas, aceptas cumplir con las normas específicas de cada una.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>7.1 TinderRP - App de Citas</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Debes ser mayor de 18 años para usar TinderRP<br/>
              • Prohibido contenido inapropiado o ofensivo<br/>
              • No compartir información personal real<br/>
              • Respetar las decisiones de otros usuarios<br/>
              • Reportar perfiles falsos o inapropiados
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>7.2 BlackMarket - Marketplace Virtual</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Solo transacciones con moneda virtual del servidor<br/>
              • Prohibido el intercambio por dinero real (RMT)<br/>
              • Descripciones honestas de productos<br/>
              • Respetar los precios de mercado establecidos<br/>
              • Reportar estafas o productos falsos
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>7.3 StockMarket - Trading Virtual</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • No manipular precios artificialmente<br/>
              • Prohibido el uso de bots para trading<br/>
              • Respetar las reglas de mercado<br/>
              • No compartir información privilegiada<br/>
              • Asumir responsabilidad por pérdidas
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>7.4 Minijuegos y Entretenimiento</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Juego limpio en todas las competencias<br/>
              • Respetar a otros jugadores<br/>
              • No explotar bugs o glitches<br/>
              • Aceptar resultados de forma deportiva<br/>
              • Reportar problemas técnicos
            </p>

            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                🎮 Apps disponibles:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>TinderRP - Sistema de citas virtual</li>
                <li>BlackMarket - Marketplace de productos</li>
                <li>StockMarket - Trading de acciones virtuales</li>
                <li>MinijuegosRP - Juegos y competencias</li>
                <li>Panel de Usuario - Gestión de perfil</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="8. Seguridad y Anti-Cheat"
          icon={<FaShieldAlt />}
          isExpanded={expandedSections['security-anticheat']}
          onToggle={() => toggleSection('security-anticheat')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Implementamos sistemas avanzados de seguridad para mantener un entorno justo y seguro para todos los usuarios. 
              Cualquier intento de vulnerar estos sistemas resultará en sanciones inmediatas.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>8.1 Sistemas de Detección</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Monitoreo automático de patrones sospechosos<br/>
              • Detección de bots y scripts no autorizados<br/>
              • Análisis de comportamiento anómalo<br/>
              • Verificación de identidad en transacciones<br/>
              • Logs detallados de todas las actividades
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>8.2 Prohibiciones Estrictas</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Uso de bots, macros o scripts automatizados<br/>
              • Explotación de bugs o vulnerabilidades<br/>
              • Manipulación de datos del cliente<br/>
              • Intentos de acceso no autorizado<br/>
              • Interferencia con sistemas de seguridad
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>8.3 Medidas de Seguridad de la Página</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Cifrado SSL/TLS para todas las comunicaciones<br/>
              • Autenticación de dos factores (2FA) disponible<br/>
              • Tokens JWT seguros para sesiones<br/>
              • Rate limiting para prevenir ataques<br/>
              • Monitoreo continuo de seguridad
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>8.4 Sanciones por Violaciones</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Primera infracción: Advertencia y suspensión temporal<br/>
              • Segunda infracción: Suspensión prolongada<br/>
              • Infracciones graves: Baneo permanente<br/>
              • Apelación disponible en 48 horas<br/>
              • No hay reembolsos por sanciones
            </p>

            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#e74c3c', margin: '0 0 8px 0', fontSize: '14px' }}>
                ⚠️ Reporta actividades sospechosas:
              </h4>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                Si detectas comportamientos sospechosos, reporta inmediatamente a BijjouPro08 en Discord. 
                Mantenemos la confidencialidad de los reportantes.
              </p>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="9. Integración con Plataformas"
          icon={<FaDiscord />}
          isExpanded={expandedSections['platform-integration']}
          onToggle={() => toggleSection('platform-integration')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              SpainRP se integra con múltiples plataformas para ofrecerte una experiencia completa. 
              Cada integración tiene sus propios términos y condiciones que debes cumplir.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>9.1 Discord Integration</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Bot oficial con permisos de moderación<br/>
              • Sincronización de roles y permisos<br/>
              • Comandos automáticos y notificaciones<br/>
              • Verificación de identidad mediante Discord<br/>
              • Cumplimiento con Discord Terms of Service
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>9.2 Roblox/ERLC Integration</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Verificación de cuentas de Roblox<br/>
              • Sincronización de avatares y datos<br/>
              • Sistema de roles vinculado al juego<br/>
              • Cumplimiento con Roblox Terms of Service<br/>
              • Prohibido el uso de exploits o hacks
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>9.3 APIs Externas</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Servicios de hosting (Render.com)<br/>
              • APIs de verificación de identidad<br/>
              • Servicios de análisis y métricas<br/>
              • CDN para contenido multimedia<br/>
              • Servicios de backup y almacenamiento
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>9.4 Sincronización de Datos</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • Datos de perfil sincronizados entre plataformas<br/>
              • Historial de actividad compartido<br/>
              • Preferencias de usuario unificadas<br/>
              • Sistema de notificaciones cruzadas<br/>
              • Backup automático en múltiples servicios
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>9.5 Limitaciones de Terceros</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              • No controlamos la disponibilidad de servicios externos<br/>
              • Cambios en APIs pueden afectar funcionalidades<br/>
              • Políticas de terceros pueden cambiar sin aviso<br/>
              • No nos responsabilizamos por fallos externos<br/>
              • Mantenemos alternativas cuando es posible
            </p>

            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                🔗 Plataformas integradas:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Discord - Comunicación y verificación</li>
                <li>Roblox/ERLC - Juego principal</li>
                <li>Render.com - Hosting y servicios</li>
                <li>APIs de verificación - Seguridad</li>
                <li>CDN - Entrega de contenido</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="10. Edad mínima"
          icon={<FaUserShield />}
          isExpanded={expandedSections['age-requirement']}
          onToggle={() => toggleSection('age-requirement')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Debes cumplir con las políticas de Discord (mínimo 13 años o la edad mínima legal aplicable en tu país) para
              usar los servicios y participar en la comunidad.
            </p>
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                📅 Verificación de edad:
              </h4>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                Al unirte al servidor de Discord, confirmas que cumples con los requisitos de edad mínima establecidos.
              </p>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="11. Contenidos de usuario"
          icon={<FaUserShield />}
          isExpanded={expandedSections['user-content']}
          onToggle={() => toggleSection('user-content')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Eres responsable del contenido que publiques o compartas. Al publicar, otorgas a SpainRP una licencia
              no exclusiva, mundial y libre de regalías para mostrar dicho contenido en el contexto de la comunidad.
              No publiques materiales que infrinjan derechos de terceros o la legislación vigente.
            </p>
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                📝 Tipos de contenido permitido:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Contenido relacionado con roleplay</li>
                <li>Imágenes y videos apropiados</li>
                <li>Textos y mensajes respetuosos</li>
                <li>Contenido original del usuario</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="12. Propiedad intelectual"
          icon={<FaLock />}
          isExpanded={expandedSections['intellectual-property']}
          onToggle={() => toggleSection('intellectual-property')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Todo el contenido, marcas, logotipos y materiales del sitio son propiedad de SpainRP o de sus respectivos
              titulares y están protegidos por leyes de propiedad intelectual.
            </p>
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#FFD700', margin: '0 0 8px 0', fontSize: '14px' }}>
                ⚖️ Derechos protegidos:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Logotipos y marcas de SpainRP</li>
                <li>Código fuente y algoritmos</li>
                <li>Diseños y elementos gráficos</li>
                <li>Contenido original del sitio</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="13. Servicios de terceros y limitación de responsabilidad"
          icon={<FaShieldAlt />}
          isExpanded={expandedSections['third-party-services']}
          onToggle={() => toggleSection('third-party-services')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>13.1 Servicios integrados</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Utilizamos los siguientes servicios de terceros:
              <br/>• <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#7289da' }}>Discord Terms of Service</a>
              <br/>• <a href="https://www.roblox.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#7289da' }}>ERLC (Emergency Response: Liberty County) Terms</a>
              <br/>• APIs externas para funcionalidades del sitio
              <br/>• Servicios de hosting compartido (Render.com)
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>13.2 Limitación de responsabilidad por servicios externos</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              <strong>NO NOS RESPONSABILIZAMOS</strong> por:
              <br/>• Caídas o interrupciones de las APIs de Discord
              <br/>• Fallos en los servicios de ERLC o Roblox
              <br/>• Indisponibilidad del host del bot externo compartido
              <br/>• Cambios en las políticas de terceros que afecten nuestro servicio
              <br/>• Pérdida de datos debido a fallos de servicios externos
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>13.3 Protección contra contenido ilegal</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Implementamos medidas para detectar y eliminar contenido ilegal, pero no podemos garantizar la detección 
              del 100% del contenido inapropiado. Los usuarios son responsables del contenido que publican. Reporta 
              contenido ilegal contactando a <strong>BijjouPro08</strong> inmediatamente.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>13.4 Prohibición de ingeniería inversa</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Está <strong>estrictamente prohibido</strong>:
              <br/>• Realizar ingeniería inversa de nuestro código fuente
              <br/>• Intentar extraer o replicar nuestros algoritmos
              <br/>• Crear bots o scripts que imiten nuestra funcionalidad
              <br/>• Intentar acceder a APIs no públicas
              <br/>• Cualquier intento de explotar vulnerabilidades del sistema
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>13.5 Monitoreo y análisis</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Recopilamos datos de uso para mejorar nuestros servicios:
              <br/>• Métricas de rendimiento y errores
              <br/>• Patrones de uso del sitio web
              <br/>• Datos de conexión y sesiones
              <br/>• Estadísticas de moderación y actividad
              <br/>• Información de debugging para resolver problemas
            </p>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="14. Política de datos y privacidad detallada"
          icon={<FaLock />}
          isExpanded={expandedSections['privacy']}
          onToggle={() => toggleSection('privacy')}
          id="privacy"
        >
          <div style={{ paddingLeft: '30px' }}>
            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.1 Retención de datos de Discord</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Guardamos los siguientes datos de tu cuenta de Discord por un período de <strong>2 años</strong> desde tu último acceso:
              <br/>• ID de usuario de Discord
              <br/>• Nombre de usuario y avatar
              <br/>• Roles y permisos en el servidor
              <br/>• Historial de actividad en el panel
              <br/>• Datos de verificación de Roblox (si aplica)
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.2 Derechos del usuario (GDPR)</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Tienes derecho a solicitar la eliminación de tus datos personales. Para hacerlo, contacta directamente con 
              <strong> BijjouPro08</strong> mediante Discord. Procesaremos tu solicitud en un plazo máximo de 30 días.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.3 Base legal para procesamiento</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Procesamos tus datos basándonos en tu <strong>consentimiento explícito</strong> al iniciar sesión y en nuestro 
              <strong>interés legítimo</strong> para proporcionar servicios de la comunidad y moderación.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.4 Datos que recopilamos</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Nuestro bot de Discord puede leer:
              <br/>• Mensajes en canales específicos (para moderación)
              <br/>• Información de perfil público
              <br/>• Actividad de roles y permisos
              <br/>• Comandos ejecutados y respuestas
              <br/>• Datos de conexión y uso del servicio
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.5 Backup y protección de datos</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Implementamos las siguientes medidas de protección:
              <br/>• Cifrado de datos sensibles en reposo
              <br/>• Backups automáticos diarios con retención de 30 días
              <br/>• Acceso restringido solo a administradores autorizados
              <br/>• Monitoreo de accesos y cambios en los datos
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>14.6 Brechas de seguridad</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              En caso de filtración de datos, notificaremos a los usuarios afectados en un plazo máximo de 72 horas 
              mediante Discord y publicaremos un aviso en nuestro sitio web. Reporta cualquier incidente de seguridad 
              contactando a <strong>BijjouPro08</strong> inmediatamente.
            </p>

            <p style={{ opacity: 0.85, marginTop: '1rem' }}>
              Puedes gestionar tus preferencias de cookies en la página de <a href="/cookies" style={{ color: '#7289da' }}>Política de
              Cookies</a>.
            </p>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="15. Disponibilidad y mantenimiento"
          icon={<FaInfoCircle />}
          isExpanded={expandedSections['availability']}
          onToggle={() => toggleSection('availability')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Podríamos interrumpir temporalmente el servicio por mantenimiento, actualizaciones o incidencias ajenas
              (incluyendo servicios de terceros como Discord o la plataforma ERLC). Intentaremos minimizar el impacto cuando
              sea posible.
            </p>
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                🔧 Mantenimientos programados:
              </h4>
              <p style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
                Los mantenimientos se anuncian con 24 horas de antelación en el servidor de Discord.
              </p>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="16. Limitación de responsabilidad"
          icon={<FaExclamationTriangle />}
          isExpanded={expandedSections['liability']}
          onToggle={() => toggleSection('liability')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              El sitio se ofrece "tal cual" y "según disponibilidad". En la medida permitida por la ley, no asumimos
              responsabilidad por daños indirectos, incidentales o consecuentes derivados del uso del sitio.
            </p>
            <div style={{
              background: 'rgba(231, 76, 60, 0.1)',
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#e74c3c', margin: '0 0 8px 0', fontSize: '14px' }}>
                ⚠️ Limitaciones importantes:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>No garantizamos disponibilidad 100%</li>
                <li>No nos responsabilizamos por pérdida de datos</li>
                <li>Servicio proporcionado "como está"</li>
                <li>Limitaciones según la ley aplicable</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="17. Modificaciones y notificación de cambios"
          icon={<FaInfoCircle />}
          isExpanded={expandedSections['modifications']}
          onToggle={() => toggleSection('modifications')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Nos reservamos el derecho de actualizar estos términos en cualquier momento. Los cambios entrarán en vigor al
              publicarse en esta página.
            </p>
            
            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>17.1 Notificación de cambios importantes</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Para cambios significativos que afecten tus derechos o el uso del servicio, te notificaremos mediante:
              <br/>• Mensaje en el servidor de Discord
              <br/>• Aviso destacado en el panel de usuario
              <br/>• Email (si proporcionaste uno)
              <br/>• Banner de notificación en el sitio web
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>17.2 Aceptación de cambios</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              El uso continuado del servicio después de la publicación de cambios constituye tu aceptación de los nuevos términos.
              Si no estás de acuerdo con los cambios, debes dejar de usar el servicio y contactar a <strong>BijjouPro08</strong> 
              para solicitar la eliminación de tus datos.
            </p>

            <h3 style={{ color: '#FFD700', marginTop: '1rem', marginBottom: '0.5rem' }}>17.3 Historial de versiones</h3>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Mantenemos un registro de todas las modificaciones importantes en nuestros términos. Puedes solicitar el 
              historial completo contactando a <strong>BijjouPro08</strong>.
            </p>
          </div>
        </InteractiveSection>

        <InteractiveSection
          title="18. Contacto"
          icon={<FaUserShield />}
          isExpanded={expandedSections['contact']}
          onToggle={() => toggleSection('contact')}
        >
          <div style={{ paddingLeft: '30px' }}>
            <p style={{ opacity: 0.85, marginBottom: '1rem', lineHeight: '1.6' }}>
              Si tienes preguntas acerca de estos términos, contáctanos a través de nuestro servidor de Discord.
            </p>
            <div style={{
              background: 'rgba(114, 137, 218, 0.1)',
              border: '1px solid rgba(114, 137, 218, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '1rem'
            }}>
              <h4 style={{ color: '#7289da', margin: '0 0 8px 0', fontSize: '14px' }}>
                📞 Formas de contacto:
              </h4>
              <ul style={{ opacity: 0.8, margin: 0, fontSize: '13px', lineHeight: '1.5', paddingLeft: '16px' }}>
                <li>Servidor de Discord: <a href="https://discord.gg/sMzFgFQHXA" style={{ color: '#7289da' }}>Unirse aquí</a></li>
                <li>Administrador: BijjouPro08</li>
                <li>Respuesta en 24-48 horas</li>
                <li>Idioma: Español</li>
              </ul>
            </div>
          </div>
        </InteractiveSection>
      </div>
      
      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .section-animate {
          animation: slideInFromLeft 0.6s ease-out;
        }
        
        .highlight-pulse {
          animation: pulse 2s infinite;
        }
        
        .bounce-hover:hover {
          animation: bounce 0.6s ease;
        }
      `}</style>
    </div>
  );
};

export default Terms;


