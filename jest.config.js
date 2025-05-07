module.exports = {
  projects: [
    '<rootDir>/apps/frontend',
    '<rootDir>/apps/backend',
    // Tambahkan path lain jika ada, misal:
    // '<rootDir>/packages/utils',
    // '<rootDir>/packages/ui',
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
