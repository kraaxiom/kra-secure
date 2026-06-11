#!/usr/bin/env node

"use strict";

const pkg = require("../package.json");
const args = process.argv.slice(2);
const cmd = args[0];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function c(code, text) {
  return "\x1b[" + code + "m" + text + "\x1b[0m";
}

function parseArgs() {
  const opts = {};
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === "--input" || a === "-i")          opts.input      = args[++i];
    else if (a === "--output" || a === "-o")    opts.output     = args[++i];
    else if (a === "--mode" || a === "-m")      opts.mode       = args[++i];
    else if (a === "--config" || a === "-c")    opts.configPath = args[++i];
    else if (a === "--level" || a === "-l")     opts.level      = args[++i];
    else if (a === "--algorithm" || a === "-a") opts.algorithm  = args[++i];
    else if ((a === "--version" || a === "-v") && !opts._file) {
      console.log(pkg.version);
      process.exit(0);
    } else if ((a === "--help" || a === "-h") && !opts._file) {
      printHelp();
      process.exit(0);
    } else if (!a.startsWith("-") && !opts._file) {
      opts._file = a;
    }
  }
  return opts;
}

function printBanner() {
  const v = pkg.version;
  console.log(c("36", "╔══════════════════════════════════╗"));
  console.log(c("36", "║") + "  " + c("1", "KraSecure") + " v" + v + "                    ".slice(v.length) + c("36", "║"));
  console.log(c("36", "╚══════════════════════════════════╝"));
}

function printHelp() {
  console.log(`
${c("1;36", "kra-secure")} v${pkg.version} — Advanced JavaScript Obfuscation Tool

${c("1", "Usage:")}
  kra-secure <command> [options]

${c("1", "Commands:")}
  ${c("32", "build")}              Bundle et obfusque le projet
  ${c("32", "watch")}              Surveille les fichiers et rebuild automatiquement
  ${c("32", "sign")}  <file>       Signe un fichier buildé (crée <file>.sig)
  ${c("32", "verify")} <file>      Vérifie un fichier signé contre son .sig
  ${c("32", "init")}               Génère un kra-secure.config.js par défaut
  ${c("32", "version")}            Affiche la version

${c("1", "Options:")}
  ${c("33", "-i, --input")}  <file>    Fichier d'entrée    (défaut: src/main.js)
  ${c("33", "-o, --output")} <file>    Fichier de sortie   (défaut: dist/app.secure.js)
  ${c("33", "-m, --mode")}   <mode>    Mode: ${c("36", "production")} | ${c("36", "debug")}   (défaut: production)
  ${c("33", "-l, --level")}  <level>   Niveau: ${c("36", "low")} | ${c("36", "medium")} | ${c("36", "high")}  (défaut: low)
  ${c("33", "-c, --config")} <file>    Chemin vers le fichier de config
  ${c("33", "-a, --algorithm")} <algo> Algorithme hash: ${c("36", "sha256")} | ${c("36", "sha512")}  (défaut: sha256)
  ${c("33", "-h, --help")}           Affiche cette aide
  ${c("33", "-v, --version")}        Affiche la version

${c("1", "Exemples:")}
  kra-secure build
  kra-secure build --mode debug
  kra-secure build --input src/app.js --output dist/app.min.js
  kra-secure build --level high
  kra-secure watch
  kra-secure watch --mode production
  kra-secure sign   dist/app.secure.js
  kra-secure verify dist/app.secure.js
  kra-secure init
`);
}

function fmtSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024)    return (bytes / 1024).toFixed(1) + " KB";
  return bytes + " B";
}

// ─── Commands ────────────────────────────────────────────────────────────────

if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
  printHelp();
  process.exit(0);
}

if (cmd === "version" || cmd === "--version" || cmd === "-v") {
  console.log(pkg.version);
  process.exit(0);
}

// ── init ──────────────────────────────────────────────────────────────────────
if (cmd === "init") {
  const fs   = require("fs");
  const path = require("path");
  const { generateDefaultConfig } = require("../lib/config");
  const dest = path.resolve(process.cwd(), "kra-secure.config.js");
  if (fs.existsSync(dest)) {
    console.log(c("33", "⚠  kra-secure.config.js existe déjà, aucune modification."));
  } else {
    fs.writeFileSync(dest, generateDefaultConfig(), "utf8");
    console.log(c("32", "✔  kra-secure.config.js créé avec succès."));
    console.log("   Modifiez ce fichier selon vos besoins, puis lancez " + c("1", "kra-secure build") + ".");
  }
  process.exit(0);
}

