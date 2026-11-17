import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
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

test("the beauty lecture is presented as a compact secondary option", () => {
  const ron = read("ron-livneh/index.html");
  const css = read("assets/css/styles.css");

  assert.match(ron, /class="section special-feature special-feature--compact"/);
  assert.doesNotMatch(ron, /class="special-feature__mark"/);
  assert.match(css, /\.special-feature--compact\s*\{[^}]*min-height:\s*0/s);
  assert.match(css, /\.special-feature--compact\s*\{[^}]*width:\s*min\(100% - 2rem, 50rem\)/s);
  assert.match(css, /\.special-feature__image\s*\{[^}]*max-height:\s*10rem/s);
  assert.match(css, /\.special-feature--compact h2\s*\{[^}]*font-size:/s);
});

test("lecture card images appear below their descriptive text", () => {
  for (const page of ["ron-livneh/index.html", "erez-livneh/index.html"]) {
    const html = read(page);
    const cards = [...html.matchAll(/<article class="content-card">([\s\S]*?)<\/article>/g)];
    assert.ok(cards.length >= 3, page);
    for (const [, card] of cards) {
      assert.ok(card.indexOf("lecture-card__image") > card.lastIndexOf("</p>"), page);
    }
  }
});

test("Ron's About section presents her technology work and human perspective", () => {
  const ron = read("ron-livneh/index.html");
  const css = read("assets/css/styles.css");

  assert.match(ron, /<h2>בין טכנולוגיה, אנשים והעתיד<\/h2>/);
  assert.match(ron, /רון ליבנה היא מרצה, מנהלת פרויקטים ומומחית לאוטומציה ובינה מלאכותית/);
  assert.match(ron, /הייחוד שלה הוא ביכולת לחבר בין הפן הטכנולוגי לפן האנושי/);
  assert.match(ron, /רון היא ביולוגית בהכשרתה, בעלת B\.Sc במדעי החיים מאוניברסיטת תל אביב ו־MBA בהצטיינות מאוניברסיטת בן־גוריון/);
  assert.doesNotMatch(ron, /מדע מתקדם, בגובה העיניים/);
  assert.match(css, /\.special-feature--compact \.text-link\s*\{[^}]*color:\s*#075f5b/s);
});

test("only internal pages show a clear link back to the homepage", () => {
  const homepagePath = fileURLToPath(new URL("index.html", root));
  const homepage = read("index.html");
  const internalPages = publicHtmlFiles(root).filter((path) => path !== homepagePath);

  assert.doesNotMatch(homepage, /class="site-brand"/);
  assert.ok(internalPages.length > 0);
  for (const path of internalPages) {
    const html = readFileSync(path, "utf8");
    assert.match(html, /<a[^>]+href="\/"[^>]*>חזרה לעמוד הראשי<\/a>/, path);
    assert.doesNotMatch(html, /<a class="site-brand"[^>]*>רון ליבנה · ארז ליבנה<\/a>/, path);
  }
});

test("every lecture is represented by a local landscape image", () => {
  const lectureImages = [
    "ai-revolution.jpg",
    "future-of-work.jpg",
    "future-human-body.jpg",
    "dark-side-beauty.jpg",
    "ai-evolution.jpg",
    "create-the-future.jpg",
    "cinema-vs-science.jpg",
  ];
  const publicPages = publicHtmlFiles(root);

  for (const filename of lectureImages) {
    const assetPath = new URL(`../assets/images/lectures/${filename}`, import.meta.url);
    assert.ok(existsSync(assetPath), filename);
    const references = publicPages.filter((page) => readFileSync(page, "utf8").includes(`/assets/images/lectures/${filename}`));
    assert.equal(references.length, 2, filename);
  }
});

test("Ron's profile includes the two local media videos from her original site", () => {
  const html = read("ron-livneh/index.html");
  const mediaVideos = ["channel-14.mp4", "galileo-kan.mp4"];

  assert.match(html, /id="media"/);
  assert.match(html, /פותחים יום עם הראל סגל, ערוץ 14/);
  assert.match(html, /גלילאו בהנחיית גאולה אבן-סער, כאן חינוכית/);
  for (const filename of mediaVideos) {
    const assetPath = new URL(`../assets/videos/ron/${filename}`, import.meta.url);
    assert.ok(existsSync(assetPath), filename);
    assert.match(html, new RegExp(`/assets/videos/ron/${filename}`));
  }
});

test("lecture detail headers link back to both the speaker and the homepage", () => {
  const lecturePages = [
    ["ron-livneh/ai-understand-the-revolution/index.html", "רון", "/ron-livneh/"],
    ["ron-livneh/future-of-work/index.html", "רון", "/ron-livneh/"],
    ["ron-livneh/future-of-the-human-body/index.html", "רון", "/ron-livneh/"],
    ["ron-livneh/dark-side-of-beauty/index.html", "רון", "/ron-livneh/"],
    ["erez-livneh/evolution-of-ai/index.html", "ארז", "/erez-livneh/"],
    ["erez-livneh/create-the-future/index.html", "ארז", "/erez-livneh/"],
    ["erez-livneh/cinema-vs-science/index.html", "ארז", "/erez-livneh/"],
  ];

  for (const [path, speaker, speakerUrl] of lecturePages) {
    const html = read(path);
    assert.match(html, new RegExp(`<a[^>]+href="${speakerUrl}"[^>]*>חזרה לעמוד של ${speaker}</a>`), path);
    assert.match(html, /<a[^>]+href="\/"[^>]*>חזרה לעמוד הראשי<\/a>/, path);
  }
});
