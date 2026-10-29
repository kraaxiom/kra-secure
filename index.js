"use strict";

const EventEmitter = require("events");
const fs           = require("fs");
const path         = require("path");
const { build }        = require("./lib/build");
const { loadConfig, generateDefaultConfig, deepMerge } = require("./lib/config");
const { signFile, verifyFile } = require("./lib/signer");
const { startWatch, stop: stopWatch } = require("./lib/watch");

// ─── Obfuscator class ─────────────────────────────────────────────────────────

class Obfuscator extends EventEmitter {
  constructor(userConfig) {
    super();
    userConfig = userConfig || {};
    const base = loadConfig(userConfig.configPath);
    this._config = Object.assign(deepMerge(base, userConfig), { _isLoaded: true });
  }

  // Build the project and emit events
  async build() {
    this.emit("start", this._config);
    try {
      const result = await build(this._config);
      this.emit("build", result);
      return result;
    } catch (err) {
      this.emit("error", err);
      throw err;
    }
  }

  // Start watch mode; returns { stop } handle
  watch() {
    const self = this;
    this.emit("watch:start", this._config);

    // Wire internal hooks to EventEmitter events
    const config = Object.assign({}, this._config);
    config.watch = Object.assign({}, config.watch, {
      onFileChange:  function (filePath, event) { self.emit("file:change", filePath, event); },
      onBeforeBuild: function ()         { self.emit("build:before"); },
      onAfterBuild:  function (result)   { self.emit("build:after", result); },
      onError:       function (err)      { self.emit("error", err); },
      onStop:        function ()         { self.emit("watch:stop"); }
    });

    return startWatch(config);
  }

  // Build all .js files found in srcDir → outDir, preserving relative paths
  async buildDirectory(srcDir, outDir) {
    srcDir = path.resolve(process.cwd(), srcDir);
    outDir = path.resolve(process.cwd(), outDir);
    const files   = collectJsFiles(srcDir);
    const results = [];

    for (const file of files) {
      const rel     = path.relative(srcDir, file);
      const outFile = path.join(outDir, rel);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });

      const cfg = Object.assign({}, this._config, {
        input:      file,
        output:     outFile,
        _isLoaded:  true
      });

      const result = await build(cfg);
      this.emit("build", result);
      results.push(result);
    }

    return results;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectJsFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules") {
      results.push(...collectJsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(full);
    }
  }
  return results;
}

// ─── Public API ───────────────────────────────────────────────────────────────

module.exports = {
  Obfuscator,

  // Shorthand: build a project from a config object
  build: function (config) {
    return new Obfuscator(config).build();
  },

  // Shorthand: sign / verify a file
  sign:   signFile,
  verify: verifyFile,

  // Config utilities
  loadConfig,
  generateDefaultConfig,

  // Watch (raw, without the EventEmitter wrapper)
  watch:     startWatch,
  stopWatch: stopWatch
};
