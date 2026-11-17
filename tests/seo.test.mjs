import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), "utf8");
const host = "https://ronronlivneh-prog.github.io";
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

function attributeContent(html, selectorPattern) {
  return html.match(selectorPattern)?.[1] ?? "";
}

function structuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test("Erez's profile presents the Singular School educational venture", () => {
  const html = read("erez-livneh/index.html");

  assert.match(html, /id="singular-school"/);
  assert.match(html, /יזם חינוכי ומייסד בית הספר הסינגולרי/);
  assert.match(html, /זכתה בשני פרסי חינוך ארציים/);
  assert.match(html, /href="https:\/\/singularity-schools\.com\/"/);
  assert.match(html, />לאתר בית הספר הסינגולרי</);
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
