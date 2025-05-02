import apiService from './api';

// Define types for position data
export interface PositionRequirements {
  education?: string;
  experience?: string;
  skills?: string[];
  certifications?: string[];
}

export interface PositionMetadata {
  createdDate?: Date;
  salaryGrade?: string;
  notes?: string;
}

export interface Position {
  id?: string;
  code: string;
  title: string;
  description?: string;
  division: string;
  parentPosition?: string | null;
  level?: number;
  responsibilities?: string[];
  requirements?: PositionRequirements;
  status: 'active' | 'inactive';
  metadata?: PositionMetadata;
  subordinatePositions?: Position[];
  assignedEmployees?: any[]; // Using any for now, will be replaced with User type
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PositionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  division?: string;
  level?: number;
  parentPosition?: string;
}

export interface PositionListResponse {
  data: Position[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Position Service
 * Handles position-related API operations
 */
const positionService = {
  /**
   * Get all positions with pagination and filtering
   * @param {PositionListParams} params - Query parameters
   * @returns {Promise<PositionListResponse>} - Paginated position data
   */
  getPositions: async (params: PositionListParams = {}): Promise<PositionListResponse> => {
    const response = await apiService.get<PositionListResponse>('/positions', params);
    return response.data;
  },

  /**
   * Get position by ID
   * @param {string} id - Position ID
   * @returns {Promise<Position>} - Position data
   */
  getPositionById: async (id: string): Promise<Position> => {
    const response = await apiService.get<Position>(`/positions/${id}`);
    return response.data;
  },

  /**
   * Create new position
   * @param {Position} positionData - Position data
   * @returns {Promise<Position>} - Created position
   */
  createPosition: async (positionData: Position): Promise<Position> => {
    const response = await apiService.post<Position>('/positions', positionData);
    return response.data;
  },

  /**
   * Update position
   * @param {string} id - Position ID
   * @param {Partial<Position>} positionData - Position data to update
   * @returns {Promise<Position>} - Updated position
   */
  updatePosition: async (id: string, positionData: Partial<Position>): Promise<Position> => {
    const response = await apiService.put<Position>(`/positions/${id}`, positionData);
    return response.data;
  },

  /**
   * Delete position
   * @param {string} id - Position ID
   * @returns {Promise<void>}
   */
  deletePosition: async (id: string): Promise<void> => {
    await apiService.delete(`/positions/${id}`);
  },

  /**
   * Get position hierarchy
   * @param {string} id - Position ID (optional)
   * @returns {Promise<Position[]>} - Position hierarchy
   */
  getPositionHierarchy: async (id?: string): Promise<Position[]> => {
    const endpoint = id ? `/positions/hierarchy/${id}` : '/positions/hierarchy';
    const response = await apiService.get<Position[]>(endpoint);
    return response.data;
  },

  /**
   * Get positions by division
   * @param {string} divisionId - Division ID
   * @returns {Promise<Position[]>} - List of positions in the division
   */
  getPositionsByDivision: async (divisionId: string): Promise<Position[]> => {
    const response = await apiService.get<Position[]>(`/positions/division/${divisionId}`);
    return response.data;
  },

  /**
   * Get organizational chart data
   * @returns {Promise<any>} - Organizational chart data
   */
  getOrganizationalChart: async (): Promise<any> => {
    const response = await apiService.get<any>('/positions/organizational-chart');
    return response.data;
  },
};

export default positionService;
