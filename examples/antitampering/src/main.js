// ── Exemple kra-secure : Anti-tampering ──────────────────────────────────────
// Obfuscation niveau HIGH avec signature SHA-256 et garde runtime injectée.

var SECRET_KEY = "ma-cle-secrete-ne-pas-exposer";

function validateLicense(key) {
  if (!key || key.length < 8) return false;
  return key.startsWith("KRA-") && key.length === 20;
}

function protectedFunction() {
  var data = [1, 2, 3, 4, 5];
  return data.reduce(function(acc, val) { return acc + val; }, 0);
}

console.log("Licence valide :", validateLicense("KRA-XXXX-XXXX-XXX"));
console.log("Résultat protégé :", protectedFunction());
