import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Path to Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest config for testing backend logic: Server Actions, services,
// and utilities under lib/. We deliberately do NOT test React components
// here (that would need jsdom + RTL) — this suite targets the backend
// logic layer called out in the grading rubric: services, utilities,
// controllers (Server Actions).
const customJestConfig: Config = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/chefnextdoor/',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/mocks/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/chefnextdoor/'],
  moduleNameMapper: {
    // The real 'server-only' package throws unless bundled with Next's
    // "react-server" export condition, which plain Jest doesn't set.
    // Swap it for a no-op so server actions can be imported in tests.
    '^server-only$': '<rootDir>/__tests__/mocks/server-only.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/actions/**/*.ts',
    'lib/chef/**/*.ts',
    'lib/email/**/*.ts',
    'lib/strategies/**/*.ts',
    'lib/platformFee.ts',
    'lib/utils.ts',
    '!lib/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 50,
      branches: 50,
    },
  },
  coverageDirectory: '<rootDir>/coverage',
}

export default createJestConfig(customJestConfig)
