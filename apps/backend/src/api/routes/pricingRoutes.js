/**
 * Samudra Paket ERP - Pricing Routes
 * Defines API routes for pricing operations
 */

const express = require('express');
const PricingController = require('../controllers/pricingController');
const MongoPricingRuleRepository = require('../../infrastructure/repositories/mongoPricingRuleRepository');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const {
  validateCreatePricingRule,
  validateUpdatePricingRule,
  validateAddSpecialService,
  validateAddDiscount,
  validateAddWeightTier,
  validateAddDistanceTier,
  validateCalculatePrice,
  validateGetPricingRules,
} = require('../validators/pricingValidator');

// Initialize repository
const pricingRuleRepository = new MongoPricingRuleRepository();

// Initialize controller
const pricingController = new PricingController(pricingRuleRepository);

// Create router
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/pricing/rules
 * @desc Get all pricing rules with pagination and filtering
 * @access Private
 */
router.get(
  '/rules',
  authorize('pricing.read'),
  validateGetPricingRules,
  pricingController.getAllPricingRules.bind(pricingController)
);

/**
 * @route GET /api/pricing/rules/:id
 * @desc Get pricing rule by ID
 * @access Private
 */
router.get(
  '/rules/:id',
  authorize('pricing.read'),
  pricingController.getPricingRuleById.bind(pricingController)
);

/**
 * @route GET /api/pricing/rules/code/:code
 * @desc Get pricing rule by code
 * @access Private
 */
router.get(
  '/rules/code/:code',
  authorize('pricing.read'),
  pricingController.getPricingRuleByCode.bind(pricingController)
);

/**
 * @route POST /api/pricing/rules
 * @desc Create a new pricing rule
 * @access Private
 */
router.post(
  '/rules',
  authorize('pricing.create'),
  validateCreatePricingRule,
  pricingController.createPricingRule.bind(pricingController)
);

/**
 * @route PUT /api/pricing/rules/:id
 * @desc Update a pricing rule
 * @access Private
 */
router.put(
  '/rules/:id',
  authorize('pricing.update'),
  validateUpdatePricingRule,
  pricingController.updatePricingRule.bind(pricingController)
);

/**
 * @route DELETE /api/pricing/rules/:id
 * @desc Delete a pricing rule
 * @access Private
 */
router.delete(
  '/rules/:id',
  authorize('pricing.delete'),
  pricingController.deletePricingRule.bind(pricingController)
);

/**
 * @route PUT /api/pricing/rules/:id/activate
 * @desc Activate a pricing rule
 * @access Private
 */
router.put(
  '/rules/:id/activate',
  authorize('pricing.update'),
  pricingController.activatePricingRule.bind(pricingController)
);

/**
 * @route PUT /api/pricing/rules/:id/deactivate
 * @desc Deactivate a pricing rule
 * @access Private
 */
router.put(
  '/rules/:id/deactivate',
  authorize('pricing.update'),
  pricingController.deactivatePricingRule.bind(pricingController)
);

/**
 * @route POST /api/pricing/calculate
 * @desc Calculate price for a shipment
 * @access Private
 */
router.post(
  '/calculate',
  authorize('pricing.read'),
  validateCalculatePrice,
  pricingController.calculatePrice.bind(pricingController)
);

/**
 * @route POST /api/pricing/rules/:id/special-services
 * @desc Add a special service to a pricing rule
 * @access Private
 */
router.post(
  '/rules/:id/special-services',
  authorize('pricing.update'),
  validateAddSpecialService,
  pricingController.addSpecialService.bind(pricingController)
);

/**
 * @route DELETE /api/pricing/rules/:id/special-services/:serviceCode
 * @desc Remove a special service from a pricing rule
 * @access Private
 */
router.delete(
  '/rules/:id/special-services/:serviceCode',
  authorize('pricing.update'),
  pricingController.removeSpecialService.bind(pricingController)
);

/**
 * @route POST /api/pricing/rules/:id/discounts
 * @desc Add a discount to a pricing rule
 * @access Private
 */
router.post(
  '/rules/:id/discounts',
  authorize('pricing.update'),
  validateAddDiscount,
  pricingController.addDiscount.bind(pricingController)
);

/**
 * @route DELETE /api/pricing/rules/:id/discounts/:discountId
 * @desc Remove a discount from a pricing rule
 * @access Private
 */
router.delete(
  '/rules/:id/discounts/:discountId',
  authorize('pricing.update'),
  pricingController.removeDiscount.bind(pricingController)
);

/**
 * @route POST /api/pricing/rules/:id/weight-tiers
 * @desc Add a weight tier to a pricing rule
 * @access Private
 */
router.post(
  '/rules/:id/weight-tiers',
  authorize('pricing.update'),
  validateAddWeightTier,
  pricingController.addWeightTier.bind(pricingController)
);

/**
 * @route DELETE /api/pricing/rules/:id/weight-tiers/:tierId
 * @desc Remove a weight tier from a pricing rule
 * @access Private
 */
router.delete(
  '/rules/:id/weight-tiers/:tierId',
  authorize('pricing.update'),
  pricingController.removeWeightTier.bind(pricingController)
);

/**
 * @route POST /api/pricing/rules/:id/distance-tiers
 * @desc Add a distance tier to a pricing rule
 * @access Private
 */
router.post(
  '/rules/:id/distance-tiers',
  authorize('pricing.update'),
  validateAddDistanceTier,
  pricingController.addDistanceTier.bind(pricingController)
);

/**
 * @route DELETE /api/pricing/rules/:id/distance-tiers/:tierId
 * @desc Remove a distance tier from a pricing rule
 * @access Private
 */
router.delete(
  '/rules/:id/distance-tiers/:tierId',
  authorize('pricing.update'),
  pricingController.removeDistanceTier.bind(pricingController)
);

/**
 * @route GET /api/pricing/generate-code
 * @desc Generate a pricing rule code
 * @access Private
 */
router.get(
  '/generate-code',
  authorize('pricing.create'),
  pricingController.generateCode.bind(pricingController)
);

module.exports = router;
