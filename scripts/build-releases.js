"use strict";

/**
 * build-releases.js
 * Generates the three downloadable release packages:
 *   1. kra-secure-web-v{VERSION}.zip    — full source package + examples
 *   2. kra-secure-cli-v{VERSION}.zip    — CLI-focused package with launchers
 *   3. kra-secure-setup-v{VERSION}.exe  — standalone Windows executable (pkg)
 *
 * Output directory: ../krabuild/downloads/
 *
 * Run: node scripts/build-releases.js
 */

const fs           = require("fs");
const path         = require("path");
const { execSync } = require("child_process");
const archiver     = require("archiver");

const ROOT     = path.resolve(__dirname, "..");
const OUT_DIR  = path.resolve(ROOT, "..", "krabuild", "downloads");
const PKG      = require(path.join(ROOT, "package.json"));
const VERSION  = PKG.version;

const FILES_CORE = [
  "bin/kra-build.js",
  "lib/build.js",
  "lib/config.js",
  "lib/obfuscate.js",
  "lib/signer.js",
  "lib/watch.js",
  "index.js",
  "package.json",
  "README.md",
  "LICENSE"
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write("\x1b[36m[build-releases]\x1b[0m " + msg + "\n"); }
function ok(msg)   { process.stdout.write("\x1b[32m✔\x1b[0m " + msg + "\n"); }
function err(msg)  { process.stderr.write("\x1b[31m✖\x1b[0m " + msg + "\n"); }

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fmtBytes(n) {
  if (n >= 1048576) return (n / 1048576).toFixed(1) + " MB";
  return (n / 1024).toFixed(0) + " KB";
}

// Create a ZIP file from a list of { src, dest } pairs and a list of inline files { content, dest }
function createZip(outFile, entries, inlineFiles) {
  return new Promise(function(resolve, reject) {
    const out    = fs.createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });

    out.on("close", function() { resolve(archive.pointer()); });
    archive.on("error", reject);
    archive.pipe(out);

    // Real files from disk
    for (const entry of (entries || [])) {
      const abs = path.join(ROOT, entry.src);
      if (fs.existsSync(abs)) {
        archive.file(abs, { name: entry.dest });
      }
    }

    // Inline text files (generated content)
    for (const f of (inlineFiles || [])) {
      archive.append(f.content, { name: f.dest });
    }

    archive.finalize();
  });
}

// Add an entire directory recursively to a zip under a given prefix
function addDirToZip(archive, absDir, zipPrefix) {
  if (!fs.existsSync(absDir)) return;
  archive.directory(absDir, zipPrefix);
}

// ─── Install script generators ───────────────────────────────────────────────

function installBat(globalInstall) {
  const installCmd = globalInstall
    ? "npm install -g ."
    : "npm install";
  return (
    "@echo off\r\n" +
    "echo KraSecure v" + VERSION + " — Installation\r\n" +
    "echo.\r\n" +
    "where node >nul 2>&1\r\n" +
    "if %errorlevel% neq 0 (\r\n" +
    "    echo ERREUR: Node.js n'est pas installe.\r\n" +
    "    echo Telechargez-le sur https://nodejs.org\r\n" +
    "    pause\r\n" +
    "    exit /b 1\r\n" +
    ")\r\n" +
    "echo Node.js detecte.\r\n" +
    installCmd + "\r\n" +
    "if %errorlevel% neq 0 (\r\n" +
    "    echo ERREUR lors de l'installation.\r\n" +
    "    pause\r\n" +
    "    exit /b 1\r\n" +
    ")\r\n" +
    "echo.\r\n" +
    "echo Installation reussie !\r\n" +
    (globalInstall ? "echo Commande disponible : kra-secure\r\n" : "echo Utilisez : npx kra-secure build\r\n") +
    "pause\r\n"
  );
}

function installSh(globalInstall) {
  const installCmd = globalInstall ? "npm install -g ." : "npm install";
  return (
    "#!/bin/bash\n" +
    "set -e\n" +
    "echo 'KraSecure v" + VERSION + " — Installation'\n" +
    "if ! command -v node &> /dev/null; then\n" +
    "  echo 'ERREUR: Node.js non trouvé. Installez-le sur https://nodejs.org'\n" +
    "  exit 1\n" +
    "fi\n" +
    installCmd + "\n" +
    "echo 'Installation réussie !'\n" +
    (globalInstall ? "echo 'Commande disponible : kra-secure'\n" : "echo 'Utilisez : npx kra-secure build'\n")
  );
}

