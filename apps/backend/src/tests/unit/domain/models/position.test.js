/**
 * Samudra Paket ERP - Position Model Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Position = require('../../../../domain/models/position');
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
  await Position.deleteMany({});
  await Division.deleteMany({});
});

describe('Position Model', () => {
  it('should create a position successfully', async () => {
    // Create a division first
    const division = new Division({
      code: 'DIV001',
      name: 'Finance Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await division.save();

    const positionData = {
      code: 'POS001',
      title: 'Finance Manager',
      description: 'Manages financial operations',
      division: division._id,
      responsibilities: ['Budget planning', 'Financial reporting'],
      requirements: {
        education: 'Bachelor in Finance',
        experience: '5 years in financial management',
        skills: ['Financial analysis', 'Budgeting'],
        certifications: ['CPA'],
      },
      status: 'active',
    };

    const position = new Position(positionData);
    const savedPosition = await position.save();

    expect(savedPosition._id).toBeDefined();
    expect(savedPosition.code).toBe(positionData.code);
    expect(savedPosition.title).toBe(positionData.title);
    expect(savedPosition.description).toBe(positionData.description);
    expect(savedPosition.division.toString()).toBe(division._id.toString());
    expect(savedPosition.responsibilities).toEqual(positionData.responsibilities);
    expect(savedPosition.requirements).toEqual(positionData.requirements);
    expect(savedPosition.status).toBe(positionData.status);
    expect(savedPosition.level).toBe(0); // Default level
  });

  it('should set level correctly based on parent position', async () => {
    // Create a division
    const division = new Division({
      code: 'DIV001',
      name: 'Finance Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await division.save();

    // Create parent position
    const parentPosition = new Position({
      code: 'POS001',
      title: 'Finance Director',
      division: division._id,
      level: 1,
    });
    await parentPosition.save();

    // Create child position
    const childPosition = new Position({
      code: 'POS002',
      title: 'Finance Manager',
      division: division._id,
      parentPosition: parentPosition._id,
    });
    await childPosition.save();

    expect(childPosition.level).toBe(2); // Parent level + 1
  });

  it('should retrieve position hierarchy', async () => {
    // Create a division
    const division = new Division({
      code: 'DIV001',
      name: 'Finance Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await division.save();

    // Create parent position
    const parentPosition = new Position({
      code: 'POS001',
      title: 'Finance Director',
      division: division._id,
    });
    await parentPosition.save();

    // Create child positions
    const childPosition1 = new Position({
      code: 'POS002',
      title: 'Finance Manager',
      division: division._id,
      parentPosition: parentPosition._id,
    });
    await childPosition1.save();

    const childPosition2 = new Position({
      code: 'POS003',
      title: 'Accounting Manager',
      division: division._id,
      parentPosition: parentPosition._id,
    });
    await childPosition2.save();

    // Get hierarchy
    const hierarchy = await Position.getHierarchy();
    
    expect(hierarchy).toBeDefined();
    expect(hierarchy.length).toBeGreaterThan(0);
    
    // Find the parent position in the hierarchy
    const parentInHierarchy = hierarchy.find(
      pos => pos._id.toString() === parentPosition._id.toString()
    );
    
    expect(parentInHierarchy).toBeDefined();
    expect(parentInHierarchy.subordinatePositions).toBeDefined();
    expect(parentInHierarchy.subordinatePositions.length).toBe(2);
  });

  it('should get all subordinates of a position', async () => {
    // Create a division
    const division = new Division({
      code: 'DIV001',
      name: 'Finance Division',
      branch: new mongoose.Types.ObjectId(),
    });
    await division.save();

    // Create parent position
    const parentPosition = new Position({
      code: 'POS001',
      title: 'Finance Director',
      division: division._id,
    });
    await parentPosition.save();

    // Create child positions
    const childPosition1 = new Position({
      code: 'POS002',
      title: 'Finance Manager',
      division: division._id,
      parentPosition: parentPosition._id,
    });
    await childPosition1.save();

    const childPosition2 = new Position({
      code: 'POS003',
      title: 'Accounting Manager',
      division: division._id,
      parentPosition: parentPosition._id,
    });
    await childPosition2.save();

    // Create grandchild position
    const grandchildPosition = new Position({
      code: 'POS004',
      title: 'Financial Analyst',
      division: division._id,
      parentPosition: childPosition1._id,
    });
    await grandchildPosition.save();

    // Get all subordinates
    const subordinates = await parentPosition.getAllSubordinates();
    
    expect(subordinates).toBeDefined();
    expect(subordinates.length).toBe(3); // 2 children + 1 grandchild
    
    // Check if all subordinates are included
    const subordinateIds = subordinates.map(p => p._id.toString());
    expect(subordinateIds).toContain(childPosition1._id.toString());
    expect(subordinateIds).toContain(childPosition2._id.toString());
    expect(subordinateIds).toContain(grandchildPosition._id.toString());
  });
});
