/* eslint-disable max-len */
/**
 * Samudra Paket ERP - Forwarder Controller
 * Handles forwarder management API endpoints
 */

const { ObjectId } = require('mongodb');
const ForwarderService = require('../../app/services/forwarderService');
const ForwarderIntegrationService = require('../../app/services/forwarderIntegrationService');
const MongoForwarderPartnerRepository = require('../../infrastructure/repositories/mongoForwarderPartnerRepository');
const MongoForwarderAreaRepository = require('../../infrastructure/repositories/mongoForwarderAreaRepository');
const MongoForwarderRateRepository = require('../../infrastructure/repositories/mongoForwarderRateRepository');

// Initialize repositories and services with database connection handling
let forwarderPartnerRepository;
let forwarderAreaRepository;
let forwarderRateRepository;
let forwarderService;
let forwarderIntegrationService;

try {
  // In production environment, these will be initialized properly
  forwarderPartnerRepository = new MongoForwarderPartnerRepository();
  forwarderAreaRepository = new MongoForwarderAreaRepository();
  forwarderRateRepository = new MongoForwarderRateRepository();
  
  forwarderService = new ForwarderService({
    forwarderPartnerRepository,
    forwarderAreaRepository,
    forwarderRateRepository,
  });
  
  forwarderIntegrationService = new ForwarderIntegrationService({
    forwarderPartnerRepository,
  });
} catch (error) {
  // In test environment, these will be mocked
  console.log('Using mock repositories and services for testing');
}

