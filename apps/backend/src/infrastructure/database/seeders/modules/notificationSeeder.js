/**
 * Samudra Paket ERP - Notification Seeder
 * Seeds the database with notification templates for testing
 */

const mongoose = require('mongoose');
const NotificationTemplate = require('../../../../domain/models/notificationTemplate');
const { connectToDatabase, disconnectFromDatabase } = require('../config');

/**
 * Initial notification templates data
 */
const notificationTemplateData = [
  // Pickup related notifications
  {
    code: 'PICKUP_CREATED',
    name: 'Pickup Request Created',
    type: 'SYSTEM',
    category: 'PICKUP',
    template: {
      title: 'Pickup Request Created',
      body: 'Pickup request #{pickupId} has been created for {customerName}. Scheduled for {pickupDate}.',
      email: {
        subject: 'Pickup Request #{pickupId} Created',
        body: `
          <h2>Pickup Request Created</h2>
          <p>Dear {recipientName},</p>
          <p>A new pickup request has been created with the following details:</p>
          <ul>
            <li><strong>Pickup ID:</strong> #{pickupId}</li>
            <li><strong>Customer:</strong> {customerName}</li>
            <li><strong>Pickup Date:</strong> {pickupDate}</li>
            <li><strong>Pickup Address:</strong> {pickupAddress}</li>
            <li><strong>Contact Person:</strong> {contactPerson}</li>
            <li><strong>Contact Phone:</strong> {contactPhone}</li>
          </ul>
          <p>Please prepare for the pickup accordingly.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Pickup request #{pickupId} created for {customerName}. Scheduled for {pickupDate}.',
      push: {
        title: 'New Pickup Request',
        body: 'Pickup request #{pickupId} has been created for {customerName}.'
      }
    },
    variables: ['pickupId', 'customerName', 'pickupDate', 'pickupAddress', 'contactPerson', 'contactPhone', 'recipientName'],
    status: 'active'
  },
  {
    code: 'PICKUP_ASSIGNED',
    name: 'Pickup Request Assigned',
    type: 'SYSTEM',
    category: 'PICKUP',
    template: {
      title: 'Pickup Request Assigned',
      body: 'Pickup request #{pickupId} has been assigned to {assigneeName}.',
      email: {
        subject: 'Pickup Request #{pickupId} Assigned',
        body: `
          <h2>Pickup Request Assigned</h2>
          <p>Dear {recipientName},</p>
          <p>A pickup request has been assigned with the following details:</p>
          <ul>
            <li><strong>Pickup ID:</strong> #{pickupId}</li>
            <li><strong>Customer:</strong> {customerName}</li>
            <li><strong>Pickup Date:</strong> {pickupDate}</li>
            <li><strong>Assigned To:</strong> {assigneeName}</li>
            <li><strong>Pickup Address:</strong> {pickupAddress}</li>
          </ul>
          <p>Please coordinate with the assigned team for successful pickup.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Pickup request #{pickupId} assigned to {assigneeName}. Scheduled for {pickupDate}.',
      push: {
        title: 'Pickup Request Assigned',
        body: 'Pickup request #{pickupId} has been assigned to {assigneeName}.'
      }
    },
    variables: ['pickupId', 'customerName', 'pickupDate', 'assigneeName', 'pickupAddress', 'recipientName'],
    status: 'active'
  },
  {
    code: 'PICKUP_COMPLETED',
    name: 'Pickup Completed',
    type: 'SYSTEM',
    category: 'PICKUP',
    template: {
      title: 'Pickup Completed',
      body: 'Pickup #{pickupId} has been completed. {itemCount} items collected from {customerName}.',
      email: {
        subject: 'Pickup #{pickupId} Completed Successfully',
        body: `
          <h2>Pickup Completed</h2>
          <p>Dear {recipientName},</p>
          <p>We're pleased to inform you that the pickup has been completed successfully:</p>
          <ul>
            <li><strong>Pickup ID:</strong> #{pickupId}</li>
            <li><strong>Customer:</strong> {customerName}</li>
            <li><strong>Items Collected:</strong> {itemCount}</li>
            <li><strong>Completion Time:</strong> {completionTime}</li>
            <li><strong>Collected By:</strong> {collectorName}</li>
          </ul>
          <p>The items are now being processed at our facility.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Pickup #{pickupId} completed. {itemCount} items collected from {customerName}.',
      push: {
        title: 'Pickup Completed',
        body: 'Pickup #{pickupId} has been completed successfully.'
      }
    },
    variables: ['pickupId', 'customerName', 'itemCount', 'completionTime', 'collectorName', 'recipientName'],
    status: 'active'
  },
  
  // Shipment related notifications
  {
    code: 'SHIPMENT_CREATED',
    name: 'Shipment Created',
    type: 'SYSTEM',
    category: 'SHIPMENT',
    template: {
      title: 'Shipment Created',
      body: 'Shipment #{shipmentId} has been created for route {originCode} to {destinationCode}.',
      email: {
        subject: 'Shipment #{shipmentId} Created',
        body: `
          <h2>Shipment Created</h2>
          <p>Dear {recipientName},</p>
          <p>A new shipment has been created with the following details:</p>
          <ul>
            <li><strong>Shipment ID:</strong> #{shipmentId}</li>
            <li><strong>Origin:</strong> {originName} ({originCode})</li>
            <li><strong>Destination:</strong> {destinationName} ({destinationCode})</li>
            <li><strong>Scheduled Departure:</strong> {departureTime}</li>
            <li><strong>Estimated Arrival:</strong> {estimatedArrival}</li>
            <li><strong>Item Count:</strong> {itemCount}</li>
          </ul>
          <p>You can track this shipment using the shipment ID.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Shipment #{shipmentId} created for route {originCode} to {destinationCode}.',
      push: {
        title: 'New Shipment Created',
        body: 'Shipment #{shipmentId} has been created for route {originCode} to {destinationCode}.'
      }
    },
    variables: ['shipmentId', 'originCode', 'originName', 'destinationCode', 'destinationName', 'departureTime', 'estimatedArrival', 'itemCount', 'recipientName'],
    status: 'active'
  },
  {
    code: 'SHIPMENT_DEPARTED',
    name: 'Shipment Departed',
    type: 'SYSTEM',
    category: 'SHIPMENT',
    template: {
      title: 'Shipment Departed',
      body: 'Shipment #{shipmentId} has departed from {originName} ({originCode}).',
      email: {
        subject: 'Shipment #{shipmentId} Has Departed',
        body: `
          <h2>Shipment Departed</h2>
          <p>Dear {recipientName},</p>
          <p>Your shipment has departed from the origin location:</p>
          <ul>
            <li><strong>Shipment ID:</strong> #{shipmentId}</li>
            <li><strong>Origin:</strong> {originName} ({originCode})</li>
            <li><strong>Destination:</strong> {destinationName} ({destinationCode})</li>
            <li><strong>Departure Time:</strong> {departureTime}</li>
            <li><strong>Estimated Arrival:</strong> {estimatedArrival}</li>
          </ul>
          <p>You can track this shipment using the shipment ID.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Shipment #{shipmentId} departed from {originName} at {departureTime}.',
      push: {
        title: 'Shipment Departed',
        body: 'Shipment #{shipmentId} has departed from {originName}.'
      }
    },
    variables: ['shipmentId', 'originCode', 'originName', 'destinationCode', 'destinationName', 'departureTime', 'estimatedArrival', 'recipientName'],
    status: 'active'
  },
  {
    code: 'SHIPMENT_ARRIVED',
    name: 'Shipment Arrived',
    type: 'SYSTEM',
    category: 'SHIPMENT',
    template: {
      title: 'Shipment Arrived',
      body: 'Shipment #{shipmentId} has arrived at {destinationName} ({destinationCode}).',
      email: {
        subject: 'Shipment #{shipmentId} Has Arrived',
        body: `
          <h2>Shipment Arrived</h2>
          <p>Dear {recipientName},</p>
          <p>Your shipment has arrived at the destination location:</p>
          <ul>
            <li><strong>Shipment ID:</strong> #{shipmentId}</li>
            <li><strong>Origin:</strong> {originName} ({originCode})</li>
            <li><strong>Destination:</strong> {destinationName} ({destinationCode})</li>
            <li><strong>Arrival Time:</strong> {arrivalTime}</li>
          </ul>
          <p>The shipment will now be processed for delivery or pickup.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Shipment #{shipmentId} arrived at {destinationName} at {arrivalTime}.',
      push: {
        title: 'Shipment Arrived',
        body: 'Shipment #{shipmentId} has arrived at {destinationName}.'
      }
    },
    variables: ['shipmentId', 'originCode', 'originName', 'destinationCode', 'destinationName', 'arrivalTime', 'recipientName'],
    status: 'active'
  },
  
  // Delivery related notifications
  {
    code: 'DELIVERY_ASSIGNED',
    name: 'Delivery Assigned',
    type: 'SYSTEM',
    category: 'DELIVERY',
    template: {
      title: 'Delivery Assigned',
      body: 'Delivery for package #{packageId} has been assigned to {driverName}.',
      email: {
        subject: 'Delivery for Package #{packageId} Assigned',
        body: `
          <h2>Delivery Assigned</h2>
          <p>Dear {recipientName},</p>
          <p>A delivery has been assigned with the following details:</p>
          <ul>
            <li><strong>Package ID:</strong> #{packageId}</li>
            <li><strong>Delivery Address:</strong> {deliveryAddress}</li>
            <li><strong>Assigned Driver:</strong> {driverName}</li>
            <li><strong>Estimated Delivery:</strong> {estimatedDelivery}</li>
            <li><strong>Contact Number:</strong> {driverPhone}</li>
          </ul>
          <p>Our driver will contact you before delivery.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Your package #{packageId} is out for delivery with {driverName}. Estimated delivery: {estimatedDelivery}.',
      push: {
        title: 'Package Out for Delivery',
        body: 'Your package #{packageId} is out for delivery with {driverName}.'
      }
    },
    variables: ['packageId', 'deliveryAddress', 'driverName', 'driverPhone', 'estimatedDelivery', 'recipientName'],
    status: 'active'
  },
  {
    code: 'DELIVERY_COMPLETED',
    name: 'Delivery Completed',
    type: 'SYSTEM',
    category: 'DELIVERY',
    template: {
      title: 'Delivery Completed',
      body: 'Package #{packageId} has been delivered successfully to {recipientName}.',
      email: {
        subject: 'Package #{packageId} Delivered Successfully',
        body: `
          <h2>Delivery Completed</h2>
          <p>Dear {customerName},</p>
          <p>We're pleased to inform you that your package has been delivered successfully:</p>
          <ul>
            <li><strong>Package ID:</strong> #{packageId}</li>
            <li><strong>Delivered To:</strong> {recipientName}</li>
            <li><strong>Delivery Address:</strong> {deliveryAddress}</li>
            <li><strong>Delivery Time:</strong> {deliveryTime}</li>
            <li><strong>Delivered By:</strong> {driverName}</li>
          </ul>
          <p>Thank you for choosing Samudra Paket for your shipping needs.</p>
          <p>Best regards,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Your package #{packageId} has been delivered successfully to {recipientName} at {deliveryTime}.',
      push: {
        title: 'Delivery Completed',
        body: 'Your package #{packageId} has been delivered successfully.'
      }
    },
    variables: ['packageId', 'customerName', 'recipientName', 'deliveryAddress', 'deliveryTime', 'driverName'],
    status: 'active'
  },
  {
    code: 'DELIVERY_FAILED',
    name: 'Delivery Failed',
    type: 'SYSTEM',
    category: 'DELIVERY',
    template: {
      title: 'Delivery Failed',
      body: 'Delivery attempt for package #{packageId} failed. Reason: {failureReason}.',
      email: {
        subject: 'Delivery Attempt Failed for Package #{packageId}',
        body: `
          <h2>Delivery Attempt Failed</h2>
          <p>Dear {recipientName},</p>
          <p>We attempted to deliver your package but were unable to complete the delivery:</p>
          <ul>
            <li><strong>Package ID:</strong> #{packageId}</li>
            <li><strong>Delivery Address:</strong> {deliveryAddress}</li>
            <li><strong>Attempt Time:</strong> {attemptTime}</li>
            <li><strong>Reason:</strong> {failureReason}</li>
          </ul>
          <p>We will attempt delivery again on {nextAttemptDate}. If you would like to reschedule or arrange pickup, please contact our customer service.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Delivery attempt for package #{packageId} failed. Reason: {failureReason}. Next attempt: {nextAttemptDate}.',
      push: {
        title: 'Delivery Attempt Failed',
        body: 'Delivery for package #{packageId} failed. Reason: {failureReason}.'
      }
    },
    variables: ['packageId', 'recipientName', 'deliveryAddress', 'attemptTime', 'failureReason', 'nextAttemptDate'],
    status: 'active'
  },
  
  // Payment related notifications
  {
    code: 'PAYMENT_RECEIVED',
    name: 'Payment Received',
    type: 'SYSTEM',
    category: 'PAYMENT',
    template: {
      title: 'Payment Received',
      body: 'Payment of {amount} has been received for invoice #{invoiceId}.',
      email: {
        subject: 'Payment Received for Invoice #{invoiceId}',
        body: `
          <h2>Payment Received</h2>
          <p>Dear {customerName},</p>
          <p>We have received your payment with the following details:</p>
          <ul>
            <li><strong>Invoice ID:</strong> #{invoiceId}</li>
            <li><strong>Amount:</strong> {amount}</li>
            <li><strong>Payment Method:</strong> {paymentMethod}</li>
            <li><strong>Payment Date:</strong> {paymentDate}</li>
            <li><strong>Transaction ID:</strong> {transactionId}</li>
          </ul>
          <p>Thank you for your payment.</p>
          <p>Best regards,<br>Samudra Paket Team</p>
        `
      },
      sms: 'Payment of {amount} received for invoice #{invoiceId}. Thank you for your payment.',
      push: {
        title: 'Payment Received',
        body: 'Payment of {amount} has been received for invoice #{invoiceId}.'
      }
    },
    variables: ['invoiceId', 'customerName', 'amount', 'paymentMethod', 'paymentDate', 'transactionId'],
    status: 'active'
  },
  {
    code: 'PAYMENT_OVERDUE',
    name: 'Payment Overdue',
    type: 'SYSTEM',
    category: 'PAYMENT',
    template: {
      title: 'Payment Overdue',
      body: 'Payment for invoice #{invoiceId} is overdue by {daysOverdue} days.',
      email: {
        subject: 'OVERDUE: Payment for Invoice #{invoiceId}',
        body: `
          <h2>Payment Overdue</h2>
          <p>Dear {customerName},</p>
          <p>This is a reminder that your payment for the following invoice is overdue:</p>
          <ul>
            <li><strong>Invoice ID:</strong> #{invoiceId}</li>
            <li><strong>Amount Due:</strong> {amountDue}</li>
            <li><strong>Due Date:</strong> {dueDate}</li>
            <li><strong>Days Overdue:</strong> {daysOverdue}</li>
          </ul>
          <p>Please make your payment as soon as possible to avoid any service interruptions.</p>
          <p>If you have already made the payment, please disregard this notice.</p>
          <p>Thank you,<br>Samudra Paket Team</p>
        `
      },
      sms: 'REMINDER: Payment for invoice #{invoiceId} is overdue by {daysOverdue} days. Amount due: {amountDue}.',
      push: {
        title: 'Payment Overdue',
        body: 'Payment for invoice #{invoiceId} is overdue by {daysOverdue} days.'
      }
    },
    variables: ['invoiceId', 'customerName', 'amountDue', 'dueDate', 'daysOverdue'],
    status: 'active'
  }
];

/**
 * Seed notification templates to the database
 */
const seedNotifications = async () => {
  try {
    console.log('Starting notification template seeder...');

    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectToDatabase();
    }

    // Check if we're connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error(`Failed to connect to MongoDB. Connection state: ${['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]}`);
    }

    console.log('Connected to MongoDB successfully');

    // Check for existing notification templates
    console.log('Checking for existing notification templates...');
    const existingCount = await NotificationTemplate.countDocuments({});
    
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing notification templates`);
      console.log('Deleting existing notification templates...');
      const deleteResult = await NotificationTemplate.deleteMany({});
      console.log(`Deleted ${deleteResult.deletedCount} existing notification templates`);
    } else {
      console.log('No existing notification templates found');
    }

    // Create new notification templates
    console.log('Creating new notification templates...');
    const createdTemplates = await NotificationTemplate.create(notificationTemplateData);
    console.log(`Created ${createdTemplates.length} notification templates`);

    // Log created notification templates
    createdTemplates.forEach((template) => {
      console.log(`- ${template.code}: ${template.name} (${template.category})`);
    });

    console.log('Notification template seeding completed successfully');
    return createdTemplates;
  } catch (error) {
    console.error('Error seeding notification templates:', error.message);
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await connectToDatabase();
      await seedNotifications();
      await disconnectFromDatabase();
      console.log('Notification template seeder completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Notification template seeder failed:', error);
      // Close database connection if it's open
      if (mongoose.connection.readyState !== 0) {
        await disconnectFromDatabase();
      }
      process.exit(1);
    }
  })();
}

module.exports = {
  seedNotifications
};