function defaultConfig() {
  return (
    "module.exports = {\n" +
    "  input:  \"src/main.js\",\n" +
    "  output: \"dist/app.secure.js\",\n" +
    "  mode:   \"production\",\n" +
    "  options: {\n" +
    "    level: \"medium\",\n" +
    "    compact: true,\n" +
    "    controlFlowFlattening: true,\n" +
    "    stringArray: true\n" +
    "  }\n" +
    "};\n"
  );
}

// ─── 1. Version Web ZIP ───────────────────────────────────────────────────────

async function buildWebZip() {
  const outFile = path.join(OUT_DIR, "kra-secure-web-v" + VERSION + ".zip");
  log("Création du Web ZIP → " + path.basename(outFile));

  return new Promise(function(resolve, reject) {
    const out     = fs.createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    out.on("close", function() {
      ok("Web ZIP créé : " + fmtBytes(archive.pointer()));
      resolve(archive.pointer());
    });
    archive.on("error", reject);
    archive.pipe(out);

    const prefix = "kra-secure/";

    // Core source files
    for (const f of FILES_CORE) {
      const abs = path.join(ROOT, f);
      if (fs.existsSync(abs)) {
        archive.file(abs, { name: prefix + f });
      }
    }

    // lib/ directory
    archive.directory(path.join(ROOT, "lib"), prefix + "lib");

    // bin/ directory
    archive.directory(path.join(ROOT, "bin"), prefix + "bin");

    // examples/
    if (fs.existsSync(path.join(ROOT, "examples"))) {
      archive.directory(path.join(ROOT, "examples"), prefix + "examples");
    }

    // Generated install scripts
    archive.append(installBat(false), { name: prefix + "install.bat" });
    archive.append(installSh(false),  { name: prefix + "install.sh" });

    // Default config template
    archive.append(defaultConfig(), { name: prefix + "kra-secure.config.example.js" });

    // Quick start text
    const quickstart =
      "KRA-SECURE v" + VERSION + " — GUIDE RAPIDE\n" +
      "===========================================\n\n" +
      "PRÉREQUIS\n" +
      "  Node.js >= 18 : https://nodejs.org\n\n" +
      "INSTALLATION LOCALE (recommandé)\n" +
      "  1. Copiez le dossier kra-secure/ dans votre projet\n" +
      "  2. Ouvrez un terminal dans ce dossier\n" +
      "  3. Lancez : npm install\n" +
      "     OU double-cliquez sur install.bat (Windows)\n\n" +
      "PREMIER BUILD\n" +
      "  npx kra-secure init     ← génère kra-secure.config.js\n" +
      "  npx kra-secure build    ← obfusque src/main.js → dist/app.secure.js\n\n" +
      "COMMANDES PRINCIPALES\n" +
      "  npx kra-secure build                 build de production\n" +
      "  npx kra-secure build --mode debug    build lisible avec source maps\n" +
      "  npx kra-secure build --level high    protection maximale\n" +
      "  npx kra-secure watch                 auto-rebuild\n" +
      "  npx kra-secure sign   dist/app.js    signer le fichier\n" +
      "  npx kra-secure verify dist/app.js    vérifier l'intégrité\n\n" +
      "DOCUMENTATION\n" +
      "  https://krabuild.site/docs/\n\n" +
      "SUPPORT\n" +
      "  https://github.com/KraAxiom/kra-secure\n";

    archive.append(quickstart, { name: prefix + "LISEZMOI.txt" });

    archive.finalize();
  });
}

// ─── 2. Version CLI ZIP ───────────────────────────────────────────────────────

