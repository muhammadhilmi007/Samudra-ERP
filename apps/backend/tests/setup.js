/**
 * Test setup file
 * This file is run before all tests to ensure all models are registered with Mongoose
 */

// Import all models to ensure they're registered with Mongoose
require('../src/domain/models/user');
require('../src/domain/models/role');
require('../src/domain/models/branch');
require('../src/domain/models/warehouseItem');
require('../src/domain/models/itemAllocation');
require('../src/domain/models/loadingManifest');
require('../src/domain/models/permission');
require('../src/domain/models/shipment');
require('../src/domain/models/employee');
require('../src/domain/models/position');

// Additional configuration can be added here if needed

module.exports = {};
