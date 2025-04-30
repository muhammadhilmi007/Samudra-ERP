/**
 * Samudra Paket ERP - Service Area Model Tests
 * Unit tests for the service area model
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceArea = require('../../../../src/domain/models/serviceArea');
const Branch = require('../../../../src/domain/models/branch');

let mongoServer;

// Sample data for testing
const sampleBranchData = {
  code: 'JKT01',
  name: 'Jakarta Pusat',
  address: {
    street: 'Jl. Medan Merdeka Barat No. 10',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '10110',
    country: 'Indonesia',
    coordinates: {
      latitude: -6.1751,
      longitude: 106.8650,
    },
  },
  contactInfo: {
    phone: '021-12345678',
    email: 'jakarta.pusat@samudrapaket.com',
  },
  level: 1,
  status: 'active',
};

const sampleServiceAreaData = {
  code: 'JKT-PUSAT',
  name: 'Jakarta Pusat Service Area',
  description: 'Service area covering Jakarta Pusat region',
  coverage: {
    type: 'Polygon',
    coordinates: [
      [
        [106.8000, -6.1500],
        [106.9000, -6.1500],
        [106.9000, -6.2000],
        [106.8000, -6.2000],
        [106.8000, -6.1500],
      ],
    ],
  },
  centerPoint: {
    type: 'Point',
    coordinates: [106.8500, -6.1750],
  },
  level: 'district',
  administrativeData: {
    province: 'DKI Jakarta',
    city: 'Jakarta',
    district: 'Jakarta Pusat',
    postalCodes: ['10110', '10120', '10130', '10140', '10150'],
  },
  serviceTypes: ['pickup', 'delivery'],
  status: 'active',
};

// Point inside the service area
const pointInside = [106.8500, -6.1750];

// Point outside the service area
const pointOutside = [106.7500, -6.1500];

describe('Service Area Model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await ServiceArea.deleteMany({});
    await Branch.deleteMany({});
  });

  it('should create a service area successfully', async () => {
    // Create a branch first
    const branch = new Branch(sampleBranchData);
    await branch.save();

    // Create service area with branch reference
    const serviceAreaData = {
      ...sampleServiceAreaData,
      branch: branch._id,
    };

    const serviceArea = new ServiceArea(serviceAreaData);
    const savedServiceArea = await serviceArea.save();

    // Assertions
    expect(savedServiceArea).toBeDefined();
    expect(savedServiceArea.code).toBe(sampleServiceAreaData.code);
    expect(savedServiceArea.name).toBe(sampleServiceAreaData.name);
    expect(savedServiceArea.branch.toString()).toBe(branch._id.toString());
    expect(savedServiceArea.status).toBe('active');
  });

  it('should require code, name, branch, coverage, and centerPoint', async () => {
    // Create a branch first
    const branch = new Branch(sampleBranchData);
    await branch.save();

    // Test missing code
    const missingCode = new ServiceArea({
      ...sampleServiceAreaData,
      branch: branch._id,
      code: undefined,
    });
    await expect(missingCode.save()).rejects.toThrow();

    // Test missing name
    const missingName = new ServiceArea({
      ...sampleServiceAreaData,
      branch: branch._id,
      name: undefined,
    });
    await expect(missingName.save()).rejects.toThrow();

    // Test missing branch
    const missingBranch = new ServiceArea({
      ...sampleServiceAreaData,
      branch: undefined,
    });
    await expect(missingBranch.save()).rejects.toThrow();

    // Test missing coverage
    const missingCoverage = new ServiceArea({
      ...sampleServiceAreaData,
      branch: branch._id,
      coverage: undefined,
    });
    await expect(missingCoverage.save()).rejects.toThrow();

    // Test missing centerPoint
    const missingCenterPoint = new ServiceArea({
      ...sampleServiceAreaData,
      branch: branch._id,
      centerPoint: undefined,
    });
    await expect(missingCenterPoint.save()).rejects.toThrow();
  });

  it('should correctly check if a point is within the service area', async () => {
    // Create a branch first
    const branch = new Branch(sampleBranchData);
    await branch.save();

    // Create service area with branch reference
    const serviceAreaData = {
      ...sampleServiceAreaData,
      branch: branch._id,
    };

    const serviceArea = new ServiceArea(serviceAreaData);
    await serviceArea.save();

    // Test point inside service area
    const isInside = await serviceArea.containsPoint(pointInside);
    expect(isInside).toBe(true);

    // Test point outside service area
    const isOutside = await serviceArea.containsPoint(pointOutside);
    expect(isOutside).toBe(false);
  });

  it('should find service areas containing a point', async () => {
    // Create a branch first
    const branch = new Branch(sampleBranchData);
    await branch.save();

    // Create service area with branch reference
    const serviceAreaData = {
      ...sampleServiceAreaData,
      branch: branch._id,
    };

    const serviceArea = new ServiceArea(serviceAreaData);
    await serviceArea.save();

    // Test finding service areas containing a point inside
    const areasWithPointInside = await ServiceArea.findByPoint(pointInside);
    expect(areasWithPointInside).toHaveLength(1);
    expect(areasWithPointInside[0].code).toBe(serviceAreaData.code);

    // Test finding service areas containing a point outside
    const areasWithPointOutside = await ServiceArea.findByPoint(pointOutside);
    expect(areasWithPointOutside).toHaveLength(0);
  });

  it('should find service areas by polygon intersection', async () => {
    // Create a branch first
    const branch = new Branch(sampleBranchData);
    await branch.save();

    // Create service area with branch reference
    const serviceAreaData = {
      ...sampleServiceAreaData,
      branch: branch._id,
    };

    const serviceArea = new ServiceArea(serviceAreaData);
    await serviceArea.save();

    // Create a polygon that intersects with the service area
    const intersectingPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [106.8200, -6.1600],
          [106.8800, -6.1600],
          [106.8800, -6.1900],
          [106.8200, -6.1900],
          [106.8200, -6.1600],
        ],
      ],
    };

    // Create a polygon that doesn't intersect with the service area
    const nonIntersectingPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [106.7000, -6.0500],
          [106.7500, -6.0500],
          [106.7500, -6.1000],
          [106.7000, -6.1000],
          [106.7000, -6.0500],
        ],
      ],
    };

    // Test finding service areas intersecting with a polygon
    const intersectingAreas = await ServiceArea.findByPolygon(intersectingPolygon);
    expect(intersectingAreas).toHaveLength(1);
    expect(intersectingAreas[0].code).toBe(serviceAreaData.code);

    // Test finding service areas not intersecting with a polygon
    const nonIntersectingAreas = await ServiceArea.findByPolygon(nonIntersectingPolygon);
    expect(nonIntersectingAreas).toHaveLength(0);
  });

  it('should properly index the coverage field for geospatial queries', async () => {
    // Get the indexes on the ServiceArea collection
    const indexes = await ServiceArea.collection.indexes();

    // Find the 2dsphere index on the coverage field
    const coverageIndex = indexes.find(
      (index) => index.key.coverage === '2dsphere',
    );

    expect(coverageIndex).toBeDefined();
    expect(coverageIndex.key.coverage).toBe('2dsphere');
  });
});
