import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), "utf8");

function publicHtmlFiles(directoryUrl) {
  const directoryPath = fileURLToPath(directoryUrl);
  return readdirSync(directoryPath, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", ".superpowers", "docs", "tests", "tmp"].includes(entry.name)) return [];
    const childPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) return publicHtmlFiles(new URL(`${entry.name}/`, directoryUrl));
    return entry.name.endsWith(".html") ? [childPath] : [];
  });
}

test("homepage presents the approved centered shared-brand introduction", () => {
  const html = read("index.html");
  const css = read("assets/css/styles.css");

  assert.match(html, /<h1>העתיד מתחיל כאן<\/h1>/);
  assert.match(html, /רעיונות גדולים, טכנולוגיות חדשות ושינויים שמעצבים את המחר - בהרצאות, סדנאות וייעוץ שמביאים אותו אל הבמה ואל תוך הארגון\./);
  assert.match(html, /gateway-section--shared-accent/);
  assert.match(css, /--gateway-accent:\s*#405c66/);
  assert.match(css, /\.gateway-intro\s*\{[^}]*text-align:\s*center/s);
});

test("public HTML avoids en dashes and em dashes", () => {
  const offenders = publicHtmlFiles(root)
    .filter((path) => /[\u2013\u2014]/u.test(readFileSync(path, "utf8")));

  assert.deepEqual(offenders, []);
});

test("Ron uses the approved portraits instead of the pink portrait", () => {
  const homepage = read("index.html");
  const profile = read("ron-livneh/index.html");
  const allPublicHtml = publicHtmlFiles(root).map((path) => readFileSync(path, "utf8")).join("\n");

  assert.doesNotMatch(allPublicHtml, /ron-livneh-portrait\.webp/);
  assert.match(homepage, /ron-livneh-blue-shirt\.jpg/);
  assert.match(profile, /ron-livneh-black-suit-corrected\.png/);
  assert.doesNotMatch(profile, /ron-livneh-black-suit\.jpg/);
  assert.match(profile, /ron-livneh-tea\.jpg/);
});

test("shared homepage labels win over speaker colors and Ron story portrait keeps an upper focal point", () => {
  const css = read("assets/css/styles.css");
  const profile = read("ron-livneh/index.html");

  assert.match(css, /\.gateway-section--shared-accent \.speaker-card\.speaker-ron \.speaker-card__label[\s\S]*color:\s*var\(--gateway-accent\)/);
  assert.match(css, /\.gateway-section--shared-accent \.speaker-card\.speaker-erez \.speaker-card__label[\s\S]*color:\s*var\(--gateway-accent\)/);
  assert.match(profile, /class="story-section__portrait"[^>]*ron-livneh-tea\.jpg/);
  assert.match(css, /\.story-section__portrait\s*\{[^}]*object-position:\s*center 18%/s);
});

test("both speaker pages show real company logo images and Ron shows Yael's testimonial", () => {
  const ron = read("ron-livneh/index.html");
  const erez = read("erez-livneh/index.html");
  const ronLogos = ron.match(/<img src="\/assets\/images\/ron\/logos\/logo-[^"]+" alt="[^"]+"/g) ?? [];
  const erezLogos = erez.match(/<img src="\/assets\/images\/erez\/logos\/logo-[^"]+" alt="[^"]+"/g) ?? [];

  assert.equal(ronLogos.length, 9);
  assert.match(ron, /class="logo-strip logo-strip--ron"/);
  assert.match(ron, /logo-mr-coral\.png" alt="Mr\. Coral"/);
  assert.match(ron, /logo-israel-engineers-association\.png" alt="אגודת בית ההנדסאי והטכנאי"/);
  assert.ok(erezLogos.length >= 6);
  assert.doesNotMatch(erez, /class="client-list"/);
  assert.match(erez, /class="logo-strip logo-strip--erez"/);
  assert.match(ron, /<h2[^>]*>בין לקוחותינו<\/h2>/);
  assert.match(erez, /<h2[^>]*>בין לקוחותינו<\/h2>/);
  assert.match(ron, /יעל, אלייד יוניברסל/);
  assert.match(ron, /הרצאה מרתקת, סוחפת וסופר מעניינת אודות עתיד הגוף האנושי\./);
  assert.match(ron, /רון מרצה רהוטה, מקצועית, נעימה וקולחת\./);
  assert.match(ron, /נהננו מאוד!<br>תודה רבה!/);
  assert.doesNotMatch(read("assets/css/styles.css"), /\.logo-strip img\s*\{[^}]*grayscale/s);
});
