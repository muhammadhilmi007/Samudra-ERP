/**
 * Health Controller
 * Provides endpoints for system health monitoring
 */

/**
 * Check system health
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Health status information
 */
const checkHealth = async (req, res) => {
  try {
    // Get database connection status from app context
    const { mongoose } = req.app.locals;
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get Redis connection status if available
    let redisStatus = 'not_configured';
    if (req.app.locals.redis) {
      redisStatus = req.app.locals.redis.status === 'ready' ? 'connected' : 'disconnected';
    }

    // Get environment information
    const environment = process.env.NODE_ENV || 'development';
    
    // Return health information
    return res.status(200).json({
      status: 'success',
      message: 'System is healthy',
      data: {
        timestamp: new Date().toISOString(),
        environment,
        services: {
          api: 'healthy',
          database: dbStatus,
          cache: redisStatus
        },
        version: process.env.APP_VERSION || '1.0.0'
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error checking system health',
      error: error.message
    });
  }
};

module.exports = {
  checkHealth
};
