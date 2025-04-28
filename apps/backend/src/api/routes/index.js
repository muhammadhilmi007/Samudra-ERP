/**
 * Samudra Paket ERP - API Routes
 * Main router that combines all route modules
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const packageRoutes = require('./packageRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/packages', packageRoutes);

module.exports = router;
