/**
 * Unit Tests for Permission Service
 * Tests business logic for permission management
 */

const PermissionService = require('../../../../src/index/services/permissionService');
const PermissionRepository = require('../../../../src/domain/repositories/permissionRepository');
const RoleRepository = require('../../../../src/domain/repositories/roleRepository');

// Mock dependencies
jest.mock('../../../../src/domain/repositories/permissionRepository');
jest.mock('../../../../src/domain/repositories/roleRepository');
jest.mock('../../../../src/domain/utils/errorUtils', () => ({
  createApiError: (code, message, details = {}) => {
    const error = new Error(message);
    error.code = code;
    error.details = details;
    return error;
  },
}));

describe('Permission Service', () => {
  let permissionService;
  let mockPermissionRepository;
  let mockRoleRepository;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock implementations
    mockPermissionRepository = new PermissionRepository();
    mockRoleRepository = new RoleRepository();

    // Initialize service with mocks
    permissionService = new PermissionService(
      mockPermissionRepository,
      mockRoleRepository,
    );
  });

  describe('getAllPermissions', () => {
    it('should return all permissions from the repository', async () => {
      const mockPermissions = [
        {
          id: 'perm1',
          name: 'Read User',
          code: 'user:read',
          module: 'user',
          action: 'read',
        },
        {
          id: 'perm2',
          name: 'Create User',
          code: 'user:create',
          module: 'user',
          action: 'create',
        },
      ];

      mockPermissionRepository.findAll.mockResolvedValue(mockPermissions);

      const result = await permissionService.getAllPermissions();

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and throw them correctly', async () => {
      const error = new Error('Database error');
      mockPermissionRepository.findAll.mockRejectedValue(error);

      await expect(permissionService.getAllPermissions()).rejects.toThrow(
        'Database error',
      );
      expect(mockPermissionRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should filter permissions by module when module parameter is provided', async () => {
      const mockPermissions = [
        {
          id: 'perm1',
          name: 'Read User',
          code: 'user:read',
          module: 'user',
          action: 'read',
        },
        {
          id: 'perm2',
          name: 'Create User',
          code: 'user:create',
          module: 'user',
          action: 'create',
        },
      ];

      mockPermissionRepository.findByModule.mockResolvedValue(mockPermissions);

      const result = await permissionService.getAllPermissions('user');

      expect(result).toEqual(mockPermissions);
      expect(mockPermissionRepository.findByModule).toHaveBeenCalledWith('user');
      expect(mockPermissionRepository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getPermissionById', () => {
    it('should return a specific permission by ID', async () => {
      const mockPermission = {
        id: 'perm1',
        name: 'Read User',
        code: 'user:read',
        module: 'user',
        action: 'read',
      };

      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      const result = await permissionService.getPermissionById('perm1');

      expect(result).toEqual(mockPermission);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith('perm1');
    });

    it('should throw an error if permission is not found', async () => {
      const mockPermission = {
        id: 'perm1',
        name: 'Read User',
        code: 'user:read',
        module: 'user',
        action: 'read',
      };

      mockPermissionRepository.findById.mockResolvedValue(mockPermission);

      const result = await permissionService.getPermissionById('perm1');
      expect(result).toEqual(mockPermission);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
        'perm1',
      );
    });
  });

  describe('createPermission', () => {
    it('should create a new permission with valid data', async () => {
      const permissionData = {
        name: 'Update Package',
        code: 'package:update',
        isActive: true,
        isSystem: false,
        module: 'package',
        action: 'update',
      };

      const createdPermission = {
        id: 'newPermId',
        ...permissionData,
        isActive: true,
        isSystem: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Mock duplicate code check
      mockPermissionRepository.findByCode.mockResolvedValue(null);

      // Mock create
      mockPermissionRepository.create.mockResolvedValue(createdPermission);

      const result = await permissionService.createPermission(permissionData);

      expect(result).toEqual(createdPermission);
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(
        permissionData.code,
      );
      expect(mockPermissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: permissionData.name,
          code: permissionData.code,
          module: permissionData.module,
          action: permissionData.action,
          isActive: true,
          isSystem: false,
        }),
      );
    });

    it('should throw an error if permission code is already taken', async () => {
      const permissionData = {
        name: 'Update Package',
        code: 'package:update',
        isActive: true,
        isSystem: false,
        module: 'package',
        action: 'update',
      };

      mockPermissionRepository.findByCode.mockResolvedValue({
        id: 'existingId',
        code: 'package:update',
      });

      await expect(
        permissionService.createPermission(permissionData),
      ).rejects.toThrow('Permission with this code already exists');
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(
        permissionData.code,
      );
      expect(mockPermissionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if name is missing', async () => {
      const permissionData = {
        code: 'package:update',
        module: 'package',
        action: 'update',
      };

      // Mock repository create to throw validation error
      mockPermissionRepository.create.mockRejectedValue(
        new Error('Validation failed: name is required'),
      );

      await expect(
        permissionService.createPermission(permissionData),
      ).rejects.toThrow('Validation failed: name is required');
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(permissionData.code);
    });

    it('should generate code if not provided but module and action are present', async () => {
      const permissionData = {
        name: 'Update Package',
        module: 'package',
        action: 'update',
      };

      const generatedCode = 'package:update';
      const createdPermission = {
        id: 'newPermId',
        ...permissionData,
        code: generatedCode,
        isActive: true,
        isSystem: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      // Mock code generation and repository methods
      mockPermissionRepository.generateCode = jest.fn().mockReturnValue(generatedCode);
      mockPermissionRepository.findByCode.mockResolvedValue(null);
      mockPermissionRepository.create.mockResolvedValue(createdPermission);

      const result = await permissionService.createPermission(permissionData);

      expect(result).toEqual(createdPermission);
      expect(mockPermissionRepository.generateCode).toHaveBeenCalledWith(
        permissionData.module,
        permissionData.action,
      );
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(generatedCode);
    });

    it('should throw an error if module is missing', async () => {
      const permissionData = {
        name: 'Update Package',
        code: 'package:update',
        action: 'update',
      };

      // Mock repository create to throw validation error
      mockPermissionRepository.create.mockRejectedValue(
        new Error('Validation failed: module is required'),
      );

      await expect(
        permissionService.createPermission(permissionData),
      ).rejects.toThrow('Validation failed: module is required');
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(permissionData.code);
    });

    it('should throw an error if action is missing', async () => {
      const permissionData = {
        name: 'Update Package',
        code: 'package:update',
        module: 'package',
      };

      // Mock repository create to throw validation error
      mockPermissionRepository.create.mockRejectedValue(
        new Error('Validation failed: action is required'),
      );

      await expect(
        permissionService.createPermission(permissionData),
      ).rejects.toThrow('Validation failed: action is required');
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(permissionData.code);
    });
  });

  describe('updatePermission', () => {
    const permId = 'perm1';
    const existingPermission = {
      id: permId,
      name: 'Read User',
      code: 'user:read',
      module: 'user',
      action: 'read',
      isSystem: false,
      isActive: true,
    };

    it('should update a permission with valid data', async () => {
      const updateData = {
        name: 'View User',
        code: 'user:view',
        module: 'user',
        action: 'view',
      };

      const updatedPermission = {
        ...existingPermission,
        ...updateData,
        updatedAt: expect.any(Date),
      };

      // Mock permission retrieval
      mockPermissionRepository.findById.mockResolvedValue(existingPermission);

      // Mock code duplicate check (no duplicate)
      mockPermissionRepository.findByCode.mockResolvedValue(null);

      // Mock update
      mockPermissionRepository.update.mockResolvedValue(updatedPermission);

      const result = await permissionService.updatePermission(permId, updateData);

      expect(result).toEqual(updatedPermission);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(
        updateData.code,
      );
      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permId,
        expect.objectContaining({
          name: updateData.name,
          code: updateData.code,
          module: updateData.module,
          action: updateData.action,
        }),
      );
    });

    it('should throw an error if trying to update a system permission', async () => {
      const systemPermission = {
        ...existingPermission,
        isSystem: true,
      };

      mockPermissionRepository.findById.mockResolvedValue(systemPermission);

      await expect(
        permissionService.updatePermission(permId, { name: 'New Name' }),
      ).rejects.toThrow('Cannot modify name, code, or deactivate system permissions');

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if permission is not found', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(
        permissionService.updatePermission(permId, { name: 'New Name' }),
      ).rejects.toThrow('Permission not found');

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if new code is already taken by another permission', async () => {
      mockPermissionRepository.findById.mockResolvedValue(existingPermission);

      // Another permission with the same code exists
      mockPermissionRepository.findByCode.mockResolvedValue({
        id: 'differentId',
        code: 'user:view',
      });

      await expect(
        permissionService.updatePermission(permId, { code: 'user:view' }),
      ).rejects.toThrow('Permission with this code already exists');

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.findByCode).toHaveBeenCalledWith(
        'user:view',
      );
      expect(mockPermissionRepository.update).not.toHaveBeenCalled();
    });

    it('should not perform duplicate code check if code is not being updated', async () => {
      mockPermissionRepository.findById.mockResolvedValue(existingPermission);

      // Update only the name, not the code
      const updateData = { name: 'View User' };

      const updatedPermission = {
        ...existingPermission,
        name: 'View User',
        updatedAt: expect.any(Date),
      };

      mockPermissionRepository.update.mockResolvedValue(updatedPermission);

      const result = await permissionService.updatePermission(permId, updateData);

      expect(result).toEqual(updatedPermission);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.findByCode).not.toHaveBeenCalled();
      expect(mockPermissionRepository.update).toHaveBeenCalledWith(
        permId,
        expect.objectContaining({
          name: updateData.name,
        }),
      );
    });
  });

  describe('deletePermission', () => {
    const permId = 'perm1';
    const existingPermission = {
      id: permId,
      name: 'Read User',
      code: 'user:read',
      isSystem: false,
      isActive: true,
    };

    it('should delete a non-system permission', async () => {
      mockPermissionRepository.findById.mockResolvedValue(existingPermission);
      mockRoleRepository.getRolesWithPermission = jest.fn().mockResolvedValue([]);
      mockPermissionRepository.delete.mockResolvedValue(true);

      const result = await permissionService.deletePermission(permId);

      expect(result).toBe(true);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockRoleRepository.getRolesWithPermission).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.delete).toHaveBeenCalledWith(permId);
    });

    it('should throw an error if trying to delete a system permission', async () => {
      const systemPermission = {
        id: permId,
        isSystem: true,
      };

      mockPermissionRepository.findById.mockResolvedValue(systemPermission);

      await expect(permissionService.deletePermission(permId)).rejects.toThrow(
        'Cannot delete system permissions',
      );

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if permission is not found', async () => {
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(permissionService.deletePermission(permId)).rejects.toThrow(
        'Permission not found',
      );

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if permission is assigned to roles', async () => {
      mockPermissionRepository.findById.mockResolvedValue(existingPermission);

      // Permission is assigned to some roles
      mockRoleRepository.getRolesWithPermission = jest.fn().mockResolvedValue([
        { id: 'role1', name: 'Admin' },
        { id: 'role2', name: 'Manager' },
      ]);

      await expect(permissionService.deletePermission(permId)).rejects.toThrow(
        'Permission is used by the following roles',
      );

      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permId);
      expect(mockRoleRepository.getRolesWithPermission).toHaveBeenCalledWith(permId);
      expect(mockPermissionRepository.delete).not.toHaveBeenCalled();
    });
  });
});
