/**
 * Samudra Paket ERP - ForwarderRate Model Unit Tests
 */

const ForwarderRate = require('../../../../domain/models/forwarderRate');
const { ObjectId } = require('mongodb');

describe('ForwarderRate Model', () => {
  it('should create a forwarder rate with valid data', () => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    
    const rateData = {
      forwarder: new ObjectId().toString(),
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
      expiryDate: expiry,
      status: 'active',
      createdBy: new ObjectId().toString(),
      updatedBy: new ObjectId().toString(),
    };

    const rate = new ForwarderRate(rateData);

    expect(rate.forwarder).toBe(rateData.forwarder);
    expect(rate.originArea).toEqual(rateData.originArea);
    expect(rate.destinationArea).toEqual(rateData.destinationArea);
    expect(rate.rate).toBe(rateData.rate);
    expect(rate.minWeight).toBe(rateData.minWeight);
    expect(rate.maxWeight).toBe(rateData.maxWeight);
    expect(rate.dimensionFactor).toBe(rateData.dimensionFactor);
    expect(rate.effectiveDate).toEqual(rateData.effectiveDate);
    expect(rate.expiryDate).toEqual(rateData.expiryDate);
    expect(rate.status).toBe(rateData.status);
    expect(rate.createdBy).toBe(rateData.createdBy);
    expect(rate.updatedBy).toBe(rateData.updatedBy);
    expect(rate.createdAt).toBeInstanceOf(Date);
    expect(rate.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a forwarder rate with default values', () => {
    const rateData = {
      forwarder: new ObjectId().toString(),
      originArea: {
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
      },
      destinationArea: {
        province: 'Jawa Barat',
        city: 'Bandung',
      },
      rate: 15000,
      effectiveDate: new Date(),
    };

    const rate = new ForwarderRate(rateData);

    expect(rate.forwarder).toBe(rateData.forwarder);
    expect(rate.originArea).toEqual(rateData.originArea);
    expect(rate.destinationArea).toEqual(rateData.destinationArea);
    expect(rate.rate).toBe(rateData.rate);
    expect(rate.minWeight).toBe(1);
    expect(rate.maxWeight).toBe(null);
    expect(rate.dimensionFactor).toBe(6000);
    expect(rate.effectiveDate).toEqual(rateData.effectiveDate);
    expect(rate.expiryDate).toBe(null);
    expect(rate.status).toBe('active');
    expect(rate.createdAt).toBeInstanceOf(Date);
    expect(rate.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid forwarder rate', () => {
      const rateData = {
        forwarder: new ObjectId().toString(),
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
        effectiveDate: new Date(),
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it('should invalidate a forwarder rate without forwarder', () => {
      const rateData = {
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
        effectiveDate: new Date(),
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('forwarder');
    });

    it('should invalidate a forwarder rate without origin province', () => {
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        minWeight: 1,
        effectiveDate: new Date(),
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('originArea.province');
    });

    it('should invalidate a forwarder rate without destination city', () => {
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
        },
        rate: 15000,
        minWeight: 1,
        effectiveDate: new Date(),
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('destinationArea.city');
    });

    it('should invalidate a forwarder rate with negative rate', () => {
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: -100,
        minWeight: 1,
        effectiveDate: new Date(),
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('rate');
    });

    it('should invalidate a forwarder rate with expiry date before effective date', () => {
      const effectiveDate = new Date();
      const expiryDate = new Date(effectiveDate);
      expiryDate.setDate(expiryDate.getDate() - 1); // One day before effective date
      
      const rateData = {
        forwarder: new ObjectId().toString(),
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
        effectiveDate: effectiveDate,
        expiryDate: expiryDate,
      };

      const rate = new ForwarderRate(rateData);
      const validation = rate.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('expiryDate');
    });
  });

  describe('isActive', () => {
    it('should return true for an active rate within effective period', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        status: 'active',
        effectiveDate: yesterday,
        expiryDate: tomorrow,
      };

      const rate = new ForwarderRate(rateData);
      expect(rate.isActive()).toBe(true);
    });

    it('should return false for an inactive rate', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        status: 'inactive',
        effectiveDate: yesterday,
        expiryDate: tomorrow,
      };

      const rate = new ForwarderRate(rateData);
      expect(rate.isActive()).toBe(false);
    });

    it('should return false for a rate before effective date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        status: 'active',
        effectiveDate: tomorrow,
        expiryDate: nextWeek,
      };

      const rate = new ForwarderRate(rateData);
      expect(rate.isActive()).toBe(false);
    });

    it('should return false for a rate after expiry date', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const rateData = {
        forwarder: new ObjectId().toString(),
        originArea: {
          province: 'DKI Jakarta',
          city: 'Jakarta Barat',
        },
        destinationArea: {
          province: 'Jawa Barat',
          city: 'Bandung',
        },
        rate: 15000,
        status: 'active',
        effectiveDate: lastWeek,
        expiryDate: yesterday,
      };

      const rate = new ForwarderRate(rateData);
      expect(rate.isActive()).toBe(false);
    });
  });
});
