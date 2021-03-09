module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  "setupFiles": [
    "fake-indexeddb/auto"
  ],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json'
    }
  }
};