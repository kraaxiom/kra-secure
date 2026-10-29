"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { build } = require("../lib/build");

function workDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "kra-build-"));
}

test("production build bundles and obfuscates the entry point", async () => {
  const dir = workDir();
  const input = path.join(dir, "main.js");
  const output = path.join(dir, "out.js");
  fs.writeFileSync(input, "export const answer = 42; console.log(answer);");

  const result = await build({
    input,
    output,
    mode: "production",
    options: { level: "medium" },
    _isLoaded: true
  });

  assert.strictEqual(result.obfuscated, true);
  assert.ok(result.size > 0);
  assert.ok(fs.existsSync(output));
  const code = fs.readFileSync(output, "utf8");
  assert.ok(!code.includes("const answer = 42"), "source is obfuscated");
});

test("debug build stays readable and is not obfuscated", async () => {
  const dir = workDir();
  const input = path.join(dir, "main.js");
  const output = path.join(dir, "out.js");
  fs.writeFileSync(input, "const token = 'readable'; console.log(token);");

  const result = await build({
    input,
    output,
    mode: "debug",
    _isLoaded: true
  });

  assert.strictEqual(result.obfuscated, false);
  assert.ok(fs.readFileSync(output, "utf8").includes("readable"));
});

test("an invalid mode throws before building", async () => {
  const dir = workDir();
  const input = path.join(dir, "main.js");
  fs.writeFileSync(input, "console.log(1);");
  await assert.rejects(
    build({ input, output: path.join(dir, "o.js"), mode: "turbo", _isLoaded: true }),
    /Mode invalide/
  );
});

test("a missing entry point throws a clear error", async () => {
  const dir = workDir();
  await assert.rejects(
    build({
      input: path.join(dir, "nope.js"),
      output: path.join(dir, "o.js"),
      _isLoaded: true
    }),
    /introuvable/
  );
});

test("array input produces one result per entry via [name]", async () => {
  const dir = workDir();
  const a = path.join(dir, "a.js");
  const b = path.join(dir, "b.js");
  fs.writeFileSync(a, "console.log('a');");
  fs.writeFileSync(b, "console.log('b');");

  const results = await build({
    input: [a, b],
    output: path.join(dir, "[name].sec.js"),
    mode: "production",
    options: { level: "low" },
    _isLoaded: true
  });

  assert.strictEqual(results.length, 2);
  assert.ok(fs.existsSync(path.join(dir, "a.sec.js")));
  assert.ok(fs.existsSync(path.join(dir, "b.sec.js")));
});

test("array input without [name] in the output is rejected", async () => {
  const dir = workDir();
  const a = path.join(dir, "a.js");
  const b = path.join(dir, "b.js");
  fs.writeFileSync(a, "console.log('a');");
  fs.writeFileSync(b, "console.log('b');");

  await assert.rejects(
    build({
      input: [a, b],
      output: path.join(dir, "bundle.js"),
      _isLoaded: true
    }),
    /\[name\]/
  );
});

test("colliding [name] outputs are rejected instead of overwritten", async () => {
  const dir = workDir();
  const da = path.join(dir, "a");
  const db = path.join(dir, "b");
  fs.mkdirSync(da);
  fs.mkdirSync(db);
  fs.writeFileSync(path.join(da, "main.js"), "console.log('a');");
  fs.writeFileSync(path.join(db, "main.js"), "console.log('b');");

  await assert.rejects(
    build({
      input: [path.join(da, "main.js"), path.join(db, "main.js")],
      output: path.join(dir, "[name].js"),
      _isLoaded: true
    }),
    /Collision de sortie/
  );
});