// ── sign ──────────────────────────────────────────────────────────────────────
if (cmd === "sign") {
  const opts = parseArgs();
  const file = opts._file;
  if (!file) {
    console.error(c("31", "✖  Usage: kra-secure sign <file>"));
    process.exit(1);
  }
  const { signFile } = require("../lib/signer");
  try {
    const result = signFile(file, { algorithm: opts.algorithm || "sha256" });
    console.log(c("32", "✔  Fichier signé: ") + file);
    console.log("   Algorithme : " + result.algorithm);
    console.log("   Hash       : " + result.hash);
    console.log("   Signature  : " + result.sigPath);
    console.log("   Date       : " + result.timestamp);
  } catch (err) {
    console.error(c("31", "✖  Signature échouée: ") + err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ── verify ────────────────────────────────────────────────────────────────────
if (cmd === "verify") {
  const opts = parseArgs();
  const file = opts._file;
  if (!file) {
    console.error(c("31", "✖  Usage: kra-secure verify <file>"));
    process.exit(1);
  }
  const { verifyFile } = require("../lib/signer");
  const result = verifyFile(file);
  if (result.valid) {
    console.log(c("32", "✔  Vérification réussie: ") + file);
    console.log("   Hash    : " + result.hash);
    console.log("   Signé   : " + result.signedAt);
  } else {
    console.error(c("31", "✖  Vérification ÉCHOUÉE: ") + file);
    console.error("   Raison  : " + result.error);
    if (result.expected) console.error("   Attendu : " + result.expected);
    if (result.actual)   console.error("   Actuel  : " + result.actual);
    process.exit(1);
  }
  process.exit(0);
}

// ── build ─────────────────────────────────────────────────────────────────────
if (cmd === "build") {
  printBanner();
  const opts = parseArgs();
  const { loadConfig }  = require("../lib/config");
  const { build }       = require("../lib/build");

  let config = loadConfig(opts.configPath);
  if (opts.input)  config.input  = opts.input;
  if (opts.output) config.output = opts.output;
  if (opts.mode)   config.mode   = opts.mode;
  if (opts.level)  config.options = Object.assign(config.options || {}, { level: opts.level });
  config._isLoaded = true;

  const modeLabel = config.mode === "debug"
    ? c("33", "debug") + c("90", " (source maps, non-obfusqué)")
    : c("32", "production") + c("90", " (obfusqué, niveau " + (config.options && config.options.level || "low") + ")");

  console.log("Mode    : " + modeLabel);
  console.log("Entrée  : " + c("90", config.input));
  console.log("Sortie  : " + c("90", config.output));
  console.log("");

  build(config)
    .then(function (result) {
      // Handle multi-file result (array)
      const results = Array.isArray(result) ? result : [result];
      results.forEach(function (r) {
        console.log(
          c("32", "✔  Build terminé") +
            " → " +
            r.output +
            c("90", " [" + fmtSize(r.size || 0) + "]")
        );
        if (r.signature) {
          console.log("   Signature : " + r.signature.sigPath);
        }
      });
      console.log("");
    })
    .catch(function (err) {
      console.error(c("31", "✖  Build échoué: ") + err.message);
      process.exit(1);
    });

// ── watch ─────────────────────────────────────────────────────────────────────
} else if (cmd === "watch") {
  printBanner();
  const opts = parseArgs();
  const { loadConfig }  = require("../lib/config");
  const { startWatch }  = require("../lib/watch");

  let config = loadConfig(opts.configPath);
  if (opts.input)  config.input  = opts.input;
  if (opts.output) config.output = opts.output;
  if (opts.mode)   config.mode   = opts.mode;
  if (opts.level)  config.options = Object.assign(config.options || {}, { level: opts.level });
  config._isLoaded = true;

  startWatch(config).catch(function (err) {
    console.error(c("31", "✖  Watch échoué: ") + err.message);
    process.exit(1);
  });

} else {
  console.error(c("31", "✖  Commande inconnue: ") + cmd);
  console.log('   Tapez "kra-secure help" pour voir les commandes disponibles.');
  process.exit(1);
}
