/**
 * Samudra Paket ERP - Pricing Rule Model Unit Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { PricingRuleSchema } = require('../../../../domain/models/pricingRule');

// Create a separate in-memory database for testing
let mongoServer;
let PricingRule;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create the model using the schema
  PricingRule = mongoose.model('PricingRule', PricingRuleSchema);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the database before each test
  await PricingRule.deleteMany({});
});

describe('PricingRule Model', () => {
  describe('Schema Validation', () => {
    test('should create a valid pricing rule', async () => {
      const pricingRuleData = {
        code: 'PR-001',
        name: 'Regular Jakarta to Bandung',
        description: 'Standard pricing for Jakarta to Bandung route',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        weightTiers: [
          {
            minWeight: 0,
            maxWeight: 1,
            pricePerKg: 10000,
          },
          {
            minWeight: 1,
            maxWeight: 3,
            pricePerKg: 9000,
          },
        ],
        specialServices: [
          {
            serviceCode: 'INS',
            serviceName: 'Insurance',
            price: 5000,
            isPercentage: false,
          },
        ],
        discounts: [
          {
            name: 'New Customer',
            discountType: 'percentage',
            value: 10,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        ],
        taxPercentage: 10,
        insurancePercentage: 0.5,
        volumetricDivisor: 6000,
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        priority: 1,
        isActive: true,
        applicableCustomerTypes: ['retail', 'corporate'],
        createdBy: new mongoose.Types.ObjectId(),
      };

      const pricingRule = new PricingRule(pricingRuleData);
      const savedPricingRule = await pricingRule.save();

      expect(savedPricingRule._id).toBeDefined();
      expect(savedPricingRule.code).toBe(pricingRuleData.code);
      expect(savedPricingRule.name).toBe(pricingRuleData.name);
      expect(savedPricingRule.serviceType).toBe(pricingRuleData.serviceType);
      expect(savedPricingRule.pricingType).toBe(pricingRuleData.pricingType);
      expect(savedPricingRule.basePrice).toBe(pricingRuleData.basePrice);
      expect(savedPricingRule.weightTiers.length).toBe(2);
      expect(savedPricingRule.specialServices.length).toBe(1);
      expect(savedPricingRule.discounts.length).toBe(1);
    });

    test('should fail when required fields are missing', async () => {
      const invalidPricingRule = new PricingRule({
        // Missing required fields like name, serviceType, etc.
      });

      await expect(invalidPricingRule.save()).rejects.toThrow();
    });

    test('should fail with invalid service type', async () => {
      const invalidPricingRule = new PricingRule({
        code: 'PR-002',
        name: 'Test Rule',
        serviceType: 'invalid_type', // Invalid service type
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
      });

      await expect(invalidPricingRule.save()).rejects.toThrow();
    });
  });

  describe('calculateWeightPrice', () => {
    test('should calculate price based on weight tiers correctly', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-003',
        name: 'Weight Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        weightTiers: [
          {
            minWeight: 0,
            maxWeight: 1,
            pricePerKg: 10000,
          },
          {
            minWeight: 1,
            maxWeight: 3,
            pricePerKg: 9000,
          },
          {
            minWeight: 3,
            maxWeight: null, // No upper limit
            pricePerKg: 8000,
          },
        ],
      });

      await pricingRule.save();

      // Test different weight scenarios
      expect(pricingRule.calculateWeightPrice(0.5)).toBe(10000); // 0.5 kg in first tier
      expect(pricingRule.calculateWeightPrice(1)).toBe(10000); // 1 kg in first tier
      expect(pricingRule.calculateWeightPrice(2)).toBe(18000); // 2 kg in second tier
      expect(pricingRule.calculateWeightPrice(3)).toBe(27000); // 3 kg in second tier
      expect(pricingRule.calculateWeightPrice(4)).toBe(32000); // 4 kg in third tier
      expect(pricingRule.calculateWeightPrice(5)).toBe(40000); // 5 kg in third tier
    });

    test('should apply minimum price when calculated price is lower', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-004',
        name: 'Min Price Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 5000,
        minimumPrice: 20000,
        weightTiers: [
          {
            minWeight: 0,
            maxWeight: 1,
            pricePerKg: 10000,
          },
        ],
      });

      await pricingRule.save();

      // Price would be 10000 but minimum is 20000
      expect(pricingRule.calculateWeightPrice(0.5)).toBe(20000);
    });
  });

  describe('calculateDistancePrice', () => {
    test('should calculate price based on distance tiers correctly', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-005',
        name: 'Distance Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'distance',
        basePrice: 10000,
        minimumPrice: 15000,
        distanceTiers: [
          {
            minDistance: 0,
            maxDistance: 10,
            pricePerKm: 2000,
          },
          {
            minDistance: 10,
            maxDistance: 50,
            pricePerKm: 1500,
          },
          {
            minDistance: 50,
            maxDistance: null, // No upper limit
            pricePerKm: 1000,
          },
        ],
      });

      await pricingRule.save();

      // Test different distance scenarios
      expect(pricingRule.calculateDistancePrice(5)).toBe(20000); // 5 km in first tier (10000 + 5*2000)
      expect(pricingRule.calculateDistancePrice(10)).toBe(30000); // 10 km in first tier
      expect(pricingRule.calculateDistancePrice(30)).toBe(55000); // 30 km in second tier (10000 + 10*2000 + 20*1500)
      expect(pricingRule.calculateDistancePrice(60)).toBe(95000); // 60 km in third tier (10000 + 10*2000 + 40*1500 + 10*1000)
    });
  });

  describe('calculateSpecialServicesPrice', () => {
    test('should calculate special services price correctly', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-006',
        name: 'Special Services Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        specialServices: [
          {
            serviceCode: 'INS',
            serviceName: 'Insurance',
            price: 5000,
            isPercentage: false,
          },
          {
            serviceCode: 'PKG',
            serviceName: 'Packaging',
            price: 10000,
            isPercentage: false,
          },
          {
            serviceCode: 'EXP',
            serviceName: 'Express Handling',
            price: 20,
            isPercentage: true,
          },
        ],
      });

      await pricingRule.save();

      // Test with fixed price services
      expect(pricingRule.calculateSpecialServicesPrice(['INS'], 50000)).toBe(5000);
      expect(pricingRule.calculateSpecialServicesPrice(['PKG'], 50000)).toBe(10000);
      expect(pricingRule.calculateSpecialServicesPrice(['INS', 'PKG'], 50000)).toBe(15000);

      // Test with percentage-based service
      expect(pricingRule.calculateSpecialServicesPrice(['EXP'], 50000)).toBe(10000); // 20% of 50000
      
      // Test with mixed services
      expect(pricingRule.calculateSpecialServicesPrice(['INS', 'EXP'], 50000)).toBe(15000); // 5000 + 10000
    });

    test('should return 0 for non-existent services', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-007',
        name: 'Non-existent Services Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        specialServices: [
          {
            serviceCode: 'INS',
            serviceName: 'Insurance',
            price: 5000,
            isPercentage: false,
          },
        ],
      });

      await pricingRule.save();

      expect(pricingRule.calculateSpecialServicesPrice(['NONEXISTENT'], 50000)).toBe(0);
      expect(pricingRule.calculateSpecialServicesPrice(['INS', 'NONEXISTENT'], 50000)).toBe(5000);
    });
  });

  describe('calculateDiscount', () => {
    test('should calculate discount correctly', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

      const pricingRule = new PricingRule({
        code: 'PR-008',
        name: 'Discount Test',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        discounts: [
          {
            name: 'Percentage Discount',
            discountType: 'percentage',
            value: 10, // 10%
            startDate: now,
            endDate: future,
          },
          {
            name: 'Fixed Discount',
            discountType: 'fixed',
            value: 5000,
            startDate: now,
            endDate: future,
          },
          {
            name: 'Expired Discount',
            discountType: 'percentage',
            value: 20,
            startDate: past,
            endDate: past,
          },
        ],
      });

      await pricingRule.save();

      // Test percentage discount
      expect(pricingRule.calculateDiscount('Percentage Discount', 50000)).toBe(5000); // 10% of 50000

      // Test fixed discount
      expect(pricingRule.calculateDiscount('Fixed Discount', 50000)).toBe(5000);

      // Test expired discount
      expect(pricingRule.calculateDiscount('Expired Discount', 50000)).toBe(0);

      // Test non-existent discount
      expect(pricingRule.calculateDiscount('NONEXISTENT', 50000)).toBe(0);
    });
  });

  describe('calculateTotalPrice', () => {
    test('should calculate total price correctly for weight-based pricing', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-009',
        name: 'Total Price Test - Weight',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'weight',
        basePrice: 10000,
        minimumPrice: 15000,
        weightTiers: [
          {
            minWeight: 0,
            maxWeight: 1,
            pricePerKg: 10000,
          },
          {
            minWeight: 1,
            maxWeight: 3,
            pricePerKg: 9000,
          },
        ],
        specialServices: [
          {
            serviceCode: 'INS',
            serviceName: 'Insurance',
            price: 5000,
            isPercentage: false,
          },
        ],
        discounts: [
          {
            name: 'New Customer',
            discountType: 'percentage',
            value: 10,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        ],
        taxPercentage: 10,
      });

      await pricingRule.save();

      const shipment = {
        weight: 2, // 2 kg
        specialServices: ['INS'], // Insurance
        discountName: 'New Customer',
      };

      // Base price: 10000 + (2 * 9000) = 28000
      // Special services: 5000
      // Subtotal: 33000
      // Discount: 10% of 33000 = 3300
      // After discount: 29700
      // Tax: 10% of 29700 = 2970
      // Total: 32670

      const result = pricingRule.calculateTotalPrice(shipment);
      expect(result.basePrice).toBe(28000);
      expect(result.specialServicesPrice).toBe(5000);
      expect(result.subtotal).toBe(33000);
      expect(result.discountAmount).toBe(3300);
      expect(result.afterDiscount).toBe(29700);
      expect(result.taxAmount).toBe(2970);
      expect(result.totalPrice).toBe(32670);
    });

    test('should calculate total price correctly for distance-based pricing', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-010',
        name: 'Total Price Test - Distance',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'distance',
        basePrice: 10000,
        minimumPrice: 15000,
        distanceTiers: [
          {
            minDistance: 0,
            maxDistance: 10,
            pricePerKm: 2000,
          },
          {
            minDistance: 10,
            maxDistance: 50,
            pricePerKm: 1500,
          },
        ],
        taxPercentage: 10,
      });

      await pricingRule.save();

      const shipment = {
        distance: 20, // 20 km
      };

      // Base price: 10000 + (10 * 2000) + (10 * 1500) = 45000
      // Subtotal: 45000
      // Tax: 10% of 45000 = 4500
      // Total: 49500

      const result = pricingRule.calculateTotalPrice(shipment);
      expect(result.basePrice).toBe(45000);
      expect(result.subtotal).toBe(45000);
      expect(result.taxAmount).toBe(4500);
      expect(result.totalPrice).toBe(49500);
    });

    test('should calculate total price correctly for flat pricing', async () => {
      const pricingRule = new PricingRule({
        code: 'PR-011',
        name: 'Total Price Test - Flat',
        serviceType: 'regular',
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Selatan',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        pricingType: 'flat',
        basePrice: 50000,
        minimumPrice: 50000,
        taxPercentage: 10,
        createdBy: new mongoose.Types.ObjectId(),
      });

      await pricingRule.save();

      const shipment = {};

      // Base price: 50000
      // Subtotal: 50000
      // Tax: 10% of 50000 = 5000
      // Total: 55000

      const result = pricingRule.calculateTotalPrice(shipment);
      expect(result.basePrice).toBe(50000);
      expect(result.subtotal).toBe(50000);
      expect(result.taxAmount).toBe(5000);
      expect(result.totalPrice).toBe(55000);
    });
  });

  describe('generateCode', () => {
    test('should generate a unique code', async () => {
      const code = await PricingRule.generateCode();
      expect(code).toMatch(/^PR-\d{8}-\d{3}$/);
    });

    test('should generate different codes for multiple calls', async () => {
      const code1 = await PricingRule.generateCode();
      const code2 = await PricingRule.generateCode();
      expect(code1).not.toBe(code2);
    });
  });
});
