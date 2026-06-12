module.exports = {
  input:  "src/main.js",
  output: "dist/app.secure.js",
  mode:   "production",
  options: {
    level:                 "high",
    compact:               true,
    controlFlowFlattening: true,
    deadCodeInjection:     true,
    debugProtection:       true,
    stringArray:           true,
    selfDefending:         true
  },
  antiTampering: {
    enabled:           true,
    signature:         true,
    algorithm:         "sha256",
    onTamperDetected:  "block",
    checkInterval:     5000
  }
};
