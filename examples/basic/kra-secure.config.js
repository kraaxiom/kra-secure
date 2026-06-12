module.exports = {
  input:  "src/main.js",
  output: "dist/app.secure.js",
  mode:   "production",
  options: {
    level:                  "medium",
    compact:                true,
    controlFlowFlattening:  true,
    stringArray:            true,
    debugProtection:        false
  }
};
