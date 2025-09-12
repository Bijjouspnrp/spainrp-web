import React, { useEffect } from 'react';

const sectionStyle = {
  background: 'rgba(255,255,255,0.05)',
  padding: '1.5rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};

const Terms = () => {
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
        if (el) smoothScrollWithOffset(el);
      }
    };

    // Intento inicial tras montar
    setTimeout(handleHash, 50);
    // Escuchar cambios de hash mientras estamos en Terms
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div style={{
      minHeight: '60vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: 'white',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Términos y Condiciones</h1>
        <p style={{ opacity: 0.85, marginBottom: '2rem' }}>
          Bienvenido a SpainRP. Al acceder y utilizar nuestro sitio web y servicios, aceptas estos términos y condiciones.
          Te recomendamos leerlos detenidamente.
        </p>

        <div style={sectionStyle}>
          <h2>1. Aceptación de los términos</h2>
          <p style={{ opacity: 0.85 }}>
            Al utilizar este sitio, confirmas que tienes la capacidad legal para aceptar estos términos y que cumples con
            todas las leyes y regulaciones aplicables.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>2. Uso del servicio</h2>
          <p style={{ opacity: 0.85 }}>
            Te comprometes a utilizar el sitio y los servicios de forma responsable y a no llevar a cabo actividades que
            puedan dañar, interrumpir o afectar negativamente a la experiencia de otros usuarios. Cualquier intento de
            vulnerar la seguridad o explotar fallos será motivo de suspensión.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>3. Cuentas, inicio de sesión con Discord y seguridad</h2>
          <p style={{ opacity: 0.85 }}>
            Para acceder a áreas privadas (p. ej., el panel) utilizamos autenticación mediante Discord. Al iniciar sesión,
            aceptas que obtengamos la información básica de tu perfil de Discord necesaria para identificarte y verificar
            tu pertenencia al servidor. Eres responsable de mantener la confidencialidad de tus credenciales y de la
            seguridad del dispositivo desde el que accedes. Notifícanos inmediatamente si detectas accesos no autorizados.
          </p>
          <p style={{ opacity: 0.85 }}>
            Podremos revocar el acceso a tu cuenta si incumples estos términos, las normas de la comunidad o las políticas
            de Discord.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>4. Bot de Discord y permisos</h2>
          <p style={{ opacity: 0.85 }}>
            El bot de Discord asociado a SpainRP puede requerir permisos para moderación, gestión de roles, lectura de
            mensajes en canales designados y otras funciones destinadas al correcto funcionamiento de la comunidad. El bot
            puede registrar eventos básicos (p. ej., unirte/abandonar, asignación de roles, ejecución de comandos) con
            fines de auditoría y mejora del servicio. No utilizamos estos datos con fines comerciales.
          </p>
          <p style={{ opacity: 0.85 }}>
            La manipulación, abuso o intento de explotación del bot resultará en sanciones y posible expulsión del
            servidor.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>5. Servidor de Roleplay (ERLC) y normas</h2>
          <p style={{ opacity: 0.85 }}>
            El roleplay en ERLC debe realizarse respetando las reglas internas (incluyendo Fair Play, No RDM/VDM, respeto
            a jerarquías y coherencia de personaje). El incumplimiento de las normas de roleplay podrá conllevar sanciones
            dentro del servidor (advertencias, expulsiones temporales o permanentes) a criterio del equipo de moderación.
          </p>
          <p style={{ opacity: 0.85 }}>
            Las sanciones dentro del juego o del servidor de Discord pueden aplicarse de forma independiente o conjunta
            cuando corresponda. Las decisiones del staff están orientadas a proteger la experiencia de la comunidad.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>6. Moderación, sanciones y conducta</h2>
          <p style={{ opacity: 0.85 }}>
            No se tolerarán conductas ilícitas, acoso, discurso de odio, doxxing, trampas, ni intentos de eludir sanciones.
            El equipo de moderación puede tomar medidas según la gravedad del caso. La reiteración de infracciones puede
            derivar en expulsión permanente.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>7. Edad mínima</h2>
          <p style={{ opacity: 0.85 }}>
            Debes cumplir con las políticas de Discord (mínimo 13 años o la edad mínima legal aplicable en tu país) para
            usar los servicios y participar en la comunidad.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>8. Contenidos de usuario</h2>
          <p style={{ opacity: 0.85 }}>
            Eres responsable del contenido que publiques o compartas. Al publicar, otorgas a SpainRP una licencia
            no exclusiva, mundial y libre de regalías para mostrar dicho contenido en el contexto de la comunidad.
            No publiques materiales que infrinjan derechos de terceros o la legislación vigente.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>9. Propiedad intelectual</h2>
          <p style={{ opacity: 0.85 }}>
            Todo el contenido, marcas, logotipos y materiales del sitio son propiedad de SpainRP o de sus respectivos
            titulares y están protegidos por leyes de propiedad intelectual.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>10. Enlaces y servicios de terceros</h2>
          <p style={{ opacity: 0.85 }}>
            Podemos integrar servicios o enlaces de terceros (p. ej., Discord). No nos responsabilizamos por el contenido
            o prácticas de privacidad de dichos terceros.
          </p>
        </div>

        <div style={sectionStyle} id="privacy">
          <h2>11. Privacidad y cookies</h2>
          <p style={{ opacity: 0.85 }}>
            Puedes gestionar tus preferencias de cookies en la página de <a href="/cookies" style={{ color: '#7289da' }}>Política de
            Cookies</a>. El uso de datos personales cumple con la normativa aplicable y se limita a lo necesario para el
            funcionamiento del sitio y la comunidad.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>12. Disponibilidad y mantenimiento</h2>
          <p style={{ opacity: 0.85 }}>
            Podríamos interrumpir temporalmente el servicio por mantenimiento, actualizaciones o incidencias ajenas
            (incluyendo servicios de terceros como Discord o la plataforma ERLC). Intentaremos minimizar el impacto cuando
            sea posible.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>13. Limitación de responsabilidad</h2>
          <p style={{ opacity: 0.85 }}>
            El sitio se ofrece "tal cual" y "según disponibilidad". En la medida permitida por la ley, no asumimos
            responsabilidad por daños indirectos, incidentales o consecuentes derivados del uso del sitio.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>14. Modificaciones</h2>
          <p style={{ opacity: 0.85 }}>
            Nos reservamos el derecho de actualizar estos términos en cualquier momento. Los cambios entrarán en vigor al
            publicarse en esta página.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2>15. Contacto</h2>
          <p style={{ opacity: 0.85 }}>
            Si tienes preguntas acerca de estos términos, contáctanos a través de nuestro servidor de Discord.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;


