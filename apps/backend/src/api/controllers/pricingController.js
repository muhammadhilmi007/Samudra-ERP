/**
 * Samudra Paket ERP - Pricing Controller
 * Handles HTTP requests for pricing operations
 */

const PricingRuleRepository = require('../../domain/repositories/pricingRuleRepository');
const { NotFoundError, ValidationError } = require('../../domain/utils/errorUtils');

/**
 * Pricing Controller
 */
class PricingController {
  /**
   * Constructor
   * @param {PricingRuleRepository} pricingRuleRepository - Repository for pricing rules
   */
  constructor(pricingRuleRepository) {
    this.pricingRuleRepository = pricingRuleRepository;
  }

  /**
   * Get all pricing rules with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllPricingRules(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = -1,
        serviceType,
        originProvince,
        originCity,
        destinationProvince,
        destinationCity,
        isActive,
        branch,
        code,
        name,
      } = req.query;

      // Build filters
      const filters = {};

      if (serviceType) filters.serviceType = serviceType;
      if (originProvince) filters['originArea.province'] = originProvince;
      if (originCity) filters['originArea.city'] = originCity;
      if (destinationProvince) filters['destinationArea.province'] = destinationProvince;
      if (destinationCity) filters['destinationArea.city'] = destinationCity;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (branch) filters.branch = branch;
      if (code) filters.code = { $regex: code, $options: 'i' };
      if (name) filters.name = { $regex: name, $options: 'i' };

      // Get pricing rules with pagination
      const pricingRules = await this.pricingRuleRepository.findAll(filters, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy,
        sortOrder: parseInt(sortOrder, 10),
      });

      // Get total count for pagination
      const totalCount = await this.pricingRuleRepository.count(filters);
      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        success: true,
        data: {
          pricingRules,
          pagination: {
            total: totalCount,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pricing rule by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPricingRuleById(req, res, next) {
    try {
      const { id } = req.params;
      const pricingRule = await this.pricingRuleRepository.findById(id);

      if (!pricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pricing rule by code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPricingRuleByCode(req, res, next) {
    try {
      const { code } = req.params;
      const pricingRule = await this.pricingRuleRepository.findByCode(code);

      if (!pricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createPricingRule(req, res, next) {
    try {
      const pricingRuleData = req.body;
      const userId = req.user.id;

      // Set created by
      pricingRuleData.createdBy = userId;

      // Create pricing rule
      const pricingRule = await this.pricingRuleRepository.create(pricingRuleData);

      res.status(201).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePricingRule(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Set updated by
      updateData.updatedBy = userId;

      // Update pricing rule
      const pricingRule = await this.pricingRuleRepository.update(id, updateData);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deletePricingRule(req, res, next) {
    try {
      const { id } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Delete pricing rule
      await this.pricingRuleRepository.delete(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Pricing rule deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async activatePricingRule(req, res, next) {
    try {
      const { id } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Activate pricing rule
      const pricingRule = await this.pricingRuleRepository.activate(id);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deactivatePricingRule(req, res, next) {
    try {
      const { id } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Deactivate pricing rule
      const pricingRule = await this.pricingRuleRepository.deactivate(id);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate price for a shipment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async calculatePrice(req, res, next) {
    try {
      const shipmentData = req.body;

      // Calculate price
      const priceDetails = await this.pricingRuleRepository.calculatePrice(shipmentData);

      res.status(200).json({
        success: true,
        data: {
          priceDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a special service to a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addSpecialService(req, res, next) {
    try {
      const { id } = req.params;
      const serviceData = req.body;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if service code already exists
      const serviceExists = existingPricingRule.specialServices.some(
        (service) => service.serviceCode === serviceData.serviceCode
      );
      if (serviceExists) {
        throw new ValidationError('Special service with this code already exists');
      }

      // Add special service
      const pricingRule = await this.pricingRuleRepository.addSpecialService(id, serviceData);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a special service from a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeSpecialService(req, res, next) {
    try {
      const { id, serviceCode } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if service exists
      const serviceExists = existingPricingRule.specialServices.some(
        (service) => service.serviceCode === serviceCode
      );
      if (!serviceExists) {
        throw new NotFoundError('Special service not found');
      }

      // Remove special service
      const pricingRule = await this.pricingRuleRepository.removeSpecialService(id, serviceCode);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a discount to a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addDiscount(req, res, next) {
    try {
      const { id } = req.params;
      const discountData = req.body;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if discount code already exists (if code is provided)
      if (discountData.code) {
        const discountExists = existingPricingRule.discounts.some(
          (discount) => discount.code === discountData.code
        );
        if (discountExists) {
          throw new ValidationError('Discount with this code already exists');
        }
      }

      // Add discount
      const pricingRule = await this.pricingRuleRepository.addDiscount(id, discountData);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a discount from a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeDiscount(req, res, next) {
    try {
      const { id, discountId } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if discount exists
      const discountExists = existingPricingRule.discounts.some(
        (discount) => discount._id.toString() === discountId
      );
      if (!discountExists) {
        throw new NotFoundError('Discount not found');
      }

      // Remove discount
      const pricingRule = await this.pricingRuleRepository.removeDiscount(id, discountId);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a weight tier to a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addWeightTier(req, res, next) {
    try {
      const { id } = req.params;
      const tierData = req.body;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Validate tier data
      if (tierData.maxWeight && tierData.minWeight >= tierData.maxWeight) {
        throw new ValidationError('Minimum weight must be less than maximum weight');
      }

      // Check for overlapping tiers
      const overlappingTier = existingPricingRule.weightTiers.find((tier) => {
        // Check if new tier's min weight falls within an existing tier's range
        if (tierData.minWeight >= tier.minWeight && 
            (!tier.maxWeight || tierData.minWeight <= tier.maxWeight)) {
          return true;
        }
        
        // Check if new tier's max weight falls within an existing tier's range
        if (tierData.maxWeight && 
            tierData.maxWeight >= tier.minWeight && 
            (!tier.maxWeight || tierData.maxWeight <= tier.maxWeight)) {
          return true;
        }
        
        // Check if new tier encompasses an existing tier
        if (tierData.minWeight <= tier.minWeight && 
            tierData.maxWeight && 
            (!tier.maxWeight || tierData.maxWeight >= tier.maxWeight)) {
          return true;
        }
        
        return false;
      });

      if (overlappingTier) {
        throw new ValidationError('Weight tier overlaps with an existing tier');
      }

      // Add weight tier
      const pricingRule = await this.pricingRuleRepository.addWeightTier(id, tierData);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a weight tier from a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeWeightTier(req, res, next) {
    try {
      const { id, tierId } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if tier exists
      const tierExists = existingPricingRule.weightTiers.some(
        (tier) => tier._id.toString() === tierId
      );
      if (!tierExists) {
        throw new NotFoundError('Weight tier not found');
      }

      // Remove weight tier
      const pricingRule = await this.pricingRuleRepository.removeWeightTier(id, tierId);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add a distance tier to a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addDistanceTier(req, res, next) {
    try {
      const { id } = req.params;
      const tierData = req.body;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Validate tier data
      if (tierData.maxDistance && tierData.minDistance >= tierData.maxDistance) {
        throw new ValidationError('Minimum distance must be less than maximum distance');
      }

      // Check for overlapping tiers
      const overlappingTier = existingPricingRule.distanceTiers.find((tier) => {
        // Check if new tier's min distance falls within an existing tier's range
        if (tierData.minDistance >= tier.minDistance && 
            (!tier.maxDistance || tierData.minDistance <= tier.maxDistance)) {
          return true;
        }
        
        // Check if new tier's max distance falls within an existing tier's range
        if (tierData.maxDistance && 
            tierData.maxDistance >= tier.minDistance && 
            (!tier.maxDistance || tierData.maxDistance <= tier.maxDistance)) {
          return true;
        }
        
        // Check if new tier encompasses an existing tier
        if (tierData.minDistance <= tier.minDistance && 
            tierData.maxDistance && 
            (!tier.maxDistance || tierData.maxDistance >= tier.maxDistance)) {
          return true;
        }
        
        return false;
      });

      if (overlappingTier) {
        throw new ValidationError('Distance tier overlaps with an existing tier');
      }

      // Add distance tier
      const pricingRule = await this.pricingRuleRepository.addDistanceTier(id, tierData);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove a distance tier from a pricing rule
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeDistanceTier(req, res, next) {
    try {
      const { id, tierId } = req.params;

      // Check if pricing rule exists
      const existingPricingRule = await this.pricingRuleRepository.findById(id);
      if (!existingPricingRule) {
        throw new NotFoundError('Pricing rule not found');
      }

      // Check if tier exists
      const tierExists = existingPricingRule.distanceTiers.some(
        (tier) => tier._id.toString() === tierId
      );
      if (!tierExists) {
        throw new NotFoundError('Distance tier not found');
      }

      // Remove distance tier
      const pricingRule = await this.pricingRuleRepository.removeDistanceTier(id, tierId);

      res.status(200).json({
        success: true,
        data: {
          pricingRule,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate a pricing rule code
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateCode(req, res, next) {
    try {
      const code = await this.pricingRuleRepository.generateCode();

      res.status(200).json({
        success: true,
        data: {
          code,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PricingController;
