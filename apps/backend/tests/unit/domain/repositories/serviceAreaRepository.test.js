/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ServiceArea = require('../../../../src/domain/models/serviceArea');
const MongoServiceAreaRepository = require('../../../../src/infrastructure/repositories/mongoServiceAreaRepository');
const { NotFoundError } = require('../../../../src/domain/utils/errorUtils');

let mongoServer;
let serviceAreaRepository;
let branchId;

describe('MongoServiceAreaRepository', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    serviceAreaRepository = new MongoServiceAreaRepository();
    branchId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await ServiceArea.deleteMany({});
  });

  describe('create', () => {
    it('should create a new service area', async () => {
      const serviceAreaData = {
        name: 'Test Area',
        code: 'TA001',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          // eslint-disable-next-line max-len
          coordinates: [
            [
              [-73.9, 40.7],
              [-73.8, 40.7],
              [-73.8, 40.8],
              [-73.9, 40.8],
              [-73.9, 40.7],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [-73.85, 40.75],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City',
        },
        operationalHours: 'Mon-Fri 9am-5pm',
      };

      const createdArea = await serviceAreaRepository.create(serviceAreaData);

      expect(createdArea).toBeDefined();
      expect(createdArea.name).toBe('Test Area');
      expect(createdArea.branch.toString()).toBe(branchId.toString());
      expect(createdArea.coverage.coordinates).toEqual(serviceAreaData.coverage.coordinates);
      expect(createdArea.operationalHours).toBe(serviceAreaData.operationalHours);
      expect(createdArea.isActive).toBe(true);

      const dbArea = await ServiceArea.findById(createdArea._id);
      expect(dbArea).toBeDefined();
      expect(dbArea.name).toBe(serviceAreaData.name);
    });

    it('should throw an error if validation fails', async () => {
      const invalidServiceAreaData = {
        name: '',
        branch: branchId,
        coverage: {
          type: 'InvalidType',
          coordinates: [],
        },
      };

      await expect(serviceAreaRepository.create(invalidServiceAreaData)).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });
  });

  describe('findById', () => {
    let testArea;

    beforeEach(async () => {
      testArea = await new ServiceArea({
        name: 'Find Area',
        code: 'FA001',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          coordinates: [
            [
              [-1, 1],
              [1, 1],
              [1, -1],
              [-1, -1],
              [-1, 1],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [0, 0],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City',
        },
      }).save();
    });

    it('should return the service area if found', async () => {
      const foundArea = await serviceAreaRepository.findById(testArea._id);

      expect(foundArea).toBeDefined();
      expect(foundArea._id.toString()).toBe(testArea._id.toString());
      expect(foundArea.name).toBe(testArea.name);
    });

    it('should return null if service area not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const foundArea = await serviceAreaRepository.findById(nonExistentId);

      expect(foundArea).toBeNull();
    });

    it('should throw an error for invalid ID format', async () => {
      await expect(serviceAreaRepository.findById('invalid-id')).rejects.toThrow(
        mongoose.Error.CastError,
      );
    });
  });

  describe('findByQuery', () => {
    let areas;

    beforeAll(async () => {
      // Debug: Log branchId being used

      areas = await Promise.all([
        new ServiceArea({
          name: 'Area A',
          code: 'AA001',
          branch: branchId,
          isActive: true,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1],
                [-1, 1],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City A',
          },
        }).save(),
        new ServiceArea({
          name: 'Area B',
          code: 'AB001',
          branch: branchId,
          isActive: false,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-2, 2],
                [2, 2],
                [2, -2],
                [-2, -2],
                [-2, 2],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City B',
          },
        }).save(),
        new ServiceArea({
          name: 'Search Area C',
          code: 'AC001',
          branch: new mongoose.Types.ObjectId(),
          isActive: true,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-3, 3],
                [3, 3],
                [3, -3],
                [-3, -3],
                [-3, 3],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City C',
          },
        }).save(),
      ]);

      // Debug: Verify saved areas

      // Debug: Verify database contents
      const dbAreas = await ServiceArea.find({});
    });

    afterAll(async () => {
      await Promise.all(areas.map((area) => ServiceArea.findByIdAndDelete(area._id)));
    });

    it('should return areas matching the query', async () => {
      const result = await serviceAreaRepository.findByQuery({ branch: branchId });

      expect(result.results).toBeDefined();
      expect(result.totalResults).toBe(2);
      expect(result.results).toHaveLength(2);
      expect(result.results.some((area) => area.name === 'Area A')).toBe(true);
      expect(result.results.some((area) => area.name === 'Area B')).toBe(true);
    });

    it('should filter by isActive status', async () => {
      const result = await serviceAreaRepository.findByQuery({ isActive: true });

      expect(result.totalResults).toBe(2);
      expect(result.results.every((area) => area.isActive === true)).toBe(true);
    });

    it('should paginate results correctly', async () => {
      const options = {
        page: 1,
        limit: 1,
        sortBy: 'name',
        sortOrder: 'asc',
      };
      const result = await serviceAreaRepository.findByQuery({}, options);

      expect(result.results).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.totalResults).toBe(3);
      expect(result.totalPages).toBe(3);
      expect(result.results[0].name).toBe('Area A');
    });

    it('should sort results correctly', async () => {
      const options = { sortBy: 'createdAt', sortOrder: 'desc' };
      const result = await serviceAreaRepository.findByQuery({}, options);

      expect(result.results[0].name).toBe('Search Area C');
    });

    it('should return empty results if no match found', async () => {
      const result = await serviceAreaRepository.findByQuery({ name: 'NonExistentArea' });

      expect(result.results).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });

    it('should handle complex queries (e.g., regex search)', async () => {
      const result = await serviceAreaRepository.findByQuery({ name: /Area/i });

      expect(result.totalResults).toBe(3);
    });
  });

  describe('update', () => {
    let testArea;

    beforeEach(async () => {
      testArea = await new ServiceArea({
        name: 'Update Area',
        code: 'UA001',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [0.5, 0.5],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City',
        },
      }).save();
    });

    it('should update and return the service area', async () => {
      const updateData = {
        name: 'Updated Service Area Name',
        isActive: false,
        operationalHours: '24/7',
      };

      const updatedArea = await serviceAreaRepository.update(testArea._id, updateData);

      expect(updatedArea).toBeDefined();
      expect(updatedArea._id.toString()).toBe(testArea._id.toString());
      expect(updatedArea.name).toBe(updateData.name);
      expect(updatedArea.isActive).toBe(updateData.isActive);
      expect(updatedArea.operationalHours).toBe(updateData.operationalHours);

      const dbArea = await ServiceArea.findById(testArea._id);
      expect(dbArea.name).toBe(updateData.name);
      expect(dbArea.isActive).toBe(false);
    });

    it('should throw NotFoundError if service area does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updateData = { name: 'Does Not Matter' };

      await expect(serviceAreaRepository.update(nonExistentId, updateData)).rejects.toThrow(
        NotFoundError,
      );
      await expect(serviceAreaRepository.update(nonExistentId, updateData)).rejects.toThrow(
        `ServiceArea with ID ${nonExistentId} not found`,
      );
    });

    it('should throw validation error for invalid update data', async () => {
      const invalidUpdateData = { name: '' };

      await expect(serviceAreaRepository.update(testArea._id, invalidUpdateData)).rejects.toThrow(
        mongoose.Error.ValidationError,
      );
    });

    it('should only update specified fields', async () => {
      const updateData = { operationalHours: 'Weekend Only' };
      const updatedArea = await serviceAreaRepository.update(testArea._id, updateData);

      expect(updatedArea.operationalHours).toBe(updateData.operationalHours);
      expect(updatedArea.name).toBe(testArea.name);
      expect(updatedArea.isActive).toBe(testArea.isActive);
    });
  });

  describe('delete', () => {
    let testArea;

    beforeEach(async () => {
      testArea = await new ServiceArea({
        name: 'Delete Area',
        code: 'DA001',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [0.5, 0.5],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City',
        },
      }).save();
    });

    it('should delete the service area and return the deleted area', async () => {
      const result = await serviceAreaRepository.delete(testArea._id);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(testArea._id.toString());

      const dbArea = await ServiceArea.findById(testArea._id);
      expect(dbArea).toBeNull();
    });

    it('should throw NotFoundError if service area does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      await expect(serviceAreaRepository.delete(nonExistentId)).rejects.toThrow(NotFoundError);
      await expect(serviceAreaRepository.delete(nonExistentId)).rejects.toThrow(
        `ServiceArea with ID ${nonExistentId} not found`,
      );
    });

    it('should throw an error for invalid ID format', async () => {
      await expect(serviceAreaRepository.delete('invalid-id')).rejects.toThrow(
        mongoose.Error.CastError,
      );
    });
  });

  describe('findByBranch', () => {
    let branch1Areas;
    let branch2Areas;
    const branch2Id = new mongoose.Types.ObjectId();

    beforeAll(async () => {
      branch1Areas = await Promise.all([
        new ServiceArea({
          name: 'Branch1 Area1',
          code: 'B1A1',
          branch: branchId,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1],
                [-1, 1],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City B1A1',
          },
        }).save(),
        new ServiceArea({
          name: 'Branch1 Area2',
          code: 'B1A2',
          branch: branchId,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-2, 2],
                [2, 2],
                [2, -2],
                [-2, -2],
                [-2, 2],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City B1A2',
          },
        }).save(),
      ]);
      branch2Areas = await Promise.all([
        new ServiceArea({
          name: 'Branch2 Area1',
          code: 'B2A1',
          branch: branch2Id,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-3, 3],
                [3, 3],
                [3, -3],
                [-3, -3],
                [-3, 3],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Test City B2A1',
          },
        }).save(),
      ]);
    });

    afterAll(async () => {
      const allAreas = [...branch1Areas, ...branch2Areas];
      await Promise.all(allAreas.map((area) => ServiceArea.findByIdAndDelete(area._id)));
    });

    it('should return all service areas for a specific branch', async () => {
      const result = await serviceAreaRepository.findByBranch(branchId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.every((area) => area.branch.toString() === branchId.toString())).toBe(true);
      expect(result.some((area) => area.name === 'Branch1 Area1')).toBe(true);
    });

    it('should return an empty array if branch has no service areas', async () => {
      const newBranchId = new mongoose.Types.ObjectId();
      const result = await serviceAreaRepository.findByBranch(newBranchId);

      expect(result).toEqual([]);
    });

    it('should return only areas for the specified branch', async () => {
      const result = await serviceAreaRepository.findByBranch(branch2Id);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Branch2 Area1');
    });
  });

  describe('findContainingPoint', () => {
    let polygonArea;
    let pointArea;

    beforeAll(async () => {
      polygonArea = await new ServiceArea({
        name: 'Polygon Area',
        code: 'PA001',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          coordinates: [
            [
              [1, 1],
              [3, 1],
              [3, 3],
              [1, 3],
              [1, 1],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [2, 2],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City PA',
        },
      }).save();
      pointArea = await new ServiceArea({
        name: 'Point Area',
        code: 'PA002',
        branch: branchId,
        coverage: {
          type: 'Polygon',
          coordinates: [
            [
              [4, 4],
              [6, 4],
              [6, 6],
              [4, 6],
              [4, 4],
            ],
          ],
        },
        centerPoint: {
          type: 'Point',
          coordinates: [5, 5],
        },
        administrativeData: {
          province: 'Test Province',
          city: 'Test City PB',
        },
      }).save();
    });

    afterAll(async () => {
      await Promise.all([
        ServiceArea.findByIdAndDelete(polygonArea._id),
        ServiceArea.findByIdAndDelete(pointArea._id),
      ]);
    });

    it('should return service areas whose coverage contains the point', async () => {
      const pointInside = { type: 'Point', coordinates: [2, 2] };
      const result = await serviceAreaRepository.findContainingPoint(pointInside);

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0]._id.toString()).toBe(polygonArea._id.toString());
    });

    it('should return empty array if no service area contains the point', async () => {
      const pointOutside = { type: 'Point', coordinates: [4, 4] };
      const result = await serviceAreaRepository.findContainingPoint(pointOutside);

      expect(result).toEqual([]);
    });

    it('should return empty array if point coordinates are invalid', async () => {
      const invalidPoint = { type: 'Point', coordinates: [NaN, NaN] };
      const result = await serviceAreaRepository.findContainingPoint(invalidPoint);
      expect(result).toEqual([]);
    });

    it('should handle different geometry types (if applicable)', async () => {
      const pointOnPoint = { type: 'Point', coordinates: [5, 5] };
      const result = await serviceAreaRepository.findContainingPoint(pointOnPoint);
      expect(result).toHaveLength(0);
    });
  });

  describe('searchByName', () => {
    let areasToSearch;

    beforeAll(async () => {
      areasToSearch = await Promise.all([
        new ServiceArea({
          name: 'Alpha Service Area',
          code: 'ASA001',
          branch: branchId,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1],
                [-1, 1],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Alpha City',
          },
        }).save(),
        new ServiceArea({
          name: 'Beta Service Area',
          code: 'BSA001',
          branch: branchId,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-2, 2],
                [2, 2],
                [2, -2],
                [-2, -2],
                [-2, 2],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Beta City',
          },
        }).save(),
        new ServiceArea({
          name: 'Gamma Zone',
          code: 'GZ001',
          branch: branchId,
          coverage: {
            type: 'Polygon',
            coordinates: [
              [
                [-3, 3],
                [3, 3],
                [3, -3],
                [-3, -3],
                [-3, 3],
              ],
            ],
          },
          centerPoint: {
            type: 'Point',
            coordinates: [0, 0],
          },
          administrativeData: {
            province: 'Test Province',
            city: 'Gamma City',
          },
        }).save(),
      ]);
    });

    afterAll(async () => {
      await Promise.all(areasToSearch.map((area) => ServiceArea.findByIdAndDelete(area._id)));
    });

    it('should return service areas matching the search term', async () => {
      const result = await serviceAreaRepository.searchByName('Service');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result.some((area) => area.name === 'Alpha Service Area')).toBe(true);
      expect(result.some((area) => area.name === 'Beta Service Area')).toBe(true);
    });

    it('should be case insensitive', async () => {
      const result = await serviceAreaRepository.searchByName('service');

      expect(result).toHaveLength(2);
    });

    it('should return empty array if no matches found', async () => {
      const result = await serviceAreaRepository.searchByName('NonExistent');

      expect(result).toEqual([]);
    });
  });
});
