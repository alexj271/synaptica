module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {presets: ['module:@react-native/babel-preset']},
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@reduxjs/toolkit|immer|uuid)/)',
  ],
};
