/**
 * Unit tests for Leave Service
 */
const mongoose = require('mongoose');
const leaveService = require('../../../../app/services/leaveService');
const leaveRepository = require('../../../../domain/repositories/leaveRepository');
const employeeRepository = require('../../../../domain/repositories/employeeRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../../../../infrastructure/errors/errors');

// Mock dependencies
jest.mock('../../../../domain/repositories/leaveRepository');
jest.mock('../../../../domain/repositories/employeeRepository');

describe('Leave Service', () => {
  // Mock data
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    permissions: ['manage_all_leaves'],
  };

  const mockEmployee = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Employee',
    employeeId: 'EMP001',
    branch: new mongoose.Types.ObjectId(),
    leaveEntitlements: {
      2023: {
        annual: 14,
        sick: 10,
        maternity: 90,
        paternity: 7,
        bereavement: 3,
        unpaid: 0,
        other: 5,
      },
    },
  };

  const mockLeave = {
    _id: new mongoose.Types.ObjectId(),
    employee: mockEmployee._id,
    leaveType: 'annual',
    startDate: new Date('2023-01-10'),
    endDate: new Date('2023-01-15'),
    totalDays: 6,
    reason: 'Vacation',
    status: 'pending',
    branch: mockEmployee.branch,
    createdBy: mockUser._id,
    updatedBy: mockUser._id,
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLeaveRequest', () => {
    it('should create a new leave request', async () => {
      // Setup
      const leaveData = {
        employee: mockEmployee._id,
        leaveType: 'annual',
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-01-15'),
        reason: 'Vacation',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      leaveRepository.findAll.mockResolvedValue({ data: [] });
      leaveRepository.create.mockResolvedValue(mockLeave);

      // Execute
      const result = await leaveService.createLeaveRequest(leaveData, mockUser);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(leaveRepository.findAll).toHaveBeenCalled();
      expect(leaveRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...leaveData,
          totalDays: 6,
        }),
        mockUser
      );
      expect(result).toEqual(mockLeave);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      // Setup
      const leaveData = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(leaveService.createLeaveRequest(leaveData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if employee does not exist', async () => {
      // Setup
      const leaveData = {
        employee: new mongoose.Types.ObjectId(),
        leaveType: 'annual',
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-01-15'),
        reason: 'Vacation',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockRejectedValue(new NotFoundError('Employee not found'));

      // Execute & Verify
      await expect(leaveService.createLeaveRequest(leaveData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if end date is before start date', async () => {
      // Setup
      const leaveData = {
        employee: mockEmployee._id,
        leaveType: 'annual',
        startDate: new Date('2023-01-15'),
        endDate: new Date('2023-01-10'), // End date before start date
        reason: 'Vacation',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);

      // Execute & Verify
      await expect(leaveService.createLeaveRequest(leaveData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if overlapping leave request exists', async () => {
      // Setup
      const leaveData = {
        employee: mockEmployee._id,
        leaveType: 'annual',
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-01-15'),
        reason: 'Vacation',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      leaveRepository.findAll.mockResolvedValue({ data: [mockLeave] });

      // Execute & Verify
      await expect(leaveService.createLeaveRequest(leaveData, mockUser))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('getLeaveRequestById', () => {
    it('should return leave request by ID', async () => {
      // Setup
      leaveRepository.findById.mockResolvedValue(mockLeave);

      // Execute
      const result = await leaveService.getLeaveRequestById(mockLeave._id);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(result).toEqual(mockLeave);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.getLeaveRequestById())
        .rejects.toThrow(ValidationError);
    });

    it('should pass through NotFoundError from repository', async () => {
      // Setup
      leaveRepository.findById.mockRejectedValue(new NotFoundError('Leave request not found'));

      // Execute & Verify
      await expect(leaveService.getLeaveRequestById(mockLeave._id))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllLeaveRequests', () => {
    it('should return all leave requests with pagination', async () => {
      // Setup
      const mockLeaveList = {
        data: [mockLeave],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      leaveRepository.findAll.mockResolvedValue(mockLeaveList);

      // Execute
      const result = await leaveService.getAllLeaveRequests();

      // Verify
      expect(leaveRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLeaveList);
    });

    it('should apply filters and options correctly', async () => {
      // Setup
      const filter = { branch: mockEmployee.branch };
      const options = { page: 2, limit: 20 };
      const mockLeaveList = {
        data: [mockLeave],
        meta: {
          total: 1,
          page: 2,
          limit: 20,
          totalPages: 1,
        },
      };
      leaveRepository.findAll.mockResolvedValue(mockLeaveList);

      // Execute
      const result = await leaveService.getAllLeaveRequests(filter, options);

      // Verify
      expect(leaveRepository.findAll).toHaveBeenCalledWith(filter, options);
      expect(result).toEqual(mockLeaveList);
    });
  });

  describe('updateLeaveRequest', () => {
    it('should update a leave request', async () => {
      // Setup
      const updateData = {
        reason: 'Updated reason',
      };
      const updatedLeave = { ...mockLeave, ...updateData };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.update.mockResolvedValue(updatedLeave);

      // Execute
      const result = await leaveService.updateLeaveRequest(mockLeave._id, updateData, mockUser);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(leaveRepository.update).toHaveBeenCalledWith(mockLeave._id, updateData, mockUser);
      expect(result).toEqual(updatedLeave);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.updateLeaveRequest(null, {}, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to update non-pending leave without permission', async () => {
      // Setup
      const approvedLeave = { ...mockLeave, status: 'approved' };
      const updateData = { reason: 'Updated reason' };
      const userWithoutPermission = { ...mockUser, permissions: [] };
      
      leaveRepository.findById.mockResolvedValue(approvedLeave);

      // Execute & Verify
      await expect(leaveService.updateLeaveRequest(approvedLeave._id, updateData, userWithoutPermission))
        .rejects.toThrow(ValidationError);
    });

    it('should recalculate total days if dates are updated', async () => {
      // Setup
      const updateData = {
        startDate: new Date('2023-01-10'),
        endDate: new Date('2023-01-20'), // 11 days
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.findAll.mockResolvedValue({ data: [] });
      leaveRepository.update.mockImplementation((id, data) => Promise.resolve({ ...mockLeave, ...data }));

      // Execute
      const result = await leaveService.updateLeaveRequest(mockLeave._id, updateData, mockUser);

      // Verify
      expect(result.totalDays).toBe(11);
    });

    it('should throw ConflictError if updated dates overlap with existing leave', async () => {
      // Setup
      const updateData = {
        startDate: new Date('2023-02-10'),
        endDate: new Date('2023-02-15'),
      };
      
      const overlappingLeave = {
        ...mockLeave,
        _id: new mongoose.Types.ObjectId(),
        startDate: new Date('2023-02-12'),
        endDate: new Date('2023-02-20'),
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.findAll.mockResolvedValue({ data: [overlappingLeave] });

      // Execute & Verify
      await expect(leaveService.updateLeaveRequest(mockLeave._id, updateData, mockUser))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('deleteLeaveRequest', () => {
    it('should delete a pending leave request', async () => {
      // Setup
      leaveRepository.findById.mockResolvedValue(mockLeave); // mockLeave has status 'pending'
      leaveRepository.delete.mockResolvedValue(true);

      // Execute
      const result = await leaveService.deleteLeaveRequest(mockLeave._id);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(leaveRepository.delete).toHaveBeenCalledWith(mockLeave._id);
      expect(result).toBe(true);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.deleteLeaveRequest())
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to delete non-pending leave', async () => {
      // Setup
      const approvedLeave = { ...mockLeave, status: 'approved' };
      leaveRepository.findById.mockResolvedValue(approvedLeave);

      // Execute & Verify
      await expect(leaveService.deleteLeaveRequest(approvedLeave._id))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('approveLeaveRequest', () => {
    it('should approve a pending leave request', async () => {
      // Setup
      const approvalData = {
        comments: 'Approved',
      };
      
      const approvedLeave = {
        ...mockLeave,
        status: 'approved',
        approvedBy: mockUser._id,
        approvedAt: expect.any(Date),
        ...approvalData,
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.approve.mockResolvedValue(approvedLeave);

      // Execute
      const result = await leaveService.approveLeaveRequest(mockLeave._id, approvalData, mockUser);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(leaveRepository.approve).toHaveBeenCalledWith(mockLeave._id, approvalData, mockUser);
      expect(result).toEqual(approvedLeave);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.approveLeaveRequest(null, {}, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to approve non-pending leave', async () => {
      // Setup
      const approvedLeave = { ...mockLeave, status: 'approved' };
      leaveRepository.findById.mockResolvedValue(approvedLeave);

      // Execute & Verify
      await expect(leaveService.approveLeaveRequest(approvedLeave._id, {}, mockUser))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('rejectLeaveRequest', () => {
    it('should reject a pending leave request', async () => {
      // Setup
      const rejectionData = {
        rejectionReason: 'Insufficient staff',
      };
      
      const rejectedLeave = {
        ...mockLeave,
        status: 'rejected',
        rejectionReason: 'Insufficient staff',
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.reject.mockResolvedValue(rejectedLeave);

      // Execute
      const result = await leaveService.rejectLeaveRequest(mockLeave._id, rejectionData, mockUser);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(leaveRepository.reject).toHaveBeenCalledWith(mockLeave._id, rejectionData, mockUser);
      expect(result).toEqual(rejectedLeave);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.rejectLeaveRequest(null, { rejectionReason: 'Reason' }, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if rejection reason is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.rejectLeaveRequest(mockLeave._id, {}, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to reject non-pending leave', async () => {
      // Setup
      const approvedLeave = { ...mockLeave, status: 'approved' };
      leaveRepository.findById.mockResolvedValue(approvedLeave);

      // Execute & Verify
      await expect(leaveService.rejectLeaveRequest(approvedLeave._id, { rejectionReason: 'Reason' }, mockUser))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('cancelLeaveRequest', () => {
    it('should cancel a pending leave request', async () => {
      // Setup
      const cancelledLeave = {
        ...mockLeave,
        status: 'cancelled',
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);
      leaveRepository.cancel.mockResolvedValue(cancelledLeave);

      // Execute
      const result = await leaveService.cancelLeaveRequest(mockLeave._id, mockUser);

      // Verify
      expect(leaveRepository.findById).toHaveBeenCalledWith(mockLeave._id);
      expect(leaveRepository.cancel).toHaveBeenCalledWith(mockLeave._id, mockUser);
      expect(result).toEqual(cancelledLeave);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.cancelLeaveRequest(null, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to cancel rejected leave', async () => {
      // Setup
      const rejectedLeave = { ...mockLeave, status: 'rejected' };
      leaveRepository.findById.mockResolvedValue(rejectedLeave);

      // Execute & Verify
      await expect(leaveService.cancelLeaveRequest(rejectedLeave._id, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if user is not authorized to cancel the leave', async () => {
      // Setup
      const userWithoutPermission = { 
        _id: new mongoose.Types.ObjectId(), // Different user ID
        permissions: [] 
      };
      
      leaveRepository.findById.mockResolvedValue(mockLeave);

      // Execute & Verify
      await expect(leaveService.cancelLeaveRequest(mockLeave._id, userWithoutPermission))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getEmployeeLeaveStatistics', () => {
    it('should get leave statistics for an employee', async () => {
      // Setup
      const year = 2023;
      
      const mockStats = {
        byType: [
          {
            _id: 'annual',
            totalRequests: 2,
            approvedRequests: 1,
            pendingRequests: 1,
            rejectedRequests: 0,
            cancelledRequests: 0,
            totalDays: 10,
            approvedDays: 5,
          },
        ],
        total: {
          totalRequests: 2,
          approvedRequests: 1,
          pendingRequests: 1,
          rejectedRequests: 0,
          cancelledRequests: 0,
          totalDays: 10,
          approvedDays: 5,
        },
        year,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      leaveRepository.getEmployeeLeaveStatistics.mockResolvedValue(mockStats);

      // Execute
      const result = await leaveService.getEmployeeLeaveStatistics(mockEmployee._id, year);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(leaveRepository.getEmployeeLeaveStatistics).toHaveBeenCalledWith(mockEmployee._id, year);
      expect(result).toEqual(mockStats);
    });

    it('should throw ValidationError if employee ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.getEmployeeLeaveStatistics())
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getEmployeeLeaveBalance', () => {
    it('should get leave balance for an employee', async () => {
      // Setup
      const year = 2023;
      
      const mockStats = {
        byType: [
          {
            _id: 'annual',
            totalRequests: 2,
            approvedRequests: 1,
            pendingRequests: 1,
            rejectedRequests: 0,
            cancelledRequests: 0,
            totalDays: 10,
            approvedDays: 5,
          },
        ],
        total: {
          totalRequests: 2,
          approvedRequests: 1,
          pendingRequests: 1,
          rejectedRequests: 0,
          cancelledRequests: 0,
          totalDays: 10,
          approvedDays: 5,
        },
        year,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      leaveRepository.getEmployeeLeaveStatistics.mockResolvedValue(mockStats);

      // Execute
      const result = await leaveService.getEmployeeLeaveBalance(mockEmployee._id, year);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(leaveRepository.getEmployeeLeaveStatistics).toHaveBeenCalledWith(mockEmployee._id, year);
      expect(result).toHaveProperty('employee', mockEmployee._id);
      expect(result).toHaveProperty('year', year);
      expect(result).toHaveProperty('balance');
      expect(result.balance).toHaveProperty('annual');
      expect(result.balance.annual).toHaveProperty('entitled', 14);
      expect(result.balance.annual).toHaveProperty('used', 5);
      expect(result.balance.annual).toHaveProperty('remaining', 9);
    });

    it('should throw ValidationError if employee ID is not provided', async () => {
      // Execute & Verify
      await expect(leaveService.getEmployeeLeaveBalance())
        .rejects.toThrow(ValidationError);
    });
  });
});
