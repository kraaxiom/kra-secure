const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function computeHash(content, algorithm) {
  return crypto
    .createHash(algorithm || "sha256")
    .update(content, "utf8")
    .digest("hex");
}

function signFile(filePath, options) {
  options = options || {};
  if (!fs.existsSync(filePath)) {
    throw new Error("Fichier introuvable: " + filePath);
  }

  const algorithm = options.algorithm || "sha256";
  const content = fs.readFileSync(filePath, "utf8");
  const hash = computeHash(content, algorithm);
  const sigPath = filePath + ".sig";

  const sigData = {
    file: path.basename(filePath),
    algorithm: algorithm,
    hash: hash,
    size: Buffer.byteLength(content, "utf8"),
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  };

  fs.writeFileSync(sigPath, JSON.stringify(sigData, null, 2), "utf8");
  return { hash: hash, sigPath: sigPath, algorithm: algorithm, timestamp: sigData.timestamp };
}

function verifyFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: "Fichier introuvable: " + filePath };
  }

  const sigPath = filePath + ".sig";
  if (!fs.existsSync(sigPath)) {
    return { valid: false, error: "Fichier de signature introuvable: " + sigPath };
  }

  var sigData;
  try {
    sigData = JSON.parse(fs.readFileSync(sigPath, "utf8"));
  } catch (e) {
    return { valid: false, error: "Format de fichier de signature invalide" };
  }

  if (!sigData.hash || !sigData.algorithm) {
    return { valid: false, error: "Données de signature incomplètes" };
  }

  const content = fs.readFileSync(filePath, "utf8");
  const currentHash = computeHash(content, sigData.algorithm);

  if (currentHash === sigData.hash) {
    return {
      valid: true,
      hash: currentHash,
      algorithm: sigData.algorithm,
      signedAt: sigData.timestamp
    };
  }

  return {
    valid: false,
    error: "Vérification d'intégrité échouée — le fichier a peut-être été modifié",
    expected: sigData.hash,
    actual: currentHash
  };
}

// Generates a small IIFE that embeds the expected hash and exposes a
// verification helper on window.__kraSecure. The actual hash comparison
// is best done server-side (SRI / endpoint); this helper enables it client-side.
function generateRuntimeGuard(hash, options) {
  options = options || {};
  const onTamperDetected = options.onTamperDetected || "block";
  const callback = options.callback || "window.__onTamperDetected";
  const redirectUrl = options.redirectUrl || "/security-error";
  const checkInterval = Number(options.checkInterval) || 0;

  var tamperResponse;
  if (onTamperDetected === "callback") {
    tamperResponse =
      'typeof ' + callback + '==="function"&&' + callback + '({hash:h});';
  } else if (onTamperDetected === "redirect") {
    tamperResponse =
      'typeof window!=="undefined"&&(window.location.href="' + redirectUrl + '");';
  } else {
    tamperResponse =
      '(function(){throw new Error("KraSecure: échec de vérification d\'intégrité");})();';
  }

  var intervalCode = "";
  if (checkInterval > 0) {
    intervalCode =
      "setInterval(function(){" +
      'var s=window.__kraSecure;' +
      "if(s&&s._verifiedHash&&s._verifiedHash!==s.expectedHash){" +
      tamperResponse +
      "}" +
      "}," +
      checkInterval +
      ");";
  }

  return (
    ";(function(){" +
    'var h="' + hash + '";' +
    'if(typeof window!=="undefined"){' +
    "window.__kraSecure={" +
    "expectedHash:h," +
    "verify:function(actualHash){" +
    "if(actualHash&&actualHash!==h){" + tamperResponse + "return false;}" +
    "this._verifiedHash=actualHash;" +
    "return !actualHash||actualHash===h;" +
    "}" +
    "};" +
    "}" +
    intervalCode +
    "})();"
  );
}

module.exports = { computeHash, signFile, verifyFile, generateRuntimeGuard };
