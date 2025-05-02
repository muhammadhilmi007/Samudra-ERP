/* eslint-disable class-methods-use-this */
const Employee = require('../models/employee');
const { NotFoundError } = require('../../infrastructure/errors/errors');

/**
 * Employee Repository
 * Handles all data access operations for employees
 */
class EmployeeRepository {
  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created employee
   */
  async create(employeeData, user) {
    const employee = new Employee({
      ...employeeData,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return employee.save();
  }

  /**
   * Find employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Employee document
   * @throws {NotFoundError} If employee is not found
   */
  async findById(id) {
    const employee = await Employee.findById(id)
      .populate('position')
      .populate('branch')
      .populate('user', '-passwordHash -salt');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  /**
   * Find employee by employee ID
   * @param {string} employeeId - Employee ID (not MongoDB _id)
   * @returns {Promise<Object>} Employee document
   * @throws {NotFoundError} If employee is not found
   */
  async findByEmployeeId(employeeId) {
    const employee = await Employee.findOne({ employeeId })
      .populate('position')
      .populate('branch')
      .populate('user', '-passwordHash -salt');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  /**
   * Find all employees with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async findAll(filter = {}, options = {}) {
    const {
      page = 1, limit = 10, sortBy = 'employeeId', sortOrder = 'asc',
    } = options;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const employees = await Employee.find(filter)
      .populate('position')
      .populate('branch')
      .populate('user', '-passwordHash -salt')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(filter);

    return {
      data: employees,
      meta: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update an employee
   * @param {string} id - Employee ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   * @throws {NotFoundError} If employee is not found
   */
  async update(id, updateData, user) {
    const employee = await Employee.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: user._id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    )
      .populate('position')
      .populate('branch')
      .populate('user', '-passwordHash -salt');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  /**
   * Delete an employee
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {NotFoundError} If employee is not found
   */
  async delete(id) {
    const result = await Employee.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundError('Employee not found');
    }

    return true;
  }

  /**
   * Find employees by branch ID
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async findByBranch(branchId, options = {}) {
    return this.findAll({ branch: branchId }, options);
  }

  /**
   * Find employees by position ID
   * @param {string} positionId - Position ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async findByPosition(positionId, options = {}) {
    return this.findAll({ position: positionId }, options);
  }

  /**
   * Find employees by status
   * @param {string} status - Employee status
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async findByStatus(status, options = {}) {
    return this.findAll({ status }, options);
  }

  /**
   * Find employee by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Employee document
   * @throws {NotFoundError} If employee is not found
   */
  async findByUserId(userId) {
    const employee = await Employee.findOne({ user: userId })
      .populate('position')
      .populate('branch')
      .populate('user', '-passwordHash -salt');

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    return employee;
  }

  /**
   * Add document to employee
   * @param {string} id - Employee ID
   * @param {Object} document - Document data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   * @throws {NotFoundError} If employee is not found
   */
  async addDocument(id, document, user) {
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    employee.documents.push(document);
    employee.updatedBy = user._id;
    employee.updatedAt = new Date();

    return employee.save();
  }

  /**
   * Update employee document
   * @param {string} id - Employee ID
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Document data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   * @throws {NotFoundError} If employee or document is not found
   */
  async updateDocument(id, documentId, updateData, user) {
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const documentIndex = employee.documents.findIndex((doc) => doc._id.toString() === documentId);

    if (documentIndex === -1) {
      throw new NotFoundError('Document not found');
    }

    employee.documents[documentIndex] = {
      ...employee.documents[documentIndex].toObject(),
      ...updateData,
    };

    employee.updatedBy = user._id;
    employee.updatedAt = new Date();

    return employee.save();
  }

  /**
   * Remove document from employee
   * @param {string} id - Employee ID
   * @param {string} documentId - Document ID
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   * @throws {NotFoundError} If employee or document is not found
   */
  async removeDocument(id, documentId, user) {
    const employee = await Employee.findById(id);

    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    const documentIndex = employee.documents.findIndex((doc) => doc._id.toString() === documentId);

    if (documentIndex === -1) {
      throw new NotFoundError('Document not found');
    }

    employee.documents.splice(documentIndex, 1);
    employee.updatedBy = user._id;
    employee.updatedAt = new Date();

    return employee.save();
  }
}

module.exports = new EmployeeRepository();
