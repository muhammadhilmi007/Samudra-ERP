import apiService from './api';

// Define types for branch data
export interface Address {
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

export interface ContactInfo {
  phone: string;
  email: string;
  fax?: string;
  website?: string;
}

export interface OperationalHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface Division {
  id?: string;
  name: string;
  code: string;
  description?: string;
  head?: string;
  status: 'active' | 'inactive';
}

export interface BranchMetadata {
  establishedDate?: Date;
  capacity?: number;
  serviceArea?: string[];
  notes?: string;
}

export interface Branch {
  id?: string;
  code: string;
  name: string;
  address: Address;
  contactInfo: ContactInfo;
  parentBranch?: string | null;
  level?: number;
  status: 'active' | 'inactive';
  operationalHours?: OperationalHours;
  manager?: string;
  divisions?: Division[];
  metadata?: BranchMetadata;
  childBranches?: Branch[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BranchListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  level?: number;
  parentBranch?: string;
}

export interface BranchListResponse {
  data: Branch[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Branch Service
 * Handles branch-related API operations
 */
const branchService = {
  /**
   * Get all branches with pagination and filtering
   * @param {BranchListParams} params - Query parameters
   * @returns {Promise<BranchListResponse>} - Paginated branch data
   */
  getBranches: async (params: BranchListParams = {}): Promise<BranchListResponse> => {
    const response = await apiService.get<BranchListResponse>('/branches', params);
    return response.data;
  },

  /**
   * Get branch by ID
   * @param {string} id - Branch ID
   * @returns {Promise<Branch>} - Branch data
   */
  getBranchById: async (id: string): Promise<Branch> => {
    const response = await apiService.get<Branch>(`/branches/${id}`);
    return response.data;
  },

  /**
   * Create new branch
   * @param {Branch} branchData - Branch data
   * @returns {Promise<Branch>} - Created branch
   */
  createBranch: async (branchData: Branch): Promise<Branch> => {
    const response = await apiService.post<Branch>('/branches', branchData);
    return response.data;
  },

  /**
   * Update branch
   * @param {string} id - Branch ID
   * @param {Partial<Branch>} branchData - Branch data to update
   * @returns {Promise<Branch>} - Updated branch
   */
  updateBranch: async (id: string, branchData: Partial<Branch>): Promise<Branch> => {
    const response = await apiService.put<Branch>(`/branches/${id}`, branchData);
    return response.data;
  },

  /**
   * Delete branch
   * @param {string} id - Branch ID
   * @returns {Promise<void>}
   */
  deleteBranch: async (id: string): Promise<void> => {
    await apiService.delete(`/branches/${id}`);
  },

  /**
   * Get branch hierarchy
   * @param {string} id - Branch ID (optional)
   * @returns {Promise<Branch[]>} - Branch hierarchy
   */
  getBranchHierarchy: async (id?: string): Promise<Branch[]> => {
    const endpoint = id ? `/branches/hierarchy/${id}` : '/branches/hierarchy';
    const response = await apiService.get<Branch[]>(endpoint);
    return response.data;
  },

  /**
   * Get service areas
   * @returns {Promise<string[]>} - List of service areas
   */
  getServiceAreas: async (): Promise<string[]> => {
    const response = await apiService.get<string[]>('/branches/service-areas');
    return response.data;
  },

  /**
   * Add service area
   * @param {string} area - Service area name
   * @returns {Promise<string[]>} - Updated list of service areas
   */
  addServiceArea: async (area: string): Promise<string[]> => {
    const response = await apiService.post<string[]>('/branches/service-areas', { area });
    return response.data;
  },

  /**
   * Remove service area
   * @param {string} area - Service area name
   * @returns {Promise<string[]>} - Updated list of service areas
   */
  removeServiceArea: async (area: string): Promise<string[]> => {
    const response = await apiService.delete<string[]>(`/branches/service-areas/${encodeURIComponent(area)}`);
    return response.data;
  },
};

export default branchService;
