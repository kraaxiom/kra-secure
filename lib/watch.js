const chokidar = require("chokidar");
const { build } = require("./build");
const { loadConfig } = require("./config");

var _watcher = null;
var _debounceTimer = null;

function ts() {
  return new Date().toLocaleTimeString("fr-FR");
}

function log(msg) {
  process.stdout.write("[" + ts() + "] " + msg + "\n");
}

async function startWatch(configOrOptions) {
  configOrOptions = configOrOptions || {};

  var config;
  if (configOrOptions._isLoaded) {
    config = configOrOptions;
  } else {
    const fileConfig = loadConfig(configOrOptions.configPath);
    config = Object.assign(fileConfig, configOrOptions, { _isLoaded: true });
  }

  const wc = config.watch || {};
  const patterns = wc.patterns || ["src/**/*.js"];
  const ignored = wc.ignore || ["node_modules/**", "dist/**", ".git/**"];
  const debounce = typeof wc.debounce === "number" ? wc.debounce : 300;
  const continueOnError = wc.continueOnError !== false;

  log("\x1b[36mKraSecure Watch démarré\x1b[0m");
  log("Surveillance: \x1b[33m" + patterns.join(", ") + "\x1b[0m");
  log("Mode: \x1b[33m" + (config.mode || "production") + "\x1b[0m");
  log("Appuyez sur \x1b[1mCtrl+C\x1b[0m pour arrêter.");

  if (typeof wc.onStart === "function") {
    try { wc.onStart(config); } catch (_) {}
  }

  async function runBuild(changedFile) {
    if (changedFile) {
      log("Fichier modifié: \x1b[33m" + changedFile + "\x1b[0m");
    } else {
      log("Build initial...");
    }

    if (typeof wc.onBeforeBuild === "function") {
      try { wc.onBeforeBuild(); } catch (_) {}
    }

    const start = Date.now();
    try {
      const result = await build(config);
      const elapsed = Date.now() - start;
      const sizeStr = result.size
        ? " (" + (result.size / 1024).toFixed(1) + " KB)"
        : "";
      log(
        "\x1b[32m✔ Build terminé\x1b[0m en " +
          elapsed +
          "ms → " +
          result.output +
          sizeStr
      );
      if (typeof wc.onAfterBuild === "function") {
        try { wc.onAfterBuild(result); } catch (_) {}
      }
    } catch (err) {
      log("\x1b[31m✖ Erreur build: " + err.message + "\x1b[0m");
      if (typeof wc.onError === "function") {
        try { wc.onError(err); } catch (_) {}
      }
      if (!continueOnError) {
        stop();
        process.exit(1);
      }
    }
  }

  // Initial build
  if (wc.initialBuild !== false) {
    await runBuild(null);
  }

  _watcher = chokidar.watch(patterns, {
    ignored: ignored,
    persistent: true,
    ignoreInitial: true,
    depth: wc.depth || 10,
    usePolling: wc.usePolling || false,
    followSymlinks: wc.followSymlinks || false
  });

  function triggerBuild(filePath, event) {
    if (typeof wc.onFileChange === "function") {
      try { wc.onFileChange(filePath, event); } catch (_) {}
    }
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(function () {
      runBuild(filePath);
    }, debounce);
  }

  _watcher.on("add", function (p) { triggerBuild(p, "add"); });
  _watcher.on("change", function (p) { triggerBuild(p, "change"); });
  _watcher.on("unlink", function (p) { triggerBuild(p, "unlink"); });
  _watcher.on("error", function (err) {
    log("\x1b[31mErreur watcher: " + err.message + "\x1b[0m");
  });

  process.on("SIGINT", function () {
    log("Arrêt du mode watch...");
    if (typeof wc.onStop === "function") {
      try { wc.onStop(); } catch (_) {}
    }
    stop();
    process.exit(0);
  });

  return { stop: stop };
}

function stop() {
  if (_watcher) {
    _watcher.close();
    _watcher = null;
  }
  clearTimeout(_debounceTimer);
}

module.exports = { startWatch: startWatch, stop: stop };
