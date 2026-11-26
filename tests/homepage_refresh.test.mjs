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
    if (/^google[a-z0-9]+\.html$/i.test(entry.name)) return [];
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

test("organization routes use each speaker color without redundant profile links", () => {
  const css = read("assets/css/styles.css");
  const homepage = read("index.html");

  assert.match(css, /\.organization-events__choice--ron \.button\s*\{[^}]*background:\s*var\(--ron\)/s);
  assert.match(css, /\.organization-events__choice--erez \.button\s*\{[^}]*background:\s*var\(--erez\)/s);
  assert.match(homepage, /organization-events__choice--ron[\s\S]*href="\/ron-livneh\/ai-lectures-for-organizations\/"/);
  assert.match(homepage, /organization-events__choice--erez[\s\S]*href="\/erez-livneh\/innovation-futures-for-organizations\/"/);
  assert.doesNotMatch(homepage, /organization-events__profile-link/);
  assert.doesNotMatch(css, /\.organization-events__profile-link/);
});

test("both speaker pages show real company logo images and Ron shows Yael's testimonial", () => {
  const ron = read("ron-livneh/index.html");
  const ronOrganizations = read("ron-livneh/ai-lectures-for-organizations/index.html");
  const erez = read("erez-livneh/index.html");
  const ronLogos = ron.match(/<img[^>]+src="\/assets\/images\/ron\/logos\/logo-[^"]+"[^>]+alt="[^"]+"/g) ?? [];
  const erezLogos = erez.match(/<img[^>]+src="\/assets\/images\/erez\/logos\/logo-[^"]+"[^>]+alt="[^"]+"/g) ?? [];

  assert.equal(ronLogos.length, 9);
  assert.match(ron, /class="logo-strip logo-strip--ron"/);
  assert.match(ron, /logo-mr-coral-landscape\.png" alt="Coral Creative Technologies"/);
  assert.match(ron, /logo-israel-engineers-association\.png" alt="אגודת בית ההנדסאי והטכנאי"/);
  assert.match(ronOrganizations, /logo-mr-coral-landscape\.png" alt="Coral Creative Technologies"/);
  assert.match(ronOrganizations, /logo-israel-engineers-association\.png" alt="אגודת בית ההנדסאי והטכנאי"/);
  assert.match(ronOrganizations, /class="logo-strip__logo--large" src="\/assets\/images\/ron\/logos\/logo-strauss\.png"/);
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
  assert.match(read("assets/css/styles.css"), /\.logo-strip img\.logo-strip__logo--large\s*\{[^}]*padding:\s*0\.25rem/s);
});

test("Ron's organization page promotes Allied instead of Cinema City and avoids a repeated hero photo", () => {
  const page = read("ron-livneh/ai-lectures-for-organizations/index.html");
  const logoStrip = page.match(/<div class="logo-strip logo-strip--ron"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.doesNotMatch(logoStrip, /logo-cinema-city\.png|alt="סינמה סיטי"/);
  assert.equal((logoStrip.match(/logo-allied-universal\.svg/g) ?? []).length, 1);
  assert.ok(
    logoStrip.indexOf("logo-allied-universal.svg") > logoStrip.indexOf("logo-elbit.svg")
      && logoStrip.indexOf("logo-allied-universal.svg") < logoStrip.indexOf("logo-strauss.png"),
    "Allied should occupy Cinema City's former position between Elbit and Strauss",
  );
  assert.match(
    page,
    /<figure class="lecture-hero__media"><img src="\/assets\/images\/ron\/ron-livneh-black-suit-corrected\.png"/,
  );
  assert.match(
    page,
    /<img class="lecture-card__image" src="\/assets\/images\/lectures\/ai-revolution\.jpg\?v=20261117"/,
  );
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

test("lecture cards share fixed desktop rows and equal landscape media", () => {
  const css = read("assets/css/styles.css");
  const ron = read("ron-livneh/index.html");
  const erez = read("erez-livneh/index.html");

  assert.match(css, /\.content-card\s*\{[^}]*display:\s*grid[^}]*grid-template-rows:\s*2rem 8\.75rem 7\.5rem auto 2rem/s);
  assert.match(css, /\.lecture-card__image\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/s);
  assert.match(css, /@media \(max-width: 48rem\)[\s\S]*\.content-card\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s);
  for (const html of [ron, erez]) {
    const cards = [...html.matchAll(/<article class="content-card">([\s\S]*?)<\/article>/g)];
    assert.equal(cards.length, 3);
    for (const [, card] of cards) {
      assert.match(card, /class="lecture-card__image"[^>]*width="1600" height="1067"/);
    }
  }
});

test("Ron's lecture cards use her real stage photos and the approved beauty image", () => {
  const ron = read("ron-livneh/index.html");
  const body = read("ron-livneh/future-of-the-human-body/index.html");
  const beauty = read("ron-livneh/dark-side-of-beauty/index.html");

  assert.match(ron, /alt="רון ליבנה מרצה מול קהל על בינה מלאכותית"/);
  assert.match(ron, /alt="רון ליבנה מרצה על במה"/);
  assert.match(ron, /alt="רון ליבנה מרצה על רובוטיקה ועתיד הגוף"/);
  assert.match(body, /alt="רון ליבנה מרצה על רובוטיקה ועתיד הגוף"/);
  assert.match(ron, /אישה מקהילת הקאיאן עם טבעות צוואר מסורתיות עובדת על נול/);
  assert.match(beauty, /CEphoto, Uwe Aranas/);
  assert.match(beauty, /CC BY-SA 3\.0/);
});

test("Ron's replaced lecture photos use cache-busting URLs", () => {
  const pages = [
    "ron-livneh/index.html",
    "ron-livneh/ai-understand-the-revolution/index.html",
    "ron-livneh/future-of-work/index.html",
    "ron-livneh/future-of-the-human-body/index.html",
  ];

  for (const page of pages) {
    const html = read(page);
    for (const match of html.matchAll(/src="(\/assets\/images\/lectures\/(?:ai-revolution|future-of-work|future-human-body)\.jpg[^"]*)"/g)) {
      assert.match(match[1], /\?v=20261117$/, `${page}: ${match[1]}`);
    }
  }
});

test("Erez's lecture cards use real speaking photos from his agency gallery", () => {
  const erez = read("erez-livneh/index.html");
  const credits = read("assets/images/lectures/CREDITS.md");

  assert.match(erez, /alt="ארז ליבנה מרצה על התפתחות הטכנולוגיה"/);
  assert.match(erez, /alt="ארז ליבנה מרצה מול קהל"/);
  assert.match(erez, /alt="ארז ליבנה בשיחה על במה"/);
  assert.match(credits, /speaxit\.co\.il\/lecturer/);
  assert.doesNotMatch(credits, /ai-evolution\.jpg.*OpenAI/);
  assert.doesNotMatch(credits, /create-the-future\.jpg.*OpenAI/);
  assert.doesNotMatch(credits, /cinema-vs-science\.jpg.*OpenAI/);
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
    assert.ok(references.length >= 2, `${filename}: expected profile and detail coverage`);
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

test("Ron's profile links to two full interviews with local thumbnails", () => {
  const html = read("ron-livneh/index.html");
  const interviews = html.match(/<div class="interview-grid">([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.match(html, /<h3>ראיונות מלאים<\/h3>/);
  assert.match(interviews, /https:\/\/www\.youtube\.com\/watch\?v=stqnsz8FWMg/);
  assert.match(interviews, /https:\/\/www\.youtube\.com\/watch\?v=L-MmUAxecYY/);
  assert.match(interviews, /ראיון עם רון ליבנה בתוכנית הקוד הבריאותי עם איציק וקסלר/);
  assert.match(interviews, /מובילות שינוי עם דנה גולדרינג \| רון ליבנה/);
  assert.match(interviews, /11:19/);
  assert.match(interviews, /18:18/);
  assert.match(interviews, /\/assets\/images\/ron\/interview-health-code\.jpg/);
  assert.match(interviews, /\/assets\/images\/ron\/interview-leading-change\.jpg/);
  assert.match(interviews, /alt="תמונת תצוגה מהראיון של רון ליבנה בתוכנית הקוד הבריאותי"/);
  assert.match(interviews, /alt="תמונת תצוגה מהראיון של רון ליבנה בתוכנית מובילות שינוי"/);
  assert.match(interviews, /target="_blank"/);
  assert.match(interviews, /rel="noopener"/);
  assert.doesNotMatch(interviews, /<iframe/);
});

test("contact forms use isolated verified Formspree endpoints for each speaker", () => {
  const ronPages = [
    "ron-livneh/index.html",
    "ron-livneh/ai-understand-the-revolution/index.html",
    "ron-livneh/future-of-work/index.html",
    "ron-livneh/future-of-the-human-body/index.html",
    "ron-livneh/dark-side-of-beauty/index.html",
  ];
  const erezPages = [
    "erez-livneh/index.html",
    "erez-livneh/evolution-of-ai/index.html",
    "erez-livneh/create-the-future/index.html",
    "erez-livneh/cinema-vs-science/index.html",
  ];

  for (const path of ronPages) {
    const form = read(path).match(/<form class="contact-form"[\s\S]*?<\/form>/)?.[0] ?? "";
    assert.match(form, /action="https:\/\/formspree\.io\/f\/xeagpwby"/, path);
    assert.match(form, /data-endpoint-status="ready"/, path);
    assert.doesNotMatch(form, /<fieldset disabled>/, path);
    assert.doesNotMatch(form, /data-local-form-notice/, path);
  }

  for (const path of erezPages) {
    const form = read(path).match(/<form class="contact-form"[\s\S]*?<\/form>/)?.[0] ?? "";
    assert.match(form, /action="https:\/\/formspree\.io\/f\/xdegyaql"/, path);
    assert.match(form, /data-endpoint-status="ready"/, path);
    assert.doesNotMatch(form, /<fieldset disabled>/, path);
    assert.doesNotMatch(form, /data-local-form-notice/, path);
  }
});

test("contact form script preserves success, reset and WhatsApp fallback behavior", () => {
  const script = read("assets/js/forms.js");

  assert.match(script, /button\.disabled = true/);
  assert.match(script, /body: new FormData\(form\)/);
  assert.match(script, /headers: \{ Accept: "application\/json" \}/);
  assert.match(script, /if \(!response\.ok\) throw new Error/);
  assert.match(script, /form\.reset\(\)/);
  assert.match(script, /הפרטים נשלחו בהצלחה/);
  assert.match(script, /אפשר לפנות אלינו ישירות בוואטסאפ/);
  assert.match(script, /finally[\s\S]*button\.disabled = false/);
});

test("all direct WhatsApp actions use the approved white and green component", () => {
  const publicPages = publicHtmlFiles(root);
  const whatsappLinks = publicPages.flatMap((path) => {
    const html = readFileSync(path, "utf8");
    return [...html.matchAll(/<a class="([^"]*)" href="https:\/\/wa\.me\/[^"]+">[^<]+<\/a>/g)]
      .map((match) => ({ path, classes: match[1] }));
  });
  const css = read("assets/css/styles.css");
  const iconPath = new URL("../assets/images/icons/whatsapp.svg", import.meta.url);

  assert.ok(whatsappLinks.length >= 9);
  for (const link of whatsappLinks) {
    assert.match(link.classes, /\bbutton\b/, link.path);
    assert.match(link.classes, /\bwhatsapp-button\b/, link.path);
  }
  assert.ok(existsSync(iconPath));
  const icon = readFileSync(iconPath, "utf8");
  assert.match(icon, /viewBox="0 0 24 24"/);
  assert.match(icon, /<title>WhatsApp<\/title>/);
  assert.match(icon, /<path fill="#075e54"/);
  assert.match(css, /\.whatsapp-button\s*\{[^}]*background(?:-color)?:\s*white/s);
  assert.match(css, /\.whatsapp-button\s*\{[^}]*border:\s*2px solid #075e54/s);
  assert.match(css, /\.whatsapp-button\s*\{[^}]*box-shadow:/s);
  assert.match(css, /\.whatsapp-button::before\s*\{[^}]*url\("\/assets\/images\/icons\/whatsapp\.svg\?v=20261124-2"\) center \/ 82% no-repeat/s);

  for (const path of publicPages) {
    const html = readFileSync(path, "utf8");
    assert.doesNotMatch(html, /<button[^>]*class="[^"]*whatsapp-button/);
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
