/**
 * Samudra Paket ERP - API Routes
 * Main router that combines all route modules
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const packageRoutes = require('./packageRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');
const authorizationRoutes = require('./authorizationRoutes');
const branchRoutes = require('./branchRoutes');
const serviceAreaRoutes = require('./serviceAreaRoutes');
const divisionRoutes = require('./divisionRoutes');
const positionRoutes = require('./positionRoutes');
const forwarderRoutes = require('./forwarderRoutes');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const customerRoutes = require('./customerRoutes');
const pickupRequestRoutes = require('./pickupRequestRoutes');
const pickupAssignmentRoutes = require('./pickupAssignmentRoutes');
const pickupItemRoutes = require('./pickupItemRoutes');
const shipmentOrderRoutes = require('./shipmentOrderRoutes');
const pricingRoutes = require('./pricingRoutes');
const waybillDocumentRoutes = require('./waybillDocumentRoutes');
const fileUploadRoutes = require('./fileUploadRoutes');
const loadingFormRoutes = require('./loadingFormRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const deliveryOrderRoutes = require('./deliveryOrderRoutes');
const trackingRoutes = require('./trackingRoutes');
const notificationRoutes = require('./notificationRoutes');
const monitoringRoutes = require('./monitoringRoutes');

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
router.use('/authorization', authorizationRoutes);
router.use('/branches', branchRoutes);
router.use('/service-areas', serviceAreaRoutes);
router.use('/divisions', divisionRoutes);
router.use('/positions', positionRoutes);
router.use('/forwarders', forwarderRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/customers', customerRoutes);
router.use('/pickup-requests', pickupRequestRoutes);
router.use('/pickup-assignments', pickupAssignmentRoutes);
router.use('/pickup-items', pickupItemRoutes);
router.use('/shipments', shipmentOrderRoutes);
router.use('/pricing', pricingRoutes);
router.use('/documents', waybillDocumentRoutes);
router.use('/uploads', fileUploadRoutes);
router.use('/loading-forms', loadingFormRoutes);
router.use('/inter-branch-shipments', shipmentRoutes);
router.use('/delivery-orders', deliveryOrderRoutes);
router.use('/tracking', trackingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/monitoring', monitoringRoutes);

module.exports = router;
