# kra-secure

> Advanced JavaScript obfuscation and secure build tool — CLI + programmatic API

[![npm version](https://img.shields.io/npm/v/kra-secure.svg)](https://www.npmjs.com/package/kra-secure)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

kra-secure bundles your JavaScript with **esbuild** then applies advanced obfuscation via **javascript-obfuscator** — renaming, control-flow flattening, string encoding, anti-debugging, and more. It also ships a file-signing system for deployment integrity checks.

---

## Features

- **3 protection levels** — `low`, `medium`, `high`
- **Debug / Production modes** — readable bundle with source maps in dev, fully obfuscated in prod
- **Watch mode** — auto-rebuild on file changes with debounce and lifecycle hooks
- **Anti-tampering** — SHA-256/SHA-512 file signing, CLI verification, optional runtime guard injection
- **Multi-file input** — array of entry points with `[name]` pattern in output path
- **Config file** — `kra-secure.config.js` with deep-merge defaults
- **Programmatic API** — `Obfuscator` class extending `EventEmitter`, `buildDirectory()`, and more

---

## Installation

```bash
# Local (recommended)
npm install --save-dev kra-secure

# Global
npm install -g kra-secure
```

**Requirements:** Node.js ≥ 18

---

## Quick Start

```bash
# Generate a default config file
npx kra-secure init

# Build (production, obfuscated)
npx kra-secure build

# Build in debug mode (readable + source maps)
npx kra-secure build --mode debug

# Watch mode
npx kra-secure watch
```

---

## CLI Reference

```
kra-secure <command> [options]

Commands:
  build              Bundle and obfuscate the project
  watch              Watch for changes and rebuild automatically
  sign  <file>       Sign a built file (creates <file>.sig)
  verify <file>      Verify a signed file against its .sig
  init               Generate a default kra-secure.config.js
  version            Print the version

Options:
  -i, --input  <file>    Entry file          (default: src/main.js)
  -o, --output <file>    Output file         (default: dist/app.secure.js)
  -m, --mode   <mode>    production | debug  (default: production)
  -l, --level  <level>   low | medium | high (default: low)
  -c, --config <file>    Path to config file
  -a, --algorithm <algo> sha256 | sha512     (default: sha256)
```

### Examples

```bash
# High-protection production build
kra-secure build --level high

# Custom paths
kra-secure build --input src/app.js --output public/app.min.js

# Sign a dist file for deployment verification
kra-secure sign dist/app.secure.js
kra-secure verify dist/app.secure.js

# Watch with a specific level
kra-secure watch --level medium
```

---

## Configuration File

Run `kra-secure init` to generate `kra-secure.config.js`, or create it manually:

```js
// kra-secure.config.js
module.exports = {
  input: "src/main.js",
  output: "dist/app.secure.js",
  mode: "production", // "production" | "debug"

  options: {
    level: "medium",              // "low" | "medium" | "high"
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: false,
    debugProtection: false,
    stringArray: true,
    selfDefending: false
  },

  watch: {
    patterns: ["src/**/*.js"],
    ignore: ["node_modules/**", "dist/**"],
    debounce: 300,
    initialBuild: true,
    continueOnError: true,
    // Lifecycle hooks
    onStart:        (config) => {},
    onFileChange:   (filePath, event) => {},
    onBeforeBuild:  () => {},
    onAfterBuild:   (result) => {},
    onError:        (err) => {},
    onStop:         () => {}
  },

  antiTampering: {
    enabled: false,
    signature: false,           // embed runtime hash guard in output
    algorithm: "sha256",
    onTamperDetected: "block",  // "block" | "callback" | "redirect"
    callback: "window.__onTamperDetected",
    redirectUrl: "/security-error",
    checkInterval: 5000         // ms, 0 = disabled
  }
};
```

---

## Protection Levels

| Feature | `low` | `medium` | `high` |
|---|:---:|:---:|:---:|
| Hex identifier renaming | ✓ | ✓ | ✓ |
| Compact output | ✓ | ✓ | ✓ |
| Control-flow flattening | — | 50% | 100% |
| String array + encoding | — | base64 | RC4 |
| Dead code injection | — | — | ✓ |
| Anti-debugging | — | — | ✓ |
| Console output disabled | — | — | ✓ |
| Self-defending | — | — | ✓ |
| Object keys transform | — | — | ✓ |

---

## Programmatic API

```js
const kraSecure = require("kra-secure");

// Simple build
const result = await kraSecure.build({
  input: "src/main.js",
  output: "dist/app.secure.js",
  options: { level: "high" }
});
console.log(result.output, result.size);

// Obfuscator class with events
const { Obfuscator } = require("kra-secure");

const obs = new Obfuscator({
  input: "src/main.js",
  output: "dist/app.secure.js",
  options: { level: "medium" }
});

obs.on("start",  (cfg)    => console.log("Starting..."));
obs.on("build",  (result) => console.log("Done →", result.output));
obs.on("error",  (err)    => console.error(err.message));

await obs.build();

// Watch mode
const handle = await obs.watch();
// handle.stop() to stop watching

// Build all .js files in a directory
const results = await obs.buildDirectory("src", "dist");

// Anti-tampering: sign & verify
await kraSecure.sign("dist/app.secure.js");                // creates .sig file
const check = kraSecure.verify("dist/app.secure.js");      // { valid, hash, signedAt }
```

### Build Result Object

```js
{
  output:     "dist/app.secure.js", // absolute path
  mode:       "production",
  obfuscated: true,
  size:       12345,               // bytes
  signature:  {                    // null when antiTampering is off
    hash:      "a3f...",
    sigPath:   "dist/app.secure.js.sig",
    algorithm: "sha256",
    timestamp: "2026-01-01T00:00:00.000Z"
  }
}
```

---

## Anti-Tampering

kra-secure supports two complementary integrity mechanisms:

### 1. File signing (CLI / CI-CD)

```bash
# After building, sign the output
kra-secure sign dist/app.secure.js
# → creates dist/app.secure.js.sig (JSON with SHA-256 hash + timestamp)

# Before deploying or in CI, verify nothing changed
kra-secure verify dist/app.secure.js
# ✔  Integrity check passed   OR   ✖  FAILED (with expected vs actual hash)
```

### 2. Runtime guard (browser)

Enable in `kra-secure.config.js`:

```js
antiTampering: {
  enabled: true,
  signature: true,            // injects a guard IIFE at the top of the output
  onTamperDetected: "block"   // throw Error on mismatch
}
```

The injected guard exposes `window.__kraSecure.verify(hash)` — call it from your server-side script-src check or a fetch-based SRI verification.

---

## Project Structure

```
your-project/
├── src/
│   └── main.js          ← your source code
├── dist/
│   └── app.secure.js    ← obfuscated output (deploy this only)
└── kra-secure.config.js ← optional configuration
```

> **Security note:** Only ever deploy the `dist/` folder. Never ship `src/` to production.

---

## Multi-file build

```js
module.exports = {
  input: ["src/main.js", "src/worker.js"],
  output: "dist/[name].secure.js",   // [name] = basename without extension
  options: { level: "medium" }
};
```

---

## npm scripts integration

```json
{
  "scripts": {
    "build":   "kra-secure build",
    "build:debug": "kra-secure build --mode debug",
    "watch":   "kra-secure watch",
    "sign":    "kra-secure sign dist/app.secure.js",
    "verify":  "kra-secure verify dist/app.secure.js"
  }
}
```

---

## License

[MIT](LICENSE) — © 2026 [KraAxiom](https://github.com/KraAxiom)
