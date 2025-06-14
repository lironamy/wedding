// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom', // Use jsdom for testing React components
  preset: 'ts-jest', // Use ts-jest for TypeScript files
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Optional: for extended Jest matchers
  moduleNameMapper: {
    // Handle CSS imports (if you use CSS Modules, etc.)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Alias for imports like @/components/*
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    // Use babel-jest to transpile tests with Babel configuration (good for Next.js projects)
    // Ensure this path is correct
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  // Ignore Next.js build directory and node_modules
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Collect coverage from these files
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!app/**/*.test.{ts,tsx}', // Exclude test files
    '!components/**/*.test.{ts,tsx}',
    '!lib/**/*.test.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    // Exclude files that are mostly configuration or declarations
    '!**/*.config.js',
    '!**/*.d.ts',
    '!app/layout.tsx', // Often simple, can be excluded
    '!app/api/**/route.ts', // API routes will be tested differently (integration)
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover'], // Coverage report formats
};
