/* eslint-disable class-methods-use-this */
const employeeService = require('../../app/services/employeeService');
const { BadRequestError } = require('../../infrastructure/errors/errors');
const { validateObjectId } = require('../../infrastructure/utils/validationUtils');

/**
 * Employee Controller
 * Handles HTTP requests for employee management
 */
class EmployeeController {
  /**
   * Create a new employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  createEmployee = async (req, res, next) => {
    try {
      const employeeData = req.body;
      const { user } = req;

      const employee = await employeeService.createEmployee(employeeData, user);

      res.status(201).json({
        success: true,
        data: employee,
        message: 'Employee created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeById = async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      const employee = await employeeService.getEmployeeById(id);

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee by employee ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeByEmployeeId = async (req, res, next) => {
    try {
      const { employeeId } = req.params;

      const employee = await employeeService.getEmployeeByEmployeeId(employeeId);

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all employees with optional filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAllEmployees = async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'employeeId',
        sortOrder = 'asc',
        status,
        branch,
        position,
        search,
      } = req.query;

      // Build filter object
      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (branch) {
        if (!validateObjectId(branch)) {
          throw new BadRequestError('Invalid branch ID format');
        }
        filter.branch = branch;
      }

      if (position) {
        if (!validateObjectId(position)) {
          throw new BadRequestError('Invalid position ID format');
        }
        filter.position = position;
      }

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
          { 'contact.email': { $regex: search, $options: 'i' } },
          { 'contact.phone': { $regex: search, $options: 'i' } },
        ];
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const result = await employeeService.getAllEmployees(filter, options);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateEmployee = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const { user } = req;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      const employee = await employeeService.updateEmployee(id, updateData, user);

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Employee updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  deleteEmployee = async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      await employeeService.deleteEmployee(id);

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employees by branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeesByBranch = async (req, res, next) => {
    try {
      const { branchId } = req.params;
      const {
        page = 1, limit = 10, sortBy = 'employeeId', sortOrder = 'asc',
      } = req.query;

      if (!validateObjectId(branchId)) {
        throw new BadRequestError('Invalid branch ID format');
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const result = await employeeService.getEmployeesByBranch(branchId, options);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employees by position
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeesByPosition = async (req, res, next) => {
    try {
      const { positionId } = req.params;
      const {
        page = 1, limit = 10, sortBy = 'employeeId', sortOrder = 'asc',
      } = req.query;

      if (!validateObjectId(positionId)) {
        throw new BadRequestError('Invalid position ID format');
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const result = await employeeService.getEmployeesByPosition(positionId, options);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employees by status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeesByStatus = async (req, res, next) => {
    try {
      const { status } = req.params;
      const {
        page = 1, limit = 10, sortBy = 'employeeId', sortOrder = 'asc',
      } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder,
      };

      const result = await employeeService.getEmployeesByStatus(status, options);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get employee by user ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getEmployeeByUserId = async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!validateObjectId(userId)) {
        throw new BadRequestError('Invalid user ID format');
      }

      const employee = await employeeService.getEmployeeByUserId(userId);

      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Add document to employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  addEmployeeDocument = async (req, res, next) => {
    try {
      const { id } = req.params;
      const documentData = req.body;
      const { user } = req;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      const employee = await employeeService.addEmployeeDocument(id, documentData, user);

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Document added successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update employee document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateEmployeeDocument = async (req, res, next) => {
    try {
      const { id, documentId } = req.params;
      const updateData = req.body;
      const { user } = req;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      if (!validateObjectId(documentId)) {
        throw new BadRequestError('Invalid document ID format');
      }

      const employee = await employeeService.updateEmployeeDocument(
        id,
        documentId,
        updateData,
        user,
      );

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Document updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove document from employee
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  removeEmployeeDocument = async (req, res, next) => {
    try {
      const { id, documentId } = req.params;
      const { user } = req;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      if (!validateObjectId(documentId)) {
        throw new BadRequestError('Invalid document ID format');
      }

      const employee = await employeeService.removeEmployeeDocument(id, documentId, user);

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Document removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update employee status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateEmployeeStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { user } = req;

      if (!validateObjectId(id)) {
        throw new BadRequestError('Invalid employee ID format');
      }

      if (!status) {
        throw new BadRequestError('Status is required');
      }

      const employee = await employeeService.updateEmployeeStatus(id, status, user);

      res.status(200).json({
        success: true,
        data: employee,
        message: 'Employee status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new EmployeeController();
