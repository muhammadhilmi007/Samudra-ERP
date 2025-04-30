/**
 * Samudra Paket ERP - Division Model Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Division = require('../../../../domain/models/division');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Division.deleteMany({});
});

describe('Division Model', () => {
  it('should create a division successfully', async () => {
    const divisionData = {
      code: 'DIV001',
      name: 'Finance Division',
      description: 'Handles financial operations',
      branch: new mongoose.Types.ObjectId(),
      status: 'active',
    };

    const division = new Division(divisionData);
    const savedDivision = await division.save();

    expect(savedDivision._id).toBeDefined();
    expect(savedDivision.code).toBe(divisionData.code);
    expect(savedDivision.name).toBe(divisionData.name);
    expect(savedDivision.description).toBe(divisionData.description);
    expect(savedDivision.branch.toString()).toBe(divisionData.branch.toString());
    expect(savedDivision.status).toBe(divisionData.status);
    expect(savedDivision.level).toBe(0); // Default level
  });

  it('should set level correctly based on parent division', async () => {
    // Create parent division
    const parentDivision = new Division({
      code: 'DIV001',
      name: 'Parent Division',
      branch: new mongoose.Types.ObjectId(),
      level: 1,
    });
    await parentDivision.save();

    // Create child division
    const childDivision = new Division({
      code: 'DIV002',
      name: 'Child Division',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: parentDivision._id,
    });
    await childDivision.save();

    expect(childDivision.level).toBe(2); // Parent level + 1
  });

  it('should retrieve division hierarchy', async () => {
    // Create parent division
    const parentDivision = new Division({
      code: 'DIV001',
      name: 'Parent Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await parentDivision.save();

    // Create child divisions
    const childDivision1 = new Division({
      code: 'DIV002',
      name: 'Child Division 1',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: parentDivision._id,
    });
    await childDivision1.save();

    const childDivision2 = new Division({
      code: 'DIV003',
      name: 'Child Division 2',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: parentDivision._id,
    });
    await childDivision2.save();

    // Get hierarchy
    const hierarchy = await Division.getHierarchy();
    
    expect(hierarchy).toBeDefined();
    expect(hierarchy.length).toBeGreaterThan(0);
    
    // Find the parent division in the hierarchy
    const parentInHierarchy = hierarchy.find(
      div => div._id.toString() === parentDivision._id.toString()
    );
    
    expect(parentInHierarchy).toBeDefined();
    expect(parentInHierarchy.childDivisions).toBeDefined();
    expect(parentInHierarchy.childDivisions.length).toBe(2);
  });

  it('should get all descendants of a division', async () => {
    // Create parent division
    const parentDivision = new Division({
      code: 'DIV001',
      name: 'Parent Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await parentDivision.save();

    // Create child divisions
    const childDivision1 = new Division({
      code: 'DIV002',
      name: 'Child Division 1',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: parentDivision._id,
    });
    await childDivision1.save();

    const childDivision2 = new Division({
      code: 'DIV003',
      name: 'Child Division 2',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: parentDivision._id,
    });
    await childDivision2.save();

    // Create grandchild division
    const grandchildDivision = new Division({
      code: 'DIV004',
      name: 'Grandchild Division',
      branch: new mongoose.Types.ObjectId(),
      parentDivision: childDivision1._id,
    });
    await grandchildDivision.save();

    // Get all descendants
    const descendants = await parentDivision.getAllDescendants();
    
    expect(descendants).toBeDefined();
    expect(descendants.length).toBe(3); // 2 children + 1 grandchild
    
    // Check if all descendants are included
    const descendantIds = descendants.map(d => d._id.toString());
    expect(descendantIds).toContain(childDivision1._id.toString());
    expect(descendantIds).toContain(childDivision2._id.toString());
    expect(descendantIds).toContain(grandchildDivision._id.toString());
  });
});
