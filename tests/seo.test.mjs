import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), "utf8");

test("Erez's profile presents the Singular School educational venture", () => {
  const html = read("erez-livneh/index.html");

  assert.match(html, /id="singular-school"/);
  assert.match(html, /יזם חינוכי ומייסד בית הספר הסינגולרי/);
  assert.match(html, /זכתה בשני פרסי חינוך ארציים/);
  assert.match(html, /href="https:\/\/singularity-schools\.com\/"/);
  assert.match(html, />לאתר בית הספר הסינגולרי</);
});
