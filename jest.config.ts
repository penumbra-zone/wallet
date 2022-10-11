module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true,
      autoMapModuleNames: true,
    },
  },
  // transformIgnorePatterns: ['node_modules/(?!penumbra-web-assembly)/'],
  transformIgnorePatterns: ['node_modules/(?!penumbra-web-assembly/)'],
 
};
