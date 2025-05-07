/**
 * Format respons sukses API
 * @param {Object} data - Data utama yang akan dikembalikan
 * @param {Object} [meta] - Metadata tambahan (pagination, dll)
 * @param {number} [statusCode=200] - Kode status HTTP
 * @returns {Object} Respons format standar
 */
const successResponse = (data, meta = {}, statusCode = 200) => ({
  success: true,
  statusCode,
  data,
  meta
});

/**
 * Format respons error API
 * @param {Error} error - Objek error
 * @param {string} [message] - Pesan error yang dapat ditampilkan ke user
 * @param {string} [code] - Kode error khusus aplikasi
 * @param {number} [status=400] - Kode status HTTP
 * @returns {Object} Respons error format standar
 */
const errorResponse = (error, message, code, status = 400) => ({
  success: false,
  statusCode: status,
  error: {
    code: code || 'INTERNAL_ERROR',
    message: message || error.message,
    details: {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...error.details
    }
  }
});

module.exports = {
  successResponse,
  errorResponse
};
