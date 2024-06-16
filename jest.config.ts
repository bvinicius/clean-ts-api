/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
    transform: {
        '.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main/**'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    preset: '@shelf/jest-mongodb',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testEnvironment: 'node',
};

export default config;
