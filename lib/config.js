const fs = require("fs");
const path = require("path");

const DEFAULTS = {
  input: "src/main.js",
  output: "dist/app.secure.js",
  mode: "production",
  platform: "browser",
  options: {
    level: "low",
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    stringArray: false,
    selfDefending: false
  },
  watch: {
    enabled: false,
    patterns: ["src/**/*.js"],
    ignore: ["node_modules/**", "dist/**", ".git/**"],
    debounce: 300,
    depth: 10,
    followSymlinks: false,
    usePolling: false,
    initialBuild: true,
    continueOnError: true,
    notify: true
  },
  antiTampering: {
    enabled: false,
    signature: false,
    algorithm: "sha256",
    onTamperDetected: "block",
    callback: "window.__onTamperDetected",
    redirectUrl: "/security-error",
    checkInterval: 0,
    selfDefending: false
  }
};

function deepMerge(target, source) {
  const result = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(tgtVal, srcVal);
    } else {
      result[key] = srcVal;
    }
  }
  return result;
}

function loadConfig(configPath) {
  const candidates = configPath
    ? [path.resolve(process.cwd(), configPath)]
    : [
        path.resolve(process.cwd(), "kra-secure.config.js"),
        path.resolve(process.cwd(), "kra-secure.config.json"),
        path.resolve(process.cwd(), ".krasecurerc.js"),
        path.resolve(process.cwd(), ".krasecurerc.json")
      ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        // Clear cache to allow hot-reload during watch
        delete require.cache[require.resolve(candidate)];
        const userConfig = candidate.endsWith(".json")
          ? JSON.parse(fs.readFileSync(candidate, "utf8"))
          : require(candidate);
        return deepMerge(DEFAULTS, userConfig);
      } catch (err) {
        throw new Error(`Erreur config "${path.basename(candidate)}": ${err.message}`);
      }
    }
  }

  return deepMerge({}, DEFAULTS);
}

function generateDefaultConfig() {
  return `module.exports = {
  // Fichier d'entrée (relatif à la racine du projet)
  input: "src/main.js",

  // Fichier de sortie
  output: "dist/app.secure.js",

  // Mode de build: "production" (obfusqué) ou "debug" (lisible + source maps)
  mode: "production",

  // Cible esbuild: "browser" | "node" | "neutral"
  platform: "browser",

  // Options d'obfuscation
  options: {
    // Niveau de protection: "low" | "medium" | "high"
    level: "medium",

    // Supprimer les espaces et retours à la ligne
    compact: true,

    // Aplatissement du flux de contrôle
    controlFlowFlattening: true,

    // Injection de code mort
    deadCodeInjection: false,

    // Protection anti-débogage
    debugProtection: false,

    // Encodage des chaînes de caractères
    stringArray: true,

    // Auto-défense contre le reformatage
    selfDefending: false
  },

  // Configuration du mode watch
  watch: {
    patterns: ["src/**/*.js"],
    ignore: ["node_modules/**", "dist/**"],
    debounce: 300,
    initialBuild: true,
    continueOnError: true
  },

  // Anti-tampering (signature de fichiers)
  antiTampering: {
    enabled: false,
    signature: false,
    algorithm: "sha256",
    onTamperDetected: "block" // "block" | "callback" | "redirect"
  }
};
`;
}

module.exports = { loadConfig, deepMerge, generateDefaultConfig, DEFAULTS };