async function buildCliZip() {
  const outFile = path.join(OUT_DIR, "kra-secure-cli-v" + VERSION + ".zip");
  log("Création du CLI ZIP → " + path.basename(outFile));

  return new Promise(function(resolve, reject) {
    const out     = fs.createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    out.on("close", function() {
      ok("CLI ZIP créé : " + fmtBytes(archive.pointer()));
      resolve(archive.pointer());
    });
    archive.on("error", reject);
    archive.pipe(out);

    const prefix = "kra-secure-cli/";

    for (const f of FILES_CORE) {
      const abs = path.join(ROOT, f);
      if (fs.existsSync(abs)) {
        archive.file(abs, { name: prefix + f });
      }
    }

    archive.directory(path.join(ROOT, "lib"), prefix + "lib");
    archive.directory(path.join(ROOT, "bin"), prefix + "bin");

    // Global install scripts
    archive.append(installBat(true), { name: prefix + "install-global.bat" });
    archive.append(installSh(true),  { name: prefix + "install-global.sh" });

    // npm scripts for package.json integration
    const npmScripts =
      "// Ajoutez ces scripts à votre package.json :\n" +
      "\"scripts\": {\n" +
      "  \"secure:build\":  \"kra-secure build\",\n" +
      "  \"secure:debug\":  \"kra-secure build --mode debug\",\n" +
      "  \"secure:watch\":  \"kra-secure watch\",\n" +
      "  \"secure:sign\":   \"kra-secure sign dist/app.secure.js\",\n" +
      "  \"secure:verify\": \"kra-secure verify dist/app.secure.js\"\n" +
      "}\n";
    archive.append(npmScripts, { name: prefix + "npm-scripts-example.js" });

    const quickstart =
      "KRA-SECURE CLI v" + VERSION + " — INSTALLATION GLOBALE\n" +
      "========================================================\n\n" +
      "INSTALLATION GLOBALE (une seule fois)\n" +
      "  Windows : double-cliquez install-global.bat\n" +
      "  Linux/Mac : chmod +x install-global.sh && ./install-global.sh\n\n" +
      "  OU directement : npm install -g .\n\n" +
      "UTILISATION (depuis n'importe où)\n" +
      "  kra-secure build\n" +
      "  kra-secure watch\n" +
      "  kra-secure sign  dist/app.js\n" +
      "  kra-secure verify dist/app.js\n" +
      "  kra-secure init\n" +
      "  kra-secure --help\n\n" +
      "DOCUMENTATION\n" +
      "  https://krabuild.site/docs/cli\n";

    archive.append(quickstart, { name: prefix + "LISEZMOI.txt" });

    archive.finalize();
  });
}

// ─── 3. Windows .exe ─────────────────────────────────────────────────────────
//
// libphonenumber-js (dep of class-validator → javascript-obfuscator) has
// "type":"module" in its package.json but its build/ files are plain CJS.
// pkg treats them as ESM and crashes. We temporarily remove the "type" field
// before compiling, then restore it — no functional change to the code.

function patchEsmPackages() {
  const targets = [
    path.join(ROOT, "node_modules", "libphonenumber-js", "package.json"),
    path.join(ROOT, "node_modules", "uuid", "package.json")
  ];
  const backups = {};
  for (const pkgFile of targets) {
    if (!fs.existsSync(pkgFile)) continue;
    const raw = fs.readFileSync(pkgFile, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.type === "module") {
      backups[pkgFile] = raw;
      delete parsed.type;
      fs.writeFileSync(pkgFile, JSON.stringify(parsed, null, 2), "utf8");
      log("  Patché (type:module retiré) : " + path.relative(ROOT, pkgFile));
    }
  }
  return backups;
}

function restoreEsmPackages(backups) {
  for (const [pkgFile, original] of Object.entries(backups)) {
    fs.writeFileSync(pkgFile, original, "utf8");
    log("  Restauré : " + path.relative(ROOT, pkgFile));
  }
}

