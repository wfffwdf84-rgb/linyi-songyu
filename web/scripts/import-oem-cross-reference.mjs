#!/usr/bin/env node
/**
 * Turn the filled OEM cross-reference CSV into src/lib/data/oem-cross-reference.json.
 *
 *   node scripts/import-oem-cross-reference.mjs scripts/oem-cross-reference-template.csv
 *
 * Fill the oem_1..oem_4 columns in the CSV (any column may stay empty) and run
 * the command above; every number you enter becomes searchable on the site and
 * is shown on the product page under the OEM Part label.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "../src/lib/data/oem-cross-reference.json");
const input = process.argv[2] ?? resolve(here, "oem-cross-reference-template.csv");

/** Minimal RFC 4180 parser: handles quoted fields, embedded commas and CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i += 1) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const rows = parseCsv(readFileSync(input, "utf8"));
const header = rows.shift().map((h) => h.trim());
const slugAt = header.indexOf("slug");
const oemAt = header
  .map((h, i) => (h.toLowerCase().startsWith("oem") ? i : -1))
  .filter((i) => i >= 0);

if (slugAt < 0 || oemAt.length === 0) {
  console.error("CSV must have a slug column and at least one oem_* column");
  process.exit(1);
}

const map = {};
let filledRows = 0;
let numbers = 0;
const duplicates = [];
for (const row of rows) {
  const slug = (row[slugAt] ?? "").trim();
  if (!slug) continue;
  const values = oemAt
    .map((i) => (row[i] ?? "").trim())
    .filter(Boolean);
  if (values.length === 0) continue;
  const unique = [...new Set(values)];
  if (unique.length !== values.length) duplicates.push(slug);
  map[slug] = unique;
  filledRows += 1;
  numbers += unique.length;
}

writeFileSync(OUT, `${JSON.stringify(map, null, 2)}\n`, "utf8");
console.log(`read   ${input}`);
console.log(`wrote  ${OUT}`);
console.log(`       ${filledRows} products, ${numbers} OEM numbers`);
if (duplicates.length > 0) {
  console.log(`note   repeated number in the same row for: ${duplicates.join(", ")}`);
}
const empty = rows.length - filledRows;
console.log(`       ${empty} products still have no OEM number`);
