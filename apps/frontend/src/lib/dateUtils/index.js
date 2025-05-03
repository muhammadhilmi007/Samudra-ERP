/**
 * Samudra Paket ERP - Date Utilities
 * Standardized date and time formatting functions
 */

/**
 * Format date to locale string
 * @param {String|Date} dateString - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('id-ID', defaultOptions);
};

/**
 * Format time to locale string
 * @param {String|Date} dateString - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} Formatted time
 */
export const formatTime = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return date.toLocaleTimeString('id-ID', defaultOptions);
};

/**
 * Format date and time together
 * @param {String|Date} dateString - Date string or Date object
 * @returns {String} Formatted date and time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  const date = formatDate(dateString);
  const time = formatTime(dateString);
  
  return `${date} ${time}`;
};

/**
 * Get relative time (e.g. "2 hours ago", "just now")
 * @param {String|Date} dateString - Date string or Date object
 * @returns {String} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  // Intervals in seconds
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };
  
  // Just now
  if (seconds < 10) {
    return 'just now';
  }
  
  // Future date
  if (seconds < 0) {
    return formatDateTime(date);
  }
  
  // Find the appropriate interval
  for (const [interval, secondsInInterval] of Object.entries(intervals)) {
    const count = Math.floor(seconds / secondsInInterval);
    if (count > 0) {
      return `${count} ${interval}${count !== 1 ? 's' : ''} ago`;
    }
  }
  
  return formatDateTime(date);
};
