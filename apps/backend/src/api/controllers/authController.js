/**
 * Samudra Paket ERP - Auth Controller
 * Handles authentication-related API endpoints
 */

const jwt = require('jsonwebtoken');
const { createApiError } = require('../../domain/utils/errorUtils');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');

// Initialize the user repository
const userRepository = new MongoUserRepository();

/**
 * Login user and generate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Username and password are required')
      );
    }

    // Find user by username
    const user = await userRepository.findByUsername(username);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json(
        createApiError('AUTHENTICATION_FAILED', 'Invalid username or password')
      );
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json(
        createApiError('ACCOUNT_INACTIVE', 'Your account is inactive. Please contact an administrator.')
      );
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json(
        createApiError('AUTHENTICATION_FAILED', 'Invalid username or password')
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here',
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Update last login time
      await userRepository.update(user._id, { lastLogin: new Date() });

      // Return user data and tokens
      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            permissions: user.permissions,
          },
          token,
          refreshToken,
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during login')
    );
  }
};

/**
 * Refresh JWT token using refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Refresh token is required')
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here'
    );

    // Find user by ID
    const user = await userRepository.findById(decoded.id);
    
    // Check if user exists and is active
    if (!user) {
      return res.status(401).json(
        createApiError('AUTHENTICATION_FAILED', 'User not found')
      );
    }
    
    if (!user.isActive) {
      return res.status(401).json(
        createApiError('ACCOUNT_INACTIVE', 'Your account is inactive')
      );
    }

    // Generate new JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Generate new refresh token (token rotation for security)
    const newRefreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(
        createApiError('TOKEN_EXPIRED', 'Refresh token has expired')
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(
        createApiError('INVALID_TOKEN', 'Invalid refresh token')
      );
    }

    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during token refresh')
    );
  }
};

/**
 * Logout user (invalidate refresh token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // In a production app, you would implement a token blacklist using Redis
    // or another fast database to invalidate the refresh token
    // For now, we'll just return success as the client should remove the tokens
    
    // Get user ID from the authenticated request
    const userId = req.user ? req.user.id : null;
    
    if (userId) {
      // Update last activity timestamp
      await userRepository.update(userId, { lastActivity: new Date() });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during logout')
    );
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
};
