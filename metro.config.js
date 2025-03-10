const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

// Adaugă suport pentru fișiere `.mjs` și `.cjs`
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = config;
