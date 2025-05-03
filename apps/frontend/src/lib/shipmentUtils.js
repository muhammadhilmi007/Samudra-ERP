/**
 * Samudra Paket ERP - Shipment Utilities
 * Common utility functions for shipment-related components
 */

/**
 * Format a date string to locale format
 * @param {string} dateString - The date string to format
 * @param {object} options - Format options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '-';
  
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Format currency value to Indonesian Rupiah
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value) {
  if (value === undefined || value === null) return 'Rp 0';
  
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `Rp ${value}`;
  }
}

/**
 * Format weight value to kilograms
 * @param {number} weight - Weight in grams
 * @returns {string} Formatted weight string
 */
export function formatWeight(weight) {
  if (weight === undefined || weight === null) return '0 kg';
  
  // Convert from grams to kilograms if needed
  const weightInKg = weight >= 1000 ? weight / 1000 : weight;
  
  return `${weightInKg.toFixed(2)} kg`;
}

/**
 * Get the appropriate badge color for a shipment status
 * @param {string} status - The shipment status
 * @returns {object} Badge color classes
 */
export function getStatusBadgeColor(status) {
  const statusColors = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
    processed: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    picked_up: { bg: 'bg-purple-100', text: 'text-purple-800' },
    in_transit: { bg: 'bg-blue-100', text: 'text-blue-800' },
    out_for_delivery: { bg: 'bg-teal-100', text: 'text-teal-800' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800' },
    returned: { bg: 'bg-red-100', text: 'text-red-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    exception: { bg: 'bg-orange-100', text: 'text-orange-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    // Inter-branch shipment statuses
    preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    departed: { bg: 'bg-blue-100', text: 'text-blue-800' },
    arrived_at_destination: { bg: 'bg-teal-100', text: 'text-teal-800' },
    unloaded: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    delayed: { bg: 'bg-orange-100', text: 'text-orange-800' },
  };

  // Default to gray if status is not recognized
  return statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
}

/**
 * Format a status string for display (convert snake_case to Title Case)
 * @param {string} status - The status string
 * @returns {string} Formatted status string
 */
export function formatStatus(status) {
  if (!status) return '-';
  
  // Replace underscores with spaces and capitalize each word
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Calculate total weight from shipment items
 * @param {Array} items - Shipment items
 * @returns {number} Total weight
 */
export function calculateTotalWeight(items) {
  if (!items || !items.length) return 0;
  
  return items.reduce((total, item) => {
    const weight = Number(item.weight) || 0;
    const quantity = Number(item.quantity) || 1;
    return total + (weight * quantity);
  }, 0);
}

/**
 * Generate a dummy tracking number for new shipments
 * @returns {string} Generated tracking number
 */
export function generateDummyWaybill() {
  const prefix = 'SM';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}${date}${random}`;
}

/**
 * Calculate volumetric weight
 * @param {number} length - Length in cm
 * @param {number} width - Width in cm
 * @param {number} height - Height in cm
 * @param {number} divisor - Volumetric divisor (default 6000 for domestic)
 * @returns {number} Volumetric weight in kg
 */
export function calculateVolumetricWeight(length, width, height, divisor = 6000) {
  if (!length || !width || !height) return 0;
  
  const volume = parseFloat(length) * parseFloat(width) * parseFloat(height);
  return volume / divisor;
}

/**
 * Get highest weight between actual and volumetric
 * @param {number} actualWeight - Actual weight in kg
 * @param {number} volumetricWeight - Volumetric weight in kg
 * @returns {number} Chargeable weight
 */
export function getChargeableWeight(actualWeight, volumetricWeight) {
  return Math.max(actualWeight, volumetricWeight);
}

/**
 * Convert shipment form data to API request format
 * @param {object} formData - Form data from react-hook-form
 * @returns {object} Formatted data for API request
 */
export function formatShipmentFormData(formData) {
  // Deep copy to avoid modifying original
  const data = JSON.parse(JSON.stringify(formData));
  
  // Format dates if needed
  if (data.shipmentDate && typeof data.shipmentDate === 'object') {
    data.shipmentDate = data.shipmentDate.toISOString();
  }
  
  // Ensure items have proper numeric values
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map(item => ({
      ...item,
      weight: parseFloat(item.weight) || 0,
      length: parseFloat(item.length) || 0,
      width: parseFloat(item.width) || 0,
      height: parseFloat(item.height) || 0,
      quantity: parseInt(item.quantity, 10) || 1,
      declaredValue: parseFloat(item.declaredValue) || 0,
    }));
  }
  
  return data;
}
