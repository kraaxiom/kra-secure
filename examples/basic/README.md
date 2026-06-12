# Exemple — Obfuscation basique

## Installation

```bash
npm install --save-dev kra-secure
```

## Utilisation

```bash
# Build de production (obfusqué)
npx kra-secure build

# Build debug (lisible, avec source maps)
npx kra-secure build --mode debug

# Signature du fichier généré
npx kra-secure sign dist/app.secure.js
```

## Structure

```
basic/
├── src/main.js           ← votre code source
├── dist/app.secure.js    ← généré par kra-secure build
└── kra-secure.config.js  ← configuration
```
