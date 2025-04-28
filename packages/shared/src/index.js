/**
 * Samudra Paket ERP - Shared Package
 * Common utilities and components
 */

// Date formatting utilities
const formatDate = (date, format = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  // Simple implementation - in a real app, use date-fns
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year);
};

// Currency formatting
const formatCurrency = (amount, locale = 'id-ID', currency = 'IDR') => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Indonesian phone number validation (simple version)
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  return phoneRegex.test(phone);
};

// Error handling
const createApiError = (code, message, details = {}) => ({
  success: false,
  error: {
    code,
    message,
    details,
  },
});

// Export all utilities
module.exports = {
  formatDate,
  formatCurrency,
  isValidEmail,
  isValidPhone,
  createApiError,
};
