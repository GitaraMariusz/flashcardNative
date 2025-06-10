const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// To jest magiczna linia, która wyłącza problematyczną funkcję.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;