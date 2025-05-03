/**
 * Samudra Paket ERP - Shipment Routes Tests
 * Unit tests for the shipment routes
 */

const request = require('supertest');
const express = require('express');
const shipmentRoutes = require('../../../../api/routes/shipmentRoutes');
const shipmentController = require('../../../../api/controllers/shipmentController');
const { authenticate } = require('../../../../api/middleware/authMiddleware');
const { authorize } = require('../../../../api/middleware/roleMiddleware');

// Mock dependencies
jest.mock('../../../../api/controllers/shipmentController', () => ({
  createShipment: jest.fn((req, res) => res.status(201).json({ success: true })),
  getAllShipments: jest.fn((req, res) => res.status(200).json({ success: true })),
  getShipmentById: jest.fn((req, res) => res.status(200).json({ success: true })),
  getShipmentByShipmentNo: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateShipment: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateStatus: jest.fn((req, res) => res.status(200).json({ success: true })),
  recordGpsLocation: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateETA: jest.fn((req, res) => res.status(200).json({ success: true })),
  addCheckpoint: jest.fn((req, res) => res.status(200).json({ success: true })),
  updateCheckpointStatus: jest.fn((req, res) => res.status(200).json({ success: true })),
  reportIssue: jest.fn((req, res) => res.status(200).json({ success: true })),
  resolveIssue: jest.fn((req, res) => res.status(200).json({ success: true })),
  getActiveBranchShipments: jest.fn((req, res) => res.status(200).json({ success: true })),
  getShipmentsBetweenBranches: jest.fn((req, res) => res.status(200).json({ success: true })),
  getTodayShipments: jest.fn((req, res) => res.status(200).json({ success: true })),
  getShipmentsForDelivery: jest.fn((req, res) => res.status(200).json({ success: true })),
}));

jest.mock('../../../../api/middleware/authMiddleware', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 'userId', role: 'admin' };
    next();
  }),
}));

jest.mock('../../../../api/middleware/roleMiddleware', () => ({
  authorize: (roles) => jest.fn((req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
    }
  }),
}));

describe('Shipment Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inter-branch-shipments', shipmentRoutes);
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should call createShipment controller', async () => {
      const response = await request(app)
        .post('/api/inter-branch-shipments')
        .send({
          loadingForm: 'loadingFormId',
          vehicle: 'vehicleId',
          driver: 'driverId',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.createShipment).toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    it('should call getAllShipments controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getAllShipments).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should call getShipmentById controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/shipmentId');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getShipmentById).toHaveBeenCalled();
    });
  });

  describe('GET /shipment-no/:shipmentNo', () => {
    it('should call getShipmentByShipmentNo controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/shipment-no/SP2505BR0001');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getShipmentByShipmentNo).toHaveBeenCalled();
    });
  });

  describe('PUT /:id', () => {
    it('should call updateShipment controller', async () => {
      const response = await request(app)
        .put('/api/inter-branch-shipments/shipmentId')
        .send({
          route: 'Updated route',
          notes: 'Updated notes',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.updateShipment).toHaveBeenCalled();
    });
  });

  describe('PUT /:id/status', () => {
    it('should call updateStatus controller', async () => {
      const response = await request(app)
        .put('/api/inter-branch-shipments/shipmentId/status')
        .send({
          status: 'departed',
          notes: 'Departed from origin branch',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.updateStatus).toHaveBeenCalled();
    });
  });

  describe('POST /:id/gps-location', () => {
    it('should call recordGpsLocation controller', async () => {
      const response = await request(app)
        .post('/api/inter-branch-shipments/shipmentId/gps-location')
        .send({
          coordinates: [106.8456, -6.2088],
          speed: 60,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.recordGpsLocation).toHaveBeenCalled();
    });
  });

  describe('PUT /:id/eta', () => {
    it('should call updateETA controller', async () => {
      const response = await request(app)
        .put('/api/inter-branch-shipments/shipmentId/eta')
        .send({
          estimatedArrival: '2023-05-01T16:00:00.000Z',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.updateETA).toHaveBeenCalled();
    });
  });

  describe('POST /:id/checkpoints', () => {
    it('should call addCheckpoint controller', async () => {
      const response = await request(app)
        .post('/api/inter-branch-shipments/shipmentId/checkpoints')
        .send({
          name: 'Rest Area KM 50',
          location: {
            coordinates: [106.5678, -6.1234],
            address: 'Rest Area KM 50, Jakarta-Bandung',
          },
          estimatedArrival: '2023-05-01T10:00:00.000Z',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.addCheckpoint).toHaveBeenCalled();
    });
  });

  describe('PUT /:id/checkpoints/:checkpointIndex/status', () => {
    it('should call updateCheckpointStatus controller', async () => {
      const response = await request(app)
        .put('/api/inter-branch-shipments/shipmentId/checkpoints/0/status')
        .send({
          status: 'arrived',
          notes: 'Arrived at checkpoint',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.updateCheckpointStatus).toHaveBeenCalled();
    });
  });

  describe('POST /:id/issues', () => {
    it('should call reportIssue controller', async () => {
      const response = await request(app)
        .post('/api/inter-branch-shipments/shipmentId/issues')
        .send({
          type: 'vehicle_breakdown',
          description: 'Flat tire',
          location: {
            coordinates: [106.7890, -6.3456],
            address: 'KM 75, Jakarta-Bandung',
          },
          severity: 'medium',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.reportIssue).toHaveBeenCalled();
    });
  });

  describe('PUT /:id/issues/:issueIndex/resolve', () => {
    it('should call resolveIssue controller', async () => {
      const response = await request(app)
        .put('/api/inter-branch-shipments/shipmentId/issues/0/resolve')
        .send({
          resolution: 'Changed the tire',
          resolutionTime: 45,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.resolveIssue).toHaveBeenCalled();
    });
  });

  describe('GET /branch/:branchId/active', () => {
    it('should call getActiveBranchShipments controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/branch/branchId/active');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getActiveBranchShipments).toHaveBeenCalled();
    });
  });

  describe('GET /coordination/:originBranchId/:destinationBranchId', () => {
    it('should call getShipmentsBetweenBranches controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/coordination/originBranchId/destinationBranchId');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getShipmentsBetweenBranches).toHaveBeenCalled();
    });
  });

  describe('GET /today', () => {
    it('should call getTodayShipments controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/today');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getTodayShipments).toHaveBeenCalled();
    });
  });

  describe('GET /branch/:branchId/for-delivery', () => {
    it('should call getShipmentsForDelivery controller', async () => {
      const response = await request(app)
        .get('/api/inter-branch-shipments/branch/branchId/for-delivery');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(authenticate).toHaveBeenCalled();
      expect(shipmentController.getShipmentsForDelivery).toHaveBeenCalled();
    });
  });
});
