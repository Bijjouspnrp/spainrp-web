import React, { useEffect, useState, useRef } from 'react';
import './DiscordSection.css';
import { FaDiscord, FaUsers, FaShieldAlt, FaGift, FaArrowRight, FaHashtag, FaVolumeUp, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import canalesData from '../assets/canales.json';
import spainrpLogo from '../assets/spainrplogo.png';

const DiscordSection = () => {
  const [discord, setDiscord] = useState(null);
  const [canales, setCanales] = useState(canalesData);
  const [eliminando, setEliminando] = useState(null);
  const [ordenEditado, setOrdenEditado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
  fetch('/api/backend/discord/widget')
      .then(res => res.json())
      .then(data => {
        setDiscord(data);
      });
  }, []);

  const benefits = [
    {
      icon: <FaUsers />,
      title: 'Comunidad Activa',
      description: 'Más de 500 miembros activos compartiendo experiencias'
    },
    {
      icon: <FaShieldAlt />, 
      title: 'Roles Exclusivos',
      description: 'Accede a roles especiales y canales privados'
    },
    {
      icon: <FaGift />, 
      title: 'Eventos Regulares',
      description: 'Participa en eventos exclusivos y sorteos'
    }
  ];

  const getChannelIcon = (name) => {
    if (name.includes('🔊') || name.toLowerCase().includes('escena')) {
      return <FaVolumeUp className="channel-icon" />;
    }
    if (name.toLowerCase().includes('espera') || name.toLowerCase().includes('sts')) {
      return <FaVolumeUp className="channel-icon" />;
    }
    return <FaHashtag className="channel-icon" />;
  };

  // Cambia esto por tu ID real de servidor
  const SERVER_ID = '1212556680911650866';

  // Palabras clave para ocultar canales
  const palabrasClaveOcultas = [
    'ticket', 'log', 'logs', 'admin', 'staff', 'directiva', 'sancion', 'dudas', 'contactar',
    'oficina', 'autoroles', 'normativa', 'galería', 'liverys', 'radio', 'ck', 'apela', 'bot',
    'alianza', 'mara', 'mafia', 'corp', 'ooc', 'ic', 'sala legends', 'verano', 'limites', 'texturas',
    'miembros', 'postulaciones', 'encuesta', 'livery', 'security', 'anonimos', 'sanciones', 'warns',
    'generales', 'melonly', 'canales', 'dinero', 'mensajes', 'roles', 'mdt', 'reporte', 'apelaciones',
    'otros', 'games', 'claudia', 'pablosky', 'hugo', 'snpr', 'dni', 'rp', 'fair', 'play',
    'numerico', 'soportes', 'bijjou', 'bunta', 'grande', 'server', 'summer', 'información',
    'creacion_roles_canales', 'sala', 'legends', 'anuncios', 'maazgt1', 'zellman2', 'antimoros3000',
    'mumrikzx', 'emmanuel03235', 'aitorvvm3', 'papussii77862', 'yosoynico49', 'x1njectx', 'izan2221',
    'bobrpofi', 'pacoelfolleti', 'josepprimolejan', 'torito3343', 'devarthur22', 'azel147718',
    'sirmapacheee',
    // Repeticiones ignoradas por eficiencia
    'oficinas', 'especial', 'informacion', 'procesos', 'reglamento', 'beneficios', 'noticias',
    'principal', 'redes ic', 'gobierno', 'p. legislativo', 'jec', 'economia', 'trabajos', 'negocios',
    'cgjp', 'canales de voz', 'corporaciones ic', 'facciones ilegales', 'oposiciones ilegales',
    'tickets', 'administracion', 'auditoria', 'logs bot', 'logs tickets', 'jerarquia-soportes',
    'staff', 'aperturas', 'alertas', 'staff en servicio a', 'cks', 'staff en servicio b', 'niveles',
    'revision-whitelist', 'servidores-vinculados', 'eventos', 'escena 1', 'escena 2', 'escena',
    'boost', 'off-rol (chill)', 'servidores', 'entorno', 'afk', 'sts', '112',
    'ministerios', 'casa-real', 'poder-legislativo', 'constitución-española', 'junta-electoral-central',
    'campaña-electoral', 'papeles-vehículos', 'trabajos-autorole', 'salarios', 'asuntos-internos',
    'cni', 'mtms', 'bomberos', 'guardia-civil', 'anuncios-empresas', 'normativa mepresas',
    'armas', 'multas', 'demandas', 'antecedentes', 'arrestos', 'busqueda-captura', 'abogados',
    'normativa-legales', 'información', 'anuncios-ilegales', 'crear-pandilla', 'reclamar-robo',
    'desmantelaciones', 'organizaciones', 'sugerencias', 'chat-mafia-administrativa',
    'cds-cartel-de-sinaloa', 'los-vagos', 'aztecas', 'craneo-dorado', 'cúpula-administrativa',
    'comandos-staff', 'poner-sanciones', 'postulaciones-staff-ev', 'encuesta-satisfacción-logs',
    'liverys', 'log-anonimos', 'log-sanciones', 'logs-warns', 'log-generales', 'log-melonly',
    'logs-canales', 'log-dinero', 'log-mensajes', 'log-roles', 'estado-mdt', 'logs-bot',
    'logs-dudas-generales', 'logs-reportes-a-staff', 'logs-alianzas', 'logs-reportar-usuario',
    'logs-cks-y-apelaciones', 'logs-contactar-directiva', 'logs-otros', 'logs-liverys',
    'log-server', 'verano-2025', 'logs-dni', 'snpr', 'dni-2-pj', 'galería-rp', 'texturas',
    'tts', 'limites-de-velocidad', 'anuncios-soportes', 'mara-bunta-grande', 'sala-legends'
  ];
  

  // Normaliza un string: quita emojis, estilos, tildes, espacios, guiones, etc.
  function normalizarTexto(texto) {
    // Quitar emojis y símbolos no alfabéticos
    let limpio = texto.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{So}\p{Sk}\p{Sm}\p{Sc}\p{Cf}\p{Cn}]/gu, '');
    // Quitar caracteres no alfanuméricos (excepto letras y números)
    limpio = limpio.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/g, '');
    // Pasar a minúsculas
    limpio = limpio.toLowerCase();
    // Quitar tildes y diacríticos
    limpio = limpio.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Reemplazar letras Unicode estilizadas por normales (ejemplo básico)
    const unicodeMap = {
      '𝗮': 'a', '𝗯': 'b', '𝗰': 'c', '𝗱': 'd', '𝗲': 'e', '𝗳': 'f', '𝗴': 'g', '𝗵': 'h', '𝗶': 'i', '𝗷': 'j', '𝗸': 'k', '𝗹': 'l', '𝗺': 'm', '𝗻': 'n', '𝗼': 'o', '𝗽': 'p', '𝗾': 'q', '𝗿': 'r', '𝘀': 's', '𝘁': 't', '𝘂': 'u', '𝘃': 'v', '𝘄': 'w', '𝘅': 'x', '��': 'y', '𝘇': 'z',
      '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f', '𝐠': 'g', '𝐡': 'h', '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm', '𝐧': 'n', '𝐨': 'o', '𝐩': 'p', '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v', '𝐰': 'w', '𝐱': 'x', '𝐲': 'y', '𝐳': 'z',
      '𝑎': 'a', '𝑏': 'b', '𝑐': 'c', '𝑑': 'd', '𝑒': 'e', '𝑓': 'f', '𝑔': 'g', '𝑖': 'i', '𝑗': 'j', '𝑘': 'k', '𝑙': 'l', '𝑚': 'm', '𝑛': 'n', '𝑜': 'o', '𝑝': 'p', '𝑞': 'q', '𝑟': 'r', '𝑠': 's', '𝑡': 't', '𝑢': 'u', '𝑣': 'v', '𝑤': 'w', '𝑥': 'x', '��': 'y', '𝑧': 'z',
      // Agrega más si lo necesitas
    };
    limpio = limpio.replace(/[\u{1D400}-\u{1D7FF}]/gu, c => unicodeMap[c] || c);
    return limpio;
  }

  // Filtro avanzado: compara palabra por palabra
  const canalesFiltrados = canales.filter(canal => {
    const nombreNormalizado = normalizarTexto(canal.name);
    const palabrasNombre = nombreNormalizado.split(' ');
    return !palabrasNombre.some(palabra =>
      palabrasClaveOcultas.some(clave => palabra === normalizarTexto(clave))
    );
  });

  // Eliminar canal
  const eliminarCanal = async (id, nombre) => {
    setEliminando(id);
    try {
    const res = await fetch(`/api/canales/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCanales(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Error eliminando canal');
      }
    } catch (e) {
      alert('Error eliminando canal');
    }
    setEliminando(null);
  };

  // Mover canal arriba
  const moverArriba = (index) => {
    if (index === 0) return;
    const nuevos = [...canales];
    [nuevos[index - 1], nuevos[index]] = [nuevos[index], nuevos[index - 1]];
    setCanales(nuevos);
    setOrdenEditado(true);
  };
  // Mover canal abajo
  const moverAbajo = (index) => {
    if (index === canales.length - 1) return;
    const nuevos = [...canales];
    [nuevos[index], nuevos[index + 1]] = [nuevos[index + 1], nuevos[index]];
    setCanales(nuevos);
    setOrdenEditado(true);
  };
  // Guardar cambios definitivos
  const guardarCambios = async () => {
    setGuardando(true);
    try {
    const res = await fetch('/api/canales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(canales)
      });
      if (res.ok) {
        setOrdenEditado(false);
        alert('¡Orden guardado correctamente!');
      } else {
        alert('Error guardando el orden');
      }
    } catch (e) {
      alert('Error guardando el orden');
    }
    setGuardando(false);
  };

  // Referencias para navegación por teclado
  const channelRefs = useRef([]);

  // Manejar navegación por teclado
  const handleKeyDown = (e, idx, canal) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (channelRefs.current[idx + 1]) channelRefs.current[idx + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (channelRefs.current[idx - 1]) channelRefs.current[idx - 1].focus();
    } else if (e.key === 'Enter') {
      window.open(`https://discord.com/channels/${SERVER_ID}/${canal.id}`, '_blank');
    }
  };

  return (
    <section id="discord" className="discord-section">
      <div className="container">
        <div className="discord-content">
          <div className="discord-left">
            <div className="discord-badge">
              <FaDiscord />
              <span>Discord Oficial</span>
            </div>
            
            <h2 className="discord-title">
              Únete a Nuestra <span className="highlight">Comunidad</span>
            </h2>
            <p className="discord-description">
              Miembros activos: <b>{discord ? discord.presence_count : 'Cargando...'}</b>
            </p>
            <div className="discord-benefits">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item">
                  <div className="benefit-icon">
                    {benefit.icon}
                  </div>
                  <div className="benefit-content">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <a 
              href={discord ? discord.instant_invite : "#"}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-discord discord-cta"
            >
              <FaDiscord />
              Unirse Ahora
              <FaArrowRight />
            </a>
          </div>
          <div className="discord-right">
            <div className="discord-preview">
              <div className="discord-header">
                <div className="discord-server-info">
                  <img 
                    src={spainrpLogo}
                    alt="SpainRP Logo"
                    className="discord-server-icon"
                  />
                  <div>
                    <h3>{discord ? discord.name : "SpainRP ERLC"}</h3>
                    <p>Servidor de Roleplay</p>
                  </div>
                </div>
                <div className="discord-status">
                  <div className="status-indicator online"></div>
                  <span>Online</span>
                </div>
              </div>
              <div className="discord-channels">
                {canalesFiltrados && canalesFiltrados.length > 0 ? (
                  canalesFiltrados.map((canal, idx) => (
                    <div
                      key={canal.id}
                      className="channel fade-in-up"
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <a
                        href={`https://discord.com/channels/${SERVER_ID}/${canal.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1, position: 'relative' }}
                        tabIndex={0}
                        ref={el => channelRefs.current[idx] = el}
                        onKeyDown={e => handleKeyDown(e, idx, canal)}
                        title={canal.topic || canal.description || 'Canal de Discord'}
                        className="channel-link"
                      >
                        {getChannelIcon(canal.name)}
                        {canal.name}
                        {canal.topic && (
                          <span className="channel-tooltip">{canal.topic}</span>
                        )}
                      </a>
                    </div>
                  ))
                ) : (
                  <div>No hay canales para mostrar.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection; 