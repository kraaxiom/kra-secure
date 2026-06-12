module.exports = {
  input:  "src/main.js",
  output: "dist/app.secure.js",
  mode:   "production",
  options: { level: "medium" },
  watch: {
    patterns:       ["src/**/*.js"],
    ignore:         ["node_modules/**", "dist/**"],
    debounce:       300,
    initialBuild:   true,
    continueOnError: true,
    onAfterBuild: function(result) {
      console.log("[hook] Nouveau build : " + result.size + " octets");
    }
  }
};
