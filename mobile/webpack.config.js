const path = require('path');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: 'development',
    platform: 'web'
  }, argv);
  
  // Ensure the entry point is correct
  config.entry = './index.ts';
  
  // Add resolve aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };
  
  // Configure dev server
  config.devServer = {
    port: 8082,
    hot: true,
    open: true,
    historyApiFallback: true,
  };
  
  return config;
};
