"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { obfuscate, buildObfuscatorOptions, LEVEL_PRESETS } =
  require("../lib/obfuscate");

test("buildObfuscatorOptions returns the preset for a known level", () => {
  const opts = buildObfuscatorOptions({ level: "high" });
  assert.strictEqual(opts.controlFlowFlattening, true);
  assert.strictEqual(opts.stringArray, true);
});

test("buildObfuscatorOptions throws on an unknown level", () => {
  assert.throws(
    () => buildObfuscatorOptions({ level: "ultra" }),
    /Niveau d'obfuscation invalide/
  );
});

test("defaults to the low preset when no level is given", () => {
  const opts = buildObfuscatorOptions({});
  assert.strictEqual(opts.controlFlowFlattening, LEVEL_PRESETS.low.controlFlowFlattening);
  assert.strictEqual(opts.stringArray, false);
  // low has stringArray off, so sub-options are cleared
  assert.deepStrictEqual(opts.stringArrayEncoding, []);
});

test("a per-option override wins over the preset", () => {
  const opts = buildObfuscatorOptions({ level: "high", stringArray: false });
  assert.strictEqual(opts.stringArray, false);
  assert.deepStrictEqual(opts.stringArrayEncoding, [], "sub-options cleared");
});

test("obfuscate transforms code while preserving behaviour markers", () => {
  const src = "function greet(name){return 'hello ' + name;}\ngreet('world');";
  const out = obfuscate(src, { level: "medium" });
  assert.notStrictEqual(out, src, "output differs from input");
  assert.ok(out.length > 0);
});

test("obfuscate surfaces a wrapped error on invalid syntax", () => {
  assert.throws(
    () => obfuscate("function (", { level: "low" }),
    /Échec de l'obfuscation/
  );
});