function generateEsbuildVendor() {
  // pkg compiles all .js and .json files to V8 bytecode, but STRING constants are
  // preserved in bytecode — require() returns the exact string values at runtime.
  // We generate lib/esbuild-vendor.js (a plain CJS module exporting two strings)
  // just before pkg compilation. lib/build.js requires this at runtime inside .exe.
  const esbuildWasmRoot = path.join(ROOT, "node_modules", "esbuild-wasm");

  const serviceCode  = fs.readFileSync(path.join(esbuildWasmRoot, "bin", "esbuild"), "utf8")
    .replace(/^#!.*\r?\n/, "");
  const wasmExecCode = fs.readFileSync(path.join(esbuildWasmRoot, "wasm_exec_node.js"), "utf8");
  const wasmExecShim = fs.readFileSync(path.join(esbuildWasmRoot, "wasm_exec.js"), "utf8");
  // pkg corrupts binary assets (non-UTF-8 bytes → U+FFFD). Encode WASM as base64
  // (ASCII-only) so V8 bytecode preserves every byte exactly.
  const wasmBase64   = fs.readFileSync(path.join(esbuildWasmRoot, "esbuild.wasm")).toString("base64");

  const generated =
    "// AUTO-GENERATED by scripts/build-releases.js — DO NOT EDIT\n" +
    "// esbuild-wasm service scripts embedded for pkg standalone .exe\n" +
    "exports.serviceCode  = " + JSON.stringify(serviceCode)  + ";\n" +
    "exports.wasmExecCode = " + JSON.stringify(wasmExecCode) + ";\n" +
    "exports.wasmExecShim = " + JSON.stringify(wasmExecShim) + ";\n" +
    "exports.wasmBase64   = " + JSON.stringify(wasmBase64)   + ";\n";

  fs.writeFileSync(path.join(ROOT, "lib", "esbuild-vendor.js"), generated, "utf8");
  log("  lib/esbuild-vendor.js généré (" + Math.round(generated.length / 1024) + " KB)");
}

function buildWindowsExe() {
  const outFile = path.join(OUT_DIR, "kra-secure-setup-v" + VERSION + ".exe");
  log("Compilation du Windows .exe → " + path.basename(outFile));

  // Check esbuild-wasm is available (needed as pkg asset)
  const wasmPath = path.join(ROOT, "node_modules", "esbuild-wasm", "esbuild.wasm");
  if (!fs.existsSync(wasmPath)) {
    err("esbuild-wasm/esbuild.wasm introuvable. Lancez: npm install");
    return false;
  }

  // Generate lib/esbuild-vendor.js with embedded service scripts
  generateEsbuildVendor();

  // Temporarily patch ESM packages that break pkg
  const backups = patchEsmPackages();

  // pkg command
  const pkgBin = path.join(ROOT, "node_modules", ".bin", "pkg");
  const target = "node18-win-x64";
  const cmd = (
    '"' + pkgBin + '"' +
    " bin/kra-build.js" +
    " --targets " + target +
    " --output " + '"' + outFile + '"' +
    " --compress GZip" +
    " --public-packages \"*\""
  );

  try {
    log("  Lancement de pkg (peut prendre 1-2 minutes)...");
    execSync(cmd, { cwd: ROOT, stdio: "inherit", timeout: 300000 });
    restoreEsmPackages(backups);

    if (fs.existsSync(outFile)) {
      ok(".exe créé : " + fmtBytes(fs.statSync(outFile).size));
      return true;
    } else {
      err(".exe non créé (vérifiez les logs ci-dessus)");
      return false;
    }
  } catch (e) {
    restoreEsmPackages(backups); // always restore
    err("pkg a échoué : " + e.message);
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n\x1b[1;36m═══ KraSecure Release Builder v" + VERSION + " ═══\x1b[0m\n");

  ensureDir(OUT_DIR);
  ensureDir(path.join(ROOT, "dist"));

  const results = { web: false, cli: false, exe: false };

  // Web ZIP
  try {
    await buildWebZip();
    results.web = true;
  } catch (e) { err("Web ZIP : " + e.message); }

  // CLI ZIP
  try {
    await buildCliZip();
    results.cli = true;
  } catch (e) { err("CLI ZIP : " + e.message); }

  // Windows .exe
  results.exe = buildWindowsExe();

  // Summary
  console.log("\n\x1b[1m── Résumé ──────────────────────────────────────────\x1b[0m");
  [
    { label: "Web ZIP  ", key: "web",  file: "kra-secure-web-v" + VERSION + ".zip" },
    { label: "CLI ZIP  ", key: "cli",  file: "kra-secure-cli-v" + VERSION + ".zip" },
    { label: "Win .exe ", key: "exe",  file: "kra-secure-setup-v" + VERSION + ".exe" }
  ].forEach(function(r) {
    const outFile = path.join(OUT_DIR, r.file);
    const exists  = fs.existsSync(outFile);
    const size    = exists ? " [" + fmtBytes(fs.statSync(outFile).size) + "]" : "";
    const status  = exists ? "\x1b[32m✔\x1b[0m" : "\x1b[31m✖\x1b[0m";
    console.log("  " + status + "  " + r.label + "  " + r.file + "\x1b[90m" + size + "\x1b[0m");
  });

  console.log("\n  Dossier de sortie : \x1b[33m" + OUT_DIR + "\x1b[0m\n");
}

main().catch(function(e) {
  err("Erreur fatale : " + e.message);
  process.exit(1);
});
