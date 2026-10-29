"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { deepMerge, loadConfig, generateDefaultConfig, DEFAULTS } =
  require("../lib/config");

test("deepMerge merges nested objects without dropping sibling keys", () => {
  const merged = deepMerge(
    { options: { level: "low", compact: true } },
    { options: { level: "high" } }
  );
  assert.strictEqual(merged.options.level, "high");
  assert.strictEqual(merged.options.compact, true, "sibling key preserved");
});

test("deepMerge replaces arrays instead of merging them", () => {
  const merged = deepMerge({ list: [1, 2, 3] }, { list: [9] });
  assert.deepStrictEqual(merged.list, [9]);
});

test("deepMerge does not mutate its inputs", () => {
  const target = { a: { b: 1 } };
  deepMerge(target, { a: { c: 2 } });
  assert.deepStrictEqual(target, { a: { b: 1 } }, "target untouched");
});

test("loadConfig returns a copy of DEFAULTS when no config file exists", () => {
  const cfg = loadConfig("does/not/exist.config.js");
  // Non-existent explicit path falls through to DEFAULTS.
  assert.strictEqual(cfg.input, DEFAULTS.input);
  assert.notStrictEqual(cfg, DEFAULTS, "returns a copy, not the shared object");
});

test("generateDefaultConfig emits a requirable module", () => {
  const src = generateDefaultConfig();
  assert.match(src, /module\.exports\s*=/);
  assert.match(src, /input:/);
});
