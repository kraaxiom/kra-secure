const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");
const { obfuscate } = require("./obfuscate");
const { computeHash, signFile, generateRuntimeGuard } = require("./signer");

// Build a single entry point.
async function buildOne(config) {
  const inputFile = path.resolve(process.cwd(), config.input);
  const outputFile = path.resolve(process.cwd(), config.output);
  const mode = config.mode || "production";

  if (!fs.existsSync(inputFile)) {
    throw new Error("Fichier d'entrée introuvable: " + inputFile);
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  // Debug mode: bundle only, source maps, no obfuscation
  if (mode === "debug") {
    await esbuild.build({
      entryPoints: [inputFile],
      bundle: true,
      minify: false,
      outfile: outputFile,
      platform: "browser",
      sourcemap: true,
      define: { "process.env.NODE_ENV": '"development"' }
    });
    const stats = fs.statSync(outputFile);
    return { output: outputFile, mode: "debug", obfuscated: false, size: stats.size };
  }

  // Production: bundle → obfuscate → optionally sign
  const tmpFile = outputFile + ".__kra_tmp__";
  try {
    await esbuild.build({
      entryPoints: [inputFile],
      bundle: true,
      minify: false,
      outfile: tmpFile,
      platform: "browser",
      define: { "process.env.NODE_ENV": '"production"' }
    });

    const bundled = fs.readFileSync(tmpFile, "utf8");
    const obfuscated = obfuscate(bundled, config.options || {});

    var finalCode = obfuscated;
    var sigInfo = null;
    const at = config.antiTampering || {};

    if (at.enabled || at.signature) {
      const algorithm = at.algorithm || "sha256";
      const hash = computeHash(obfuscated, algorithm);

      if (at.signature) {
        const guard = generateRuntimeGuard(hash, at);
        finalCode = guard + "\n" + obfuscated;
      }
    }

    fs.writeFileSync(outputFile, finalCode, "utf8");

    if (at.enabled || at.signature) {
      try {
        sigInfo = signFile(outputFile, { algorithm: at.algorithm || "sha256" });
      } catch (_) {
        // Non-fatal: signing failed, build still succeeds
      }
    }

    const stats = fs.statSync(outputFile);
    return {
      output: outputFile,
      mode: "production",
      obfuscated: true,
      size: stats.size,
      signature: sigInfo
    };
  } finally {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }
}

// Resolve the [name] placeholder in output paths (for multi-file builds).
function resolveOutputPath(outputPattern, inputFile) {
  const name = path.basename(inputFile, path.extname(inputFile));
  return outputPattern.replace(/\[name\]/g, name);
}

// Main build function — accepts a pre-loaded config or a plain options object.
async function build(configOrOptions) {
  configOrOptions = configOrOptions || {};

  // If not pre-loaded, merge with any config file on disk
  var config;
  if (configOrOptions._isLoaded) {
    config = configOrOptions;
  } else {
    const fileConfig = loadConfig(configOrOptions.configPath);
    config = Object.assign(fileConfig, configOrOptions, { _isLoaded: true });
  }

  // Multi-file input (array of entry points)
  if (Array.isArray(config.input)) {
    const results = [];
    for (const inputFile of config.input) {
      const resolvedOutput = resolveOutputPath(config.output, inputFile);
      const single = Object.assign({}, config, {
        input: inputFile,
        output: resolvedOutput,
        _isLoaded: true
      });
      results.push(await buildOne(single));
    }
    return results;
  }

  return buildOne(config);
}

module.exports = { build };
