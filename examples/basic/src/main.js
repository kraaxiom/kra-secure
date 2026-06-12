// ── Exemple kra-secure : Obfuscation basique ─────────────────────────────────
// Ce fichier est votre code source. Ne le déployez jamais tel quel.
// Lancez "kra-secure build" pour générer dist/app.secure.js obfusqué.

var APP_NAME = "MonApp";
var APP_VERSION = "1.0.0";

function greet(name) {
  var message = "Bonjour " + name + " ! Bienvenue sur " + APP_NAME;
  console.log(message);
  return message;
}

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  var result = 0;
  for (var i = 0; i < b; i++) {
    result = add(result, a);
  }
  return result;
}

// Point d'entrée
greet("Développeur");
console.log("2 × 5 =", multiply(2, 5));
