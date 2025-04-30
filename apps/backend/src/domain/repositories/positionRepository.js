/**
 * Samudra Paket ERP - Position Repository Interface
 * Defines the contract for position data access
 */

/**
 * Position Repository Interface
 * @interface
 */
class PositionRepository {
  /**
   * Create a new position
   * @param {Object} _positionData - The position data
   * @returns {Promise<Object>} The created position
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async create(_positionData) {
    throw new Error('Method not implemented');
  }

  /**
   * Find a position by ID
   * @param {string} _id - The position ID
   * @returns {Promise<Object>} The position if found, null otherwise
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findById(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Find positions by query
   * @param {Object} _query - The query object
   * @param {Object} _options - Query options (pagination, sorting)
   * @returns {Promise<Array>} Array of positions matching the query
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByQuery(_query, _options = {}) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a position
   * @param {string} _id - The position ID
   * @param {Object} _updateData - The data to update
   * @returns {Promise<Object>} The updated position
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async update(_id, _updateData) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a position
   * @param {string} _id - The position ID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async delete(_id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get position hierarchy
   * @param {string} [_rootId] - Optional root position ID
   * @returns {Promise<Array>} Hierarchical structure of positions
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async getHierarchy(_rootId = null) {
    throw new Error('Method not implemented');
  }

  /**
   * Get positions by division
   * @param {string} _divisionId - The division ID
   * @returns {Promise<Array>} Positions belonging to the division
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findByDivision(_divisionId) {
    throw new Error('Method not implemented');
  }

  /**
   * Get subordinate positions
   * @param {string} _parentId - The parent position ID
   * @returns {Promise<Array>} Subordinate positions
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  async findSubordinates(_parentId) {
    throw new Error('Method not implemented');
  }
}

module.exports = PositionRepository;
