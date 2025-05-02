/**
 * Samudra Paket ERP - Auth Controller
 * Handles authentication-related API endpoints
 */

const jwt = require('jsonwebtoken');
const { createApiError } = require('../../domain/utils/errorUtils');
const MongoUserRepository = require('../../infrastructure/repositories/mongoUserRepository');
const { logger } = require('../middleware/gateway/logger');

// Initialize the user repository
const userRepository = new MongoUserRepository();

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => jwt.sign(
  {
    id: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
  },
  process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
);

/**
 * Generate refresh token
 * @param {Object} user - User object
 * @returns {Object} Refresh token and expiration date
 */
const generateRefreshToken = (user) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  // Convert expiration time to milliseconds
  let expiresInMs;
  if (expiresIn.endsWith('d')) {
    expiresInMs = parseInt(expiresIn, 10) * 24 * 60 * 60 * 1000;
  } else if (expiresIn.endsWith('h')) {
    expiresInMs = parseInt(expiresIn, 10) * 60 * 60 * 1000;
  } else {
    expiresInMs = parseInt(expiresIn, 10) * 1000;
  }

  const expiresAt = new Date(Date.now() + expiresInMs);

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here',
    { expiresIn },
  );

  return { token, expiresAt };
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const {
      username, email, password, fullName, phoneNumber,
    } = req.body;

    // Check if username is already taken
    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      return res.status(409).json(
        createApiError('USERNAME_TAKEN', 'Username is already taken'),
      );
    }

    // Check if email is already registered
    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json(
        createApiError('EMAIL_TAKEN', 'Email is already registered'),
      );
    }

    // Create new user
    const userData = {
      username,
      email,
      password,
      fullName,
      phoneNumber,
      role: 'CUSTOMER', // Default role for new registrations
      permissions: ['customer.view'], // Default permissions
      isActive: false, // Inactive until email is verified
      isEmailVerified: false,
    };

    const newUser = await userRepository.create(userData);

    // Generate verification token
    const verificationToken = newUser.emailVerificationToken;

    // In a real application, you would send an email with the verification link
    // For now, we'll just return the token in the response for testing purposes
    // eslint-disable-next-line max-len
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    logger.info(`User registered: ${newUser.username} (${newUser.email})`);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          fullName: newUser.fullName,
        },
        message: 'Registration successful. Please verify your email.',
        verificationUrl, // In production, remove this and send via email
      },
    });
  } catch (error) {
    logger.error('Registration error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during registration'),
    );
  }
};

