module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true, // Enable Jest globals
  },
  extends: [
    'airbnb-base', // Following the Airbnb Style Guide as specified in Windsurf Rules
    'plugin:jest/recommended', // Add recommended Jest rules
  ],
  plugins: [
    'jest', // Enable the Jest plugin
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Customize rules as needed
    'no-underscore-dangle': ['error', { allow: ['_id'] }], // Allow _id for MongoDB
    // Disallow console.log but allow console.warn and console.error
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // Limit line length to 100 characters as specified in Windsurf Rules
    'max-len': ['error', { code: 100 }],
    'no-param-reassign': ['error', { props: false }], // Allow modifying properties of parameters
  },
  overrides: [
    // Override settings for test files
    {
      files: ['**/*.test.js', '**/__tests__/**/*.js', '**/__mocks__/**/*.js'],
      env: {
        jest: true,
      },
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
  ],
};
