const jwt = require('jsonwebtoken');
const { tenantContext } = require('../utils/context');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Store user info in request object for downstream use
    req.user = decoded;

    // Wrap the next execution in AsyncLocalStorage context
    tenantContext.run({ 
      tenantId: decoded.tenant_id, 
      userId: decoded.user_id, 
      role: decoded.role 
    }, () => {
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
