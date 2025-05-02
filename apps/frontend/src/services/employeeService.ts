import apiService from './api';

// Define types for employee data
export interface EmployeeContact {
  phone: string;
  email: string;
  alternativePhone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface EmployeeAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface EmployeeDocument {
  id?: string;
  type: 'ktp' | 'npwp' | 'sim' | 'ijazah' | 'sertifikat' | 'kontrak' | 'other';
  number: string;
  issuedDate: Date;
  expiryDate?: Date;
  issuedBy: string;
  documentUrl?: string;
  status: 'active' | 'expired' | 'revoked';
  notes?: string;
}

export interface EmployeeAssignment {
  id?: string;
  branchId: string;
  branchName?: string;
  divisionId: string;
  divisionName?: string;
  positionId: string;
  positionName?: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'terminated';
  notes?: string;
}

export interface EmployeeAttendance {
  id?: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'halfDay' | 'leave';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface EmployeeMetadata {
  joinDate: Date;
  terminationDate?: Date;
  employmentType: 'fullTime' | 'partTime' | 'contract' | 'probation';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'onLeave';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  taxId?: string;
  bpjsKesehatan?: string;
  bpjsKetenagakerjaan?: string;
  notes?: string;
}

export interface Employee {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date;
  birthPlace?: string;
  religion?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  contact: EmployeeContact;
  address: EmployeeAddress;
  currentAssignment?: EmployeeAssignment;
  documents?: EmployeeDocument[];
  assignments?: EmployeeAssignment[];
  attendance?: EmployeeAttendance[];
  metadata: EmployeeMetadata;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'terminated' | 'onLeave';
  branchId?: string;
  divisionId?: string;
  positionId?: string;
  employmentType?: 'fullTime' | 'partTime' | 'contract' | 'probation';
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Employee Service
 * Handles employee-related API operations
 */
const employeeService = {
  /**
   * Get all employees with pagination and filtering
   * @param {EmployeeListParams} params - Query parameters
   * @returns {Promise<EmployeeListResponse>} - Paginated employee data
   */
  getEmployees: async (params: EmployeeListParams = {}): Promise<EmployeeListResponse> => {
    const response = await apiService.get<EmployeeListResponse>('/employees', params);
    return response.data;
  },

  /**
   * Get employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise<Employee>} - Employee data
   */
  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await apiService.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  /**
   * Create new employee
   * @param {Employee} employeeData - Employee data
   * @returns {Promise<Employee>} - Created employee
   */
  createEmployee: async (employeeData: Employee): Promise<Employee> => {
    const response = await apiService.post<Employee>('/employees', employeeData);
    return response.data;
  },

  /**
   * Update employee
   * @param {string} id - Employee ID
   * @param {Partial<Employee>} employeeData - Employee data to update
   * @returns {Promise<Employee>} - Updated employee
   */
  updateEmployee: async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await apiService.put<Employee>(`/employees/${id}`, employeeData);
    return response.data;
  },

  /**
   * Delete employee
   * @param {string} id - Employee ID
   * @returns {Promise<void>}
   */
  deleteEmployee: async (id: string): Promise<void> => {
    await apiService.delete(`/employees/${id}`);
  },

  /**
   * Upload employee document
   * @param {string} employeeId - Employee ID
   * @param {FormData} formData - Form data with document file and metadata
   * @returns {Promise<EmployeeDocument>} - Uploaded document
   */
  uploadDocument: async (employeeId: string, formData: FormData): Promise<EmployeeDocument> => {
    const response = await apiService.post<EmployeeDocument>(
      `/employees/${employeeId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete employee document
   * @param {string} employeeId - Employee ID
   * @param {string} documentId - Document ID
   * @returns {Promise<void>}
   */
  deleteDocument: async (employeeId: string, documentId: string): Promise<void> => {
    await apiService.delete(`/employees/${employeeId}/documents/${documentId}`);
  },

  /**
   * Add employee assignment
   * @param {string} employeeId - Employee ID
   * @param {EmployeeAssignment} assignmentData - Assignment data
   * @returns {Promise<EmployeeAssignment>} - Created assignment
   */
  addAssignment: async (employeeId: string, assignmentData: EmployeeAssignment): Promise<EmployeeAssignment> => {
    const response = await apiService.post<EmployeeAssignment>(
      `/employees/${employeeId}/assignments`,
      assignmentData
    );
    return response.data;
  },

  /**
   * Update employee assignment
   * @param {string} employeeId - Employee ID
   * @param {string} assignmentId - Assignment ID
   * @param {Partial<EmployeeAssignment>} assignmentData - Assignment data to update
   * @returns {Promise<EmployeeAssignment>} - Updated assignment
   */
  updateAssignment: async (
    employeeId: string,
    assignmentId: string,
    assignmentData: Partial<EmployeeAssignment>
  ): Promise<EmployeeAssignment> => {
    const response = await apiService.put<EmployeeAssignment>(
      `/employees/${employeeId}/assignments/${assignmentId}`,
      assignmentData
    );
    return response.data;
  },

  /**
   * Delete employee assignment
   * @param {string} employeeId - Employee ID
   * @param {string} assignmentId - Assignment ID
   * @returns {Promise<void>}
   */
  deleteAssignment: async (employeeId: string, assignmentId: string): Promise<void> => {
    await apiService.delete(`/employees/${employeeId}/assignments/${assignmentId}`);
  },

  /**
   * Record employee attendance
   * @param {string} employeeId - Employee ID
   * @param {EmployeeAttendance} attendanceData - Attendance data
   * @returns {Promise<EmployeeAttendance>} - Recorded attendance
   */
  recordAttendance: async (employeeId: string, attendanceData: EmployeeAttendance): Promise<EmployeeAttendance> => {
    const response = await apiService.post<EmployeeAttendance>(
      `/employees/${employeeId}/attendance`,
      attendanceData
    );
    return response.data;
  },

  /**
   * Get employee attendance history
   * @param {string} employeeId - Employee ID
   * @param {Object} params - Query parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @returns {Promise<EmployeeAttendance[]>} - Attendance history
   */
  getAttendanceHistory: async (
    employeeId: string,
    params: { startDate: Date; endDate: Date }
  ): Promise<EmployeeAttendance[]> => {
    const response = await apiService.get<EmployeeAttendance[]>(
      `/employees/${employeeId}/attendance`,
      params
    );
    return response.data;
  },
};

export default employeeService;
