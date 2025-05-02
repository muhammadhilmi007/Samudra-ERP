const employeeService = require('../../../../app/services/employeeService');
const employeeRepository = require('../../../../domain/repositories/employeeRepository');
const branchRepository = require('../../../../domain/repositories/branchRepository');
const positionRepository = require('../../../../domain/repositories/positionRepository');
const userRepository = require('../../../../domain/repositories/userRepository');
const {
  BadRequestError,
  NotFoundError,
  ConflictError,
} = require('../../../../infrastructure/errors/errors');

// Mock the repositories
jest.mock('../../../../domain/repositories/employeeRepository');
jest.mock('../../../../domain/repositories/branchRepository');
jest.mock('../../../../domain/repositories/positionRepository');
jest.mock('../../../../domain/repositories/userRepository');

describe('Employee Service', () => {
  // Sample data for testing
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockBranch = {
    _id: 'branch123',
    name: 'Test Branch',
    code: 'TB001',
  };

  const mockPosition = {
    _id: 'position123',
    name: 'Test Position',
    code: 'TP001',
  };

  const mockEmployee = {
    _id: 'employee123',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: new Date('1990-01-01'),
    gender: 'male',
    maritalStatus: 'single',
    position: mockPosition._id,
    branch: mockBranch._id,
    joinDate: new Date('2023-01-01'),
    status: 'active',
  };

  const mockEmployeeWithUser = {
    ...mockEmployee,
    user: mockUser._id,
  };

  const mockDocument = {
    type: 'id_card',
    number: 'ID12345',
    issuedDate: new Date('2020-01-01'),
    expiryDate: new Date('2025-01-01'),
    fileUrl: 'http://example.com/id-card.pdf',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createEmployee', () => {
    it('should create an employee successfully', async () => {
      // Setup mocks
      branchRepository.findById.mockResolvedValue(mockBranch);
      positionRepository.findById.mockResolvedValue(mockPosition);
      employeeRepository.findByEmployeeId.mockRejectedValue(
        new NotFoundError('Employee not found'),
      );
      employeeRepository.create.mockResolvedValue(mockEmployee);

      // Call the service
      const result = await employeeService.createEmployee(mockEmployee, mockUser);

      // Assertions
      expect(branchRepository.findById).toHaveBeenCalledWith(mockEmployee.branch);
      expect(positionRepository.findById).toHaveBeenCalledWith(mockEmployee.position);
      expect(employeeRepository.findByEmployeeId).toHaveBeenCalledWith(mockEmployee.employeeId);
      expect(employeeRepository.create).toHaveBeenCalledWith(mockEmployee, mockUser);
      expect(result).toEqual(mockEmployee);
    });

    it('should create an employee with user association successfully', async () => {
      // Setup mocks
      branchRepository.findById.mockResolvedValue(mockBranch);
      positionRepository.findById.mockResolvedValue(mockPosition);
      userRepository.findById.mockResolvedValue(mockUser);
      employeeRepository.findByUserId.mockRejectedValue(new NotFoundError('Employee not found'));
      employeeRepository.findByEmployeeId.mockRejectedValue(
        new NotFoundError('Employee not found'),
      );
      employeeRepository.create.mockResolvedValue(mockEmployeeWithUser);

      // Call the service
      const result = await employeeService.createEmployee(mockEmployeeWithUser, mockUser);

      // Assertions
      expect(branchRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.branch);
      expect(positionRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.position);
      expect(userRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.user);
      expect(employeeRepository.findByUserId).toHaveBeenCalledWith(mockEmployeeWithUser.user);
      expect(employeeRepository.findByEmployeeId).toHaveBeenCalledWith(
        mockEmployeeWithUser.employeeId,
      );
      expect(employeeRepository.create).toHaveBeenCalledWith(mockEmployeeWithUser, mockUser);
      expect(result).toEqual(mockEmployeeWithUser);
    });

    it('should throw ConflictError if employee ID is already in use', async () => {
      // Setup mocks
      branchRepository.findById.mockResolvedValue(mockBranch);
      positionRepository.findById.mockResolvedValue(mockPosition);
      employeeRepository.findByEmployeeId.mockResolvedValue(mockEmployee);

      // Call the service and expect it to throw
      await expect(employeeService.createEmployee(mockEmployee, mockUser)).rejects.toThrow(
        ConflictError,
      );

      // Assertions
      expect(branchRepository.findById).toHaveBeenCalledWith(mockEmployee.branch);
      expect(positionRepository.findById).toHaveBeenCalledWith(mockEmployee.position);
      expect(employeeRepository.findByEmployeeId).toHaveBeenCalledWith(mockEmployee.employeeId);
      expect(employeeRepository.create).not.toHaveBeenCalled();
    });

    // eslint-disable-next-line max-len
    it('should throw ConflictError if user is already associated with another employee', async () => {
      // Setup mocks
      branchRepository.findById.mockResolvedValue(mockBranch);
      positionRepository.findById.mockResolvedValue(mockPosition);
      userRepository.findById.mockResolvedValue(mockUser);
      employeeRepository.findByUserId.mockResolvedValue(mockEmployee);

      // Call the service and expect it to throw
      await expect(employeeService.createEmployee(mockEmployeeWithUser, mockUser)).rejects.toThrow(
        ConflictError,
      );

      // Assertions
      expect(branchRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.branch);
      expect(positionRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.position);
      expect(userRepository.findById).toHaveBeenCalledWith(mockEmployeeWithUser.user);
      expect(employeeRepository.findByUserId).toHaveBeenCalledWith(mockEmployeeWithUser.user);
      expect(employeeRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getEmployeeById', () => {
    it('should get an employee by ID successfully', async () => {
      // Setup mocks
      employeeRepository.findById.mockResolvedValue(mockEmployee);

      // Call the service
      const result = await employeeService.getEmployeeById(mockEmployee._id);

      // Assertions
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw NotFoundError if employee is not found', async () => {
      // Setup mocks
      employeeRepository.findById.mockRejectedValue(new NotFoundError('Employee not found'));

      // Call the service and expect it to throw
      await expect(employeeService.getEmployeeById('nonexistent')).rejects.toThrow(NotFoundError);

      // Assertions
      expect(employeeRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('updateEmployee', () => {
    it('should update an employee successfully', async () => {
      // Setup mocks
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      const updatedEmployee = { ...mockEmployee, ...updateData };

      branchRepository.findById.mockResolvedValue(mockBranch);
      positionRepository.findById.mockResolvedValue(mockPosition);
      employeeRepository.update.mockResolvedValue(updatedEmployee);

      // Call the service
      const result = await employeeService.updateEmployee(mockEmployee._id, updateData, mockUser);

      // Assertions
      expect(employeeRepository.update).toHaveBeenCalledWith(
        mockEmployee._id,
        updateData,
        mockUser,
      );
      expect(result).toEqual(updatedEmployee);
    });
  });

  describe('addEmployeeDocument', () => {
    it('should add a document to an employee successfully', async () => {
      // Setup mocks
      const employeeWithDoc = {
        ...mockEmployee,
        documents: [mockDocument],
      };

      employeeRepository.addDocument.mockResolvedValue(employeeWithDoc);

      // Call the service
      const result = await employeeService.addEmployeeDocument(
        mockEmployee._id,
        mockDocument,
        mockUser,
      );

      // Assertions
      expect(employeeRepository.addDocument).toHaveBeenCalledWith(
        mockEmployee._id,
        mockDocument,
        mockUser,
      );
      expect(result).toEqual(employeeWithDoc);
    });

    it('should throw BadRequestError if document type is invalid', async () => {
      // Setup invalid document
      const invalidDocument = { ...mockDocument, type: 'invalid_type' };

      // Call the service and expect it to throw
      await expect(
        employeeService.addEmployeeDocument(mockEmployee._id, invalidDocument, mockUser),
      ).rejects.toThrow(BadRequestError);

      // Assertions
      expect(employeeRepository.addDocument).not.toHaveBeenCalled();
    });
  });

  describe('updateEmployeeStatus', () => {
    it('should update employee status successfully', async () => {
      // Setup mocks
      const newStatus = 'on_leave';
      const updatedEmployee = { ...mockEmployee, status: newStatus };

      employeeRepository.update.mockResolvedValue(updatedEmployee);

      // Call the service
      const result = await employeeService.updateEmployeeStatus(
        mockEmployee._id,
        newStatus,
        mockUser,
      );

      // Assertions
      expect(employeeRepository.update).toHaveBeenCalledWith(
        mockEmployee._id,
        { status: newStatus },
        mockUser,
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should throw BadRequestError if status is invalid', async () => {
      // Setup invalid status
      const invalidStatus = 'invalid_status';

      // Call the service and expect it to throw
      await expect(
        employeeService.updateEmployeeStatus(mockEmployee._id, invalidStatus, mockUser),
      ).rejects.toThrow(BadRequestError);

      // Assertions
      expect(employeeRepository.update).not.toHaveBeenCalled();
    });
  });
});
