const pickupItemController = require('../../../../src/api/controllers/pickupItemController');
const pickupItemRepository = require('../../../../src/domain/repositories/pickupItemRepository');
const httpMocks = require('node-mocks-http');

jest.mock('../../../../src/domain/repositories/pickupItemRepository');

describe('PickupItemController', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    next = jest.fn();
  });

  describe('createPickupItem', () => {
    it('should create a pickup item and return 201', async () => {
      req.body = {
        pickupRequest: 'reqid',
        pickupAssignment: 'assignid',
        description: 'Barang A',
        category: 'parcel',
        weight: { value: 2, unit: 'kg' },
        dimensions: { length: 10, width: 10, height: 10, unit: 'cm' },
      };
      req.user = { _id: 'userid' };
      const mockItem = { _id: 'itemid', ...req.body };
      pickupItemRepository.createPickupItem.mockResolvedValue(mockItem);

      await pickupItemController.createPickupItem(req, res, next);

      expect(pickupItemRepository.createPickupItem).toHaveBeenCalledWith({ ...req.body, createdBy: 'userid' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItem });
    });

    it('should call next with error if required fields missing', async () => {
      req.body = { description: 'Barang A' };
      await pickupItemController.createPickupItem(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getPickupItemById', () => {
    it('should return pickup item by id', async () => {
      req.params = { id: 'itemid' };
      req.query = {};
      const mockItem = { _id: 'itemid', description: 'Barang A' };
      pickupItemRepository.getPickupItemById.mockResolvedValue(mockItem);
      await pickupItemController.getPickupItemById(req, res, next);
      expect(pickupItemRepository.getPickupItemById).toHaveBeenCalledWith('itemid', []);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItem });
    });
    it('should call next with 404 if not found', async () => {
      req.params = { id: 'itemid' };
      req.query = {};
      pickupItemRepository.getPickupItemById.mockResolvedValue(null);
      await pickupItemController.getPickupItemById(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updatePickupItem', () => {
    it('should update pickup item and return 200', async () => {
      req.params = { id: 'itemid' };
      req.body = { description: 'Barang B' };
      req.user = { _id: 'userid' };
      const mockItem = { _id: 'itemid', description: 'Barang B' };
      pickupItemRepository.updatePickupItem.mockResolvedValue(mockItem);
      await pickupItemController.updatePickupItem(req, res, next);
      expect(pickupItemRepository.updatePickupItem).toHaveBeenCalledWith('itemid', { ...req.body, updatedBy: 'userid' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockItem });
    });
  });
}); 