/**
 * Samudra Paket ERP - API Routes
 * Main router that combines all route modules
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const packageRoutes = require('./packageRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const branchRoutes = require('./branchRoutes');
const serviceAreaRoutes = require('./serviceAreaRoutes');
const divisionRoutes = require('./divisionRoutes');
const positionRoutes = require('./positionRoutes');

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
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/branches', branchRoutes);
router.use('/service-areas', serviceAreaRoutes);
router.use('/divisions', divisionRoutes);
router.use('/positions', positionRoutes);

module.exports = router;
