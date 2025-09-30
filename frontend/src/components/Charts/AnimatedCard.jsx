import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const AnimatedCard = ({ 
  children, 
  className = '', 
  delay = 0, 
  loading = false,
  hover = true,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(114, 137, 218, 0.25)",
        transition: { duration: 0.2 }
      } : {}}
      className={`animated-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(114, 137, 218, 0.15)',
        border: '1px solid rgba(114, 137, 218, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        ...props.style
      }}
      {...props}
    >
      {/* Efecto de brillo animado */}
      <motion.div
        className="shimmer-effect"
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(114, 137, 218, 0.1), transparent)',
          zIndex: 1
        }}
        animate={{
          left: ['100%', '100%'],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '20px'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner size={32} color="#7289da" />
          </motion.div>
        </motion.div>
      )}
      
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;
