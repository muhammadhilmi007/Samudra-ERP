import apiService from './api';

// Define types for division data
export interface DivisionMetadata {
  establishedDate?: Date;
  notes?: string;
}

export interface Division {
  data: any;
  id?: string;
  code: string;
  name: string;
  description?: string;
  branch: string;
  parentDivision?: string | null;
  level?: number;
  head?: string;
  status: 'active' | 'inactive';
  metadata?: DivisionMetadata;
  childDivisions?: Division[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DivisionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  branch?: string;
  level?: number;
  parentDivision?: string;
}

export interface DivisionListResponse {
  data: Division[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Division Service
 * Handles division-related API operations
 */
const divisionService = {
  /**
   * Get all divisions with pagination and filtering
   * @param {DivisionListParams} params - Query parameters
   * @returns {Promise<DivisionListResponse>} - Paginated division data
   */
  getDivisions: async (params: DivisionListParams = {}): Promise<DivisionListResponse> => {
    const response = await apiService.get<DivisionListResponse>('/divisions', params);
    return response.data;
  },

  /**
   * Get division by ID
   * @param {string} id - Division ID
   * @returns {Promise<Division>} - Division data
   */
  getDivisionById: async (id: string): Promise<Division> => {
    const response = await apiService.get<Division>(`/divisions/${id}`);
    return response.data;
  },

  /**
   * Create new division
   * @param {Division} divisionData - Division data
   * @returns {Promise<Division>} - Created division
   */
  createDivision: async (divisionData: Division): Promise<Division> => {
    const response = await apiService.post<Division>('/divisions', divisionData);
    return response.data;
  },

  /**
   * Update division
   * @param {string} id - Division ID
   * @param {Partial<Division>} divisionData - Division data to update
   * @returns {Promise<Division>} - Updated division
   */
  updateDivision: async (id: string, divisionData: Partial<Division>): Promise<Division> => {
    const response = await apiService.put<Division>(`/divisions/${id}`, divisionData);
    return response.data;
  },

  /**
   * Delete division
   * @param {string} id - Division ID
   * @returns {Promise<void>}
   */
  deleteDivision: async (id: string): Promise<void> => {
    await apiService.delete(`/divisions/${id}`);
  },

  /**
   * Get division hierarchy
   * @param {string} id - Division ID (optional)
   * @returns {Promise<Division[]>} - Division hierarchy
   */
  getDivisionHierarchy: async (id?: string): Promise<Division[]> => {
    const endpoint = id ? `/divisions/hierarchy/${id}` : '/divisions/hierarchy';
    const response = await apiService.get<Division[]>(endpoint);
    return response.data;
  },

  /**
   * Get divisions by branch
   * @param {string} branchId - Branch ID
   * @returns {Promise<Division[]>} - List of divisions in the branch
   */
  getDivisionsByBranch: async (branchId: string): Promise<Division[]> => {
    const response = await apiService.get<Division[]>(`/divisions/branch/${branchId}`);
    return response.data;
  },
};

export default divisionService;
