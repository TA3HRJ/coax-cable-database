// node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as coax from "../site/js/coax.js";
import { runParity } from "./parity.cases.mjs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("JS hesabı Excel ile aynı sonucu veriyor (Ham_Bands, Calculator, karşılaştırma)", () => {
  const { checks, failures } = runParity({
    db: JSON.parse(read("../site/data/cables.min.json")),
    hamCsv: read("../export/csv/ham_bands.csv"),
    fixture: JSON.parse(read("./fixtures/excel_calculator.json")),
    coax,
  });
  assert.ok(checks > 2500, `beklenenden az denetim: ${checks}`);
  assert.deepEqual(failures.slice(0, 20), [], `${failures.length} uyuşmazlık`);
});
