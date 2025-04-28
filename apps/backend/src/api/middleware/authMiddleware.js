/**
 * Samudra Paket ERP - Authentication Middleware
 * Handles JWT authentication and RBAC authorization
 */

const jwt = require('jsonwebtoken');
const { createApiError } = require('../../domain/utils/errorUtils');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');

// Initialize the user repository
const userRepository = new MongoUserRepository();

/**
 * Authenticate user using JWT token
 * @returns {Function} Express middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required')
      );
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your_jwt_secret_key_here'
    );
    
    // Get user from database
    const user = await userRepository.findById(decoded.id);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'User not found')
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'Account is inactive')
      );
    }
    
    // Attach user to request object
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(
        createApiError('TOKEN_EXPIRED', 'Token has expired')
      );
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        createApiError('INVALID_TOKEN', 'Invalid token')
      );
    }
    
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during authentication')
    );
  }
};

/**
 * Authorize user based on roles
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    // Check if authenticate middleware has been run
    if (!req.user) {
      return res.status(500).json(
        createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization')
      );
    }
    
    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action')
      );
    }
    
    next();
  };
};

/**
 * Authorize user based on permissions
 * @param {string|string[]} permissions - Required permission(s)
 * @returns {Function} Express middleware
 */
const authorizePermissions = (permissions) => {
  return (req, res, next) => {
    // Check if authenticate middleware has been run
    if (!req.user) {
      return res.status(500).json(
        createApiError('SERVER_ERROR', 'Authentication middleware must be used before authorization')
      );
    }
    
    // Convert single permission to array
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    // Check if user has ALL permission
    if (req.user.permissions.includes('ALL')) {
      return next();
    }
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      req.user.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json(
        createApiError('FORBIDDEN', 'You do not have permission to perform this action')
      );
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
  authorizePermissions,
};
