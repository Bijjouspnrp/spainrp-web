const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'spainrp_jwt_secret_key_2024';
const JWT_EXPIRES_IN = '7d'; // 7 días

// Generar JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    isAdmin: user.isAdmin || false
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'spainrp',
    audience: 'spainrp-users'
  });
};

// Verificar JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token requerido',
      code: 'NO_TOKEN'
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'spainrp',
      audience: 'spainrp-users'
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('[JWT] Token inválido:', error.message);
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware opcional (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'spainrp',
      audience: 'spainrp-users'
    });
    req.user = decoded;
  } catch (error) {
    req.user = null;
  }
  
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth,
  JWT_SECRET
};
