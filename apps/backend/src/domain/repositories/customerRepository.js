/* eslint-disable class-methods-use-this */
/* eslint-disable no-useless-catch */
/**
 * Samudra Paket ERP - Customer Repository
 * Handles database operations for customers
 */

const Customer = require('../models/customer');

/**
 * Customer Repository
 * Provides methods for customer data access
 */
class CustomerRepository {
  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    try {
      const customer = new Customer(customerData);
      return await customer.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all customers
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting, search)
   * @returns {Promise<Object>} List of customers with pagination metadata
   */
  async getAllCustomers(filter = {}, options = {}) {
    try {
      const {
        page = 1, 
        limit = 10, 
        sortBy = 'name', 
        sortOrder = 'asc', 
        populate = [],
        search = '',
        category = '',
        status = '',
        city = '',
        province = '',
      } = options;

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
      
      // Build filter object
      const queryFilter = { ...filter };
      
      // Add search functionality
      if (search) {
        queryFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'contactInfo.primaryPhone': { $regex: search, $options: 'i' } },
          { 'contactInfo.email': { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ];
      }
      
      // Add category filter
      if (category) {
        queryFilter.category = category;
      }
      
      // Add status filter
      if (status) {
        queryFilter.status = status;
      }
      
      // Add location filters
      if (city) {
        queryFilter['address.city'] = { $regex: city, $options: 'i' };
      }
      
      if (province) {
        queryFilter['address.province'] = { $regex: province, $options: 'i' };
      }

      // Build the query
      const query = Customer.find(queryFilter).sort(sort).skip(skip).limit(limit);

      // Apply population if needed
      if (populate.includes('branch')) {
        query.populate('branch', 'name code');
      }

      if (populate.includes('registeredBy')) {
        query.populate('registeredBy', 'name email');
      }

      // Execute query
      const customers = await query.exec();
      const total = await Customer.countDocuments(queryFilter);

      return {
        data: customers,
        meta: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param {string} id - Customer ID
   * @param {Array} populate - Fields to populate
   * @returns {Promise<Object>} Customer
   */
  async getCustomerById(id, populate = []) {
    try {
      const query = Customer.findById(id);

      // Apply population if needed
      if (populate.includes('branch')) {
        query.populate('branch', 'name code');
      }

      if (populate.includes('registeredBy')) {
        query.populate('registeredBy', 'name email');
      }

      const customer = await query.exec();
      return customer;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update customer
   * @param {string} id - Customer ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Update options
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, updateData, options = { new: true }) {
    try {
      return await Customer.findByIdAndUpdate(id, updateData, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {string} id - Customer ID
   * @returns {Promise<Object>} Deleted customer
   */
  async deleteCustomer(id) {
    try {
      return await Customer.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add activity to customer history
   * @param {string} customerId - Customer ID
   * @param {string} action - Action performed
   * @param {string} userId - User who performed the action
   * @param {Object} details - Additional details
   * @returns {Promise<Object>} Updated customer
   */
  async addCustomerActivity(customerId, action, userId, details = {}) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      return await customer.addActivity(action, userId, details);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customer activity history
   * @param {string} customerId - Customer ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Object>} Activity history with pagination metadata
   */
  async getCustomerActivityHistory(customerId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortOrder = 'desc',
      } = options;

      const customer = await Customer.findById(customerId)
        .populate({
          path: 'activityHistory.performedBy',
          select: 'name email',
        });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Sort activities by timestamp
      const sortedActivities = [...customer.activityHistory].sort((a, b) => {
        return sortOrder === 'desc' 
          ? new Date(b.timestamp) - new Date(a.timestamp)
          : new Date(a.timestamp) - new Date(b.timestamp);
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedActivities = sortedActivities.slice(startIndex, endIndex);

      return {
        data: paginatedActivities,
        meta: {
          total: customer.activityHistory.length,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(customer.activityHistory.length / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get customers by category
   * @param {string} category - Customer category
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Customers list with pagination metadata
   */
  async getCustomersByCategory(category, options = {}) {
    try {
      return await this.getAllCustomers({ category }, options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search customers
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Search results with pagination metadata
   */
  async searchCustomers(query, options = {}) {
    try {
      return await this.getAllCustomers({}, { ...options, search: query });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CustomerRepository();
