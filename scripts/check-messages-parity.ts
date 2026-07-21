#!/usr/bin/env bun
/**
 * Ensures all locale message files under messages/ share the same key structure
 * as messages/en.json (the source of truth for next-intl).
 *
 * Run: bun run check-messages
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "..", "messages");
const SOURCE_LOCALE = "en";

function nextPath(parent: string, segment: string): string {
  return parent === "" ? segment : `${parent}.${segment}`;
}

const VALUE_PREVIEW_MAX_CHARS = 120;

/**
 * Short, CI-safe description of a value (type + bounded JSON for objects/arrays).
 */
function describeUnexpectedValue(value: unknown): string {
  if (typeof value === "string") {
    if (value.length <= 80) {
      return `string ${JSON.stringify(value)}`;
    }
    return `string (length ${value.length})`;
  }

  const valueType = typeof value;

  if (
    valueType === "number" ||
    valueType === "boolean" ||
    valueType === "bigint"
  ) {
    return `${valueType}(${String(value)})`;
  }

  if (valueType === "undefined") {
    return "undefined";
  }

  if (valueType === "function") {
    return "function";
  }

  if (valueType === "symbol") {
    return "symbol";
  }

  const kind = Array.isArray(value) ? "array" : "object";
  try {
    const json = JSON.stringify(value);
    if (typeof json !== "string") {
      return `${kind} (non-serializable)`;
    }
    if (json.length <= VALUE_PREVIEW_MAX_CHARS) {
      return `${kind} ${json}`;
    }
    return `${kind} (${json.slice(0, VALUE_PREVIEW_MAX_CHARS - 1)}…)`;
  } catch {
    return `${kind} (not JSON-serializable)`;
  }
}

/**
 * Recursively compares structure: same keys at each object level, same array lengths,
 * compatible leaf types (primitive or null). String values are not compared.
 */
export function compareStructure(
  source: unknown,
  other: unknown,
  pathStr: string,
  label: string,
): string[] {
  const errors: string[] = [];

  if (source === undefined) {
    errors.push(`${label}: undefined at ${pathStr || "(root)"}`);
    return errors;
  }
  if (other === undefined) {
    errors.push(`${label}: missing value at ${pathStr || "(root)"}`);
    return errors;
  }

  const sourceType = typeof source;
  const otherType = typeof other;

  if (sourceType !== otherType) {
    errors.push(
      `${label}: type mismatch at ${pathStr || "(root)"}: expected ${sourceType}, got ${otherType}`,
    );
    return errors;
  }

  if (source === null) {
    if (other !== null) {
      errors.push(
        `${label}: expected null at ${pathStr || "(root)"}, got ${describeUnexpectedValue(other)}`,
      );
    }
    return errors;
  }

  if (sourceType !== "object") {
    return errors;
  }

  if (Array.isArray(source) !== Array.isArray(other)) {
    errors.push(`${label}: array vs object at ${pathStr || "(root)"}`);
    return errors;
  }

  if (Array.isArray(source)) {
    const a = source as unknown[];
    const b = other as unknown[];
    if (a.length !== b.length) {
      errors.push(
        `${label}: array length at ${pathStr || "(root)"}: ${SOURCE_LOCALE} has ${a.length}, ${label} has ${b.length}`,
      );
    }
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
      errors.push(
        ...compareStructure(a[i], b[i], nextPath(pathStr, String(i)), label),
      );
    }
    return errors;
  }

  const objA = source as Record<string, unknown>;
  const objB = other as Record<string, unknown>;
  const keysA = Object.keys(objA).sort();
  const keysB = Object.keys(objB).sort();
  const setB = new Set(keysB);

  for (const key of keysA) {
    if (!setB.has(key)) {
      errors.push(
        `${label}: missing key "${nextPath(pathStr, key)}" (present in ${SOURCE_LOCALE}.json)`,
      );
    }
  }

  const setA = new Set(keysA);
  for (const key of keysB) {
    if (!setA.has(key)) {
      errors.push(
        `${label}: extra key "${nextPath(pathStr, key)}" (not in ${SOURCE_LOCALE}.json)`,
      );
    }
  }

  for (const key of keysA) {
    if (setB.has(key)) {
      errors.push(
        ...compareStructure(
          objA[key],
          objB[key],
          nextPath(pathStr, key),
          label,
        ),
      );
    }
  }

  return errors;
}

async function main(): Promise<void> {
  const entries = await readdir(MESSAGES_DIR, { withFileTypes: true });
  const localeFiles = entries
    .filter(
      (e) =>
        e.isFile() && e.name.endsWith(".json") && e.name !== "package.json",
    )
    .map((e) => e.name)
    .sort();

  const divider = "────────────────────────────────────────";

  const sourceName = `${SOURCE_LOCALE}.json`;
  if (!localeFiles.includes(sourceName)) {
    console.error("\n❌  Source file missing\n");
    console.error(`   Expected: ${path.join(MESSAGES_DIR, sourceName)}\n`);
    process.exit(1);
  }

  const sourceRaw = await readFile(path.join(MESSAGES_DIR, sourceName), "utf8");
  let sourceJson: unknown;
  try {
    sourceJson = JSON.parse(sourceRaw);
  } catch (e) {
    console.error("\n❌  Invalid JSON (source)\n");
    console.error(`   File: ${sourceName}`);
    console.error(`   ${String(e)}\n`);
    process.exit(1);
  }

  const targets = localeFiles.filter((f) => f !== sourceName);
  if (targets.length === 0) {
    console.error("\n❌  No locale files to compare\n");
    console.error(`   Add at least one *.json locale besides ${sourceName}.\n`);
    process.exit(1);
  }

  console.log("\n📋  Message parity check (next-intl)\n");
  console.log(`   Source     ${sourceName}`);
  console.log(`   Compare    ${targets.length} file(s)`);
  console.log(`   ${divider}\n`);

  let failed = false;

  for (const file of targets) {
    const label = file.replace(/\.json$/, "");
    const raw = await readFile(path.join(MESSAGES_DIR, file), "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      failed = true;
      console.error(`   ⚠️  ${file} — invalid JSON`);
      console.error(`      ${String(e)}\n`);
      continue;
    }

    const errors = compareStructure(sourceJson, parsed, "", label);
    if (errors.length > 0) {
      failed = true;
      console.error(`   ❌  ${file}`);
      console.error(`      vs ${sourceName} (${errors.length} issue(s))`);
      console.error(`      ${divider}`);
      for (const line of errors) {
        console.error(`      • ${line}`);
      }
      console.error("");
    } else {
      console.log(`   ✅  ${file} — structure matches ${sourceName}`);
    }
  }

  console.log(`   ${divider}`);

  if (failed) {
    console.error("\n❌  Parity check failed\n");
    console.error(
      "   Locale files must mirror the key structure of messages/en.json.\n",
    );
    process.exit(1);
  }

  console.log("\n✅  All locale files match the source key structure.\n");
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
