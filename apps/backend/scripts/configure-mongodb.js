/**
 * Samudra Paket ERP - MongoDB Configuration Helper
 * Helps configure the correct MongoDB connection string for MongoDB Compass
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Path to .env file
const envFilePath = path.resolve(__dirname, '../.env');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Ask a question and get user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Update .env file with new MongoDB connection string
 * @param {string} uri - MongoDB URI
 * @param {string} username - MongoDB username
 * @param {string} password - MongoDB password
 */
function updateEnvFile(uri, username, password) {
  try {
    // Read existing .env file
    let envContent = '';

    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');

      // Update MongoDB URI
      if (envContent.includes('MONGODB_URI=')) {
        envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI=${uri}`);
      } else {
        envContent += `\nMONGODB_URI=${uri}`;
      }

      // Update MongoDB username
      if (envContent.includes('MONGODB_USER=')) {
        envContent = envContent.replace(/MONGODB_USER=.*/g, `MONGODB_USER=${username}`);
      } else {
        envContent += `\nMONGODB_USER=${username}`;
      }

      // Update MongoDB password
      if (envContent.includes('MONGODB_PASSWORD=')) {
        envContent = envContent.replace(/MONGODB_PASSWORD=.*/g, `MONGODB_PASSWORD=${password}`);
      } else {
        envContent += `\nMONGODB_PASSWORD=${password}`;
      }
    } else {
      // Create new .env file
      envContent = `NODE_ENV=development\nPORT=5000\nMONGODB_URI=${uri}\nMONGODB_USER=${username}\nMONGODB_PASSWORD=${password}\nJWT_SECRET=dev_jwt_secret\nJWT_EXPIRES_IN=1h\nJWT_REFRESH_SECRET=dev_jwt_refresh_secret\nJWT_REFRESH_EXPIRES_IN=7d`;
    }

    // Write updated content to .env file
    fs.writeFileSync(envFilePath, envContent);
    console.log('\n.env file updated with MongoDB connection details');
  } catch (error) {
    console.error('Error updating .env file:', error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n=== Samudra Paket ERP - MongoDB Configuration Helper ===\n');

  console.log('This script will help you configure the MongoDB connection for the Samudra Paket ERP backend.');
  console.log('If you\'re using MongoDB Compass, you can copy the connection string from there.\n');

  // Get MongoDB connection details
  const useCompass = await askQuestion('Are you using MongoDB Compass? (y/n): ');

  if (useCompass.toLowerCase() === 'y') {
    console.log('\nIn MongoDB Compass:');
    console.log('1. Click on "Connect" > "New Connection"');
    console.log('2. Copy the connection string (e.g., mongodb://localhost:27017)\n');

    const compassUri = await askQuestion('Enter the MongoDB Compass connection string: ');
    const dbName = await askQuestion('Enter the database name (default: samudra_paket): ') || 'samudra_paket';
    const username = await askQuestion('Enter MongoDB username (leave empty if none): ');
    const password = await askQuestion('Enter MongoDB password (leave empty if none): ');

    // Construct MongoDB URI
    let uri = compassUri;

    // Add database name if not included
    if (!uri.includes('/samudra_paket') && !uri.includes(`/${dbName}`)) {
      uri = uri.endsWith('/') ? `${uri}${dbName}` : `${uri}/${dbName}`;
    }

    // Update .env file
    updateEnvFile(uri, username, password);

    console.log('\nMongoDB configuration completed!');
    console.log(`Connection string: ${uri}`);
    console.log(`Username: ${username || 'None'}`);
    console.log(`Password: ${password ? '********' : 'None'}`);
    console.log(`Database: ${dbName}`);
  } else {
    const host = await askQuestion('Enter MongoDB host (default: localhost): ') || 'localhost';
    const port = await askQuestion('Enter MongoDB port (default: 27017): ') || '27017';
    const dbName = await askQuestion('Enter the database name (default: samudra_paket): ') || 'samudra_paket';
    const username = await askQuestion('Enter MongoDB username (leave empty if none): ');
    const password = await askQuestion('Enter MongoDB password (leave empty if none): ');

    // Construct MongoDB URI
    const uri = `mongodb://${host}:${port}/${dbName}`;

    // Update .env file
    updateEnvFile(uri, username, password);

    console.log('\nMongoDB configuration completed!');
    console.log(`Connection string: ${uri}`);
    console.log(`Username: ${username || 'None'}`);
    console.log(`Password: ${password ? '********' : 'None'}`);
    console.log(`Database: ${dbName}`);
  }

  console.log('\nYou can now run the user seeder script:');
  console.log('node src/infrastructure/database/seeds/userSeeder.js');

  rl.close();
}

// Run main function
main();
