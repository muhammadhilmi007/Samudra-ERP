/**
 * Unit Tests for Role Service
 * Tests business logic for role management
 */

const RoleService = require('../../../../src/app/services/roleService');
const RoleRepository = require('../../../../src/domain/repositories/roleRepository');
const PermissionRepository = require('../../../../src/domain/repositories/permissionRepository');

// Mock dependencies
jest.mock('../../../../src/domain/repositories/roleRepository');
jest.mock('../../../../src/domain/repositories/permissionRepository');

describe('Role Service', () => {
  let roleService;
  let mockRoleRepository;
  let mockPermissionRepository;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock implementations
    mockRoleRepository = new RoleRepository();
    mockPermissionRepository = new PermissionRepository();

    // Initialize service with mocks
    roleService = new RoleService(mockRoleRepository, mockPermissionRepository);

    // Mock permission repository methods
    mockPermissionRepository.findByIds = jest.fn();
  });

  describe('getAllRoles', () => {
    it('should return all roles from the repository', async () => {
      const mockRoles = [
        { id: 'role1', name: 'Admin', permissions: ['perm1', 'perm2'] },
        { id: 'role2', name: 'User', permissions: ['perm3'] },
      ];

      mockRoleRepository.findAll.mockResolvedValue(mockRoles);

      const result = await roleService.getAllRoles();

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and throw them correctly', async () => {
      const error = new Error('Database error');
      mockRoleRepository.findAll.mockRejectedValue(error);

      await expect(roleService.getAllRoles()).rejects.toThrow('Database error');
      expect(mockRoleRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRoleById', () => {
    it('should return a specific role by ID', async () => {
      const mockRole = { id: 'role1', name: 'Admin', permissions: ['perm1', 'perm2'] };
      mockRoleRepository.findById.mockResolvedValue(mockRole);

      const result = await roleService.getRoleById('role1');

      expect(result).toEqual(mockRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith('role1');
    });

    it('should throw an error if role is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.getRoleById('nonexistent')).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Role not found',
          details: {},
        },
      });
      expect(mockRoleRepository.findById).toHaveBeenCalledWith('nonexistent');
    });
  });

  describe('createRole', () => {
    it('should create a new role with valid data', async () => {
      const roleData = {
        name: 'New Role',
        description: 'A new role',
        permissions: ['perm1', 'perm2'],
      };

      const mockPermissions = [
        { id: 'perm1', code: 'user:read' },
        { id: 'perm2', code: 'user:write' },
      ];

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.findByIds.mockResolvedValue(mockPermissions);
      mockRoleRepository.create.mockResolvedValue({
        ...roleData,
        id: 'role1',
        permissions: mockPermissions,
      });

      const result = await roleService.createRole(roleData, 'test-user-id');

      expect(result).toEqual({
        ...roleData,
        id: 'role1',
        permissions: mockPermissions,
      });
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(mockPermissionRepository.findByIds).toHaveBeenCalledWith(['perm1', 'perm2']);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        ...roleData,
        permissions: mockPermissions,
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      });
    });

    it('should throw an error if role name is already taken', async () => {
      const roleData = {
        name: 'Existing Role',
        description: 'An existing role',
        permissions: ['perm1'],
      };

      mockRoleRepository.findByName.mockResolvedValue({
        id: 'role1',
        name: 'Existing Role',
      });

      await expect(roleService.createRole(roleData, 'test-user-id')).rejects.toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role with this name already exists',
          details: {},
        },
      });

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if permissions are invalid', async () => {
      const roleData = {
        name: 'New Role',
        description: 'A new role',
        permissions: ['perm1', 'perm2'],
      };

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.findByIds.mockResolvedValue([
        { id: 'perm1', code: 'user:read' },
      ]);

      await expect(roleService.createRole(roleData, 'test-user-id')).rejects.toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'One or more permissions are invalid',
          details: {},
        },
      });

      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(mockPermissionRepository.findByIds).toHaveBeenCalledWith(roleData.permissions);
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    const roleId = 'role1';
    const existingRole = {
      id: roleId,
      name: 'Admin',
      description: 'Administrator role',
      permissions: ['perm1'],
      isSystem: false,
      isActive: true,
    };

    it('should update a role with valid data', async () => {
      const updateData = {
        name: 'Updated Role',
        description: 'Updated description',
        permissions: ['perm1', 'perm2'],
      };

      const mockPermissions = [
        { id: 'perm1', code: 'user:read' },
        { id: 'perm2', code: 'user:write' },
      ];

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.findByName.mockResolvedValue(null);
      mockPermissionRepository.findByIds.mockResolvedValue(mockPermissions);
      mockRoleRepository.update.mockResolvedValue({
        ...updateData,
        id: roleId,
        permissions: mockPermissions,
      });

      const result = await roleService.updateRole(roleId, updateData, 'test-user-id');

      expect(result).toEqual({
        ...updateData,
        id: roleId,
        permissions: mockPermissions,
      });
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(updateData.name);
      expect(mockPermissionRepository.findByIds).toHaveBeenCalledWith(['perm1', 'perm2']);
      expect(mockRoleRepository.update).toHaveBeenCalledWith(roleId, expect.objectContaining({
        name: updateData.name,
        description: updateData.description,
        permissions: mockPermissions,
        updatedBy: 'test-user-id',
      }));
    });

    it('should throw an error if trying to update a system role', async () => {
      const systemRole = {
        ...existingRole,
        isSystem: true,
      };

      mockRoleRepository.findById.mockResolvedValue(systemRole);

      await expect(roleService.updateRole(roleId, { name: 'New Name' })).rejects.toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot modify name or deactivate system roles',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if role is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.updateRole(roleId, { name: 'New Name' })).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Role not found',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error if new name is already taken by another role', async () => {
      const existingNameRole = {
        id: 'role2',
        name: 'Updated Role',
      };

      mockRoleRepository.findById.mockResolvedValue({
        id: roleId,
        name: 'Original Role',
      });
      mockRoleRepository.findByName.mockResolvedValue(existingNameRole);

      await expect(roleService.updateRole(roleId, { name: 'Updated Role' })).rejects.toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role with this name already exists',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith('Updated Role');
      expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    const roleId = 'role1';
    const existingRole = {
      id: roleId,
      name: 'Admin',
      isSystem: false,
      isActive: true,
    };

    it('should delete a non-system role', async () => {
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.delete.mockResolvedValue(true);

      const result = await roleService.deleteRole(roleId);

      expect(result).toBe(true);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.delete).toHaveBeenCalledWith(roleId);
    });

    it('should throw an error if trying to delete a system role', async () => {
      const systemRole = {
        ...existingRole,
        isSystem: true,
      };

      mockRoleRepository.findById.mockResolvedValue(systemRole);

      await expect(roleService.deleteRole(roleId)).rejects.toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot delete system roles',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if role is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.deleteRole(roleId)).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Role not found',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('addPermissionToRole', () => {
    const roleId = 'role1';
    const permissionId = 'perm1';
    const permission = {
      id: permissionId,
      code: 'user:read',
    };
    const existingRole = {
      id: roleId,
      name: 'Admin',
      permissions: [{ id: 'perm2' }],
      isSystem: false,
      isActive: true,
    };

    it('should add a permission to a role', async () => {
      const updatedRole = {
        ...existingRole,
        permissions: [...existingRole.permissions, { id: permissionId }],
        updatedAt: expect.any(Date),
      };

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockPermissionRepository.findById.mockResolvedValue(permission);
      mockRoleRepository.addPermission.mockResolvedValue(updatedRole);

      const result = await roleService.addPermissionToRole(roleId, permissionId);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permissionId);
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(roleId, permissionId);
    });

    it('should throw an error if role is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(roleService.addPermissionToRole(roleId, permissionId)).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Role not found',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should throw an error if permission is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockPermissionRepository.findById.mockResolvedValue(null);

      await expect(roleService.addPermissionToRole(roleId, permissionId)).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Permission not found',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permissionId);
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should throw an error if role already has the permission', async () => {
      // Mock a role that already has the permission
      const roleWithPermission = {
        ...existingRole,
        permissions: [{ id: 'perm1' }, { id: permissionId }],
      };

      // Setup mocks
      mockRoleRepository.findById.mockResolvedValue(roleWithPermission);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      // Make sure addPermission is not called in this case
      mockRoleRepository.addPermission.mockImplementation(() => null);

      await expect(roleService.addPermissionToRole(roleId, permissionId)).rejects.toMatchObject({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to add permission to role',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permissionId);
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });
  });

  describe('removePermissionFromRole', () => {
    const permissionId = 'perm1';
    const roleId = 'role1';
    const existingRole = {
      id: roleId,
      name: 'Admin',
      permissions: [{ id: 'perm2' }, { id: permissionId }],
      isSystem: false,
      isActive: true,
    };

    it('should remove a permission from a role', async () => {
      const updatedRole = {
        ...existingRole,
        permissions: [{ id: 'perm2' }],
        updatedAt: expect.any(Date),
      };

      mockRoleRepository.findById.mockResolvedValue(existingRole);
      mockRoleRepository.removePermission.mockResolvedValue(updatedRole);

      const result = await roleService.removePermissionFromRole(roleId, permissionId);

      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.removePermission).toHaveBeenCalledWith(roleId, permissionId);
    });

    it('should throw an error if role is not found', async () => {
      mockRoleRepository.findById.mockResolvedValue(null);

      await expect(
        roleService.removePermissionFromRole(roleId, permissionId),
      ).rejects.toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Role not found',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.removePermission).not.toHaveBeenCalled();
    });

    it('should throw an error if role does not have the permission', async () => {
      const roleWithoutPermission = {
        ...existingRole,
        permissions: [{ id: 'perm2' }, { id: 'perm3' }],
      };

      mockRoleRepository.findById.mockResolvedValue(roleWithoutPermission);
      mockPermissionRepository.findById.mockResolvedValue({ id: permissionId });

      await expect(
        roleService.removePermissionFromRole(roleId, permissionId),
      ).rejects.toMatchObject({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Role does not have this permission',
          details: {},
        },
      });

      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.removePermission).not.toHaveBeenCalled();
    });
  });
});
