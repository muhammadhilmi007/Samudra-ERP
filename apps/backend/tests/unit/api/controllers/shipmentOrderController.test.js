const request = require('supertest');
const express = require('express');
const ShipmentOrderController = require('../../../../src/api/controllers/shipmentOrderController');

// Mock dependencies
const mockShipmentOrderRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  validateDestination: jest.fn(),
  calculatePrice: jest.fn(),
};
const mockServiceAreaRepository = {};
const mockDocumentGenerationService = {
  generateDocument: jest.fn(),
};

// Setup Express app
const app = express();
app.use(express.json());
const controller = new ShipmentOrderController(
  mockShipmentOrderRepository,
  mockServiceAreaRepository,
  mockDocumentGenerationService
);

// Route bindings
app.post('/api/shipments', (req, res, next) => controller.createShipmentOrder(req, res, next));
app.put('/api/shipments/:id', (req, res, next) => controller.updateShipmentOrder(req, res, next));
app.put('/api/shipments/:id/status', (req, res, next) => controller.updateShipmentOrderStatus(req, res, next));
app.get('/api/shipments/:id/waybill-document', (req, res, next) => {
  req.user = { id: 'user123' };
  controller.generateWaybillDocument(req, res, next);
});

// Test data
describe('ShipmentOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createShipmentOrder', () => {
    it('should create shipment order successfully', async () => {
      mockShipmentOrderRepository.validateDestination.mockResolvedValue(true);
      mockShipmentOrderRepository.create.mockResolvedValue({ _id: 'order1', status: 'created' });
      const res = await request(app)
        .post('/api/shipments')
        .send({ receiver: { address: { province: 'Jawa Barat', city: 'Bandung', district: 'Coblong' } }, items: [{}] });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockShipmentOrderRepository.create).toHaveBeenCalled();
    });
    it('should return error if destination invalid', async () => {
      mockShipmentOrderRepository.validateDestination.mockResolvedValue(false);
      const res = await request(app)
        .post('/api/shipments')
        .send({ receiver: { address: { province: 'Jawa Barat', city: 'Bandung', district: 'Coblong' } }, items: [{}] });
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('updateShipmentOrder', () => {
    it('should update shipment order successfully', async () => {
      mockShipmentOrderRepository.findById.mockResolvedValue({ _id: 'order1', receiver: { address: {} } });
      mockShipmentOrderRepository.update.mockResolvedValue({ _id: 'order1', status: 'updated' });
      const res = await request(app)
        .put('/api/shipments/order1')
        .send({});
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockShipmentOrderRepository.update).toHaveBeenCalled();
    });
    it('should return error if shipment order not found', async () => {
      mockShipmentOrderRepository.findById.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/shipments/order1')
        .send({});
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('updateShipmentOrderStatus', () => {
    it('should update status successfully', async () => {
      mockShipmentOrderRepository.findById.mockResolvedValue({ _id: 'order1' });
      mockShipmentOrderRepository.updateStatus.mockResolvedValue({ _id: 'order1', status: 'delivered' });
      const res = await request(app)
        .put('/api/shipments/order1/status')
        .send({ status: 'delivered' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockShipmentOrderRepository.updateStatus).toHaveBeenCalled();
    });
    it('should return error if shipment order not found', async () => {
      mockShipmentOrderRepository.findById.mockResolvedValue(null);
      const res = await request(app)
        .put('/api/shipments/order1/status')
        .send({ status: 'delivered' });
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('generateWaybillDocument', () => {
    it('should generate waybill document successfully', async () => {
      mockDocumentGenerationService.generateDocument.mockResolvedValue({
        documentId: 'doc1',
        documentType: 'waybill',
        waybillNumber: 'WB123',
        fileUrl: 'http://localhost/file.pdf',
        accessToken: 'token123',
        createdAt: new Date().toISOString(),
      });
      const res = await request(app)
        .get('/api/shipments/order1/waybill-document');
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document.documentType).toBe('waybill');
      expect(mockDocumentGenerationService.generateDocument).toHaveBeenCalled();
    });
    it('should return error if document generation fails', async () => {
      mockDocumentGenerationService.generateDocument.mockRejectedValue(new Error('Failed'));
      const res = await request(app)
        .get('/api/shipments/order1/waybill-document');
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
}); 