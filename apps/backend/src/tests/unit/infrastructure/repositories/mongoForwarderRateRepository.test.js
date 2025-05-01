/**
 * Samudra Paket ERP - MongoDB Forwarder Rate Repository Unit Tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const MongoForwarderRateRepository = require('../../../../infrastructure/repositories/mongoForwarderRateRepository');
const ForwarderRate = require('../../../../domain/models/forwarderRate');

let mongoServer;
let connection;
let db;
let forwarderRateRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  db = connection.db();
  forwarderRateRepository = new MongoForwarderRateRepository(db);
});

afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('forwarderRates').deleteMany({});
});

describe('MongoForwarderRateRepository', () => {
  describe('create', () => {
    it('should create a forwarder rate successfully', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rateData = new ForwarderRate({
        forwarder: forwarderId.toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        minWeight: 1,
        maxWeight: 50,
        dimensionFactor: 6000,
        effectiveDate: now,
        status: 'active',
      });

      // Act
      const result = await forwarderRateRepository.create(rateData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.forwarder).toBe(forwarderId.toString());
      expect(result.originArea).toEqual(rateData.originArea);
      expect(result.destinationArea).toEqual(rateData.destinationArea);
      expect(result.rate).toBe(rateData.rate);
      expect(result.minWeight).toBe(rateData.minWeight);
      expect(result.maxWeight).toBe(rateData.maxWeight);
      expect(result.dimensionFactor).toBe(rateData.dimensionFactor);
      expect(result.effectiveDate).toEqual(rateData.effectiveDate);
      expect(result.status).toBe(rateData.status);
    });
  });

  describe('findAll', () => {
    it('should find all forwarder rates', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'inactive',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const result = await forwarderRateRepository.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].originArea.city).toBe('Jakarta Barat');
      expect(result[1].originArea.city).toBe('Jakarta Selatan');
      expect(result[2].destinationArea.city).toBe('Semarang');
    });

    it('should find forwarder rates with filter', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'inactive',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const result = await forwarderRateRepository.findAll({ status: 'active' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should find forwarder rates with pagination', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'inactive',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Timur',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bogor',
          },
          rate: 18000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Utara',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Depok',
          },
          rate: 17000,
          effectiveDate: now,
          status: 'active',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const result = await forwarderRateRepository.findAll({}, { skip: 2, limit: 2 });

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('count', () => {
    it('should count all forwarder rates', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'inactive',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const count = await forwarderRateRepository.count();

      // Assert
      expect(count).toBe(3);
    });

    it('should count forwarder rates with filter', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'inactive',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const count = await forwarderRateRepository.count({ status: 'active' });

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a forwarder rate by ID', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rate = new ForwarderRate({
        forwarder: forwarderId.toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        effectiveDate: now,
        status: 'active',
      });

      const created = await forwarderRateRepository.create(rate);

      // Act
      const result = await forwarderRateRepository.findById(created._id);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.originArea).toEqual(rate.originArea);
      expect(result.destinationArea).toEqual(rate.destinationArea);
      expect(result.rate).toBe(rate.rate);
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderRateRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByForwarder', () => {
    it('should find rates by forwarder ID', async () => {
      // Arrange
      const forwarderId1 = new ObjectId();
      const forwarderId2 = new ObjectId();
      const now = new Date();
      
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId1.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId1.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId2.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'active',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const result = await forwarderRateRepository.findByForwarder(forwarderId1);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].forwarder).toBe(forwarderId1.toString());
      expect(result[1].forwarder).toBe(forwarderId1.toString());
    });
  });

  describe('findRatesForRoute', () => {
    it('should find rates for a specific route', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: tomorrow, // Future date, should not be included
          status: 'active',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const result = await forwarderRateRepository.findRatesForRoute(
        forwarderId,
        { province: 'DKI Jakarta', city: 'Jakarta Barat' },
        { province: 'Jawa Barat', city: 'Bandung' }
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].originArea.city).toBe('Jakarta Barat');
      expect(result[0].destinationArea.city).toBe('Bandung');
      expect(result[0].rate).toBe(15000);
    });
  });

  describe('update', () => {
    it('should update a forwarder rate', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rate = new ForwarderRate({
        forwarder: forwarderId.toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        effectiveDate: now,
        status: 'active',
      });

      const created = await forwarderRateRepository.create(rate);

      const updatedData = new ForwarderRate({
        ...rate,
        _id: created._id,
        rate: 18000,
        minWeight: 2,
      });

      // Act
      const result = await forwarderRateRepository.update(created._id, updatedData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.originArea).toEqual(rate.originArea);
      expect(result.destinationArea).toEqual(rate.destinationArea);
      expect(result.rate).toBe(18000);
      expect(result.minWeight).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a forwarder rate', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rate = new ForwarderRate({
        forwarder: forwarderId.toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        effectiveDate: now,
        status: 'active',
      });

      const created = await forwarderRateRepository.create(rate);

      // Act
      const result = await forwarderRateRepository.delete(created._id);

      // Assert
      expect(result).toBe(true);

      const found = await forwarderRateRepository.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent rate', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderRateRepository.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('deleteByForwarder', () => {
    it('should delete all rates for a forwarder', async () => {
      // Arrange
      const forwarderId1 = new ObjectId();
      const forwarderId2 = new ObjectId();
      const now = new Date();
      
      const rates = [
        new ForwarderRate({
          forwarder: forwarderId1.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 15000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId1.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
          },
          destinationArea: {
            province: 'Jawa Barat',
            city: 'Bandung',
          },
          rate: 16000,
          effectiveDate: now,
          status: 'active',
        }),
        new ForwarderRate({
          forwarder: forwarderId2.toString(),
          originArea: {
            province: 'DKI Jakarta',
            city: 'Jakarta Barat',
          },
          destinationArea: {
            province: 'Jawa Tengah',
            city: 'Semarang',
          },
          rate: 25000,
          effectiveDate: now,
          status: 'active',
        }),
      ];

      for (const rate of rates) {
        await forwarderRateRepository.create(rate);
      }

      // Act
      const deletedCount = await forwarderRateRepository.deleteByForwarder(forwarderId1);

      // Assert
      expect(deletedCount).toBe(2);
      
      const remaining = await forwarderRateRepository.findAll();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].forwarder).toBe(forwarderId2.toString());
    });
  });

  describe('updateStatus', () => {
    it('should update a forwarder rate status', async () => {
      // Arrange
      const forwarderId = new ObjectId();
      const now = new Date();
      const rate = new ForwarderRate({
        forwarder: forwarderId.toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        effectiveDate: now,
        status: 'active',
      });

      const created = await forwarderRateRepository.create(rate);
      const userId = new ObjectId();

      // Act
      const result = await forwarderRateRepository.updateStatus(created._id, 'inactive', userId);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.status).toBe('inactive');
      expect(result.updatedBy.toString()).toBe(userId.toString());
    });
  });
});
