const mongoose = require('mongoose');
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const Role = require('../../../../domain/models/role');

describe('Role Model', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/samudra-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  it('should create a new role with valid fields', async () => {
    const roleData = {
      name: 'TEST_ROLE',
      description: 'Test role for unit testing',
      permissions: [],
      isActive: true,
      isSystem: false,
    };

    const role = new Role(roleData);
    const savedRole = await role.save();

    expect(savedRole._id).toBeDefined();
    expect(savedRole.name).toBe(roleData.name);
    expect(savedRole.description).toBe(roleData.description);
    expect(savedRole.isActive).toBe(roleData.isActive);
    expect(savedRole.isSystem).toBe(roleData.isSystem);
    expect(savedRole.permissions).toEqual(roleData.permissions);
    expect(savedRole.createdAt).toBeDefined();
    expect(savedRole.updatedAt).toBeDefined();

    // Clean up
    await Role.deleteOne({ _id: savedRole._id });
  });

  it('should fail to create a role without required fields', async () => {
    const roleWithoutName = new Role({
      description: 'Test role without name',
    });

    let error;
    try {
      await roleWithoutName.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.name).toBeDefined();
  });

  it('should check if role has a specific permission', () => {
    const permissionId = new mongoose.Types.ObjectId();
    const role = new Role({
      name: 'TEST_ROLE',
      description: 'Test role for unit testing',
      permissions: [permissionId],
    });

    expect(role.hasPermission(permissionId)).toBe(true);
    expect(role.hasPermission(new mongoose.Types.ObjectId())).toBe(false);
  });

  it('should add a permission to a role', () => {
    const role = new Role({
      name: 'TEST_ROLE',
      description: 'Test role for unit testing',
      permissions: [],
    });

    const permissionId = new mongoose.Types.ObjectId();
    const result = role.addPermission(permissionId);

    expect(result).toBe(true);
    expect(role.permissions).toContainEqual(permissionId);

    // Adding the same permission again should return false
    const secondResult = role.addPermission(permissionId);
    expect(secondResult).toBe(false);
    expect(role.permissions.length).toBe(1);
  });

  it('should remove a permission from a role', () => {
    const permissionId = new mongoose.Types.ObjectId();
    const role = new Role({
      name: 'TEST_ROLE',
      description: 'Test role for unit testing',
      permissions: [permissionId],
    });

    const result = role.removePermission(permissionId);

    expect(result).toBe(true);
    expect(role.permissions).not.toContainEqual(permissionId);

    // Removing a non-existent permission should return false
    const secondResult = role.removePermission(permissionId);
    expect(secondResult).toBe(false);
  });
});