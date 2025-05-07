/**
 * Samudra Paket ERP - Authorization Service Tests
 * Unit tests for the authorization service
 */

const AuthorizationService = require('../../../../src/domain/services/authorizationService');
const { createApiError } = require('../../../../src/domain/utils/errorUtils');

// Mock repositories
const mockRoleRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addPermission: jest.fn(),
  removePermission: jest.fn(),
  getRolesWithPermission: jest.fn(),
  getPermissions: jest.fn(),
};

const mockPermissionRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByCode: jest.fn(),
  findByName: jest.fn(),
  findByModule: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getPermissionsByAction: jest.fn(),
  codeExists: jest.fn(),
  generateCode: jest.fn(),
};

const mockUserRepository = {
  findById: jest.fn(),
  findByRole: jest.fn(),
};

// Mock the constructor injection
jest.mock('../../../../src/infrastructure/repositories/mongoRoleRepository', () => jest.fn().mockImplementation(() => mockRoleRepository));

jest.mock('../../../../src/infrastructure/repositories/mongoPermissionRepository', () => jest.fn().mockImplementation(() => mockPermissionRepository));

jest.mock('../../../../src/infrastructure/repositories/mongoUserRepository', () => jest.fn().mockImplementation(() => mockUserRepository));

describe('AuthorizationService', () => {
  let authorizationService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    authorizationService = new AuthorizationService();
  });

  describe('hasPermission', () => {
    it('should return true if user has direct permission', async () => {
      // Arrange
      const userId = 'user123';
      const permissionCode = 'TEST_PERMISSION';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        permissions: ['TEST_PERMISSION'],
        role: 'role123',
      });

      // Act
      const result = await authorizationService.hasPermission(userId, permissionCode);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, { populate: ['role'] });
    });

    it('should return true if user has ALL permission', async () => {
      // Arrange
      const userId = 'user123';
      const permissionCode = 'TEST_PERMISSION';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        permissions: ['ALL'],
        role: 'role123',
      });

      // Act
      const result = await authorizationService.hasPermission(userId, permissionCode);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, { populate: ['role'] });
    });

    it('should return true if user has permission through role', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'role123';
      const permissionCode = 'TEST_PERMISSION';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        permissions: [],
        role: { id: roleId },
      });

      mockRoleRepository.findById.mockResolvedValue({
        id: roleId,
        name: 'TEST_ROLE',
      });

      mockRoleRepository.getPermissions.mockResolvedValue([
        { code: 'TEST_PERMISSION' },
      ]);

      // Act
      const result = await authorizationService.hasPermission(userId, permissionCode);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, { populate: ['role'] });
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.getPermissions).toHaveBeenCalledWith(roleId);
    });

    it('should return false if user does not have permission', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'role123';
      const permissionCode = 'TEST_PERMISSION';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        permissions: ['OTHER_PERMISSION'],
        role: { id: roleId },
      });

      mockRoleRepository.findById.mockResolvedValue({
        id: roleId,
        name: 'TEST_ROLE',
      });

      mockRoleRepository.getPermissions.mockResolvedValue([
        { code: 'OTHER_PERMISSION' },
      ]);

      // Act
      const result = await authorizationService.hasPermission(userId, permissionCode);

      // Assert
      expect(result).toBe(false);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId, { populate: ['role'] });
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockRoleRepository.getPermissions).toHaveBeenCalledWith(roleId);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has the role', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'role123';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        role: roleId,
      });

      // Act
      const result = await authorizationService.hasRole(userId, roleId);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return true if user has one of the roles', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'role123';
      const roleIds = ['role456', 'role123', 'role789'];

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        role: roleId,
      });

      // Act
      const result = await authorizationService.hasRole(userId, roleIds);

      // Assert
      expect(result).toBe(true);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should return false if user does not have the role', async () => {
      // Arrange
      const userId = 'user123';
      const roleId = 'role123';

      mockUserRepository.findById.mockResolvedValue({
        id: userId,
        role: 'other_role',
      });

      // Act
      const result = await authorizationService.hasRole(userId, roleId);

      // Assert
      expect(result).toBe(false);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      // Arrange
      const roleData = {
        name: 'TEST_ROLE',
        description: 'Test role',
      };
      const createdBy = 'user123';
      const createdRole = {
        id: 'role123',
        ...roleData,
        createdBy,
        updatedBy: createdBy,
      };

      mockRoleRepository.findByName.mockResolvedValue(null);
      mockRoleRepository.create.mockResolvedValue(createdRole);

      // Act
      const result = await authorizationService.createRole(roleData, createdBy);

      // Assert
      expect(result).toEqual(createdRole);
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(mockRoleRepository.create).toHaveBeenCalledWith({
        ...roleData,
        createdBy,
        updatedBy: createdBy,
      });
    });

    it('should throw an error if role with same name already exists', async () => {
      // Arrange
      const roleData = {
        name: 'TEST_ROLE',
        description: 'Test role',
      };
      const createdBy = 'user123';
      const existingRole = {
        id: 'role123',
        ...roleData,
      };

      mockRoleRepository.findByName.mockResolvedValue(existingRole);

      // Act & Assert
      await expect(authorizationService.createRole(roleData, createdBy))
        .rejects
        .toEqual(createApiError('SERVER_ERROR', 'Error creating role'));
      expect(mockRoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(mockRoleRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('assignPermissionToRole', () => {
    it('should assign permission to role', async () => {
      // Arrange
      const roleId = 'role123';
      const permissionId = 'perm123';
      const role = {
        id: roleId,
        name: 'TEST_ROLE',
      };
      const permission = {
        id: permissionId,
        code: 'TEST_PERMISSION',
      };
      const updatedRole = {
        ...role,
        permissions: [permissionId],
      };

      mockRoleRepository.findById.mockResolvedValue(role);
      mockPermissionRepository.findById.mockResolvedValue(permission);
      mockRoleRepository.addPermission.mockResolvedValue(updatedRole);

      // Act
      const result = await authorizationService.assignPermissionToRole(roleId, permissionId);

      // Assert
      expect(result).toEqual(updatedRole);
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permissionId);
      expect(mockRoleRepository.addPermission).toHaveBeenCalledWith(roleId, permissionId);
    });

    it('should throw an error if role not found', async () => {
      // Arrange
      const roleId = 'role123';
      const permissionId = 'perm123';

      mockRoleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authorizationService.assignPermissionToRole(roleId, permissionId))
        .rejects
        .toEqual(createApiError('SERVER_ERROR', 'Error assigning permission to role'));
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).not.toHaveBeenCalled();
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });

    it('should throw an error if permission not found', async () => {
      // Arrange
      const roleId = 'role123';
      const permissionId = 'perm123';
      const role = {
        id: roleId,
        name: 'TEST_ROLE',
      };

      mockRoleRepository.findById.mockResolvedValue(role);
      mockPermissionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(authorizationService.assignPermissionToRole(roleId, permissionId))
        .rejects
        .toEqual(createApiError('SERVER_ERROR', 'Error assigning permission to role'));
      expect(mockRoleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(mockPermissionRepository.findById).toHaveBeenCalledWith(permissionId);
      expect(mockRoleRepository.addPermission).not.toHaveBeenCalled();
    });
  });

  // Add more tests for other methods as needed
});
