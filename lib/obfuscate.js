const JavaScriptObfuscator = require("javascript-obfuscator");

// Presets per protection level — these are the base options for each tier.
// Individual options in user config override the preset value.
const LEVEL_PRESETS = {
  low: {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: false,
    stringArray: false,
    unicodeEscapeSequence: false
  },
  medium: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: false,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
  },
  high: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    renameGlobals: false,
    selfDefending: true,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ["rc4"],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
  }
};

function buildObfuscatorOptions(userOptions) {
  const level = userOptions.level || "low";
  if (!LEVEL_PRESETS[level]) {
    throw new Error(
      'Niveau d\'obfuscation invalide: "' + level + '". ' +
        "Valeurs acceptées: " + Object.keys(LEVEL_PRESETS).join(", ") + "."
    );
  }
  const preset = Object.assign({}, LEVEL_PRESETS[level]);

  // Apply per-option overrides on top of the preset
  const overridable = [
    "compact",
    "controlFlowFlattening",
    "deadCodeInjection",
    "debugProtection",
    "selfDefending",
    "stringArray",
    "disableConsoleOutput",
    "renameGlobals",
    "unicodeEscapeSequence"
  ];

  for (const key of overridable) {
    if (typeof userOptions[key] !== "undefined") {
      preset[key] = userOptions[key];
    }
  }

  // Disable string array sub-options when stringArray is forced off
  if (preset.stringArray === false) {
    preset.stringArrayEncoding = [];
    preset.stringArrayThreshold = 0;
    delete preset.stringArrayCallsTransform;
    delete preset.stringArrayIndexShift;
    delete preset.stringArrayRotate;
    delete preset.stringArrayShuffle;
  }

  return preset;
}

function obfuscate(code, userOptions) {
  const opts = buildObfuscatorOptions(userOptions || {});
  try {
    const result = JavaScriptObfuscator.obfuscate(code, opts);
    return result.getObfuscatedCode();
  } catch (err) {
    throw new Error("Échec de l'obfuscation: " + err.message);
  }
}

module.exports = { obfuscate, LEVEL_PRESETS, buildObfuscatorOptions };
