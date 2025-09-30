import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTimes, 
  FaDownload, 
  FaShare, 
  FaCopy, 
  FaWhatsapp, 
  FaTelegram, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram,
  FaEnvelope,
  FaPrint
} from 'react-icons/fa';

const DNIShareModal = ({ isOpen, onClose, dniUrl, userName, userId }) => {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: '#25D366',
      action: () => {
        const text = `¡Mira mi DNI de SpainRP! 🆔\n\nUsuario: ${userName}\n\nVer DNI: ${dniUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: FaTelegram,
      color: '#0088cc',
      action: () => {
        const text = `¡Mira mi DNI de SpainRP! 🆔\n\nUsuario: ${userName}\n\nVer DNI: ${dniUrl}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(dniUrl)}&text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1DA1F2',
      action: () => {
        const text = `¡Mira mi DNI de SpainRP! 🆔 @SpainRP_Server`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(dniUrl)}`, '_blank');
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FaFacebook,
      color: '#1877F2',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dniUrl)}`, '_blank');
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: FaInstagram,
      color: '#E4405F',
      action: () => {
        // Instagram no permite compartir URLs directamente, copiamos al portapapeles
        copyToClipboard();
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: FaEnvelope,
      color: '#6c757d',
      action: () => {
        const subject = `Mi DNI de SpainRP - ${userName}`;
        const body = `¡Hola!\n\nTe comparto mi DNI de SpainRP:\n\nUsuario: ${userName}\nVer DNI: ${dniUrl}\n\n¡Únete a SpainRP!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(dniUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = dniUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadDNI = () => {
    const link = document.createElement('a');
    link.href = dniUrl;
    link.download = `DNI_SpainRP_${userName || 'usuario'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printDNI = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>DNI SpainRP - ${userName}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
            .info { margin-top: 20px; font-family: Arial, sans-serif; }
            .info h2 { color: #7289da; margin-bottom: 10px; }
            .info p { color: #666; margin: 5px 0; }
          </style>
        </head>
        <body>
          <img src="${dniUrl}" alt="DNI SpainRP" />
          <div class="info">
            <h2>DNI SpainRP</h2>
            <p><strong>Usuario:</strong> ${userName}</p>
            <p><strong>ID:</strong> ${userId}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="share-modal"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="share-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h3>Compartir DNI</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Share Options */}
        <div className="share-options">
          {shareOptions.map(option => (
            <button
              key={option.id}
              className="share-option"
              onClick={option.action}
              style={{ borderColor: option.color }}
            >
              <option.icon 
                className="share-option-icon" 
                style={{ color: option.color }}
              />
              <span className="share-option-text">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <button
            className="dni-action-btn primary"
            onClick={copyToClipboard}
            style={{ flex: 1 }}
          >
            <FaCopy />
            {copied ? '¡Copiado!' : 'Copiar enlace'}
          </button>
          <button
            className="dni-action-btn secondary"
            onClick={downloadDNI}
            style={{ flex: 1 }}
          >
            <FaDownload />
            Descargar
          </button>
        </div>

        <button
          className="dni-action-btn secondary"
          onClick={printDNI}
          style={{ width: '100%' }}
        >
          <FaPrint />
          Imprimir DNI
        </button>

        {/* URL Display */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <p style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6c757d',
            textTransform: 'uppercase'
          }}>
            Enlace del DNI:
          </p>
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#495057',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            {dniUrl}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DNIShareModal;
