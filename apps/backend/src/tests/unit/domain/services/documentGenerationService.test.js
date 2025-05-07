/**
 * Samudra Paket ERP - Document Generation Service Unit Tests
 */

const path = require('path');
const fs = require('fs').promises;
const DocumentGenerationService = require('../../../../domain/services/documentGenerationService');
const WaybillDocument = require('../../../../domain/models/waybillDocument'); // Untuk static method jika diperlukan

// Mock dependencies
const mockWaybillDocumentRepository = {
  createDocument: jest.fn(),
  // Tambahkan mock method lain jika diperlukan oleh DocumentGenerationService
};

const mockShipmentOrderRepository = {
  findById: jest.fn(),
  // Tambahkan mock method lain jika diperlukan
};

const mockFileUploadService = {
  uploadFile: jest.fn(),
};

// Mock config (sesuaikan dengan config yang relevan)
const mockConfig = {
  tempDir: path.join(__dirname, 'temp_test_docs'), // Gunakan direktori temp khusus untuk tes
  uploadDir: path.join(__dirname, 'temp_test_uploads'),
  baseUrl: 'http://test.localhost',
  email: {
    // mock email config jika pengiriman email diuji
  },
};

describe('DocumentGenerationService', () => {
  let documentGenerationService;

  beforeAll(async () => {
    // Buat direktori temp jika belum ada
    try {
      await fs.mkdir(mockConfig.tempDir, { recursive: true });
      await fs.mkdir(mockConfig.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directories for test:', error);
    }
  });

  afterAll(async () => {
    // Hapus direktori temp setelah semua tes selesai
    try {
      await fs.rm(mockConfig.tempDir, { recursive: true, force: true });
      await fs.rm(mockConfig.uploadDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error removing temp directories after test:', error);
    }
  });

  beforeEach(() => {
    // Reset semua mock sebelum setiap tes
    jest.clearAllMocks();

    documentGenerationService = new DocumentGenerationService(
      mockWaybillDocumentRepository,
      mockShipmentOrderRepository,
      mockFileUploadService,
      mockConfig
    );

    // Mock implementasi untuk _ensureDirectoryExists agar tidak membuat direktori di sistem asli saat tes
    // Ini penting jika constructor service memanggilnya secara langsung
    // Namun, dalam implementasi DocumentGenerationService yang kita lihat, _ensureDirectoryExists
    // dipanggil di dalam constructor, jadi kita mock setelah instansiasi jika perlu,
    // atau pastikan direktori temp dibuat di beforeAll.
    // Jika ada error terkait pembuatan direktori, kita bisa mock fs.mkdir di sini.
  });

  describe('generateDocument', () => {
    const mockShipmentOrder = {
      _id: 'shipmentOrderId123',
      waybillNumber: 'WBTEST001',
      originBranch: 'branchId123',
      // ... tambahkan properti lain yang dibutuhkan oleh _generatePdf dan _generateBarcodeData
      origin: { name: 'Sender Test', address: '123 Test St', city: 'Testville', phone: '08123456789' },
      destination: { name: 'Receiver Test', address: '456 Test Ave', city: 'Testburg', phone: '08987654321' },
      items: [{ description: 'Test Item', quantity: 1, weight: 1, value: 100000 }],
      totalPrice: 25000,
      paymentType: 'CASH',
      serviceType: 'regular',
      createdAt: new Date(),
    };

    const mockUser = {
      _id: 'userId123',
    };

    const mockBarcodeData = 'WB|WBTEST001|Testville|Testburg|timestamp';
    const mockGeneratedPdfPath = path.join(mockConfig.tempDir, 'test_waybill.pdf');
    const mockGeneratedBarcodePath = path.join(mockConfig.tempDir, 'test_barcode.png');
    const mockUploadedPdfUrl = 'http://test.localhost/uploads/documents/WBTEST001/waybill/test_waybill.pdf';
    const mockUploadedBarcodeUrl = 'http://test.localhost/uploads/barcodes/WBTEST001/waybill/test_barcode.png';

    beforeEach(() => {
      // Mock dependencies yang dipanggil di dalam generateDocument
      mockShipmentOrderRepository.findById.mockResolvedValue(mockShipmentOrder);
      
      // Mock _generateBarcodeData (bisa dari WaybillDocument.schema.statics atau langsung di service)
      // Jika _generateBarcodeData adalah static method di WaybillDocument:
      jest.spyOn(WaybillDocument.schema.statics, 'generateBarcodeData').mockResolvedValue(mockBarcodeData);
      // Jika _generateBarcodeData adalah private method di service yang ingin di-bypass:
      // jest.spyOn(documentGenerationService, '_generateBarcodeData').mockResolvedValue(mockBarcodeData);

      // Mock _generateBarcodeImage
      jest.spyOn(documentGenerationService, '_generateBarcodeImage').mockResolvedValue(mockGeneratedBarcodePath);
      
      // Mock _generatePdf
      jest.spyOn(documentGenerationService, '_generatePdf').mockResolvedValue(mockGeneratedPdfPath);

      // Mock fileUploadService
      mockFileUploadService.uploadFile
        .mockResolvedValueOnce(mockUploadedBarcodeUrl) // Pertama untuk barcode
        .mockResolvedValueOnce(mockUploadedPdfUrl);   // Kedua untuk PDF

      // Mock fs.stat untuk fileSize
      jest.spyOn(fs, 'stat').mockResolvedValue({ size: 12345 }); // Mock file size

      // Mock waybillDocumentRepository.createDocument
      mockWaybillDocumentRepository.createDocument.mockImplementation(data => Promise.resolve({ ...data, _id: 'docId123', documentId: 'DOCGEN001' }));
    
      // Mock _cleanupTempFiles
      jest.spyOn(documentGenerationService, '_cleanupTempFiles').mockResolvedValue(undefined);
    });

    test('should generate document, upload files, create record, and cleanup temp files', async () => {
      const documentType = 'waybill';
      const options = { barcodeType: 'qrcode', distribute: false };

      const result = await documentGenerationService.generateDocument(
        mockShipmentOrder._id,
        documentType,
        options,
        mockUser
      );

      expect(mockShipmentOrderRepository.findById).toHaveBeenCalledWith(mockShipmentOrder._id);
      // Verifikasi pemanggilan _generateBarcodeData atau static method yang relevan
      // expect(WaybillDocument.schema.statics.generateBarcodeData).toHaveBeenCalledWith(mockShipmentOrder, documentType);
      expect(documentGenerationService._generateBarcodeImage).toHaveBeenCalledWith(mockBarcodeData, 'qrcode');
      expect(documentGenerationService._generatePdf).toHaveBeenCalledWith(
        mockShipmentOrder,
        documentType,
        expect.objectContaining({ barcodeImagePath: mockGeneratedBarcodePath, barcodeData: mockBarcodeData })
      );
      expect(mockFileUploadService.uploadFile).toHaveBeenCalledTimes(2);
      expect(mockFileUploadService.uploadFile).toHaveBeenNthCalledWith(
        1,
        mockGeneratedBarcodePath,
        `barcodes/${mockShipmentOrder.waybillNumber}/${documentType}`,
        'image'
      );
      expect(mockFileUploadService.uploadFile).toHaveBeenNthCalledWith(
        2,
        mockGeneratedPdfPath,
        `documents/${mockShipmentOrder.waybillNumber}/${documentType}`,
        'application/pdf'
      );
      expect(mockWaybillDocumentRepository.createDocument).toHaveBeenCalledWith(expect.objectContaining({
        shipmentOrderId: mockShipmentOrder._id,
        waybillNumber: mockShipmentOrder.waybillNumber,
        documentType,
        fileUrl: mockUploadedPdfUrl,
        barcodeImageUrl: mockUploadedBarcodeUrl,
        generatedBy: mockUser._id,
      }));
      expect(documentGenerationService._cleanupTempFiles).toHaveBeenCalledWith([mockGeneratedBarcodePath, mockGeneratedPdfPath]);
      expect(result).toHaveProperty('_id'); // atau documentId tergantung apa yang di-return
      expect(result.fileUrl).toBe(mockUploadedPdfUrl);
    });

    test('should call distributeDocument if options.distribute is true and recipients are provided', async () => {
      const documentType = 'receipt';
      const recipients = ['test@example.com'];
      const options = { barcodeType: 'code128', distribute: true, recipients, distributionMethod: 'email' };
      
      // Mock distributeDocument
      jest.spyOn(documentGenerationService, 'distributeDocument').mockResolvedValue(undefined);

      await documentGenerationService.generateDocument(
        mockShipmentOrder._id,
        documentType,
        options,
        mockUser
      );

      expect(documentGenerationService.distributeDocument).toHaveBeenCalledWith(
        // document.documentId akan dihasilkan oleh createDocument mock
        // jadi kita bisa menggunakan expect.any(String) atau mock return value dari createDocument
        expect.any(String), // atau mock ID spesifik
        recipients
      );
    });

    // Tambahkan tes lain untuk error handling, kasus berbeda, dll.
    test('should throw error if shipmentOrder not found', async () => {
      mockShipmentOrderRepository.findById.mockResolvedValue(null);
      const documentType = 'waybill';
      const options = {};

      await expect(
        documentGenerationService.generateDocument(mockShipmentOrder._id, documentType, options, mockUser)
      ).rejects.toThrow('Shipment order not found'); // Sesuaikan dengan pesan error yang sebenarnya
    });
  });

  describe('_generateBarcodeImage', () => {
    // Hapus file yang mungkin dibuat oleh tes sebelumnya di direktori temp
    const cleanupBarcodeFiles = async () => {
      const files = await fs.readdir(mockConfig.tempDir);
      for (const file of files) {
        if (file.startsWith('barcode_')) {
          await fs.unlink(path.join(mockConfig.tempDir, file));
        }
      }
    };
  
    beforeEach(cleanupBarcodeFiles);
    afterEach(cleanupBarcodeFiles);

    test('should generate a QR code image file', async () => {
      // Unspy/unmock _generateBarcodeImage agar implementasi aslinya yang diuji
      documentGenerationService._generateBarcodeImage.mockRestore(); 

      const data = 'test-qr-code-data';
      const imagePath = await documentGenerationService._generateBarcodeImage(data, 'qrcode');
      
      expect(imagePath).toContain('barcode_');
      expect(imagePath).toContain('.png');
      const fileExists = await fs.access(imagePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
      // Tambahan: bisa juga memverifikasi konten QR code jika ada library untuk membacanya
    });

    test('should generate a Code128 image file', async () => {
      documentGenerationService._generateBarcodeImage.mockRestore();
      const data = 'TEST12345'; // Data untuk Code128
      const imagePath = await documentGenerationService._generateBarcodeImage(data, 'code128');
      
      expect(imagePath).toContain('barcode_');
      expect(imagePath).toContain('.png');
      const fileExists = await fs.access(imagePath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
    });

    test('should throw ValidationError for unsupported barcode type', async () => {
      documentGenerationService._generateBarcodeImage.mockRestore();
      const data = 'test-data';
      await expect(documentGenerationService._generateBarcodeImage(data, 'unsupportedtype')).rejects.toThrow('Unsupported barcode type: unsupportedtype');
    });
  });

  describe('_generatePdf', () => {
    // Mock _generateWaybillPdf, _generateReceiptPdf, dll.
    // Ini adalah unit test untuk _generatePdf, jadi kita mock method yang dipanggil di dalamnya
    // untuk fokus pada logika _generatePdf itu sendiri (piping, stream, dll.)
    
    // Hapus file yang mungkin dibuat oleh tes sebelumnya di direktori temp
    const cleanupPdfFiles = async () => {
      const files = await fs.readdir(mockConfig.tempDir);
      for (const file of files) {
        if (file.endsWith('.pdf') && (file.startsWith('waybill_') || file.startsWith('receipt_'))) {
          await fs.unlink(path.join(mockConfig.tempDir, file));
        }
      }
    };

    beforeEach(() => {
      cleanupPdfFiles();
      jest.spyOn(documentGenerationService, '_generateWaybillPdf').mockImplementation((doc, shipment, options) => {
        doc.text(`Mock Waybill PDF for ${shipment.waybillNumber}`);
      });
      jest.spyOn(documentGenerationService, '_generateReceiptPdf').mockImplementation((doc, shipment, options) => {
        doc.text(`Mock Receipt PDF for ${shipment.waybillNumber}`);
      });
      // Mock generator PDF lainnya jika ada
    });
    afterEach(cleanupPdfFiles);


    test('should generate a PDF file and call the correct PDF generator method', async () => {
      documentGenerationService._generatePdf.mockRestore(); // Uji implementasi asli
      const mockShipment = { waybillNumber: 'PDFTEST001' };
      const documentType = 'waybill';
      const options = { barcodeImagePath: 'dummyPath' }; // Diperlukan oleh _generateWaybillPdf (contoh)

      const pdfPath = await documentGenerationService._generatePdf(mockShipment, documentType, options);

      expect(pdfPath).toContain(`${documentType}_${mockShipment.waybillNumber}`);
      expect(pdfPath).toContain('.pdf');
      const fileExists = await fs.access(pdfPath).then(() => true).catch(() => false);
      expect(fileExists).toBe(true);
      expect(documentGenerationService._generateWaybillPdf).toHaveBeenCalled();
    });
    
    test('should throw ValidationError for unsupported document type', async () => {
      documentGenerationService._generatePdf.mockRestore();
      const mockShipment = { waybillNumber: 'PDFTEST002' };
      const documentType = 'unsupported_doc';
      const options = {};

      await expect(documentGenerationService._generatePdf(mockShipment, documentType, options))
        .rejects.toThrow('Unsupported document type: unsupported_doc');
    });
  });

  describe('distributeDocument', () => {
    const mockDocument = {
      _id: 'docId123',
      documentId: 'DOCDIST001',
      fileUrl: 'http://test.localhost/path/to/document.pdf',
      filePath: path.join(mockConfig.tempDir, 'test_document_for_distribution.pdf'), // Path lokal diperlukan
      documentType: 'waybill',
      waybillNumber: 'WBDIST001',
      distributionMethod: 'email', // default jika tidak di-override
      // ... properti lain yang mungkin dibutuhkan
    };
    
    beforeEach(async () => {
      // Buat file dummy untuk di-distribute agar _sendDocumentByEmail tidak error karena file tidak ada
      await fs.writeFile(mockDocument.filePath, 'dummy pdf content for distribution test');

      // Mock method pengiriman
      jest.spyOn(documentGenerationService, '_sendDocumentByEmail').mockResolvedValue({ success: true, messageId: 'emailMsgId' });
      jest.spyOn(documentGenerationService, '_sendDocumentBySms').mockResolvedValue({ success: true, messageSid: 'smsMsgSid' });
      jest.spyOn(documentGenerationService, '_sendDocumentByWhatsapp').mockResolvedValue({ success: true, messageId: 'waMsgId' });
      
      // Mock waybillDocumentRepository.updateDocument untuk status distribusi
      mockWaybillDocumentRepository.updateDocument = jest.fn().mockImplementation((id, data) => {
        // Cari dokumen yang di-mock dan update statusnya jika perlu untuk verifikasi
        return Promise.resolve({ ...mockDocument, ...data });
      });
      mockWaybillDocumentRepository.findById = jest.fn().mockResolvedValue(mockDocument);
    });

    afterEach(async () => {
      // Hapus file dummy
      try {
        await fs.unlink(mockDocument.filePath);
      } catch(e) { /* abaikan jika sudah dihapus */ }
    });

    test('should call _sendDocumentByEmail if distributionMethod is email', async () => {
      const recipients = ['test1@example.com', 'test2@example.com'];
      // Pastikan mockDocumentRepository.findById mengembalikan dokumen dengan distributionMethod email
      mockWaybillDocumentRepository.findById.mockResolvedValueOnce({...mockDocument, distributionMethod: 'email'});


      await documentGenerationService.distributeDocument(mockDocument.documentId, recipients);

      expect(documentGenerationService._sendDocumentByEmail).toHaveBeenCalledTimes(recipients.length);
      expect(documentGenerationService._sendDocumentByEmail).toHaveBeenCalledWith(expect.objectContaining({ documentId: mockDocument.documentId }), recipients[0]);
      expect(documentGenerationService._sendDocumentByEmail).toHaveBeenCalledWith(expect.objectContaining({ documentId: mockDocument.documentId }), recipients[1]);
      expect(mockWaybillDocumentRepository.updateDocument).toHaveBeenCalledWith(
        mockDocument.documentId,
        expect.objectContaining({ distributionStatus: 'sent' })
      );
    });

    test('should call _sendDocumentBySms if distributionMethod is sms', async () => {
      const recipients = ['+628123', '+628456'];
      mockWaybillDocumentRepository.findById.mockResolvedValueOnce({...mockDocument, distributionMethod: 'sms'});

      await documentGenerationService.distributeDocument(mockDocument.documentId, recipients);

      expect(documentGenerationService._sendDocumentBySms).toHaveBeenCalledTimes(recipients.length);
      // ... verifikasi panggilan lebih detail
    });
    
    test('should update distributionStatus to failed if any send method fails', async () => {
      const recipients = ['fail@example.com'];
      mockWaybillDocumentRepository.findById.mockResolvedValueOnce({...mockDocument, distributionMethod: 'email'});
      documentGenerationService._sendDocumentByEmail.mockRejectedValueOnce(new Error('Email send failed'));

      await documentGenerationService.distributeDocument(mockDocument.documentId, recipients);

      expect(mockWaybillDocumentRepository.updateDocument).toHaveBeenCalledWith(
        mockDocument.documentId,
        expect.objectContaining({ distributionStatus: 'failed' })
      );
    });
    
    // Tambahkan tes untuk kasus 'whatsapp' dan jika tidak ada recipients atau document tidak ditemukan.
  });

  // Tes untuk method private lainnya (_sendDocumentByEmail, dll.) jika logikanya kompleks
  // dan tidak cukup tercover oleh tes distributeDocument.
  // Biasanya method private diuji melalui method public yang memanggilnya.
}); 