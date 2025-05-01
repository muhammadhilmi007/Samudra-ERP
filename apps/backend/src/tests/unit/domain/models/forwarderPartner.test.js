/**
 * Samudra Paket ERP - ForwarderPartner Model Unit Tests
 */

const ForwarderPartner = require('../../../../domain/models/forwarderPartner');

describe('ForwarderPartner Model', () => {
  it('should create a forwarder partner with valid data', () => {
    const partnerData = {
      code: 'JNE',
      name: 'JNE Express',
      contactPerson: 'John Doe',
      phone: '08123456789',
      email: 'contact@jne.co.id',
      address: {
        street: 'Jl. Tomang Raya No. 11',
        city: 'Jakarta Barat',
        district: 'Grogol',
        province: 'DKI Jakarta',
        postalCode: '11440',
        country: 'Indonesia',
      },
      apiConfig: {
        baseUrl: 'https://api.jne.co.id/v1',
        apiKey: 'test-api-key',
        username: 'testuser',
        passwordHash: 'hashedpassword',
        timeout: 30000,
      },
      status: 'active',
    };

    const partner = new ForwarderPartner(partnerData);

    expect(partner.code).toBe(partnerData.code);
    expect(partner.name).toBe(partnerData.name);
    expect(partner.contactPerson).toBe(partnerData.contactPerson);
    expect(partner.phone).toBe(partnerData.phone);
    expect(partner.email).toBe(partnerData.email);
    expect(partner.address).toEqual(partnerData.address);
    expect(partner.apiConfig).toEqual(partnerData.apiConfig);
    expect(partner.status).toBe(partnerData.status);
    expect(partner.createdAt).toBeInstanceOf(Date);
    expect(partner.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a forwarder partner with default values', () => {
    const partnerData = {
      code: 'JNE',
      name: 'JNE Express',
    };

    const partner = new ForwarderPartner(partnerData);

    expect(partner.code).toBe(partnerData.code);
    expect(partner.name).toBe(partnerData.name);
    expect(partner.contactPerson).toBe('');
    expect(partner.phone).toBe('');
    expect(partner.email).toBe('');
    expect(partner.address).toEqual({
      street: '',
      city: '',
      district: '',
      province: '',
      postalCode: '',
      country: 'Indonesia',
    });
    expect(partner.apiConfig).toEqual({
      baseUrl: '',
      apiKey: '',
      username: '',
      passwordHash: '',
      timeout: 30000,
    });
    expect(partner.status).toBe('active');
    expect(partner.createdAt).toBeInstanceOf(Date);
    expect(partner.updatedAt).toBeInstanceOf(Date);
  });

  describe('validate', () => {
    it('should validate a valid forwarder partner', () => {
      const partnerData = {
        code: 'JNE',
        name: 'JNE Express',
        contactPerson: 'John Doe',
        phone: '08123456789',
        email: 'contact@jne.co.id',
        address: {
          street: 'Jl. Tomang Raya No. 11',
          city: 'Jakarta Barat',
          district: 'Grogol',
          province: 'DKI Jakarta',
          postalCode: '11440',
          country: 'Indonesia',
        },
      };

      const partner = new ForwarderPartner(partnerData);
      const validation = partner.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });

    it('should invalidate a forwarder partner without code', () => {
      const partnerData = {
        name: 'JNE Express',
      };

      const partner = new ForwarderPartner(partnerData);
      const validation = partner.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('code');
    });

    it('should invalidate a forwarder partner without name', () => {
      const partnerData = {
        code: 'JNE',
      };

      const partner = new ForwarderPartner(partnerData);
      const validation = partner.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('name');
    });

    it('should validate email format if provided', () => {
      const partnerData = {
        code: 'JNE',
        name: 'JNE Express',
        email: 'invalid-email',
      };

      const partner = new ForwarderPartner(partnerData);
      const validation = partner.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveProperty('email');
    });
  });
});
