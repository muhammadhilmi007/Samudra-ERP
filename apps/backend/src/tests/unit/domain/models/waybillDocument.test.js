/**
 * Samudra Paket ERP - Waybill Document Model Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { WaybillDocument, WaybillDocumentSchema } = require('../../../../domain/models/waybillDocument');

// Create a separate in-memory database for testing
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
  // Clear the database before each test
  await WaybillDocument.deleteMany({});
});

describe('WaybillDocument Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid waybill document', async () => {
      // Create a mock shipment order ID
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      
      const waybillDocumentData = {
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        barcodeImageUrl: 'https://example.com/barcodes/qrcode.png',
        distributionStatus: 'pending',
        distributionMethod: 'print',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
      };

      const waybillDocument = new WaybillDocument(waybillDocumentData);
      const savedWaybillDocument = await waybillDocument.save();

      expect(savedWaybillDocument._id).toBeDefined();
      expect(savedWaybillDocument.documentId).toBe(waybillDocumentData.documentId);
      expect(savedWaybillDocument.waybillNumber).toBe(waybillDocumentData.waybillNumber);
      expect(savedWaybillDocument.documentType).toBe(waybillDocumentData.documentType);
      expect(savedWaybillDocument.fileUrl).toBe(waybillDocumentData.fileUrl);
      expect(savedWaybillDocument.barcodeType).toBe(waybillDocumentData.barcodeType);
      expect(savedWaybillDocument.barcodeData).toBe(waybillDocumentData.barcodeData);
      expect(savedWaybillDocument.version).toBe(1);
    });

    test('should fail when required fields are missing', async () => {
      const invalidWaybillDocument = new WaybillDocument({
        // Missing required fields
      });

      await expect(invalidWaybillDocument.save()).rejects.toThrow();
    });

    test('should fail with invalid document type', async () => {
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      
      const invalidWaybillDocument = new WaybillDocument({
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'invalid_type', // Invalid document type
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
      });

      await expect(invalidWaybillDocument.save()).rejects.toThrow();
    });
  });

  describe('Static Methods', () => {
    test('generateDocumentId should create a unique document ID', async () => {
      const documentId = await WaybillDocumentSchema.generateDocumentId();
      
      expect(documentId).toBeDefined();
      expect(documentId).toMatch(/^DOC\d{8}\d{4}$/);
    });

    test('generateAccessToken should create a secure access token', () => {
      const accessToken = WaybillDocumentSchema.generateAccessToken();
      
      expect(accessToken).toBeDefined();
      expect(accessToken.length).toBe(64); // 32 bytes = 64 hex characters
    });

    test('generateBarcodeData should create proper barcode data based on document type', () => {
      const shipment = {
        waybillNumber: 'WB12345678',
        origin: {
          city: 'Jakarta',
        },
        destination: {
          city: 'Bandung',
        },
      };
      
      // Test waybill barcode data
      const waybillBarcodeData = WaybillDocumentSchema.generateBarcodeData(shipment, 'waybill');
      expect(waybillBarcodeData).toMatch(/^WB\|WB12345678\|Jakarta\|Bandung\|\d+$/);
      
      // Test receipt barcode data
      const receiptBarcodeData = WaybillDocumentSchema.generateBarcodeData(shipment, 'receipt');
      expect(receiptBarcodeData).toMatch(/^RC\|WB12345678\|\d+$/);
      
      // Test default barcode data
      const defaultBarcodeData = WaybillDocumentSchema.generateBarcodeData(shipment, 'unknown');
      expect(defaultBarcodeData).toMatch(/^DOC\|WB12345678\|\d+$/);
    });
  });

  describe('Instance Methods', () => {
    test('recordAccess should increment access count and update last accessed time', async () => {
      // Create a mock shipment order ID
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      
      const waybillDocument = new WaybillDocument({
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
      });
      
      await waybillDocument.save();
      
      expect(waybillDocument.accessCount).toBe(0);
      expect(waybillDocument.lastAccessedAt).toBeUndefined();
      
      // Record access
      await waybillDocument.recordAccess();
      
      expect(waybillDocument.accessCount).toBe(1);
      expect(waybillDocument.lastAccessedAt).toBeDefined();
      
      // Record another access
      await waybillDocument.recordAccess();
      
      expect(waybillDocument.accessCount).toBe(2);
    });

    test('isExpired should check if the document has expired', async () => {
      // Create a mock shipment order ID
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      
      // Document with no expiry date
      const noExpiryDocument = new WaybillDocument({
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
      });
      
      await noExpiryDocument.save();
      
      expect(noExpiryDocument.isExpired()).toBe(false);
      
      // Document with future expiry date
      const futureExpiryDocument = new WaybillDocument({
        documentId: 'DOC87654321',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day in the future
        generatedBy: userId,
        branch: branchId,
      });
      
      await futureExpiryDocument.save();
      
      expect(futureExpiryDocument.isExpired()).toBe(false);
      
      // Document with past expiry date
      const pastExpiryDocument = new WaybillDocument({
        documentId: 'DOC11223344',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day in the past
        generatedBy: userId,
        branch: branchId,
      });
      
      await pastExpiryDocument.save();
      
      expect(pastExpiryDocument.isExpired()).toBe(true);
    });

    test('createNewVersion should create a new version of the document', async () => {
      // Create a mock shipment order ID
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      const newUserId = new mongoose.Types.ObjectId();
      
      const waybillDocument = new WaybillDocument({
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
      });
      
      await waybillDocument.save();
      
      expect(waybillDocument.version).toBe(1);
      expect(waybillDocument.previousVersions.length).toBe(0);
      
      // Create new version
      const newFileUrl = 'https://example.com/documents/waybill_v2.pdf';
      const newUser = { _id: newUserId };
      const reason = 'Updated recipient information';
      
      await waybillDocument.createNewVersion(newFileUrl, newUser, reason);
      
      expect(waybillDocument.version).toBe(2);
      expect(waybillDocument.fileUrl).toBe(newFileUrl);
      expect(waybillDocument.generatedBy.toString()).toBe(newUserId.toString());
      expect(waybillDocument.previousVersions.length).toBe(1);
      expect(waybillDocument.previousVersions[0].version).toBe(1);
      expect(waybillDocument.previousVersions[0].fileUrl).toBe('https://example.com/documents/waybill.pdf');
      expect(waybillDocument.previousVersions[0].reason).toBe(reason);
    });

    test('updateDistributionStatus should update status for a recipient', async () => {
      // Create a mock shipment order ID
      const shipmentOrderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const branchId = new mongoose.Types.ObjectId();
      
      const waybillDocument = new WaybillDocument({
        documentId: 'DOC12345678',
        shipmentOrderId,
        waybillNumber: 'WB12345678',
        documentType: 'waybill',
        documentFormat: 'pdf',
        fileUrl: 'https://example.com/documents/waybill.pdf',
        fileSize: 1024,
        filePath: '/path/to/waybill.pdf',
        barcodeType: 'qrcode',
        barcodeData: 'WB|WB12345678|Jakarta|Bandung|1620000000000',
        accessToken: '1234567890abcdef1234567890abcdef',
        generatedBy: userId,
        branch: branchId,
        distributionRecipients: [
          {
            type: 'email',
            value: 'recipient@example.com',
            status: 'pending',
          },
          {
            type: 'sms',
            value: '+6281234567890',
            status: 'pending',
          },
        ],
      });
      
      await waybillDocument.save();
      
      // Update status for email recipient
      await waybillDocument.updateDistributionStatus('recipient@example.com', 'sent');
      
      expect(waybillDocument.distributionRecipients[0].status).toBe('sent');
      expect(waybillDocument.distributionRecipients[0].sentAt).toBeDefined();
      expect(waybillDocument.distributionRecipients[1].status).toBe('pending');
      
      // Update status for SMS recipient with error
      await waybillDocument.updateDistributionStatus('+6281234567890', 'failed', 'Invalid phone number');
      
      expect(waybillDocument.distributionRecipients[1].status).toBe('failed');
      expect(waybillDocument.distributionRecipients[1].errorMessage).toBe('Invalid phone number');
      
      // Update status for non-existent recipient
      const result = await waybillDocument.updateDistributionStatus('nonexistent@example.com', 'sent');
      
      expect(result).toBeNull();
    });
  });
});