/**
 * Get all forwarder partners with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllForwarderPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const result = await forwarderService.getAllForwarderPartners({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      search
    });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get a forwarder partner by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const forwarderPartner = await forwarderService.getForwarderPartnerById(id);
    if (!forwarderPartner) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan'
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: forwarderPartner
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Create a new forwarder partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createForwarderPartner = async (req, res) => {
  try {
    const forwarderData = req.body;
    const result = await forwarderService.createForwarderPartner(forwarderData);
    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data forwarder tidak valid',
          details: error.details
        }
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat membuat forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Update a forwarder partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateForwarderPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const forwarderData = req.body;
    const updatedForwarder = await forwarderService.updateForwarderPartner(id, forwarderData);
    if (!updatedForwarder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan'
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedForwarder
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data forwarder tidak valid',
          details: error.details
        }
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat memperbarui forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Delete a forwarder partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteForwarderPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await forwarderService.deleteForwarderPartner(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan'
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Forwarder berhasil dihapus'
    });
  } catch (error) {
    if (error.name === 'DependencyError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DEPENDENCY_ERROR',
          message: 'Forwarder tidak dapat dihapus karena masih memiliki area atau tarif',
          details: error.message
        }
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat menghapus forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Update forwarder partner status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateForwarderPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status tidak valid. Status harus berupa active atau inactive'
        }
      });
    }
    const updatedForwarder = await forwarderService.updateForwarderPartnerStatus(id, status);
    if (!updatedForwarder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Forwarder tidak ditemukan'
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: updatedForwarder,
      message: `Status forwarder berhasil diubah menjadi ${status}`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat memperbarui status forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get all forwarder areas with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllForwarderAreas = async (req, res) => {
  try {
    const { page = 1, limit = 10, forwarderId, status, search } = req.query;
    const result = await forwarderService.getAllForwarderAreas({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      forwarderId,
      status,
      search
    });
    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Find forwarder rates for a specific route
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const findForwarderRatesForRoute = async (req, res) => {
  try {
    const {
      originProvinceId,
      originCityId,
      originDistrictId,
      destinationProvinceId,
      destinationCityId,
      destinationDistrictId,
      weight,
      dimension
    } = req.query;
    
    const result = await forwarderService.findForwarderRatesForRoute({
      originProvinceId,
      originCityId,
      originDistrictId,
      destinationProvinceId,
      destinationCityId,
      destinationDistrictId,
      weight: weight ? parseInt(weight, 10) : undefined,
      dimension
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mencari tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get all areas for a forwarder partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderAreas = async (req, res) => {
  try {
    const { forwarderId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!ObjectId.isValid(forwarderId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID forwarder tidak valid',
        },
      });
    }

    const result = await this.forwarderService.getForwarderAreas(forwarderId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('Error getting forwarder areas:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Get a forwarder area by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderAreaById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID area tidak valid',
        },
      });
    }

    const forwarderArea = await this.forwarderService.getForwarderAreaById(id);

    if (!forwarderArea) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Area tidak ditemukan',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: forwarderArea,
    });
  } catch (error) {
    console.error('Error getting forwarder area by ID:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Create a new forwarder area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createForwarderArea = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    const result = await this.forwarderService.createForwarderArea(data, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasi gagal',
          details: result.errors,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Area forwarder berhasil dibuat',
    });
  } catch (error) {
    console.error('Error creating forwarder area:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat membuat area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Update an existing forwarder area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateForwarderArea = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID area tidak valid',
        },
      });
    }

    const result = await this.forwarderService.updateForwarderArea(id, data, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasi gagal',
          details: result.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Area forwarder berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating forwarder area:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat memperbarui area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Delete a forwarder area
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteForwarderArea = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID area tidak valid',
        },
      });
    }

    const result = await this.forwarderService.deleteForwarderArea(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: result.message || 'Gagal menghapus area forwarder',
          details: result.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message || 'Area forwarder berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting forwarder area:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat menghapus area forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

// Forwarder Rate Controllers

/**
 * Get all rates for a forwarder partner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderRates = async (req, res) => {
  try {
    const { forwarderId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!ObjectId.isValid(forwarderId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID forwarder tidak valid',
        },
      });
    }

    const result = await this.forwarderService.getForwarderRates(forwarderId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('Error getting forwarder rates:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Get a forwarder rate by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderRateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID tarif tidak valid',
        },
      });
    }

    const forwarderRate = await this.forwarderService.getForwarderRateById(id);

    if (!forwarderRate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Tarif tidak ditemukan',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: forwarderRate,
    });
  } catch (error) {
    console.error('Error getting forwarder rate by ID:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mengambil data tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Find rates for a specific route
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const findRatesForRoute = async (req, res) => {
  try {
    const { forwarderId } = req.params;
    const {
      originProvince, originCity, destinationProvince, destinationCity,
    } = req.query;

    if (!ObjectId.isValid(forwarderId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID forwarder tidak valid',
        },
      });
    }

    if (!originProvince || !originCity || !destinationProvince || !destinationCity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter rute tidak lengkap',
          details: {
            route: 'Provinsi dan kota asal serta tujuan wajib diisi',
          },
        },
      });
    }

    const rates = await this.forwarderService.findRatesForRoute(
      forwarderId,
      { province: originProvince, city: originCity },
      { province: destinationProvince, city: destinationCity },
    );

    return res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error('Error finding rates for route:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mencari tarif untuk rute',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Create a new forwarder rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createForwarderRate = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    const result = await this.forwarderService.createForwarderRate(data, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasi gagal',
          details: result.errors,
        },
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Tarif forwarder berhasil dibuat',
    });
  } catch (error) {
    console.error('Error creating forwarder rate:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat membuat tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Update an existing forwarder rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateForwarderRate = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const userId = req.user.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID tarif tidak valid',
        },
      });
    }

    const result = await this.forwarderService.updateForwarderRate(id, data, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validasi gagal',
          details: result.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: 'Tarif forwarder berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating forwarder rate:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat memperbarui tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Delete a forwarder rate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteForwarderRate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID tarif tidak valid',
        },
      });
    }

    const result = await this.forwarderService.deleteForwarderRate(id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: result.message || 'Gagal menghapus tarif forwarder',
          details: result.errors,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message || 'Tarif forwarder berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting forwarder rate:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat menghapus tarif forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Test integration with a forwarder partner's API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testForwarderIntegration = async (req, res) => {
  try {
    const { forwarderId } = req.params;

    if (!ObjectId.isValid(forwarderId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID forwarder tidak valid',
        },
      });
    }

    // Use the forwarderIntegrationService instead of forwarderService
    const result = await this.forwarderIntegrationService.testConnection(forwarderId);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result.details,
    });
  } catch (error) {
    console.error('Error testing forwarder integration:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat menguji integrasi forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
};

/**
 * Get shipping rates from a forwarder partner's API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getForwarderShippingRates = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    const result = await forwarderIntegrationService.getShippingRates(id, shipmentData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat mendapatkan tarif dari forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Create a shipment with a forwarder partner's API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createForwarderShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipmentData = req.body;
    
    const result = await forwarderIntegrationService.createShipment(id, shipmentData);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    return res.status(201).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat membuat pengiriman dengan forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Track a shipment with a forwarder partner's API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const trackForwarderShipment = async (req, res) => {
  try {
    const { id, trackingNumber } = req.params;
    
    const result = await forwarderIntegrationService.trackShipment(id, trackingNumber);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Terjadi kesalahan saat melacak pengiriman dengan forwarder',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

module.exports = {
  getAllForwarderPartners,
  getForwarderPartnerById,
  createForwarderPartner,
  updateForwarderPartner,
  deleteForwarderPartner,
  updateForwarderPartnerStatus,
  getForwarderAreas,
  getForwarderAreaById,
  createForwarderArea,
  updateForwarderArea,
  deleteForwarderArea,
  getForwarderRates,
  getForwarderRateById,
  findRatesForRoute,
  createForwarderRate,
  updateForwarderRate,
  deleteForwarderRate,
  testForwarderIntegration,
  getForwarderShippingRates,
  createForwarderShipment,
  trackForwarderShipment,
};
