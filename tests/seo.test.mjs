import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), "utf8");
const host = "https://www.livnehtalks.co.il";
const profilePages = ["ron-livneh/index.html", "erez-livneh/index.html"];
const lecturePages = [
  "ron-livneh/ai-understand-the-revolution/index.html",
  "ron-livneh/future-of-work/index.html",
  "ron-livneh/future-of-the-human-body/index.html",
  "ron-livneh/dark-side-of-beauty/index.html",
  "erez-livneh/evolution-of-ai/index.html",
  "erez-livneh/create-the-future/index.html",
  "erez-livneh/cinema-vs-science/index.html",
];
const indexablePages = ["index.html", ...profilePages, ...lecturePages];

test("the GitHub Pages custom domain is the canonical www host", () => {
  assert.equal(read("CNAME").trim(), "www.livnehtalks.co.il");
  assert.match(read("robots.txt"), /Sitemap: https:\/\/www\.livnehtalks\.co\.il\/sitemap\.xml/);
  assert.doesNotMatch(read("sitemap.xml"), /ronronlivneh-prog\.github\.io/);
});

function attributeContent(html, selectorPattern) {
  return html.match(selectorPattern)?.[1] ?? "";
}

function structuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test("homepage serves organization events search intent with visible useful copy", () => {
  const html = read("index.html");
  const section = html.match(/<section id="organization-events"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(section, /הרצאות לארגונים ולאירועי חברה/);
  assert.match(section, /מנהלות משאבי אנוש/);
  assert.match(section, /תרבות ורווחה/);
  assert.match(section, /אירועי עובדים/);
  assert.match(section, /כנסים מקצועיים/);
  assert.match(section, /href="\/ron-livneh\/"/);
  assert.match(section, /href="\/erez-livneh\/"/);

  const graph = structuredData(html).find((item) => Array.isArray(item["@graph"]))?.["@graph"] ?? [];
  const organization = graph.find((item) => item["@type"] === "Organization");
  assert.equal(organization?.name, "Livneh Talks");
  assert.deepEqual(organization?.founder?.map((person) => person.name), ["רון ליבנה", "ארז ליבנה"]);
});

test("Erez's profile presents the Singular School educational venture", () => {
  const html = read("erez-livneh/index.html");

  assert.match(html, /id="singular-school"/);
  assert.match(html, /יזם חינוכי ומייסד בית הספר הסינגולרי/);
  assert.match(html, /זכתה בשני פרסי חינוך ארציים/);
  assert.match(html, /href="https:\/\/singularity-schools\.com\/"/);
  assert.match(html, />לאתר בית הספר הסינגולרי</);
});

test("speaker pages connect visible official profiles with structured identity data", () => {
  const cases = [
    {
      path: "ron-livneh/index.html",
      links: [
        "https://www.facebook.com/RonLivnehTalks",
        "https://www.linkedin.com/in/ronlivneh/",
        "https://www.youtube.com/@ronlivneh4044",
      ],
    },
    {
      path: "erez-livneh/index.html",
      links: [
        "https://www.facebook.com/ErezLivnehTalks",
        "https://www.linkedin.com/in/erez-livneh-4374773/",
        "https://singularity-schools.com/",
      ],
    },
  ];

  for (const { path, links } of cases) {
    const html = read(path);
    const profileLinks = html.match(/<nav class="profile-links"[\s\S]*?<\/nav>/)?.[0] ?? "";
    const person = structuredData(html).find((item) => item["@type"] === "ProfilePage")?.mainEntity;

    for (const link of links) {
      assert.match(profileLinks, new RegExp(`href="${link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), path);
      assert.ok(person?.sameAs?.includes(link), `${path}: ${link}`);
    }
    assert.match(profileLinks, /target="_blank"/);
    assert.match(profileLinks, /rel="noopener"/);
  }

  const erezData = structuredData(read("erez-livneh/index.html")).find((item) => item["@type"] === "ProfilePage");
  assert.equal(erezData?.hasPart?.url, "https://singularity-schools.com/");
});

test("indexable pages expose unique canonical URLs and matching social metadata", () => {
  const canonicals = indexablePages.map((path) => {
    const html = read(path);
    const canonical = attributeContent(html, /<link rel="canonical" href="([^"]+)">/);
    const openGraphUrl = attributeContent(html, /<meta property="og:url" content="([^"]+)">/);

    assert.ok(canonical.startsWith(`${host}/`), path);
    assert.equal(openGraphUrl, canonical, path);
    assert.match(html, /<meta property="og:locale" content="he_IL">/, path);
    assert.match(html, /<meta property="og:site_name" content="רון ליבנה וארז ליבנה">/, path);
    return canonical;
  });

  assert.equal(new Set(canonicals).size, indexablePages.length);
});

test("the homepage and speaker profiles use entity-focused titles and structured data", () => {
  const homepage = read("index.html");
  assert.match(homepage, /<title>רון ליבנה וארז ליבנה \| הרצאות על חדשנות, עתידנות, מדע וטכנולוגיה<\/title>/);
  assert.ok(structuredData(homepage).some((data) => data["@graph"]?.some((item) => item["@type"] === "WebSite")));

  for (const path of profilePages) {
    const html = read(path);
    const data = structuredData(html).find((item) => item["@type"] === "ProfilePage");
    assert.ok(data, path);
    assert.equal(data.mainEntity?.["@type"], "Person", path);
    assert.ok(data.mainEntity?.name?.includes("ליבנה"), path);
    assert.ok(data.mainEntity?.alternateName, path);
    assert.ok(data.mainEntity?.description, path);
    assert.ok(data.mainEntity?.image?.startsWith(`${host}/assets/images/`), path);
    assert.ok(data.mainEntity?.knowsAbout?.length >= 4, path);
  }
});

test("lecture pages describe the service and its breadcrumb trail", () => {
  for (const path of lecturePages) {
    const html = read(path);
    const data = structuredData(html).find((item) => Array.isArray(item["@graph"]));
    const service = data?.["@graph"].find((item) => item["@type"] === "Service");
    const breadcrumbs = data?.["@graph"].find((item) => item["@type"] === "BreadcrumbList");

    assert.ok(service, path);
    assert.equal(service.serviceType, "הרצאה", path);
    assert.ok(service.provider?.name?.includes("ליבנה"), path);
    assert.ok(service.provider?.url?.startsWith(`${host}/`), path);
    assert.ok(breadcrumbs, path);
    assert.equal(breadcrumbs.itemListElement?.length, 3, path);
    assert.equal(breadcrumbs.itemListElement?.[0]?.item, `${host}/`, path);
    assert.equal(breadcrumbs.itemListElement?.[2]?.item, service.url, path);
  }
});

test("the sitemap matches every canonical page and records the release date", () => {
  const sitemap = read("sitemap.xml");
  const sitemapEntries = [...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)]
    .map((match) => ({ url: match[1], lastModified: match[2] }));
  const canonicalUrls = indexablePages.map((path) => {
    const html = read(path);
    return attributeContent(html, /<link rel="canonical" href="([^"]+)">/);
  });

  assert.deepEqual(
    new Set(sitemapEntries.map((entry) => entry.url)),
    new Set(canonicalUrls),
  );
  assert.ok(sitemapEntries.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.lastModified)));
});
