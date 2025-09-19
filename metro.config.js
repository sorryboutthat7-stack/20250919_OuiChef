const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration for testing
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
