/**
 * Samudra Paket ERP - MongoDB Forwarder Partner Repository Unit Tests
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient, ObjectId } = require('mongodb');
const MongoForwarderPartnerRepository = require('../../../../infrastructure/repositories/mongoForwarderPartnerRepository');
const ForwarderPartner = require('../../../../domain/models/forwarderPartner');

let mongoServer;
let connection;
let db;
let forwarderPartnerRepository;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  connection = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  db = connection.db();
  forwarderPartnerRepository = new MongoForwarderPartnerRepository(db);
});

afterAll(async () => {
  await connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await db.collection('forwarderPartners').deleteMany({});
});

describe('MongoForwarderPartnerRepository', () => {
  describe('create', () => {
    it('should create a forwarder partner successfully', async () => {
      // Arrange
      const partnerData = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        contactPerson: 'John Doe',
        phone: '08123456789',
        email: 'contact@jne.co.id',
        status: 'active',
      });

      // Act
      const result = await forwarderPartnerRepository.create(partnerData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.code).toBe(partnerData.code);
      expect(result.name).toBe(partnerData.name);
      expect(result.contactPerson).toBe(partnerData.contactPerson);
      expect(result.status).toBe(partnerData.status);
    });
  });

  describe('findAll', () => {
    it('should find all forwarder partners', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI', status: 'active' }),
        new ForwarderPartner({ code: 'POS', name: 'POS Indonesia', status: 'inactive' }),
      ];

      for (const partner of partners) {
        await forwarderPartnerRepository.create(partner);
      }

      // Act
      const result = await forwarderPartnerRepository.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].code).toBe('JNE');
      expect(result[1].code).toBe('POS');
      expect(result[2].code).toBe('TIKI');
    });

    it('should find forwarder partners with filter', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI', status: 'active' }),
        new ForwarderPartner({ code: 'POS', name: 'POS Indonesia', status: 'inactive' }),
      ];

      for (const partner of partners) {
        await forwarderPartnerRepository.create(partner);
      }

      // Act
      const result = await forwarderPartnerRepository.findAll({ status: 'active' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('active');
    });

    it('should find forwarder partners with pagination', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI', status: 'active' }),
        new ForwarderPartner({ code: 'POS', name: 'POS Indonesia', status: 'inactive' }),
        new ForwarderPartner({ code: 'SiCepat', name: 'SiCepat Express', status: 'active' }),
        new ForwarderPartner({ code: 'J&T', name: 'J&T Express', status: 'active' }),
      ];

      for (const partner of partners) {
        await forwarderPartnerRepository.create(partner);
      }

      // Act
      const result = await forwarderPartnerRepository.findAll({}, { skip: 2, limit: 2 });

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('count', () => {
    it('should count all forwarder partners', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI', status: 'active' }),
        new ForwarderPartner({ code: 'POS', name: 'POS Indonesia', status: 'inactive' }),
      ];

      for (const partner of partners) {
        await forwarderPartnerRepository.create(partner);
      }

      // Act
      const count = await forwarderPartnerRepository.count();

      // Assert
      expect(count).toBe(3);
    });

    it('should count forwarder partners with filter', async () => {
      // Arrange
      const partners = [
        new ForwarderPartner({ code: 'JNE', name: 'JNE Express', status: 'active' }),
        new ForwarderPartner({ code: 'TIKI', name: 'TIKI', status: 'active' }),
        new ForwarderPartner({ code: 'POS', name: 'POS Indonesia', status: 'inactive' }),
      ];

      for (const partner of partners) {
        await forwarderPartnerRepository.create(partner);
      }

      // Act
      const count = await forwarderPartnerRepository.count({ status: 'active' });

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a forwarder partner by ID', async () => {
      // Arrange
      const partner = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      const created = await forwarderPartnerRepository.create(partner);

      // Act
      const result = await forwarderPartnerRepository.findById(created._id);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.code).toBe(partner.code);
      expect(result.name).toBe(partner.name);
    });

    it('should return null for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderPartnerRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find a forwarder partner by code', async () => {
      // Arrange
      const partner = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      await forwarderPartnerRepository.create(partner);

      // Act
      const result = await forwarderPartnerRepository.findByCode('JNE');

      // Assert
      expect(result).toBeDefined();
      expect(result.code).toBe('JNE');
      expect(result.name).toBe('JNE Express');
    });

    it('should return null for non-existent code', async () => {
      // Act
      const result = await forwarderPartnerRepository.findByCode('NONEXISTENT');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a forwarder partner', async () => {
      // Arrange
      const partner = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      const created = await forwarderPartnerRepository.create(partner);

      const updatedData = new ForwarderPartner({
        ...partner,
        _id: created._id,
        name: 'JNE Express (Updated)',
        contactPerson: 'Jane Doe',
      });

      // Act
      const result = await forwarderPartnerRepository.update(created._id, updatedData);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.code).toBe(partner.code);
      expect(result.name).toBe('JNE Express (Updated)');
      expect(result.contactPerson).toBe('Jane Doe');
    });
  });

  describe('delete', () => {
    it('should delete a forwarder partner', async () => {
      // Arrange
      const partner = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      const created = await forwarderPartnerRepository.create(partner);

      // Act
      const result = await forwarderPartnerRepository.delete(created._id);

      // Assert
      expect(result).toBe(true);

      const found = await forwarderPartnerRepository.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return false when deleting non-existent partner', async () => {
      // Arrange
      const nonExistentId = new ObjectId();

      // Act
      const result = await forwarderPartnerRepository.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update a forwarder partner status', async () => {
      // Arrange
      const partner = new ForwarderPartner({
        code: 'JNE',
        name: 'JNE Express',
        status: 'active',
      });

      const created = await forwarderPartnerRepository.create(partner);
      const userId = new ObjectId();

      // Act
      const result = await forwarderPartnerRepository.updateStatus(created._id, 'inactive', userId);

      // Assert
      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(created._id.toString());
      expect(result.status).toBe('inactive');
      expect(result.updatedBy.toString()).toBe(userId.toString());
    });
  });
});
