/**
 * Samudra Paket ERP - Customer Controller Unit Tests
 */

const customerController = require('../../../../src/api/controllers/customerController');
const customerRepository = require('../../../../src/domain/repositories/customerRepository');
const { ApiError } = require('../../../../src/infrastructure/errors/ApiError');

jest.mock('../../../../src/domain/repositories/customerRepository');

// Helper untuk mock req, res, next
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

describe('Customer Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {}, user: { id: 'user-id' } };
    res = mockRes();
    next = jest.fn();
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      req.body = { name: 'Test Customer', code: 'CUST001', branch: 'branch-id' };
      const createdCustomer = { ...req.body, _id: 'customer-id' };
      customerRepository.createCustomer.mockResolvedValue(createdCustomer);
      customerRepository.addCustomerActivity.mockResolvedValue({});

      await customerController.createCustomer(req, res, next);

      expect(customerRepository.createCustomer).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Customer' }));
      expect(customerRepository.addCustomerActivity).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: createdCustomer }));
    });

    it('should handle validation error', async () => {
      const error = { name: 'ValidationError', message: 'Invalid data' };
      customerRepository.createCustomer.mockRejectedValue(error);
      await customerController.createCustomer(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('getAllCustomers', () => {
    it('should return paginated customers', async () => {
      const result = { data: [{ name: 'A' }], meta: { total: 1 } };
      customerRepository.getAllCustomers.mockResolvedValue(result);
      await customerController.getAllCustomers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: result.data, meta: result.meta }));
    });
  });

  describe('getCustomerById', () => {
    it('should return customer by id', async () => {
      req.params.id = 'customer-id';
      const customer = { _id: 'customer-id', name: 'Test' };
      customerRepository.getCustomerById.mockResolvedValue(customer);
      await customerController.getCustomerById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: customer }));
    });
    it('should handle not found', async () => {
      req.params.id = 'notfound';
      customerRepository.getCustomerById.mockResolvedValue(null);
      await customerController.getCustomerById(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('updateCustomer', () => {
    it('should update customer', async () => {
      req.params.id = 'customer-id';
      req.body = { name: 'Updated' };
      const updated = { _id: 'customer-id', name: 'Updated' };
      customerRepository.updateCustomer.mockResolvedValue(updated);
      customerRepository.addCustomerActivity.mockResolvedValue({});
      await customerController.updateCustomer(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: updated }));
    });
    it('should handle not found', async () => {
      req.params.id = 'notfound';
      customerRepository.updateCustomer.mockResolvedValue(null);
      await customerController.updateCustomer(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('deleteCustomer', () => {
    it('should soft delete customer', async () => {
      req.params.id = 'customer-id';
      const customer = { _id: 'customer-id', status: 'inactive' };
      customerRepository.updateCustomer.mockResolvedValue(customer);
      customerRepository.addCustomerActivity.mockResolvedValue({});
      await customerController.deleteCustomer(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    it('should handle not found', async () => {
      req.params.id = 'notfound';
      customerRepository.updateCustomer.mockResolvedValue(null);
      await customerController.deleteCustomer(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('getCustomerActivityHistory', () => {
    it('should return activity history', async () => {
      req.params.id = 'customer-id';
      const result = { data: [{ action: 'created' }], meta: { total: 1 } };
      customerRepository.getCustomerActivityHistory.mockResolvedValue(result);
      await customerController.getCustomerActivityHistory(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: result.data, meta: result.meta }));
    });
  });

  describe('addCustomerActivity', () => {
    it('should add activity', async () => {
      req.params.id = 'customer-id';
      req.body = { action: 'test', details: { note: 'test' } };
      customerRepository.addCustomerActivity.mockResolvedValue({});
      await customerController.addCustomerActivity(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    it('should handle not found', async () => {
      req.params.id = 'notfound';
      req.body = { action: 'test' };
      customerRepository.addCustomerActivity.mockResolvedValue(null);
      await customerController.addCustomerActivity(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('getCustomersByCategory', () => {
    it('should return customers by category', async () => {
      req.params.category = 'vip';
      const result = { data: [{ name: 'VIP', category: 'vip' }], meta: { total: 1 } };
      customerRepository.getCustomersByCategory.mockResolvedValue(result);
      await customerController.getCustomersByCategory(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: result.data, meta: result.meta }));
    });
  });

  describe('searchCustomers', () => {
    it('should search customers', async () => {
      req.query.q = 'search';
      const result = { data: [{ name: 'Searchable' }] };
      customerRepository.searchCustomers.mockResolvedValue(result);
      await customerController.searchCustomers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: result.data }));
    });
  });
}); 