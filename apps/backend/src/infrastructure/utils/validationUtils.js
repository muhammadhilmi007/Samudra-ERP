/**
 * Samudra Paket ERP - Validation Utilities
 * Common validation functions used across the application
 */

const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is a valid ObjectId, false otherwise
 */
const validateObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is valid, false otherwise
 */
const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if the phone number is valid, false otherwise
 */
const validatePhone = (phone) => {
  if (!phone) return false;
  // Basic phone validation - can be customized for specific formats
  const phoneRegex = /^[0-9+\-() ]{8,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a date is not in the future
 * @param {Date} date - The date to validate
 * @returns {boolean} True if the date is valid and not in the future, false otherwise
 */
const validatePastDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !Number.isNaN(dateObj.getTime()) && dateObj <= new Date();
};

/**
 * Validates a date is in the future
 * @param {Date} date - The date to validate
 * @returns {boolean} True if the date is valid and in the future, false otherwise
 */
const validateFutureDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj instanceof Date && !Number.isNaN(dateObj.getTime()) && dateObj > new Date();
};

/**
 * Validates a postal code format (Indonesian format by default)
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} True if the postal code is valid, false otherwise
 */
const validatePostalCode = (postalCode) => {
  if (!postalCode) return false;
  // Indonesian postal code is 5 digits
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Validates that a string has a minimum length
 * @param {string} str - The string to validate
 * @param {number} minLength - The minimum length required
 * @returns {boolean} True if the string meets the minimum length, false otherwise
 */
const validateMinLength = (str, minLength) => {
  if (!str) return false;
  return str.length >= minLength;
};

/**
 * Validates that a string doesn't exceed a maximum length
 * @param {string} str - The string to validate
 * @param {number} maxLength - The maximum length allowed
 * @returns {boolean} True if the string doesn't exceed the maximum length, false otherwise
 */
const validateMaxLength = (str, maxLength) => {
  if (!str) return true; // Empty strings are valid for max length
  return str.length <= maxLength;
};

/**
 * Validates that a number is within a range
 * @param {number} num - The number to validate
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {boolean} True if the number is within the range, false otherwise
 */
const validateNumberRange = (num, min, max) => {
  if (num === undefined || num === null) return false;
  return num >= min && num <= max;
};

module.exports = {
  validateObjectId,
  validateEmail,
  validatePhone,
  validatePastDate,
  validateFutureDate,
  validatePostalCode,
  validateMinLength,
  validateMaxLength,
  validateNumberRange,
};
