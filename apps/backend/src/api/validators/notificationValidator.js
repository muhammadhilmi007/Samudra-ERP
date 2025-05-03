/**
 * Samudra Paket ERP - Notification Validators
 * Validation schemas for notification API endpoints
 */

const Joi = require('joi');
const { validateRequest } = require('../middleware/validationMiddleware');

// Notification status enum
const notificationStatusEnum = ['unread', 'read', 'archived'];

// Notification type enum
const notificationTypeEnum = [
  'shipment_status',
  'pickup_status',
  'delivery_status',
  'issue_alert',
  'system_alert',
  'payment_reminder',
  'assignment',
  'document_update',
  'custom'
];

// Entity type enum
const entityTypeEnum = [
  'shipment_order',
  'shipment',
  'pickup_request',
  'pickup_assignment',
  'delivery_order',
  'return',
  'user',
  'system'
];

// Priority enum
const priorityEnum = ['low', 'medium', 'high', 'urgent'];

// Delivery channel enum
const deliveryChannelEnum = ['in_app', 'email', 'sms', 'push'];

// Action type enum
const actionTypeEnum = ['link', 'button', 'form'];

// Validate get user notifications request
const validateGetUserNotifications = validateRequest({
  query: Joi.object({
    status: Joi.alternatives()
      .try(
        Joi.string().valid(...notificationStatusEnum),
        Joi.array().items(Joi.string().valid(...notificationStatusEnum))
      ),
    type: Joi.alternatives()
      .try(
        Joi.string().valid(...notificationTypeEnum),
        Joi.array().items(Joi.string().valid(...notificationTypeEnum))
      ),
    entityType: Joi.string().valid(...entityTypeEnum),
    entityId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    priority: Joi.alternatives()
      .try(
        Joi.string().valid(...priorityEnum),
        Joi.array().items(Joi.string().valid(...priorityEnum))
      ),
    limit: Joi.number().integer().min(1).max(100).default(20),
    skip: Joi.number().integer().min(0).default(0),
    sort: Joi.string().pattern(/^[a-zA-Z0-9_]+:(1|-1)$/).default('createdAt:-1')
  })
});

// Validate get notification by ID request
const validateGetNotificationById = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
});

// Validate mark as read request
const validateMarkAsRead = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
});

// Validate mark all as read request
const validateMarkAllAsRead = validateRequest({
  query: Joi.object({
    type: Joi.string().valid(...notificationTypeEnum),
    entityType: Joi.string().valid(...entityTypeEnum),
    entityId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
  })
});

// Validate archive notification request
const validateArchiveNotification = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
});

// Validate delete notification request
const validateDeleteNotification = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
});

// Validate update user preferences request
const validateUpdateUserPreferences = validateRequest({
  body: Joi.object({
    notificationTypes: Joi.object().pattern(
      Joi.string().valid(...notificationTypeEnum),
      Joi.object({
        enabled: Joi.boolean(),
        channels: Joi.object({
          in_app: Joi.boolean(),
          email: Joi.boolean(),
          sms: Joi.boolean(),
          push: Joi.boolean()
        }),
        minPriority: Joi.string().valid(...priorityEnum)
      })
    ),
    quietHours: Joi.object({
      enabled: Joi.boolean(),
      start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
      end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
      timezone: Joi.string(),
      excludeUrgent: Joi.boolean()
    }),
    contactInfo: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string()
    })
  }).min(1)
});

// Validate add push token request
const validateAddPushToken = validateRequest({
  body: Joi.object({
    token: Joi.string().required(),
    device: Joi.string()
  })
});

// Validate remove push token request
const validateRemovePushToken = validateRequest({
  body: Joi.object({
    token: Joi.string().required()
  })
});

// Validate get templates request
const validateGetTemplates = validateRequest({
  query: Joi.object({
    type: Joi.alternatives()
      .try(
        Joi.string().valid(...notificationTypeEnum),
        Joi.array().items(Joi.string().valid(...notificationTypeEnum))
      ),
    isActive: Joi.boolean(),
    limit: Joi.number().integer().min(1).max(100).default(50),
    skip: Joi.number().integer().min(0).default(0),
    sort: Joi.string().pattern(/^[a-zA-Z0-9_]+:(1|-1)$/).default('code:1')
  })
});

// Validate create template request
const validateCreateTemplate = validateRequest({
  body: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid(...notificationTypeEnum).required(),
    titleTemplate: Joi.string().required(),
    messageTemplate: Joi.string().required(),
    priority: Joi.string().valid(...priorityEnum).default('medium'),
    defaultChannels: Joi.array().items(Joi.string().valid(...deliveryChannelEnum)).default(['in_app']),
    emailTemplate: Joi.object({
      subject: Joi.string(),
      htmlBody: Joi.string(),
      textBody: Joi.string()
    }),
    smsTemplate: Joi.string(),
    pushTemplate: Joi.object({
      title: Joi.string(),
      body: Joi.string()
    }),
    isActive: Joi.boolean().default(true),
    isActionable: Joi.boolean().default(false),
    action: Joi.when('isActionable', {
      is: true,
      then: Joi.object({
        type: Joi.string().valid(...actionTypeEnum).required(),
        label: Joi.string().required(),
        urlTemplate: Joi.string().required()
      }).required(),
      otherwise: Joi.forbidden()
    }),
    expiryDays: Joi.number().integer().min(1).max(365).default(30),
    metadata: Joi.object()
  })
});

// Validate update template request
const validateUpdateTemplate = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),
  body: Joi.object({
    code: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    type: Joi.string().valid(...notificationTypeEnum),
    titleTemplate: Joi.string(),
    messageTemplate: Joi.string(),
    priority: Joi.string().valid(...priorityEnum),
    defaultChannels: Joi.array().items(Joi.string().valid(...deliveryChannelEnum)),
    emailTemplate: Joi.object({
      subject: Joi.string(),
      htmlBody: Joi.string(),
      textBody: Joi.string()
    }),
    smsTemplate: Joi.string(),
    pushTemplate: Joi.object({
      title: Joi.string(),
      body: Joi.string()
    }),
    isActive: Joi.boolean(),
    isActionable: Joi.boolean(),
    action: Joi.when('isActionable', {
      is: true,
      then: Joi.object({
        type: Joi.string().valid(...actionTypeEnum).required(),
        label: Joi.string().required(),
        urlTemplate: Joi.string().required()
      }).required(),
      otherwise: Joi.forbidden()
    }),
    expiryDays: Joi.number().integer().min(1).max(365),
    metadata: Joi.object()
  }).min(1)
});

// Validate delete template request
const validateDeleteTemplate = validateRequest({
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
});

// Validate send test notification request
const validateSendTestNotification = validateRequest({
  body: Joi.object({
    templateCode: Joi.string().required(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    data: Joi.object().required(),
    entityInfo: Joi.object({
      type: Joi.string().valid(...entityTypeEnum).required(),
      id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
    }).required()
  })
});

module.exports = {
  validateGetUserNotifications,
  validateGetNotificationById,
  validateMarkAsRead,
  validateMarkAllAsRead,
  validateArchiveNotification,
  validateDeleteNotification,
  validateUpdateUserPreferences,
  validateAddPushToken,
  validateRemovePushToken,
  validateGetTemplates,
  validateCreateTemplate,
  validateUpdateTemplate,
  validateDeleteTemplate,
  validateSendTestNotification
};
