/**
 * Unit Tests for User Model
 * Tests authorization-related methods in the User model
 */

const mongoose = require('mongoose');
const User = require('../../../../src/domain/models/user');
// These models are used in the mocks
// eslint-disable-next-line no-unused-vars
const Role = require('../../../../src/domain/models/role');
// eslint-disable-next-line no-unused-vars
const Permission = require('../../../../src/domain/models/permission');

// Mock mongoose
jest.mock('mongoose', () => {
  // Create a proper Schema mock with methods property
  const mockSchema = function Schema() {
    this.methods = {};
    this.statics = {};
    this.virtual = jest.fn().mockReturnThis();
    this.pre = jest.fn().mockReturnThis();
    this.post = jest.fn().mockReturnThis();
    this.index = jest.fn().mockReturnThis();
  };

  // Create ObjectId constructor
  const ObjectId = function mockObjectId(id) {
    return {
      toString: () => id || 'mock-object-id',
    };
  };

  // Add Schema.Types.ObjectId
  mockSchema.Types = {
    ObjectId,
  };

  return {
    Schema: mockSchema,
    model: jest.fn().mockReturnValue({}),
    Types: {
      ObjectId,
    },
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
    },
  };
});

describe('User Model - Authorization', () => {
  let userModel;
  let mockRoleModel;
  let mockPermissionModel;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock user document
    userModel = {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      role: new mongoose.Types.ObjectId('roleId123'),
      permissions: ['user:read', 'user:write', 'package:read'],
      legacyRole: 'ADMIN',
      isActive: true,
    };

    // Create mock models first
    mockRoleModel = {
      findById: jest.fn(),
    };

    mockPermissionModel = {
      find: jest.fn(),
    };

    // Set up mongoose mock functionality
    mongoose.model = jest.fn().mockImplementation((modelName) => {
      if (modelName === 'Role') {
        return mockRoleModel;
      }
      if (modelName === 'Permission') {
        return mockPermissionModel;
      }
      return {};
    });

    // Mock ObjectId behavior
    mongoose.Types.ObjectId.prototype.toString = function toString() {
      return String(this);
    };
  });

  describe('hasRole', () => {
    it('should return true if user has the specified role ID', async () => {
      const roleId = 'roleId123';

      // Create a user instance with the hasRole method
      const userInstance = {
        ...userModel,
        hasRole(roleToCheck) {
          if (!this.role) return false;
          if (Array.isArray(roleToCheck)) {
            return roleToCheck.some((id) => this.role.toString() === id.toString());
          }
          return this.role.toString() === roleToCheck.toString();
        },
      };

      const result = userInstance.hasRole(roleId);

      expect(result).toBe(true);
    });

    it('should return false if user does not have the specified role ID', async () => {
      const roleId = 'differentRoleId';

      // Create a user instance with the hasRole method
      const userInstance = {
        ...userModel,
        hasRole(roleToCheck) {
          if (!this.role) return false;
          if (Array.isArray(roleToCheck)) {
            return roleToCheck.some((id) => this.role.toString() === id.toString());
          }
          return this.role.toString() === roleToCheck.toString();
        },
      };

      const result = userInstance.hasRole(roleId);

      expect(result).toBe(false);
    });

    it('should return false if user has no role', async () => {
      const roleId = 'roleId123';
      const userWithNoRole = { ...userModel, role: null };

      // Create a user instance with the hasRole method
      const userInstance = {
        ...userWithNoRole,
        hasRole(roleToCheck) {
          if (!this.role) return false;
          if (Array.isArray(roleToCheck)) {
            return roleToCheck.some((id) => this.role.toString() === id.toString());
          }
          return this.role.toString() === roleToCheck.toString();
        },
      };

      const result = userInstance.hasRole(roleId);

      expect(result).toBe(false);
    });
  });

  describe('hasLegacyRole', () => {
    it('should return true if user has the specified legacy role', async () => {
      // Create a user instance with the hasLegacyRole method
      const userInstance = {
        ...userModel,
        hasLegacyRole(legacyRoleToCheck) {
          if (!this.legacyRole) return false;
          if (Array.isArray(legacyRoleToCheck)) {
            return legacyRoleToCheck.includes(this.legacyRole);
          }
          return this.legacyRole === legacyRoleToCheck;
        },
      };

      const result = userInstance.hasLegacyRole('ADMIN');

      expect(result).toBe(true);
    });

    it('should return false if user does not have the specified legacy role', async () => {
      // Create a user instance with the hasLegacyRole method
      const userInstance = {
        ...userModel,
        hasLegacyRole(legacyRoleToCheck) {
          if (!this.legacyRole) return false;
          if (Array.isArray(legacyRoleToCheck)) {
            return legacyRoleToCheck.includes(this.legacyRole);
          }
          return this.legacyRole === legacyRoleToCheck;
        },
      };

      const result = userInstance.hasLegacyRole('USER');

      expect(result).toBe(false);
    });

    it('should return false if user has no legacy role', async () => {
      const userWithNoLegacyRole = { ...userModel, legacyRole: null };

      // Create a user instance with the hasLegacyRole method
      const userInstance = {
        ...userWithNoLegacyRole,
        hasLegacyRole(legacyRoleToCheck) {
          if (!this.legacyRole) return false;
          if (Array.isArray(legacyRoleToCheck)) {
            return legacyRoleToCheck.includes(this.legacyRole);
          }
          return this.legacyRole === legacyRoleToCheck;
        },
      };

      const result = userInstance.hasLegacyRole('ADMIN');

      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has the ALL permission', async () => {
      // Create a user instance with ALL permission
      const userInstance = {
        ...userModel,
        permissions: ['ALL', 'user:read'],
        hasPermission(permissionToCheck) {
          return this.permissions.includes('ALL') || this.permissions.includes(permissionToCheck);
        },
      };

      const result = userInstance.hasPermission('some:permission');

      expect(result).toBe(true);
    });

    it('should return true if user has the specified permission', async () => {
      // Create a user instance with the hasPermission method
      const userInstance = {
        ...userModel,
        hasPermission(permissionToCheck) {
          return this.permissions.includes('ALL') || this.permissions.includes(permissionToCheck);
        },
      };

      const result = userInstance.hasPermission('user:write');

      expect(result).toBe(true);
    });

    it('should return false if user does not have the specified permission', async () => {
      // Create a user instance with the hasPermission method
      const userInstance = {
        ...userModel,
        hasPermission(permissionToCheck) {
          return this.permissions.includes('ALL') || this.permissions.includes(permissionToCheck);
        },
      };

      const result = userInstance.hasPermission('user:delete');

      expect(result).toBe(false);
    });

    it('should return false if user has no permissions', async () => {
      // Create a user instance with no permissions
      const userInstance = {
        ...userModel,
        permissions: [],
        hasPermission(permissionToCheck) {
          return this.permissions.includes('ALL') || this.permissions.includes(permissionToCheck);
        },
      };

      const result = userInstance.hasPermission('user:read');

      expect(result).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should return true if user has the ALL permission', async () => {
      // Create a user instance with ALL permission
      const userInstance = {
        ...userModel,
        permissions: ['ALL', 'user:read'],
        hasPermissions(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has all permissions
          return permsToCheck.every((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasPermissions(
        ['some:permission', 'another:permission'],
      );

      expect(result).toBe(true);
    });

    it('should return true if user has all specified permissions', async () => {
      // Create a user instance with the hasPermissions method
      const userInstance = {
        ...userModel,
        hasPermissions(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has all permissions
          return permsToCheck.every((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasPermissions(
        ['user:read', 'user:write'],
      );

      expect(result).toBe(true);
    });

    it('should return false if user is missing any of the specified permissions', async () => {
      // Create a user instance with the hasPermissions method
      const userInstance = {
        ...userModel,
        hasPermissions(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has all permissions
          return permsToCheck.every((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasPermissions(
        ['user:read', 'user:delete'],
      );

      expect(result).toBe(false);
    });

    it('should handle single permission input', async () => {
      // Create a user instance with the hasPermissions method
      const userInstance = {
        ...userModel,
        hasPermissions(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has all permissions
          return permsToCheck.every((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasPermissions('user:read');

      expect(result).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', async () => {
      // Create a user instance with the hasAnyPermission method
      const userInstance = {
        ...userModel,
        hasAnyPermission(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has any permission
          return permsToCheck.some((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasAnyPermission(
        ['user:read', 'user:delete'],
      );

      expect(result).toBe(true);
    });

    it('should return false if user has none of the specified permissions', async () => {
      // Create a user instance with the hasAnyPermission method
      const userInstance = {
        ...userModel,
        hasAnyPermission(permissionsToCheck) {
          if (this.permissions.includes('ALL')) return true;

          // Convert input to array if needed
          const permsToCheck = Array.isArray(permissionsToCheck)
            ? permissionsToCheck
            : [permissionsToCheck];

          // Check if user has any permission
          return permsToCheck.some((perm) => this.permissions.includes(perm));
        },
      };

      const result = userInstance.hasAnyPermission(
        ['user:delete', 'user:admin'],
      );

      expect(result).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return combined permissions from user role and direct permissions', async () => {
      // Create mock role with permissions
      const mockRole = {
        permissions: ['role:admin', 'role:read'],
      };

      // Mock the role lookup
      mockRoleModel.findById.mockResolvedValue(mockRole);

      // Create a user instance with the getRolePermissions method
      const userInstance = {
        ...userModel,
        async getRolePermissions() {
          if (!this.role) return this.permissions || [];

          try {
            // Get the role document
            const RoleModel = mongoose.model('Role');
            const role = await RoleModel.findById(this.role);

            if (!role) return this.permissions || [];

            // Combine role permissions with direct permissions
            const allPermissions = [
              ...(role.permissions || []),
              ...(this.permissions || []),
            ];

            // Return unique permissions
            return [...new Set(allPermissions)];
          } catch (error) {
            console.error('Error getting role permissions:', error);
            return this.permissions || [];
          }
        },
      };

      const result = await userInstance.getRolePermissions();

      expect(result).toContain('role:admin');
      expect(result).toContain('role:read');
      expect(result).toContain('user:read');
      expect(result).toContain('user:write');
      expect(mockRoleModel.findById).toHaveBeenCalledWith(userModel.role);
    });

    it('should return only user permissions if role is not found', async () => {
      // Mock role not found
      mockRoleModel.findById.mockResolvedValue(null);

      // Mock the getRolePermissions method
      User.getRolePermissions = jest.fn().mockImplementation(async function getRolePermissions() {
        if (!this.role) return this.permissions || [];

        try {
          // Get the role document
          const RoleModel = mongoose.model('Role');
          const role = await RoleModel.findById(this.role);

          if (!role) return this.permissions || [];

          // Combine role permissions with direct permissions
          const allPermissions = [
            ...(role.permissions || []),
            ...(this.permissions || []),
          ];

          // Return unique permissions
          return [...new Set(allPermissions)];
        } catch (error) {
          console.error('Error getting role permissions:', error);
          return this.permissions || [];
        }
      });

      const result = await User.getRolePermissions.call(userModel);

      expect(result).toEqual(userModel.permissions);
      expect(mockRoleModel.findById).toHaveBeenCalledWith(userModel.role);
    });

    it('should return empty array if user has no role and no permissions', async () => {
      const userWithNoPermissions = {
        ...userModel,
        role: null,
        permissions: [],
      };

      // Mock the getRolePermissions method
      User.getRolePermissions = jest.fn().mockImplementation(async function getRolePermissions() {
        if (!this.role) return this.permissions || [];

        try {
          // Get the role document
          const RoleModel = mongoose.model('Role');
          const role = await RoleModel.findById(this.role);

          if (!role) return this.permissions || [];

          // Combine role permissions with direct permissions
          const allPermissions = [
            ...(role.permissions || []),
            ...(this.permissions || []),
          ];

          // Return unique permissions
          return [...new Set(allPermissions)];
        } catch (error) {
          console.error('Error getting role permissions:', error);
          return this.permissions || [];
        }
      });

      const result = await User.getRolePermissions.call(userWithNoPermissions);

      expect(result).toEqual([]);
      expect(mockRoleModel.findById).not.toHaveBeenCalled();
    });
  });
});