/**
 * Login user and generate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Username and password are required'),
      );
    }

    // Find user by username
    const user = await userRepository.findByUsername(username);

    // Check if user exists
    if (!user) {
      return res.status(401).json(
        createApiError('AUTHENTICATION_FAILED', 'Invalid username or password'),
      );
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const lockTime = new Date(user.lockUntil);
      return res.status(401).json(
        createApiError(
          'ACCOUNT_LOCKED',
          // eslint-disable-next-line max-len
          `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${lockTime.toLocaleTimeString()}.`,
        ),
      );
    }

    // Check if user is active
    if (!user.isActive) {
      // If email is not verified, provide a specific message
      if (!user.isEmailVerified) {
        return res.status(401).json(
          createApiError('EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.'),
        );
      }

      return res.status(401).json(
        // eslint-disable-next-line max-len
        createApiError('ACCOUNT_INACTIVE', 'Your account is inactive. Please contact an administrator.'),
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Track failed login attempt
      await userRepository.trackFailedLogin(user.id);

      return res.status(401).json(
        createApiError('AUTHENTICATION_FAILED', 'Invalid username or password'),
      );
    }

    // Reset failed login attempts
    await userRepository.resetFailedLogins(user.id);

    // Generate JWT token
    const token = generateToken(user);

    // Generate refresh token
    const { token: refreshToken, expiresAt } = generateRefreshToken(user);

    // Store refresh token in database
    await userRepository.addRefreshToken(user.id, refreshToken, expiresAt, userAgent, ipAddress);

    // Update last login time
    await userRepository.update(user.id, { lastLogin: new Date() });

    logger.info(`User logged in: ${user.username} (${user.email})`);

    // Return user data and tokens
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
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
    logger.error('Login error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during login'),
    );
  }
};

/**
 * Verify email for a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Verification token is required'),
      );
    }

    // Verify email using the token
    const user = await userRepository.verifyEmail(token);

    if (!user) {
      return res.status(400).json(
        createApiError('INVALID_TOKEN', 'Invalid or expired verification token'),
      );
    }

    logger.info(`Email verified for user: ${user.username} (${user.email})`);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Email verified successfully. You can now log in.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    logger.error('Email verification error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during email verification'),
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
    const { token } = req.body;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!token) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Refresh token is required'),
      );
    }

    try {
      // Verify refresh token
      // eslint-disable-next-line max-len
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here');

      // Find refresh token in database
      const foundRefreshToken = await userRepository.findRefreshToken(token);

      // Check if refresh token exists
      if (!foundRefreshToken) {
        return res.status(401).json(
          createApiError('INVALID_TOKEN', 'Invalid refresh token'),
        );
      }

      // Find user associated with the refresh token
      const user = await userRepository.findById(decoded.id);

      // Check if user exists and is active
      if (!user) {
        return res.status(401).json(
          createApiError('USER_NOT_FOUND', 'User not found'),
        );
      }

      if (!user.isActive) {
        return res.status(401).json(
          createApiError('ACCOUNT_INACTIVE', 'Your account is inactive'),
        );
      }

      // Remove the old refresh token
      await userRepository.removeRefreshToken(user.id, token);

      // Generate new JWT token
      const newToken = generateToken(user);

      // Generate new refresh token (token rotation for security)
      const { token: newRefreshToken, expiresAt } = generateRefreshToken(user);

      // Store new refresh token
      // eslint-disable-next-line max-len
      await userRepository.addRefreshToken(user.id, newRefreshToken, expiresAt, userAgent, ipAddress);

      logger.info(`Token refreshed for user: ${user.username}`);

      return res.status(200).json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json(
          createApiError('TOKEN_EXPIRED', 'Refresh token has expired'),
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(
          createApiError('INVALID_TOKEN', 'Invalid refresh token'),
        );
      }

      throw error;
    }
  } catch (error) {
    logger.error('Refresh token error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during token refresh'),
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
    const { token } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required'),
      );
    }

    // If a specific refresh token is provided, remove only that token
    if (token) {
      await userRepository.removeRefreshToken(userId, token);
    } else {
      // Otherwise, remove all refresh tokens for this user (logout from all devices)
      await userRepository.clearAllRefreshTokens(userId);
    }

    // Update last activity timestamp
    await userRepository.update(userId, { lastActivity: new Date() });

    logger.info(`User logged out: ${req.user.username}`);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during logout'),
    );
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Email is required'),
      );
    }

    // Find user by email
    const user = await userRepository.findByEmail(email);

    // For security reasons, always return success even if user not found
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.',
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // In a real application, you would send an email with the reset link
    // For now, we'll just return the token in the response for testing purposes
    // eslint-disable-next-line max-len
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    logger.info(`Password reset requested for user: ${user.username} (${user.email})`);

    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
      // In production, remove this and send via email
      resetUrl,
    });
  } catch (error) {
    logger.error('Password reset request error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during password reset request'),
    );
  }
};

/**
 * Reset password using token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Token and new password are required'),
      );
    }

    // Reset password using token
    const user = await userRepository.resetPassword(token, newPassword);

    if (!user) {
      return res.status(400).json(
        createApiError('INVALID_TOKEN', 'Invalid or expired reset token'),
      );
    }

    // Clear all refresh tokens for security
    await userRepository.clearAllRefreshTokens(user.id);

    logger.info(`Password reset successful for user: ${user.username} (${user.email})`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
    });
  } catch (error) {
    logger.error('Password reset error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during password reset'),
    );
  }
};

/**
 * Change password for authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required'),
      );
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json(
        createApiError('INVALID_INPUT', 'Current password and new password are required'),
      );
    }

    // Change password
    const success = await userRepository.changePassword(userId, currentPassword, newPassword);

    if (!success) {
      return res.status(400).json(
        createApiError('INVALID_PASSWORD', 'Current password is incorrect'),
      );
    }

    // Clear all refresh tokens for security
    await userRepository.clearAllRefreshTokens(userId);

    logger.info(`Password changed for user: ${req.user.username}`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again with your new password.',
    });
  } catch (error) {
    logger.error('Password change error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred during password change'),
    );
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json(
        createApiError('UNAUTHORIZED', 'Authentication required'),
      );
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      return res.status(404).json(
        createApiError('NOT_FOUND', 'User not found'),
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error('Get profile error:', { error });
    return res.status(500).json(
      createApiError('SERVER_ERROR', 'An error occurred while retrieving user profile'),
    );
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getProfile,
};
