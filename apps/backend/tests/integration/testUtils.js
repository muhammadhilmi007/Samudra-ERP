/**
 * Samudra Paket ERP - Integration Test Utilities
 * Helper functions for integration tests
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Clear all collections in the database
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create a test user with default values
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} Created user object
 */
const createTestUser = async (overrides = {}) => {
  const UserModel = mongoose.model('User');
  
  // Default password hash (for 'Password123!')
  const passwordHash = await bcrypt.hash('Password123!', 10);
  
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: passwordHash,
    fullName: 'Test User',
    phoneNumber: '081234567890',
    role: 'CUSTOMER',
    permissions: ['customer.view'],
    isActive: false,
    isEmailVerified: false,
    ...overrides
  };
  
  // If password is provided in plain text, hash it
  if (overrides.password && !overrides.password.startsWith('$2')) {
    userData.password = await bcrypt.hash(overrides.password, 10);
  }
  
  const user = new UserModel(userData);
  await user.save();
  
  return user;
};

/**
 * Create a test role with default values
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} Created role object
 */
const createTestRole = async (overrides = {}) => {
  const RoleModel = mongoose.model('Role');
  
  const roleData = {
    name: 'Test Role',
    description: 'Role created for testing',
    permissions: ['user.view', 'user.create'],
    ...overrides
  };
  
  const role = new RoleModel(roleData);
  await role.save();
  
  return role;
};

/**
 * Create a test branch with default values
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} Created branch object
 */
const createTestBranch = async (overrides = {}) => {
  const BranchModel = mongoose.model('Branch');
  
  const branchData = {
    code: 'TST',
    name: 'Test Branch',
    address: 'Test Address',
    city: 'Test City',
    province: 'Test Province',
    phoneNumber: '081234567890',
    email: 'branch@example.com',
    isActive: true,
    ...overrides
  };
  
  const branch = new BranchModel(branchData);
  await branch.save();
  
  return branch;
};

/**
 * Create a test employee with default values
 * @param {Object} overrides - Properties to override default values
 * @returns {Object} Created employee object
 */
const createTestEmployee = async (overrides = {}) => {
  const EmployeeModel = mongoose.model('Employee');
  
  // Create a test branch if not provided
  let branchId = overrides.branchId;
  if (!branchId) {
    const branch = await createTestBranch();
    branchId = branch.id;
  }
  
  // Create a test position if not provided
  let positionId = overrides.positionId;
  if (!positionId) {
    const PositionModel = mongoose.model('Position');
    const position = new PositionModel({
      name: 'Test Position',
      department: 'Test Department',
      level: 1
    });
    await position.save();
    positionId = position.id;
  }
  
  const employeeData = {
    employeeId: 'EMP001',
    fullName: 'Test Employee',
    email: 'employee@example.com',
    phoneNumber: '081234567890',
    address: 'Test Address',
    branchId,
    positionId,
    joinDate: new Date(),
    isActive: true,
    ...overrides
  };
  
  const employee = new EmployeeModel(employeeData);
  await employee.save();
  
  return employee;
};

/**
 * Generate a valid JWT token for testing
 * @param {Object} user - User object to generate token for
 * @returns {string} JWT token
 */
const generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    { expiresIn: '1h' },
  );
};

module.exports = {
  clearDatabase,
  createTestUser,
  createTestRole,
  createTestBranch,
  createTestEmployee,
  generateTestToken
};
