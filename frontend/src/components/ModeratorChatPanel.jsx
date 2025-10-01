import React, { useState, useEffect } from 'react';
import { 
  FaComments, 
  FaUser, 
  FaTimes, 
  FaPaperPlane, 
  FaCircle,
  FaUsers,
  FaClock,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import io from 'socket.io-client';
import './ModeratorChatPanel.css';

const ModeratorChatPanel = ({ user, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Conectar a Socket.IO
    const newSocket = io(process.env.REACT_APP_API_URL || 'https://spainrp-oficial.onrender.com', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('[MODERATOR] Conectado a Socket.IO');
      setIsConnected(true);
      
      // Unirse como moderador
      newSocket.emit('moderator_join', {
        userId: user.id,
        userName: user.username
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[MODERATOR] Desconectado de Socket.IO');
      setIsConnected(false);
    });

    newSocket.on('moderator_joined', (data) => {
      console.log('[MODERATOR] Conectado como moderador:', data);
      setActiveChats(data.activeChats || []);
    });

    newSocket.on('new_chat', (data) => {
      console.log('[MODERATOR] Nuevo chat:', data);
      setActiveChats(prev => [...prev, {
        chatId: data.chatId,
        userId: data.userId,
        userName: data.userName,
        status: 'active'
      }]);
    });

    newSocket.on('chat_history', (data) => {
      if (data.chatId === selectedChat?.chatId) {
        setMessages(data.messages || []);
      }
    });

    newSocket.on('new_message', (data) => {
      if (selectedChat && data.chatId === selectedChat.chatId) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender_type: data.senderType,
          sender_id: data.senderId,
          sender_name: data.senderName,
          message: data.message,
          created_at: data.timestamp
        }]);
      }
    });

    newSocket.on('chat_closed', (data) => {
      setActiveChats(prev => prev.filter(chat => chat.chatId !== data.chatId));
      if (selectedChat && selectedChat.chatId === data.chatId) {
        setSelectedChat(null);
        setMessages([]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  const selectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
    
    if (socket) {
      socket.emit('get_chat_history', { chatId: chat.chatId });
      socket.emit('join_chat', { chatId: chat.chatId });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    socket.emit('chat_message', {
      chatId: selectedChat.chatId,
      message: newMessage,
      senderType: 'moderator',
      senderId: user.id,
      senderName: user.username
    });

    setNewMessage('');
  };

  const closeChat = (chatId) => {
    if (socket) {
      socket.emit('close_chat', { chatId });
    }
  };

  return (
    <div className="moderator-chat-overlay">
      <div className="moderator-chat-container">
        {/* Header */}
        <div className="moderator-chat-header">
          <div className="moderator-chat-title">
            <FaComments />
            <h2>Panel de Moderadores</h2>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <FaCircle />
              <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="moderator-chat-content">
          {/* Lista de Chats Activos */}
          <div className="chats-sidebar">
            <div className="sidebar-header">
              <h3>Chats Activos ({activeChats.length})</h3>
            </div>
            <div className="chats-list">
              {activeChats.map((chat) => (
                <div
                  key={chat.chatId}
                  className={`chat-item ${selectedChat?.chatId === chat.chatId ? 'active' : ''}`}
                  onClick={() => selectChat(chat)}
                >
                  <div className="chat-item-header">
                    <FaUser className="chat-user-icon" />
                    <span className="chat-user-name">{chat.userName}</span>
                    <span className="chat-user-id">#{chat.userId}</span>
                  </div>
                  <div className="chat-item-status">
                    <FaCircle className="status-dot active" />
                    <span>Activo</span>
                  </div>
                </div>
              ))}
              {activeChats.length === 0 && (
                <div className="no-chats">
                  <FaUsers />
                  <p>No hay chats activos</p>
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="chat-area">
            {selectedChat ? (
              <>
                {/* Header del Chat Seleccionado */}
                <div className="selected-chat-header">
                  <div className="selected-chat-info">
                    <FaUser />
                    <div>
                      <h4>{selectedChat.userName}</h4>
                      <span>ID: {selectedChat.userId}</span>
                    </div>
                  </div>
                  <button 
                    className="close-chat-btn"
                    onClick={() => closeChat(selectedChat.chatId)}
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Mensajes */}
                <div className="chat-messages-area">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender_type}`}>
                      <div className="message-avatar">
                        <FaUser />
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
                </div>

                {/* Input de Mensaje */}
                <form onSubmit={sendMessage} className="chat-input-form">
                  <input
                    type="text"
                    placeholder="Escribe tu respuesta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-input"
                  />
                  <button type="submit" className="send-btn">
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <FaComments />
                <h3>Selecciona un chat para comenzar</h3>
                <p>Los usuarios aparecerán aquí cuando inicien un chat de soporte</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorChatPanel;
