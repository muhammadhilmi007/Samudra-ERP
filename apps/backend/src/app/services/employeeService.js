/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
const employeeRepository = require('../../domain/repositories/employeeRepository');
const branchRepository = require('../../domain/repositories/branchRepository');
const positionRepository = require('../../domain/repositories/positionRepository');
const userRepository = require('../../domain/repositories/userRepository');
const { BadRequestError, NotFoundError, ConflictError } = require('../../infrastructure/errors/errors');

/**
 * Employee Service
 * Handles business logic for employee management
 */
class EmployeeService {
  /**
   * Create a new employee
   * @param {Object} employeeData - Employee data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Created employee
   */
  async createEmployee(employeeData, user) {
    // Validate branch exists
    if (employeeData.branch) {
      await branchRepository.findById(employeeData.branch);
    }

    // Validate position exists
    if (employeeData.position) {
      await positionRepository.findById(employeeData.position);
    }

    // Validate user exists if provided
    if (employeeData.user) {
      await userRepository.findById(employeeData.user);

      // Check if user is already associated with another employee
      try {
        const existingEmployee = await employeeRepository.findByUserId(employeeData.user);
        if (existingEmployee) {
          throw new ConflictError('User is already associated with another employee');
        }
      } catch (error) {
        // NotFoundError is expected and means user is not associated with any employee
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    }

    // Check if employee ID is already in use
    try {
      const existingEmployee = await employeeRepository.findByEmployeeId(employeeData.employeeId);
      if (existingEmployee) {
        throw new ConflictError('Employee ID is already in use');
      }
    } catch (error) {
      // NotFoundError is expected and means employeeId is available
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }

    return employeeRepository.create(employeeData, user);
  }

  /**
   * Get employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<Object>} Employee document
   */
  async getEmployeeById(id) {
    return employeeRepository.findById(id);
  }

  /**
   * Get employee by employee ID
   * @param {string} employeeId - Employee ID (not MongoDB _id)
   * @returns {Promise<Object>} Employee document
   */
  async getEmployeeByEmployeeId(employeeId) {
    return employeeRepository.findByEmployeeId(employeeId);
  }

  /**
   * Get all employees with optional filtering
   * @param {Object} filter - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async getAllEmployees(filter = {}, options = {}) {
    return employeeRepository.findAll(filter, options);
  }

  /**
   * Update an employee
   * @param {string} id - Employee ID
   * @param {Object} updateData - Data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployee(id, updateData, user) {
    // Validate branch exists if provided
    if (updateData.branch) {
      await branchRepository.findById(updateData.branch);
    }

    // Validate position exists if provided
    if (updateData.position) {
      await positionRepository.findById(updateData.position);
    }

    // Validate user exists if provided
    if (updateData.user) {
      await userRepository.findById(updateData.user);

      // Check if user is already associated with another employee
      try {
        const existingEmployee = await employeeRepository.findByUserId(updateData.user);
        if (existingEmployee && existingEmployee._id.toString() !== id) {
          throw new ConflictError('User is already associated with another employee');
        }
      } catch (error) {
        // NotFoundError is expected and means user is not associated with any employee
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    }

    // Check if employee ID is already in use if updating employeeId
    if (updateData.employeeId) {
      try {
        const existingEmployee = await employeeRepository.findByEmployeeId(updateData.employeeId);
        if (existingEmployee && existingEmployee._id.toString() !== id) {
          throw new ConflictError('Employee ID is already in use');
        }
      } catch (error) {
        // NotFoundError is expected and means employeeId is available
        if (!(error instanceof NotFoundError)) {
          throw error;
        }
      }
    }

    return employeeRepository.update(id, updateData, user);
  }

  /**
   * Delete an employee
   * @param {string} id - Employee ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteEmployee(id) {
    return employeeRepository.delete(id);
  }

  /**
   * Get employees by branch
   * @param {string} branchId - Branch ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async getEmployeesByBranch(branchId, options = {}) {
    // Validate branch exists
    await branchRepository.findById(branchId);

    return employeeRepository.findByBranch(branchId, options);
  }

  /**
   * Get employees by position
   * @param {string} positionId - Position ID
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async getEmployeesByPosition(positionId, options = {}) {
    // Validate position exists
    await positionRepository.findById(positionId);

    return employeeRepository.findByPosition(positionId, options);
  }

  /**
   * Get employees by status
   * @param {string} status - Employee status
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of employees
   */
  async getEmployeesByStatus(status, options = {}) {
    const validStatuses = ['active', 'inactive', 'on_leave', 'terminated'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestError(
        'Invalid status. Must be one of: active, inactive, on_leave, terminated',
      );
    }

    return employeeRepository.findByStatus(status, options);
  }

  /**
   * Get employee by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Employee document
   */
  async getEmployeeByUserId(userId) {
    // Validate user exists
    await userRepository.findById(userId);

    return employeeRepository.findByUserId(userId);
  }

  /**
   * Add document to employee
   * @param {string} id - Employee ID
   * @param {Object} document - Document data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   */
  async addEmployeeDocument(id, document, user) {
    const validDocumentTypes = [
      'id_card',
      'passport',
      'driving_license',
      'certificate',
      'contract',
      'other',
    ];

    if (!validDocumentTypes.includes(document.type)) {
      throw new BadRequestError(
        `Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`,
      );
    }

    if (!document.number) {
      throw new BadRequestError('Document number is required');
    }

    if (!document.issuedDate) {
      throw new BadRequestError('Document issued date is required');
    }

    return employeeRepository.addDocument(id, document, user);
  }

  /**
   * Update employee document
   * @param {string} id - Employee ID
   * @param {string} documentId - Document ID
   * @param {Object} updateData - Document data to update
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployeeDocument(id, documentId, updateData, user) {
    if (updateData.type) {
      const validDocumentTypes = [
        'id_card',
        'passport',
        'driving_license',
        'certificate',
        'contract',
        'other',
      ];

      if (!validDocumentTypes.includes(updateData.type)) {
        throw new BadRequestError(
          `Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`,
        );
      }
    }

    return employeeRepository.updateDocument(id, documentId, updateData, user);
  }

  /**
   * Remove document from employee
   * @param {string} id - Employee ID
   * @param {string} documentId - Document ID
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   */
  async removeEmployeeDocument(id, documentId, user) {
    return employeeRepository.removeDocument(id, documentId, user);
  }

  /**
   * Update employee status
   * @param {string} id - Employee ID
   * @param {string} status - New status
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Updated employee
   */
  async updateEmployeeStatus(id, status, user) {
    const validStatuses = ['active', 'inactive', 'on_leave', 'terminated'];

    if (!validStatuses.includes(status)) {
      throw new BadRequestError(
        'Invalid status. Must be one of: active, inactive, on_leave, terminated',
      );
    }

    return employeeRepository.update(id, { status }, user);
  }
}

module.exports = new EmployeeService();
