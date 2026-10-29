# 🔐 kra-secure

> **Advanced JavaScript Obfuscation & Anti-Tampering CLI**  
> Enterprise-grade protection for your Node.js applications with battle-tested security practices.

<div align="center">

[![npm version](https://img.shields.io/npm/v/kra-secure?style=flat-square&logo=npm)](https://www.npmjs.com/package/kra-secure)
[![npm downloads](https://img.shields.io/npm/dm/kra-secure?style=flat-square&logo=npm)](https://www.npmjs.com/package/kra-secure)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/kraaxiom/kra-secure?style=flat-square&logo=github)](https://github.com/kraaxiom/kra-secure/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/kraaxiom/kra-secure?style=flat-square&logo=github)](https://github.com/kraaxiom/kra-secure/issues)

**[🌐 Website](https://www.krabuild.site) • [📚 Documentation](https://github.com/kraaxiom/kra-secure#documentation) • [🚀 Quick Start](#quick-start) • [💬 Discussions](https://github.com/kraaxiom/kra-secure/discussions)**

</div>

---

## 🎯 Why kra-secure?

Your JavaScript code is your intellectual property. **kra-secure** protects it with:

| Feature | Benefit |
|---------|---------|
| **🔒 Multi-layer Obfuscation** | Control-flow flattening, string encoding, variable renaming |
| **⚡ Anti-Tampering** | SHA-256/512 signatures, runtime integrity checks, tamper detection |
| **🛡️ 3 Protection Levels** | Choose between `low`, `medium`, `high` based on your security needs |
| **⚙️ Build & Watch Modes** | Seamless integration into your development workflow |
| **🔌 Programmatic API** | Full EventEmitter support + CLI for flexibility |
| **📦 Compact Output** | Optimized bundle sizes with no bloat |
| **🌍 Multi-platform** | Works on Windows, macOS, Linux (+ CLI executables available) |

---

## 🚀 Quick Start

### Installation

```bash
# Local (recommended for projects)
npm install --save-dev kra-secure

# Global (for system-wide CLI)
npm install -g kra-secure

# Requirements: Node.js ≥ 18
```

### 30-second example

```bash
# Generate a default config
npx kra-secure init

# Build & obfuscate
npx kra-secure build

# Watch mode (auto-rebuild)
npx kra-secure watch

# Sign for integrity verification
npx kra-secure sign dist/app.secure.js
```

---

## 📖 Documentation

### CLI Commands

```
kra-secure <command> [options]

Commands:
  build              Bundle and obfuscate JavaScript
  watch              Watch files and auto-rebuild
  sign <file>        Create integrity signature
  verify <file>      Verify file integrity
  init               Generate config template
  version            Show version info

Global Options:
  -i, --input <file>    Entry point       (default: src/main.js)
  -o, --output <file>   Output file       (default: dist/app.secure.js)
  -m, --mode <mode>     production|debug  (default: production)
  -p, --platform <plat> browser|node|neutral (default: browser)
  -l, --level <level>   low|medium|high   (default: low)
  -c, --config <file>   Config file path
  -a, --algorithm <algo> sha256|sha512    (default: sha256)
```

### Examples

```bash
# High-security production build
kra-secure build --level high

# Custom paths
kra-secure build --input src/app.js --output dist/app.min.js

# Sign & verify for CI/CD
kra-secure sign dist/app.secure.js
kra-secure verify dist/app.secure.js

# Watch with medium protection
kra-secure watch --level medium
```

### Configuration File

Create `kra-secure.config.js` (or run `npx kra-secure init`):

```javascript
module.exports = {
  input: "src/main.js",
  output: "dist/app.secure.js",
  mode: "production",  // or "debug"

  options: {
    level: "medium",              // Protection level
    compact: true,                // Minify output
    controlFlowFlattening: true,  // Flatten control flow
    deadCodeInjection: false,     // Inject dummy code
    debugProtection: false,       // Prevent debugging
    stringArray: true,            // Encode strings
    selfDefending: false          // Runtime protection
  },

  watch: {
    patterns: ["src/**/*.js"],
    ignore: ["node_modules/**", "dist/**"],
    debounce: 300,
    onAfterBuild: (result) => console.log("Built:", result.output)
  },

  antiTampering: {
    enabled: true,
    algorithm: "sha256",
    onTamperDetected: "block"  // or "callback" or "redirect"
  }
};
```

---

## 🛡️ Protection Levels Comparison

| Feature | `low` | `medium` | `high` |
|---------|:-----:|:--------:|:------:|
| Hex Renaming | ✅ | ✅ | ✅ |
| Compact Output | ✅ | ✅ | ✅ |
| Control-flow Flattening | — | 50% | 100% |
| String Encoding | — | Base64 | RC4 |
| Dead Code Injection | — | — | ✅ |
| Anti-debugging | — | — | ✅ |
| Console Blocking | — | — | ✅ |
| Self-defending | — | — | ✅ |

---

## 💻 Programmatic API

Use kra-secure in your Node.js scripts:

```javascript
const kraSecure = require("kra-secure");

// Simple build
const result = await kraSecure.build({
  input: "src/main.js",
  output: "dist/app.secure.js",
  options: { level: "high" }
});

console.log(`Built: ${result.output} (${result.size} bytes)`);
```

### Using the Obfuscator Class

```javascript
const { Obfuscator } = require("kra-secure");

const obs = new Obfuscator({
  input: "src/main.js",
  output: "dist/app.secure.js",
  options: { level: "medium" }
});

// Event-driven workflow
obs.on("start", (cfg) => console.log("Starting build..."));
obs.on("build", (result) => console.log("Done!"));
obs.on("error", (err) => console.error(err.message));

// Execute build
await obs.build();

// Or watch for changes
const handle = await obs.watch();
// handle.stop() to stop watching
```

---

## 🔐 Anti-Tampering

### File Signing (CI/CD)

```bash
# After build, create integrity signature
kra-secure sign dist/app.secure.js
# → dist/app.secure.js.sig created

# Before deployment, verify
kra-secure verify dist/app.secure.js
# ✔ Integrity check passed
```

### Runtime Protection

Enable in `kra-secure.config.js`:

```javascript
antiTampering: {
  enabled: true,
  signature: true,
  onTamperDetected: "block"  // throw error if tampered
}
```

The injected runtime guard is **opt-in**: nothing runs until your application
calls `window.__kraSecure.verify(hash)` with a hash obtained out-of-band (e.g.
an SRI value or a trusted endpoint). File-level integrity comes from the
generated `.sig` file (or SRI), not from the hash embedded in the bundle.

---

## 🔒 What this does — and does not — protect

Being honest about the threat model matters more than marketing.

**What kra-secure gives you**
- **Obfuscation** that makes casual reading and copy-paste reuse of your code
  much harder, and raises the cost of reverse engineering.
- **Integrity signatures** (`.sig`) so you can detect whether a built file was
  altered between build and deployment.

**What it does _not_ give you**
- It is **not** encryption and **not** a security boundary. Anyone who runs your
  code controls the runtime and can, with enough effort, deobfuscate it, read
  every string and secret, and remove any client-side guard.
- Obfuscation does **not** protect API keys, passwords, or other secrets shipped
  in client code. Keep secrets on the server.
- The runtime guard is a tripwire for accidental corruption, not protection
  against a determined attacker.

Use kra-secure to protect intellectual property and detect tampering — not as
your only line of defense.

---

## 📁 Project Structure

```
your-project/
├── src/
│   └── main.js              ← Your source code
├── dist/
│   ├── app.secure.js        ← Obfuscated output
│   └── app.secure.js.sig    ← Integrity signature
├── kra-secure.config.js     ← Configuration
└── package.json
```

**⚠️ Security Rule:** Only deploy the `dist/` folder in production. Never ship `src/`.

---

## 🔄 Multi-file Builds

```javascript
// kra-secure.config.js
module.exports = {
  input: ["src/main.js", "src/worker.js"],
  output: "dist/[name].secure.js",  // [name] = filename without extension
  options: { level: "medium" }
};
```

---

## 📦 npm Scripts Integration

```json
{
  "scripts": {
    "build": "kra-secure build",
    "build:debug": "kra-secure build --mode debug",
    "watch": "kra-secure watch",
    "sign": "kra-secure sign dist/app.secure.js",
    "verify": "kra-secure verify dist/app.secure.js"
  }
}
```

---

## 🎓 Use Cases

✅ **Web Apps** — Protect SPA bundles from reverse engineering  
✅ **APIs** — Secure server-side business logic  
✅ **Electron Apps** — Hide compiled JS in desktop applications  
✅ **Hybrid Apps** — Protect Cordova/React Native assets  
✅ **Compliance** — Meet IP protection requirements  
✅ **Benchmarking** — Prevent performance analysis attacks  

---

## ⚙️ How It Works

1. **Bundle** — Uses `esbuild` to create a compact bundle from your entry point(s)
2. **Obfuscate** — Applies `javascript-obfuscator` with your chosen protection level
3. **Sign** — Optionally generates SHA-256/512 signatures for integrity checks
4. **Deploy** — Output to `dist/` for production deployment

**Performance:** Typical build time: <2s for medium projects. Supports incremental builds in watch mode.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Testing guidelines
- Pull request process
- Code of conduct

```bash
# Local development
git clone https://github.com/kraaxiom/kra-secure.git
cd kra-secure
npm install
npm run build
```

---

## 💡 Troubleshooting

### Build fails with "module not found"
Check your `input` path in `kra-secure.config.js` is correct relative to project root.

### Output file is too large
Try `level: "high"` or enable `deadCodeInjection: false` to reduce size.

### Watch mode not detecting changes
Ensure patterns in `watch.patterns` match your file locations.

### Verification failed
Make sure you're comparing against the same `.sig` file generated at build time.

**Need help?** Open an [issue](https://github.com/kraaxiom/kra-secure/issues) or start a [discussion](https://github.com/kraaxiom/kra-secure/discussions).

---

## 📊 Comparison with Alternatives

| Tool | Obfuscation | Anti-tampering | Watch Mode | API | License |
|------|:-----------:|:--------------:|:----------:|:---:|:-------:|
| **kra-secure** | ✅ Advanced | ✅ SHA256/512 | ✅ Full | ✅ Yes | MIT |
| webpack-obfuscator | ✅ Basic | — | — | ✅ Plugin | MIT |
| javascript-obfuscator | ✅ Advanced | — | — | ✅ Yes | BSD |
| UglifyJS | — | — | — | ✅ Yes | BSD |

kra-secure combines **powerful obfuscation** + **integrity verification** in a single, easy-to-use tool.

---

## 🚀 Roadmap

- [ ] v2.1 — Configuration presets (SPA, API, Desktop)
- [ ] v2.2 — Windows .exe CLI + GUI tool
- [ ] v2.3 — PHP integration & Apache/Nginx support
- [ ] v3.0 — Advanced analytics & usage tracking

See [GitHub Issues](https://github.com/kraaxiom/kra-secure/issues) for current development.

---

## 📄 License

[MIT](LICENSE) © 2026 [KraAxiom](https://github.com/kraaxiom)

Built with for developers who care about code security.

---

**⭐ If kra-secure helps protect your code, please star this repo!** It helps other developers discover the project.

[Give us a star ⭐](https://github.com/kraaxiom/kra-secure) | [Report an issue 🐛](https://github.com/kraaxiom/kra-secure/issues) | [Start a discussion 💬](https://github.com/kraaxiom/kra-secure/discussions)
