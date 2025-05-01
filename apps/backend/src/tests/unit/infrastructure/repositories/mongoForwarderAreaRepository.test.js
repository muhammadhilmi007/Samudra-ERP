/**
 * Samudra Paket ERP - MongoDB Forwarder Area Repository Unit Tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const MongoForwarderAreaRepository = require('../../../../infrastructure/repositories/mongoForwarderAreaRepository');
const ForwarderArea = require('../../../../domain/models/forwarderArea');

let mongoServer;
let connection;
let db;
let forwarderAreaRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  db = connection.db();
  forwarderAreaRepository = new MongoForwarderAreaRepository(db);
});

afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('forwarderAreas').deleteMany({});
});

describe('MongoForwarderAreaRepository', () => {
  describe('create', () => {
    it('should create a forwarder area successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areaData = new ForwarderArea({
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
        postalCode: '11440',
        status: 'active',
      });

      // Act
      const result = await forwarderAreaRepository.create(areaData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.forwarder).toBe(forwarderId.toString());
      expect(result.province).toBe(areaData.province);
      expect(result.city).toBe(areaData.city);
      expect(result.district).toBe(areaData.district);
      expect(result.postalCode).toBe(areaData.postalCode);
      expect(result.status).toBe(areaData.status);
    });
  });

  describe('findAll', () => {
    it('should find all forwarder areas', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'inactive',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const result = await forwarderAreaRepository.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].province).toBe('DKI Jakarta');
      expect(result[1].province).toBe('DKI Jakarta');
      expect(result[2].province).toBe('Jawa Barat');
    });

    it('should find forwarder areas with filter', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'inactive',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const result = await forwarderAreaRepository.findAll({ status: 'active' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should find forwarder areas with pagination', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'inactive',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bogor',
          district: 'Bogor Utara',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Tengah',
          city: 'Semarang',
          district: 'Semarang Tengah',
          status: 'active',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const result = await forwarderAreaRepository.findAll({}, { skip: 2, limit: 2 });

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('count', () => {
    it('should count all forwarder areas', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'inactive',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const count = await forwarderAreaRepository.count();

      // Assert
      expect(count).toBe(3);
    });

    it('should count forwarder areas with filter', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'inactive',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const count = await forwarderAreaRepository.count({ status: 'active' });

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a forwarder area by ID', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const area = new ForwarderArea({
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
        status: 'active',
      });

      const created = await forwarderAreaRepository.create(area);

      // Act
      const result = await forwarderAreaRepository.findById(created._id);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.province).toBe(area.province);
      expect(result.city).toBe(area.city);
      expect(result.district).toBe(area.district);
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderAreaRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByForwarder', () => {
    it('should find areas by forwarder ID', async () => {
      // Arrange
      const forwarderId1 = new ObjectId();
      const forwarderId2 = new ObjectId();
      
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId1.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId1.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId2.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'active',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const result = await forwarderAreaRepository.findByForwarder(forwarderId1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].forwarder).toBe(forwarderId1.toString());
      expect(result[1].forwarder).toBe(forwarderId1.toString());
    });
  });

  describe('findByLocation', () => {
    it('should find areas by location criteria', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Palmerah',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const result = await forwarderAreaRepository.findByLocation({
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
      });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].province).toBe('DKI Jakarta');
      expect(result[0].city).toBe('Jakarta Barat');
      expect(result[1].province).toBe('DKI Jakarta');
      expect(result[1].city).toBe('Jakarta Barat');
    });
  });

  describe('update', () => {
    it('should update a forwarder area', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const area = new ForwarderArea({
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
        status: 'active',
      });

      const created = await forwarderAreaRepository.create(area);

      const updatedData = new ForwarderArea({
        ...area,
        _id: created._id,
        district: 'Grogol Petamburan',
        postalCode: '11470',
      });

      // Act
      const result = await forwarderAreaRepository.update(created._id, updatedData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.province).toBe(area.province);
      expect(result.city).toBe(area.city);
      expect(result.district).toBe('Grogol Petamburan');
      expect(result.postalCode).toBe('11470');
    });
  });

  describe('delete', () => {
    it('should delete a forwarder area', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const area = new ForwarderArea({
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
        status: 'active',
      });

      const created = await forwarderAreaRepository.create(area);

      // Act
      const result = await forwarderAreaRepository.delete(created._id);

      // Assert
      expect(result).toBe(true);

      const found = await forwarderAreaRepository.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent area', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderAreaRepository.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deleteByForwarder', () => {
    it('should delete all areas for a forwarder', async () => {
      // Arrange
      const forwarderId1 = new ObjectId();
      const forwarderId2 = new ObjectId();
      
      const areas = [
        new ForwarderArea({
          forwarder: forwarderId1.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
          district: 'Grogol',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId1.toString(),
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
          district: 'Kebayoran Baru',
          status: 'active',
        }),
        new ForwarderArea({
          forwarder: forwarderId2.toString(),
          province: 'Jawa Barat',
          city: 'Bandung',
          district: 'Cicendo',
          status: 'active',
        }),
      ];

      for (const area of areas) {
        await forwarderAreaRepository.create(area);
      }

      // Act
      const deletedCount = await forwarderAreaRepository.deleteByForwarder(forwarderId1);

      // Assert
      expect(deletedCount).toBe(2);
      
      const remaining = await forwarderAreaRepository.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].forwarder).toBe(forwarderId2.toString());
    });
  });

  describe('updateStatus', () => {
    it('should update a forwarder area status', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const area = new ForwarderArea({
        forwarder: forwarderId.toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
        status: 'active',
      });

      const created = await forwarderAreaRepository.create(area);
      const userId = new ObjectId();

      // Act
      const result = await forwarderAreaRepository.updateStatus(created._id, 'inactive', userId);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.status).toBe('inactive');
      expect(result.updatedBy.toString()).toBe(userId.toString());
    });
  });
});
