module.exports = {
  displayName: 'jest:test',
  runner: 'jest-runner-mocha',
  testMatch: ['<rootDir>/tests/**/*.js'],
  testEnvironment: 'node',
  collectCoverageFrom: ['<rootDir>/src/**/*.{js}'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testPathIgnorePatterns: ['mocks']
}
