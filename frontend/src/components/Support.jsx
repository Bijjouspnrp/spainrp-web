import React, { useState, useEffect } from 'react';
import { 
  FaDiscord, 
  FaTelegram, 
  FaEnvelope, 
  FaQuestionCircle, 
  FaHeadset, 
  FaBug, 
  FaCog, 
  FaShieldAlt, 
  FaGamepad, 
  FaComments,
  FaTicketAlt,
  FaUserSecret,
  FaGavel,
  FaBuilding,
  FaMoneyBillWave,
  FaCar,
  FaUserTie,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaVideo,
  FaStream,
  FaYoutube,
  FaTwitch,
  FaCommentsDollar,
  FaUserFriends,
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaCircle,
  FaUserCheck
} from 'react-icons/fa';
import io from 'socket.io-client';
import './Support.css';

const Support = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [moderatorOnline, setModeratorOnline] = useState(true);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(null);

  // Detección de móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener información del usuario
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[SUPPORT] 🔍 Token encontrado:', token ? 'Sí' : 'No');
        
        if (!token) {
          console.log('[SUPPORT] ❌ No hay token, usuario no logueado');
      return;
    }

        const apiUrl = process.env.REACT_APP_API_URL || 'https://spainrp-oficial.onrender.com';
        console.log('[SUPPORT] 🌐 Haciendo petición a /auth/me...', apiUrl);
        
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('[SUPPORT] 📡 Respuesta de /auth/me:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[SUPPORT] 👤 Datos del usuario:', data);
          setUser(data.user);
    } else {
          console.log('[SUPPORT] ❌ Error en autenticación:', response.status);
          const errorText = await response.text();
          console.log('[SUPPORT] ❌ Error details:', errorText);
        }
      } catch (error) {
        console.error('[SUPPORT] ❌ Error obteniendo información del usuario:', error);
      }
    };

    getUserInfo();
  }, []);

  // Configurar Socket.IO con mejor manejo de errores
  useEffect(() => {
    console.log('[SUPPORT] Inicializando Socket.IO...');
    console.log('[SUPPORT] Usuario actual:', user);
    
    // Inicializar Socket.IO independientemente del usuario
    // El usuario se usará cuando esté disponible
    
    const newSocket = io(process.env.REACT_APP_API_URL || 'https://spainrp-oficial.onrender.com', {
      transports: ['polling'], // Solo polling para compatibilidad con Render
      upgrade: false, // Deshabilitar upgrade a WebSocket
      timeout: 15000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      maxReconnectionAttempts: 5,
      forceNew: true,
      autoConnect: true
    });

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('[SUPPORT][Socket] ✅ Conectado a Socket.IO');
      console.log('[SUPPORT][Socket] ID de conexión:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[SUPPORT][Socket] ❌ Desconectado de Socket.IO');
      console.log('[SUPPORT][Socket] Razón:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[SUPPORT][Socket] ❌ Error de conexión:', error);
      console.error('[SUPPORT][Socket] Tipo de error:', error.type);
      console.error('[SUPPORT][Socket] Descripción:', error.description);
      console.error('[SUPPORT][Socket] Mensaje:', error.message);
      console.error('[SUPPORT][Socket] Stack:', error.stack);
      
      // Mostrar mensaje más amigable al usuario
      if (error.message && error.message.includes('server error')) {
        console.warn('[SUPPORT][Socket] ⚠️ El servidor está experimentando problemas. Intentando reconectar...');
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('[SUPPORT][Socket] 🔄 Reconectado después de', attemptNumber, 'intentos');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('[SUPPORT][Socket] ❌ Error de reconexión:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('[SUPPORT][Socket] ❌ Falló la reconexión después de todos los intentos');
      setIsConnected(false);
      alert('No se pudo conectar con el servidor de chat. Por favor, recarga la página o intenta más tarde.');
    });
    
    // Manejar errores del socket
    newSocket.on('error', (error) => {
      console.error('[SUPPORT][Socket] ❌ Error del socket:', error);
    });

    // Eventos de chat
    newSocket.on('chat_started', (data) => {
      console.log('[SUPPORT][Chat] ✅ Chat iniciado exitosamente');
      console.log('[SUPPORT][Chat] ID del chat:', data.chatId);
      console.log('[SUPPORT][Chat] Mensaje:', data.message);
      setCurrentChatId(data.chatId);
      setShowNameInput(false);
    });

    newSocket.on('new_message', (data) => {
      console.log('[SUPPORT][Chat] 📨 Nuevo mensaje recibido');
      console.log('[SUPPORT][Chat] De:', data.senderName, '(' + data.senderType + ')');
      console.log('[SUPPORT][Chat] Contenido:', data.message);
      console.log('[SUPPORT][Chat] Timestamp:', data.timestamp);
      console.log('[SUPPORT][Chat] Chat ID:', data.chatId);
      
      if (!data.message || !data.senderName) {
        console.warn('[SUPPORT][Chat] ⚠️ Mensaje incompleto recibido:', data);
        return;
      }
      
      setChatMessages(prev => {
        // Evitar duplicados
        const messageExists = prev.some(msg => 
          msg.message === data.message && 
          msg.sender_name === data.senderName && 
          Math.abs(new Date(msg.created_at) - new Date(data.timestamp || Date.now())) < 1000
        );
        
        if (messageExists) {
          console.log('[SUPPORT][Chat] Mensaje duplicado ignorado');
          return prev;
        }
        
        const newMessage = {
          id: Date.now() + Math.random(), // ID único
          sender_type: data.senderType || 'user',
          sender_id: data.senderId,
          sender_name: data.senderName,
          message: data.message,
          created_at: data.timestamp || new Date().toISOString()
        };
        console.log('[SUPPORT][Chat] Agregando mensaje al estado:', newMessage);
        return [...prev, newMessage];
      });
    });
    
    // También escuchar 'message_sent' para confirmación
    newSocket.on('message_sent', (data) => {
      console.log('[SUPPORT][Chat] ✅ Mensaje confirmado por el servidor:', data);
    });

    newSocket.on('chat_error', (data) => {
      console.error('[SUPPORT][Chat] ❌ Error en el chat');
      console.error('[SUPPORT][Chat] Mensaje de error:', data.message);
      console.error('[SUPPORT][Chat] Datos completos:', data);
      
      // Mostrar error al usuario de forma más amigable
      const errorMessage = data.message || 'Error desconocido en el chat';
      alert(`Error en el chat: ${errorMessage}`);
    });

    newSocket.on('chat_closed', (data) => {
      console.log('[SUPPORT][Chat] 🔒 Chat cerrado');
      console.log('[SUPPORT][Chat] ID del chat cerrado:', data.chatId);
      setShowLiveChat(false);
      setChatMessages([]);
      setCurrentChatId(null);
      setShowNameInput(true);
    });

    // Eventos de moderador
    newSocket.on('moderator_joined', (data) => {
      console.log('[SUPPORT][Moderator] 👮 Moderador conectado');
      console.log('[SUPPORT][Moderator] Mensaje:', data.message);
      console.log('[SUPPORT][Moderator] Chats activos:', data.activeChats?.length || 0);
    });

    newSocket.on('moderator_error', (data) => {
      console.error('[SUPPORT][Moderator] ❌ Error de moderador');
      console.error('[SUPPORT][Moderator] Mensaje:', data.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('[SUPPORT] Cerrando conexión Socket.IO');
      newSocket.close();
    };
  }, [user]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    console.log('[SUPPORT][sendMessage] Intentando enviar mensaje');
    console.log('[SUPPORT][sendMessage] Mensaje:', newMessage);
    console.log('[SUPPORT][sendMessage] Chat ID:', currentChatId);
    console.log('[SUPPORT][sendMessage] Socket conectado:', !!socket);
    console.log('[SUPPORT][sendMessage] Usuario:', user?.username);
    
    if (!newMessage.trim()) {
      console.warn('[SUPPORT][sendMessage] Mensaje vacío, no se envía');
      return;
    }
    
    if (!currentChatId) {
      console.error('[SUPPORT][sendMessage] No hay chat activo');
      alert('No hay un chat activo. Inicia un chat primero.');
      return;
    }
    
    if (!socket) {
      console.error('[SUPPORT][sendMessage] Socket no disponible');
      alert('Conexión no disponible. Intenta recargar la página.');
      return;
    }

    const messageData = {
      chatId: currentChatId,
      message: newMessage.trim(),
      senderType: 'user',
      senderId: user?.id || 'anonymous',
      senderName: userName || user?.username || 'Usuario'
    };
    
    console.log('[SUPPORT][sendMessage] Enviando datos:', messageData);
    
    try {
      socket.emit('chat_message', messageData);
      console.log('[SUPPORT][sendMessage] ✅ Mensaje enviado exitosamente');
      setNewMessage('');
    } catch (error) {
      console.error('[SUPPORT][sendMessage] ❌ Error enviando mensaje:', error);
      alert('Error enviando mensaje. Intenta de nuevo.');
    }
  };

  const startChat = () => {
    console.log('[SUPPORT][startChat] Intentando iniciar chat');
    console.log('[SUPPORT][startChat] Nombre de usuario:', userName);
    console.log('[SUPPORT][startChat] Usuario ID:', user?.id);
    console.log('[SUPPORT][startChat] Usuario completo:', user);
    console.log('[SUPPORT][startChat] Token en localStorage:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
    console.log('[SUPPORT][startChat] Socket disponible:', !!socket);
    console.log('[SUPPORT][startChat] Conectado:', isConnected);
    
    if (!userName.trim()) {
      console.warn('[SUPPORT][startChat] Nombre de usuario vacío');
      alert('Por favor, ingresa tu nombre para comenzar el chat');
      return;
    }
    
    if (!socket || !isConnected) {
      console.error('[SUPPORT][startChat] Socket no disponible o no conectado');
      console.log('[SUPPORT][startChat] Intentando reconectar...');
      
      // Intentar reconectar el socket
      const newSocket = io(process.env.REACT_APP_API_URL || 'https://spainrp-oficial.onrender.com', {
        transports: ['polling'], // Solo polling para compatibilidad con Render
        upgrade: false, // Deshabilitar upgrade a WebSocket
        timeout: 15000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 10000,
        maxReconnectionAttempts: 5,
        forceNew: true,
        autoConnect: true
      });
      
      newSocket.on('connect', () => {
        console.log('[SUPPORT][startChat] ✅ Reconectado a Socket.IO');
        setSocket(newSocket);
        setIsConnected(true);
        
        // Intentar iniciar chat después de reconectar
        setTimeout(() => {
          const chatData = {
            userId: user?.id || 'anonymous',
            userName: userName.trim()
          };
          
          console.log('[SUPPORT][startChat] Enviando datos de inicio después de reconectar:', chatData);
          newSocket.emit('start_chat', chatData);
        }, 1000);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('[SUPPORT][startChat] ❌ Error de reconexión:', error);
        alert('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
      });
      
      return;
    }

    const chatData = {
      userId: user?.id || 'anonymous',
      userName: userName.trim()
    };
    
    console.log('[SUPPORT][startChat] Enviando datos de inicio:', chatData);
    
    try {
      socket.emit('start_chat', chatData);
      console.log('[SUPPORT][startChat] ✅ Solicitud de chat enviada');
    } catch (error) {
      console.error('[SUPPORT][startChat] ❌ Error iniciando chat:', error);
      alert('Error iniciando chat. Intenta de nuevo.');
    }
  };

  const closeChat = () => {
    console.log('[SUPPORT][closeChat] Cerrando chat');
    console.log('[SUPPORT][closeChat] Chat ID:', currentChatId);
    console.log('[SUPPORT][closeChat] Socket disponible:', !!socket);
    
    if (currentChatId && socket) {
      console.log('[SUPPORT][closeChat] Enviando solicitud de cierre al servidor');
      try {
        socket.emit('close_chat', { chatId: currentChatId });
        console.log('[SUPPORT][closeChat] ✅ Solicitud de cierre enviada');
      } catch (error) {
        console.error('[SUPPORT][closeChat] ❌ Error cerrando chat:', error);
      }
    } else {
      console.warn('[SUPPORT][closeChat] No hay chat activo o socket no disponible');
    }
    
    // Limpiar estado local
    setShowLiveChat(false);
    setChatMessages([]);
    setCurrentChatId(null);
    setShowNameInput(true);
    console.log('[SUPPORT][closeChat] Estado local limpiado');
  };

  const supportOptions = [
    {
      id: 'livechat',
      title: 'Chat en Vivo',
      description: 'Habla directamente con un moderador en tiempo real para resolver tus dudas al instante',
      icon: <FaCommentsDollar />,
      color: '#00ff99',
      action: 'Iniciar Chat',
      link: '#livechat',
      popular: true,
      features: ['Respuesta inmediata', 'Moderadores online', 'Chat directo', 'Soporte personalizado']
    },
    {
      id: 'discord',
      title: 'Discord',
      description: 'Servidor principal de SpainRP con soporte en tiempo real y canales especializados',
      icon: <FaDiscord />,
      color: '#7289da',
      action: 'Unirse al Discord',
      link: 'https://discord.gg/sMzFgFQHXA',
      popular: false,
      features: ['Soporte 24/7', 'Canales de ayuda', 'Tickets automáticos', 'Comunidad activa']
    },
    {
      id: 'tickets',
      title: 'Sistema de Tickets',
      description: 'Crea tickets para reportar problemas, sanciones o solicitar ayuda específica',
      icon: <FaTicketAlt />,
      color: '#f39c12',
      action: 'Crear Ticket',
      link: '#tickets',
      popular: false,
      features: ['Reporte de bugs', 'Apelaciones', 'Solicitudes especiales', 'Seguimiento en tiempo real']
    },
    {
      id: 'email',
      title: 'Email de Emergencia',
      description: 'Para casos urgentes o problemas críticos que requieren atención inmediata',
      icon: <FaEnvelope />,
      color: '#e74c3c',
      action: 'Enviar Email',
      link: 'mailto:admin@spainrp.com',
      popular: false,
      features: ['Respuesta rápida', 'Casos urgentes', 'Problemas técnicos', 'Contacto directo']
    }
  ];

  const helpCategories = [
    {
      id: 'general',
      title: 'General',
      icon: <FaQuestionCircle />,
      color: '#3498db',
      items: [
        '¿Cómo me uno al servidor de ERLC?',
        '¿Cuáles son las reglas de SpainRP?',
        '¿Cómo obtengo el rol de Criminal?',
        '¿Problemas de conexión al servidor?',
        '¿Cómo funciona el sistema de roles?'
      ]
    },
    {
      id: 'roleplay',
      title: 'Roleplay',
      icon: <FaUserSecret />,
      color: '#9b59b6',
      items: [
        '¿Qué es MetaGaming y PowerGaming?',
        '¿Cómo funciona el sistema de PK/PKT/CK?',
        '¿Cuáles son las reglas de conducción?',
        '¿Cómo reporto a un jugador?',
        '¿Qué hacer tras una muerte en rol?'
      ]
    },
    {
      id: 'economy',
      title: 'Economía',
      icon: <FaMoneyBillWave />,
      color: '#2ecc71',
      items: [
        '¿Cómo funciona el sistema de trabajo?',
        '¿Cómo compro vehículos y propiedades?',
        '¿Cómo gestiono mi empresa?',
        '¿Cómo pago multas?',
        '¿Cómo funciona el sistema de sueldos?'
      ]
    },
    {
      id: 'technical',
      title: 'Técnico',
      icon: <FaCog />,
      color: '#f39c12',
      items: [
        'Problemas con FiveM',
        'Errores de instalación de mods',
        'Problemas de rendimiento',
        'Configuración de audio y micrófono',
        'Problemas con el launcher'
      ]
    },
    {
      id: 'moderation',
      title: 'Moderación',
      icon: <FaShieldAlt />,
      color: '#e74c3c',
      items: [
        '¿Cómo apelo una sanción?',
        '¿Cómo reporto un bug?',
        '¿Cómo solicito un desban?',
        '¿Cómo contacto con staff?',
        '¿Qué hacer si me banean injustamente?'
      ]
    },
    {
      id: 'jobs',
      title: 'Trabajos y Empresas',
      icon: <FaBuilding />,
      color: '#34495e',
      items: [
        '¿Cómo creo una empresa?',
        '¿Cuáles son los requisitos para empresas?',
        '¿Cómo contrato empleados?',
        '¿Cómo gestiono sueldos y gastos?',
        '¿Qué trabajos están disponibles?'
      ]
    }
  ];

  const faqItems = [
    {
      question: '¿Cómo me uno al servidor de ERLC SpainRP?',
      answer: 'Necesitas tener FiveM instalado, unirse a nuestro Discord, obtener el rol de Criminal y seguir las instrucciones de conexión en el canal #conexion.'
    },
    {
      question: '¿Cuáles son los requisitos para jugar?',
      answer: 'FiveM actualizado, Discord, micrófono funcional, edad mínima de 13 años y seguir todas las reglas del servidor.'
    },
    {
      question: '¿Cómo obtengo el rol de Criminal?',
      answer: 'Ve al canal #roles en Discord, lee las reglas y reacciona con el emoji correspondiente. El staff verificará tu solicitud.'
    },
    {
      question: '¿Qué es MetaGaming y PowerGaming?',
      answer: 'MetaGaming es usar información OOC (fuera del rol) en IC (dentro del rol). PowerGaming es forzar acciones irreales en el roleplay. Ambos están prohibidos.'
    },
    {
      question: '¿Cómo funciona el sistema de PK/PKT/CK?',
      answer: 'PK: Pierdes memoria del rol actual (35min espera). PKT: Pierdes memoria específica (1 día sin volver al grupo). CK: Muerte total del personaje (requiere aprobación staff).'
    },
    {
      question: '¿Cómo creo una empresa?',
      answer: 'Abre un ticket en Discord, completa la plantilla de empresa, cumple los requisitos (jefe ≥17 años, no tapadera ilegal) y espera la aprobación del staff.'
    },
    {
      question: '¿Qué hago si me banean injustamente?',
      answer: 'Crea un ticket de apelación en Discord con pruebas y explicación detallada. El staff revisará tu caso en un plazo de 24-48 horas.'
    },
    {
      question: '¿Cómo reporto bugs o problemas técnicos?',
      answer: 'Usa el comando /report en el juego, crea un ticket en Discord o contacta directamente con el equipo técnico en el canal #soporte-tecnico.'
    }
  ];

  const liveStreams = [
    {
      platform: 'YouTube',
      icon: <FaYoutube />,
      color: '#ff0000',
      title: 'SpainRP Oficial',
      description: 'Eventos en vivo, tutoriales y contenido exclusivo',
      link: 'https://youtube.com/@spainrp',
      schedule: 'Lunes, Miércoles, Viernes 20:00 CET'
    },
    {
      platform: 'Twitch',
      icon: <FaTwitch />,
      color: '#9146ff',
      title: 'SpainRP Live',
      description: 'Streams diarios del servidor y eventos especiales',
      link: 'https://twitch.tv/spainrp',
      schedule: 'Todos los días 18:00-22:00 CET'
    }
  ];

  const quickActions = [
    {
      title: 'Panel Moderadores',
      icon: <FaUserFriends />,
      color: '#5865f2',
      description: 'Acceder al panel de gestión de chats en vivo',
      action: () => window.location.href = '/moderator-dashboard'
    },
    {
      title: 'Crear Ticket',
      icon: <FaTicketAlt />,
      color: '#f39c12',
      description: 'Reportar problemas o solicitar ayuda',
      action: () => window.open('https://discord.gg/sMzFgFQHXA', '_blank')
    },
    {
      title: 'Ver Reglas',
      icon: <FaGavel />,
      color: '#e74c3c',
      description: 'Consultar normativas del servidor',
      action: () => window.location.href = '/rules'
    },
    {
      title: 'Estado del Servidor',
      icon: <FaCheckCircle />,
      color: '#2ecc71',
      description: 'Verificar si el servidor está online',
      action: () => window.open('https://discord.gg/sMzFgFQHXA', '_blank')
    },
    {
      title: 'BlackMarket',
      icon: <FaUserSecret />,
      color: '#9b59b6',
      description: 'Acceder al mercado negro',
      action: () => window.location.href = '/blackmarket'
    }
  ];

  return (
    <div className="support-container">
      {/* Header */}
      <div className="support-header">
        <div className="support-header-content">
          <h1 className="support-title">
            <FaHeadset className="support-title-icon" />
            Centro de Soporte SpainRP
          </h1>
          <p className="support-subtitle">
            Servidor de Roleplay ERLC - Encuentra ayuda, contacta con nuestro equipo y resuelve tus dudas
          </p>
          <div className="support-badges">
            <span className="badge">ERLC Roleplay</span>
            <span className="badge">24/7 Online</span>
            <span className="badge">Comunidad Activa</span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="support-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className="quick-action-card"
              onClick={action.action}
              style={{ '--accent-color': action.color }}
            >
              <div className="quick-action-icon" style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3 className="quick-action-title">{action.title}</h3>
              <p className="quick-action-description">{action.description}</p>
              </div>
          ))}
              </div>
          </div>

      {/* Canales de Contacto */}
      <div className="support-section">
        <h2 className="section-title">Canales de Contacto</h2>
        <div className="contact-grid">
          {supportOptions.map((option) => (
            <div 
              key={option.id} 
              className={`contact-card ${option.popular ? 'popular' : ''}`}
              style={{ '--accent-color': option.color }}
            >
              {option.popular && <div className="popular-badge">Más Popular</div>}
              <div className="contact-icon" style={{ color: option.color }}>
                {option.icon}
                    </div>
              <h3 className="contact-title">{option.title}</h3>
              <p className="contact-description">{option.description}</p>
              <div className="contact-features">
                {option.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
              {option.id === 'livechat' ? (
                <button 
                  onClick={() => setShowLiveChat(true)}
                  className="contact-button"
                  style={{ backgroundColor: option.color }}
                >
                  {option.action}
                </button>
              ) : (
                <a 
                  href={option.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="contact-button"
                  style={{ backgroundColor: option.color }}
                >
                  {option.action}
                </a>
              )}
            </div>
          ))}
        </div>
          </div>

      {/* Categorías de Ayuda */}
      <div className="support-section">
        <h2 className="section-title">Categorías de Ayuda</h2>
        <div className="help-grid">
          {helpCategories.map((category) => (
            <div key={category.id} className="help-card">
              <div className="help-icon" style={{ color: category.color }}>
                {category.icon}
                    </div>
              <h3 className="help-title">{category.title}</h3>
              <ul className="help-list">
                {category.items.map((item, index) => (
                  <li key={index} className="help-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="support-section">
        <h2 className="section-title">Preguntas Frecuentes</h2>
        <div className="faq-container">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">
                <FaComments className="faq-icon" />
                <span>{item.question}</span>
              </div>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
          </div>
        </div>

      {/* Streams en Vivo */}
      <div className="support-section">
        <h2 className="section-title">
          <FaVideo className="section-icon" />
          Contenido en Vivo
        </h2>
        <p className="section-subtitle">
          Sigue nuestros streams oficiales para eventos, tutoriales y contenido exclusivo
        </p>
        <div className="streams-grid">
          {liveStreams.map((stream, index) => (
            <div 
              key={index} 
              className="stream-card"
              style={{ '--accent-color': stream.color }}
            >
              <div className="stream-header">
                <div className="stream-icon" style={{ color: stream.color }}>
                  {stream.icon}
                </div>
                <div className="stream-info">
                  <h3 className="stream-title">{stream.title}</h3>
                  <p className="stream-platform">{stream.platform}</p>
                </div>
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  <span>EN VIVO</span>
                </div>
              </div>
              <p className="stream-description">{stream.description}</p>
              <div className="stream-schedule">
                <FaClock className="schedule-icon" />
                <span>{stream.schedule}</span>
              </div>
              <a 
                href={stream.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="stream-button"
                style={{ backgroundColor: stream.color }}
              >
                <FaStream />
                Ver Ahora
              </a>
            </div>
          ))}
          </div>
        </div>

      {/* Footer de Soporte */}
      <div className="support-footer">
        <div className="support-footer-content">
          <h3>¿No encuentras lo que buscas?</h3>
          <p>Nuestro equipo está disponible 24/7 para ayudarte</p>
          <div className="support-footer-actions">
            <button 
              onClick={() => setShowLiveChat(true)}
              className="footer-button primary"
            >
              <FaCommentsDollar />
              Chat en Vivo
            </button>
            <a 
              href="https://discord.gg/sMzFgFQHXA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-button secondary"
            >
              <FaDiscord />
              Discord
            </a>
                </div>
                </div>
              </div>

      {/* Chat en Vivo Modal */}
      {showLiveChat && (
        <div className="live-chat-overlay" onClick={(e) => e.target === e.currentTarget && setShowLiveChat(false)}>
          <div className="live-chat-container">
            {/* Header del Chat */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="moderator-avatar">
                  <FaUserFriends />
                </div>
                <div className="moderator-info">
                  <h3>Moderador SpainRP</h3>
                  <div className="online-status">
                    <FaCircle className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
                    <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                  </div>
                  <div className="moderator-actions">
                    <button 
                      className="moderator-panel-btn"
                      onClick={() => window.open('/moderator-dashboard', '_blank')}
                      title="Abrir Panel de Moderadores"
                    >
                      <FaUserFriends />
                      Panel Moderadores
                    </button>
                      </div>
                    </div>
              </div>
              <button 
                className="close-chat-btn"
                onClick={closeChat}
              >
                <FaTimes />
              </button>
              </div>

            {/* Input de Nombre */}
            {showNameInput && (
              <div className="name-input-container">
                <h4>Antes de comenzar, dinos tu nombre:</h4>
                <div className="name-input-group">
                <input
                    type="text"
                    placeholder="Tu nombre o nickname"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && startChat()}
                    className="name-input"
                  />
                  <button 
                    onClick={startChat}
                    className="start-chat-btn"
                    disabled={!userName.trim()}
                  >
                    <FaPaperPlane />
                    Iniciar Chat
                  </button>
                </div>
              </div>
            )}

                {/* Área de Mensajes */}
                {!showNameInput && (
                  <>
                    <div className="chat-messages">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender_type}`}>
                          <div className="message-avatar">
                            {msg.sender_type === 'user' ? <FaUserCheck /> : <FaUserFriends />}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-name">{msg.sender_name}</span>
                              <span className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="message-text">{msg.message}</div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="message moderator">
                          <div className="message-avatar">
                            <FaUserFriends />
                          </div>
                          <div className="message-content">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                              <span>Moderador está escribiendo...</span>
                            </div>
                      </div>
                    </div>
                )}
              </div>

                {/* Input de Mensaje */}
                <form onSubmit={sendMessage} className="chat-input-container">
                <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-input"
                    disabled={!moderatorOnline}
                  />
                  <button 
                    type="submit" 
                    className="send-btn"
                    disabled={!newMessage.trim() || !moderatorOnline}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
          )}
              </div>
            </div>
          )}
    </div>
  );
};

export default Support;
