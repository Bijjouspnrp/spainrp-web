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
  
  console.log('[JWT] 🎫 Generating token for user:', {
    userId: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    payloadKeys: Object.keys(payload)
  });
  
  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'spainrp',
    audience: 'spainrp-users'
  });
  
  console.log('[JWT] ✅ Token generated successfully:', {
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + '...',
    expiresIn: JWT_EXPIRES_IN
  });
  
  return token;
};

// Verificar JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('[JWT] 🔍 Verifying token:', {
    hasAuthHeader: !!authHeader,
    authHeaderPreview: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
    userAgent: req.headers['user-agent']?.substring(0, 50) || 'unknown'
  });
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[JWT] ❌ No token provided');
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
    
    console.log('[JWT] ✅ Token verified successfully:', {
      userId: decoded.id,
      username: decoded.username,
      isAdmin: decoded.isAdmin,
      exp: new Date(decoded.exp * 1000).toISOString(),
      iat: new Date(decoded.iat * 1000).toISOString()
    });
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('[JWT] ❌ Token verification failed:', {
      error: error.message,
      name: error.name,
      tokenPreview: token.substring(0, 20) + '...'
    });
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
    console.log('[JWT] ⚠️ Optional auth: No token provided');
    req.user = null;
    return next();
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'spainrp',
      audience: 'spainrp-users'
    });
    console.log('[JWT] ✅ Optional auth: Token valid:', {
      userId: decoded.id,
      username: decoded.username
    });
    req.user = decoded;
  } catch (error) {
    console.log('[JWT] ⚠️ Optional auth: Token invalid:', error.message);
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
