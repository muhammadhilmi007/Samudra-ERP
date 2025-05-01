/**
 * Samudra Paket ERP - ForwarderArea Model Unit Tests
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const { ObjectId } = require('mongodb');
const ForwarderArea = require('../../../../domain/models/forwarderArea');

describe('ForwarderArea Model', () => {
  it('should create a forwarder area with valid data', () => {
    const areaData = {
      forwarder: new ObjectId().toString(),
      province: 'DKI Jakarta',
      city: 'Jakarta Barat',
      district: 'Grogol',
      postalCode: '11440',
      status: 'active',
      createdBy: new ObjectId().toString(),
      updatedBy: new ObjectId().toString(),
    };

    const area = new ForwarderArea(areaData);

    expect(area.forwarder).toBe(areaData.forwarder);
    expect(area.province).toBe(areaData.province);
    expect(area.city).toBe(areaData.city);
    expect(area.district).toBe(areaData.district);
    expect(area.postalCode).toBe(areaData.postalCode);
    expect(area.status).toBe(areaData.status);
    expect(area.createdBy).toBe(areaData.createdBy);
    expect(area.updatedBy).toBe(areaData.updatedBy);
    expect(area.createdAt).toBeInstanceOf(Date);
    expect(area.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a forwarder area with default values', () => {
    const areaData = {
      forwarder: new ObjectId().toString(),
      province: 'DKI Jakarta',
      city: 'Jakarta Barat',
      district: 'Grogol',
    };

    const area = new ForwarderArea(areaData);

    expect(area.forwarder).toBe(areaData.forwarder);
    expect(area.province).toBe(areaData.province);
    expect(area.city).toBe(areaData.city);
    expect(area.district).toBe(areaData.district);
    expect(area.postalCode).toBe('');
    expect(area.status).toBe('active');
    expect(area.createdAt).toBeInstanceOf(Date);
    expect(area.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid forwarder area with district', () => {
      const areaData = {
        forwarder: new ObjectId().toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it('should validate a valid forwarder area with postal code', () => {
      const areaData = {
        forwarder: new ObjectId().toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        postalCode: '11440',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it('should invalidate a forwarder area without forwarder', () => {
      const areaData = {
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
        district: 'Grogol',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('forwarder');
    });

    it('should invalidate a forwarder area without province', () => {
      const areaData = {
        forwarder: new ObjectId().toString(),
        city: 'Jakarta Barat',
        district: 'Grogol',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('province');
    });

    it('should invalidate a forwarder area without city', () => {
      const areaData = {
        forwarder: new ObjectId().toString(),
        province: 'DKI Jakarta',
        district: 'Grogol',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('city');
    });

    it('should invalidate a forwarder area without district or postal code', () => {
      const areaData = {
        forwarder: new ObjectId().toString(),
        province: 'DKI Jakarta',
        city: 'Jakarta Barat',
      };

      const area = new ForwarderArea(areaData);
      const validation = area.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('district');
    });
  });
});
