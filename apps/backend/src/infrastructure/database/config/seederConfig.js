/**
 * Samudra Paket ERP - Seeder Configuration
 * Configuration for database seeders
 */

const path = require('path');
const fs = require('fs');

// Default configuration
const defaultConfig = {
  // Seeder directory path
  seedersDir: path.join(__dirname, '../seeders'),
  
  // MongoDB connection options
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  
  // Seeder execution order (important for maintaining data relationships)
  seederOrder: [
    'roleSeeder.js',
    'branchSeeder.js',
    'positionSeeder.js',
    'userSeeder.js',
    'employeeSeeder.js',
    'forwarderPartnerSeeder.js',
    'forwarderAreaSeeder.js',
    'forwarderRateSeeder.js',
    'serviceAreaSeeder.js',
    'customerSeeder.js',
  ],
  
  // Environment-specific configurations
  environments: {
    development: {
      dropDatabase: false,
      logLevel: 'verbose', // 'verbose', 'normal', 'quiet'
    },
    test: {
      dropDatabase: true,
      logLevel: 'normal',
    },
    production: {
      dropDatabase: false,
      logLevel: 'quiet',
      // In production, only run specific seeders
      allowedSeeders: ['roleSeeder.js'],
    },
  },
};

/**
 * Get configuration for the current environment
 * @returns {Object} Seeder configuration
 */
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = defaultConfig.environments[env] || defaultConfig.environments.development;
  
  return {
    ...defaultConfig,
    ...envConfig,
    currentEnv: env,
  };
};

/**
 * Get list of available seeders
 * @returns {Array<string>} List of seeder filenames
 */
const getAvailableSeeders = () => {
  const config = getConfig();
  const seedersDir = config.seedersDir;
  
  try {
    const files = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.js') && !file.startsWith('_'));
    
    // If we're in production, only return allowed seeders
    if (config.currentEnv === 'production' && config.allowedSeeders) {
      return files.filter(file => config.allowedSeeders.includes(file));
    }
    
    return files;
  } catch (error) {
    console.error(`Error reading seeders directory: ${error.message}`);
    return [];
  }
};

/**
 * Get ordered list of seeders to run
 * @returns {Array<string>} Ordered list of seeder filenames
 */
const getOrderedSeeders = () => {
  const config = getConfig();
  const availableSeeders = getAvailableSeeders();
  
  // Create a map for O(1) lookup
  const availableSeedersMap = availableSeeders.reduce((acc, file) => {
    acc[file] = true;
    return acc;
  }, {});
  
  // Filter the ordered list to only include available seeders
  const orderedSeeders = config.seederOrder
    .filter(file => availableSeedersMap[file]);
  
  // Add any seeders that aren't in the ordered list at the end
  const remainingSeeders = availableSeeders
    .filter(file => !config.seederOrder.includes(file));
  
  return [...orderedSeeders, ...remainingSeeders];
};

module.exports = {
  getConfig,
  getAvailableSeeders,
  getOrderedSeeders,
};
