const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withRozenite } = require('@rozenite/metro');
const {
  withRozeniteReduxDevTools,
} = require('@rozenite/redux-devtools-plugin/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {});

module.exports = withRozenite(config, {
  enabled: true, // ⚠️ скоро станет обязательным
  enhanceMetroConfig: (config) => withRozeniteReduxDevTools(config),
});

