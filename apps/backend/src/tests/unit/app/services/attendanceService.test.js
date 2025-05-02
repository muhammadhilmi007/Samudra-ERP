/**
 * Unit tests for Attendance Service
 */
const mongoose = require('mongoose');
const attendanceService = require('../../../../app/services/attendanceService');
const attendanceRepository = require('../../../../domain/repositories/attendanceRepository');
const employeeRepository = require('../../../../domain/repositories/employeeRepository');
const { ValidationError, NotFoundError, ConflictError } = require('../../../../infrastructure/errors/errors');

// Mock dependencies
jest.mock('../../../../domain/repositories/attendanceRepository');
jest.mock('../../../../domain/repositories/employeeRepository');

describe('Attendance Service', () => {
  // Mock data
  const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockEmployee = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Employee',
    employeeId: 'EMP001',
    branch: new mongoose.Types.ObjectId(),
  };

  const mockAttendance = {
    _id: new mongoose.Types.ObjectId(),
    employee: mockEmployee._id,
    date: new Date(),
    status: 'present',
    branch: mockEmployee.branch,
    checkIn: {
      time: new Date(),
      location: 'Office Location',
    },
    workHours: 8,
    createdBy: mockUser._id,
    updatedBy: mockUser._id,
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAttendance', () => {
    it('should create a new attendance record', async () => {
      // Setup
      const attendanceData = {
        employee: mockEmployee._id,
        date: new Date(),
        status: 'present',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeAndDate.mockRejectedValue(new NotFoundError('Not found'));
      attendanceRepository.create.mockResolvedValue(mockAttendance);

      // Execute
      const result = await attendanceService.createAttendance(attendanceData, mockUser);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(attendanceRepository.create).toHaveBeenCalledWith(attendanceData, mockUser);
      expect(result).toEqual(mockAttendance);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      // Setup
      const attendanceData = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(attendanceService.createAttendance(attendanceData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if employee does not exist', async () => {
      // Setup
      const attendanceData = {
        employee: new mongoose.Types.ObjectId(),
        date: new Date(),
        status: 'present',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockRejectedValue(new NotFoundError('Employee not found'));

      // Execute & Verify
      await expect(attendanceService.createAttendance(attendanceData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if attendance record already exists', async () => {
      // Setup
      const attendanceData = {
        employee: mockEmployee._id,
        date: new Date(),
        status: 'present',
        branch: mockEmployee.branch,
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeAndDate.mockResolvedValue(mockAttendance);

      // Execute & Verify
      await expect(attendanceService.createAttendance(attendanceData, mockUser))
        .rejects.toThrow(ConflictError);
    });

    it('should calculate work hours if check-in and check-out times are provided', async () => {
      // Setup
      const checkInTime = new Date();
      const checkOutTime = new Date(checkInTime);
      checkOutTime.setHours(checkOutTime.getHours() + 8); // 8 hours later

      const attendanceData = {
        employee: mockEmployee._id,
        date: new Date(),
        status: 'present',
        branch: mockEmployee.branch,
        checkIn: { time: checkInTime },
        checkOut: { time: checkOutTime },
      };

      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeAndDate.mockRejectedValue(new NotFoundError('Not found'));
      attendanceRepository.create.mockImplementation((data) => Promise.resolve(data));

      // Execute
      const result = await attendanceService.createAttendance(attendanceData, mockUser);

      // Verify
      expect(result.workHours).toBeDefined();
      expect(result.workHours).toBeCloseTo(8, 1);
    });
  });

  describe('getAttendanceById', () => {
    it('should return attendance record by ID', async () => {
      // Setup
      attendanceRepository.findById.mockResolvedValue(mockAttendance);

      // Execute
      const result = await attendanceService.getAttendanceById(mockAttendance._id);

      // Verify
      expect(attendanceRepository.findById).toHaveBeenCalledWith(mockAttendance._id);
      expect(result).toEqual(mockAttendance);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(attendanceService.getAttendanceById())
        .rejects.toThrow(ValidationError);
    });

    it('should pass through NotFoundError from repository', async () => {
      // Setup
      attendanceRepository.findById.mockRejectedValue(new NotFoundError('Attendance not found'));

      // Execute & Verify
      await expect(attendanceService.getAttendanceById(mockAttendance._id))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllAttendance', () => {
    it('should return all attendance records with pagination', async () => {
      // Setup
      const mockAttendanceList = {
        data: [mockAttendance],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      attendanceRepository.findAll.mockResolvedValue(mockAttendanceList);

      // Execute
      const result = await attendanceService.getAllAttendance();

      // Verify
      expect(attendanceRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAttendanceList);
    });

    it('should apply filters and options correctly', async () => {
      // Setup
      const filter = { branch: mockEmployee.branch };
      const options = { page: 2, limit: 20 };
      const mockAttendanceList = {
        data: [mockAttendance],
        meta: {
          total: 1,
          page: 2,
          limit: 20,
          totalPages: 1,
        },
      };
      attendanceRepository.findAll.mockResolvedValue(mockAttendanceList);

      // Execute
      const result = await attendanceService.getAllAttendance(filter, options);

      // Verify
      expect(attendanceRepository.findAll).toHaveBeenCalledWith(filter, options);
      expect(result).toEqual(mockAttendanceList);
    });
  });

  describe('updateAttendance', () => {
    it('should update an attendance record', async () => {
      // Setup
      const updateData = {
        status: 'late',
      };
      const updatedAttendance = { ...mockAttendance, ...updateData };
      
      attendanceRepository.findById.mockResolvedValue(mockAttendance);
      attendanceRepository.update.mockResolvedValue(updatedAttendance);

      // Execute
      const result = await attendanceService.updateAttendance(mockAttendance._id, updateData, mockUser);

      // Verify
      expect(attendanceRepository.findById).toHaveBeenCalledWith(mockAttendance._id);
      expect(attendanceRepository.update).toHaveBeenCalledWith(mockAttendance._id, updateData, mockUser);
      expect(result).toEqual(updatedAttendance);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(attendanceService.updateAttendance(null, {}, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should recalculate work hours if check-in or check-out times are updated', async () => {
      // Setup
      const existingAttendance = {
        ...mockAttendance,
        checkIn: { time: new Date('2023-01-01T08:00:00Z') },
      };
      
      const updateData = {
        checkOut: { time: new Date('2023-01-01T17:00:00Z') },
      };
      
      attendanceRepository.findById.mockResolvedValue(existingAttendance);
      attendanceRepository.update.mockImplementation((id, data) => Promise.resolve({ ...existingAttendance, ...data }));

      // Execute
      const result = await attendanceService.updateAttendance(mockAttendance._id, updateData, mockUser);

      // Verify
      expect(result.workHours).toBeDefined();
      expect(result.workHours).toBeCloseTo(9, 1); // 9 hours difference
    });
  });

  describe('deleteAttendance', () => {
    it('should delete an attendance record', async () => {
      // Setup
      attendanceRepository.delete.mockResolvedValue(true);

      // Execute
      const result = await attendanceService.deleteAttendance(mockAttendance._id);

      // Verify
      expect(attendanceRepository.delete).toHaveBeenCalledWith(mockAttendance._id);
      expect(result).toBe(true);
    });

    it('should throw ValidationError if ID is not provided', async () => {
      // Execute & Verify
      await expect(attendanceService.deleteAttendance())
        .rejects.toThrow(ValidationError);
    });
  });

  describe('checkIn', () => {
    it('should record employee check-in', async () => {
      // Setup
      const checkInData = {
        time: new Date(),
        location: 'Office Location',
        branch: mockEmployee.branch,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.checkIn.mockResolvedValue(mockAttendance);

      // Execute
      const result = await attendanceService.checkIn(mockEmployee._id, checkInData, mockUser);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(attendanceRepository.checkIn).toHaveBeenCalledWith(mockEmployee._id, checkInData, mockUser);
      expect(result).toEqual(mockAttendance);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      // Setup
      const checkInData = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(attendanceService.checkIn(mockEmployee._id, checkInData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if check-in time is in the future', async () => {
      // Setup
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
      
      const checkInData = {
        time: futureDate,
        location: 'Office Location',
        branch: mockEmployee.branch,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);

      // Execute & Verify
      await expect(attendanceService.checkIn(mockEmployee._id, checkInData, mockUser))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('checkOut', () => {
    it('should record employee check-out', async () => {
      // Setup
      const checkOutData = {
        time: new Date(),
        location: 'Office Location',
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.checkOut.mockResolvedValue(mockAttendance);

      // Execute
      const result = await attendanceService.checkOut(mockEmployee._id, checkOutData, mockUser);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(attendanceRepository.checkOut).toHaveBeenCalledWith(mockEmployee._id, checkOutData, mockUser);
      expect(result).toEqual(mockAttendance);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      // Setup
      const checkOutData = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(attendanceService.checkOut(mockEmployee._id, checkOutData, mockUser))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('markAbsent', () => {
    it('should mark employee as absent', async () => {
      // Setup
      const absentData = {
        date: new Date(),
        reason: 'Sick',
        branch: mockEmployee.branch,
      };
      
      const absentAttendance = {
        ...mockAttendance,
        status: 'absent',
        reason: 'Sick',
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeAndDate.mockRejectedValue(new NotFoundError('Not found'));
      attendanceRepository.create.mockResolvedValue(absentAttendance);

      // Execute
      const result = await attendanceService.markAbsent(mockEmployee._id, absentData, mockUser);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(attendanceRepository.create).toHaveBeenCalled();
      expect(result).toEqual(absentAttendance);
    });

    it('should throw ValidationError if required fields are missing', async () => {
      // Setup
      const absentData = {
        // Missing required fields
      };

      // Execute & Verify
      await expect(attendanceService.markAbsent(mockEmployee._id, absentData, mockUser))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ConflictError if attendance record already exists for the date', async () => {
      // Setup
      const absentData = {
        date: new Date(),
        reason: 'Sick',
        branch: mockEmployee.branch,
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findByEmployeeAndDate.mockResolvedValue(mockAttendance);

      // Execute & Verify
      await expect(attendanceService.markAbsent(mockEmployee._id, absentData, mockUser))
        .rejects.toThrow(ConflictError);
    });
  });

  describe('generateAttendanceReport', () => {
    it('should generate attendance report', async () => {
      // Setup
      const filter = { branch: mockEmployee.branch };
      const options = { groupBy: 'employee' };
      
      const mockReport = {
        data: [
          {
            _id: mockEmployee._id,
            totalDays: 20,
            presentDays: 18,
            lateDays: 2,
            absentDays: 0,
            totalWorkHours: 160,
          },
        ],
        summary: {
          totalRecords: 20,
          presentPercentage: 90,
          latePercentage: 10,
          absentPercentage: 0,
          averageWorkHours: 8,
        },
      };
      
      attendanceRepository.generateReport.mockResolvedValue(mockReport);

      // Execute
      const result = await attendanceService.generateAttendanceReport(filter, options);

      // Verify
      expect(attendanceRepository.generateReport).toHaveBeenCalledWith(filter, options);
      expect(result).toEqual(mockReport);
    });

    it('should throw ValidationError if end date is before start date', async () => {
      // Setup
      const filter = {
        startDate: new Date('2023-01-31'),
        endDate: new Date('2023-01-01'),
      };

      // Execute & Verify
      await expect(attendanceService.generateAttendanceReport(filter))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('getEmployeeMonthlyAttendanceSummary', () => {
    it('should get monthly attendance summary for an employee', async () => {
      // Setup
      const year = 2023;
      const month = 1; // January
      
      const mockAttendanceList = {
        data: [
          { ...mockAttendance, date: new Date('2023-01-01'), status: 'present', workHours: 8 },
          { ...mockAttendance, date: new Date('2023-01-02'), status: 'present', workHours: 7.5 },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 31,
          totalPages: 1,
        },
      };
      
      employeeRepository.findById.mockResolvedValue(mockEmployee);
      attendanceRepository.findAll.mockResolvedValue(mockAttendanceList);

      // Execute
      const result = await attendanceService.getEmployeeMonthlyAttendanceSummary(mockEmployee._id, year, month);

      // Verify
      expect(employeeRepository.findById).toHaveBeenCalledWith(mockEmployee._id);
      expect(attendanceRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveProperty('employee', mockEmployee._id);
      expect(result).toHaveProperty('year', year);
      expect(result).toHaveProperty('month', month);
      expect(result).toHaveProperty('records', mockAttendanceList.data);
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('presentDays');
      expect(result.summary).toHaveProperty('totalWorkHours');
    });

    it('should throw ValidationError if required parameters are missing', async () => {
      // Execute & Verify
      await expect(attendanceService.getEmployeeMonthlyAttendanceSummary())
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if year or month is invalid', async () => {
      // Execute & Verify
      await expect(attendanceService.getEmployeeMonthlyAttendanceSummary(mockEmployee._id, 3000, 13))
        .rejects.toThrow(ValidationError);
    });
  });
});
