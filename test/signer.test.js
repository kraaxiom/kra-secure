"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { computeHash, signFile, verifyFile } = require("../lib/signer");

function tmpFile(contents) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kra-signer-"));
  const file = path.join(dir, "app.js");
  fs.writeFileSync(file, contents, "utf8");
  return file;
}

test("computeHash is stable and algorithm-sensitive", () => {
  assert.strictEqual(computeHash("abc", "sha256"), computeHash("abc", "sha256"));
  assert.notStrictEqual(
    computeHash("abc", "sha256"),
    computeHash("abc", "sha512")
  );
});

test("computeHash rejects an unsupported algorithm", () => {
  assert.throws(() => computeHash("abc", "md7"), /non supporté/);
});

test("sign then verify succeeds for an untouched file", () => {
  const file = tmpFile("console.log(1);");
  const signed = signFile(file, { algorithm: "sha256" });
  assert.ok(fs.existsSync(signed.sigPath));

  const result = verifyFile(file);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.hash, signed.hash);
});

test("verify fails after the file is tampered with", () => {
  const file = tmpFile("console.log(1);");
  signFile(file);
  fs.writeFileSync(file, "console.log(2);", "utf8");

  const result = verifyFile(file);
  assert.strictEqual(result.valid, false);
  assert.match(result.error, /intégrité/);
  assert.ok(result.expected && result.actual);
});

test("verify reports a missing signature file", () => {
  const file = tmpFile("console.log(1);");
  const result = verifyFile(file);
  assert.strictEqual(result.valid, false);
  assert.match(result.error, /signature introuvable/);
});
