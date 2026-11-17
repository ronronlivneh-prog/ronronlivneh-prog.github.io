from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree


PUBLIC_ORIGIN = "https://ronronlivneh-prog.github.io"
SITE_ROOT = Path(__file__).resolve().parents[1]


def public_html_files(root: Path) -> list[Path]:
    return sorted(path for path in root.rglob("*.html") if ".superpowers" not in path.parts and "tmp" not in path.parts)


@dataclass
class ParsedPage:
    lang: str = ""
    direction: str = ""
    title: str = ""
    meta: dict[str, str] = field(default_factory=dict)
    h1_texts: list[str] = field(default_factory=list)
    stylesheets: list[str] = field(default_factory=list)
    visible_text: str = ""
    links: list[str] = field(default_factory=list)
    internal_links: list[str] = field(default_factory=list)
    primary_routes: list[str] = field(default_factory=list)
    section_ids: set[str] = field(default_factory=set)
    speaker: str = ""
    forms: list["FormInfo"] = field(default_factory=list)
    whatsapp_links: list["WhatsAppInfo"] = field(default_factory=list)
    canonical: str = ""
    public_url: str = ""
    hidden_text_markers: list[str] = field(default_factory=list)
    images: list["ImageInfo"] = field(default_factory=list)


@dataclass
class FormInfo:
    action: str
    speaker: str
    required_names: set[str] = field(default_factory=set)
    status_target_exists: bool = False
    control_names: set[str] = field(default_factory=set)
    labeled_names: set[str] = field(default_factory=set)
    pending_controls_disabled: bool = False
    pending_notice_exists: bool = False

    @property
    def every_control_has_label(self) -> bool:
        return self.control_names <= self.labeled_names


@dataclass
class ImageInfo:
    alt: str
    decorative: bool


@dataclass
class WhatsAppInfo:
    href: str
    speaker: str


class _PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.page = ParsedPage()
        self._capture: str | None = None
        self._buffer: list[str] = []
        self._all_text: list[str] = []
        self._hidden_depth = 0
        self._active_form: FormInfo | None = None
        self._label_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag in {"script", "style"}:
            self._hidden_depth += 1
        if tag == "html":
            self.page.lang = values.get("lang", "") or ""
            self.page.direction = values.get("dir", "") or ""
        if tag == "body":
            classes = set((values.get("class") or "").split())
            if "speaker-ron" in classes:
                self.page.speaker = "ron"
            elif "speaker-erez" in classes:
                self.page.speaker = "erez"
        if tag == "section" and values.get("id"):
            self.page.section_ids.add(values["id"] or "")
        if "hidden" in values or "seo-only" in (values.get("class") or "").split():
            self.page.hidden_text_markers.append(tag)
        style = (values.get("style") or "").replace(" ", "").lower()
        if "display:none" in style or "visibility:hidden" in style:
            self.page.hidden_text_markers.append(tag)
        if tag == "form":
            self._active_form = FormInfo(
                action=values.get("action", "") or "",
                speaker=values.get("data-speaker", "") or "",
            )
            self.page.forms.append(self._active_form)
        elif self._active_form is not None:
            if tag == "fieldset" and "disabled" in values:
                self._active_form.pending_controls_disabled = True
            if "data-local-form-notice" in values:
                self._active_form.pending_notice_exists = True
            if tag == "label":
                self._label_depth += 1
            if tag in {"input", "select", "textarea"} and values.get("name"):
                name = values["name"] or ""
                self._active_form.control_names.add(name)
                if "required" in values:
                    self._active_form.required_names.add(name)
                if self._label_depth:
                    self._active_form.labeled_names.add(name)
            if "data-form-status" in values:
                self._active_form.status_target_exists = True
        if tag == "img":
            alt = values.get("alt", "") or ""
            self.page.images.append(ImageInfo(alt=alt, decorative=alt == "" and values.get("aria-hidden") == "true"))
        elif tag == "meta" and values.get("name"):
            self.page.meta[values["name"] or ""] = values.get("content", "") or ""
        elif tag == "link" and values.get("rel") == "stylesheet":
            self.page.stylesheets.append(values.get("href", "") or "")
        elif tag == "link" and values.get("rel") == "canonical":
            self.page.canonical = values.get("href", "") or ""
        elif tag == "a" and values.get("href"):
            href = values["href"] or ""
            self.page.links.append(href)
            if href.startswith("/") and not href.startswith("//"):
                self.page.internal_links.append(href)
            classes = (values.get("class") or "").split()
            if "speaker-route" in classes:
                self.page.primary_routes.append(href)
            if href.startswith("https://wa.me/"):
                self.page.whatsapp_links.append(WhatsAppInfo(href=href, speaker=self.page.speaker))
        elif tag in {"title", "h1"}:
            self._capture = tag
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if not self._hidden_depth:
            self._all_text.append(data)
        if self._capture:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style"} and self._hidden_depth:
            self._hidden_depth -= 1
        if tag == "form":
            self._active_form = None
        elif tag == "label" and self._label_depth:
            self._label_depth -= 1
        if tag != self._capture:
            return
        text = " ".join("".join(self._buffer).split())
        if tag == "title":
            self.page.title = text
        elif tag == "h1":
            self.page.h1_texts.append(text)
        self._capture = None
        self._buffer = []

    def close(self) -> None:
        super().close()
        self.page.visible_text = " ".join(" ".join(self._all_text).split())


def parse_page(path: Path) -> ParsedPage:
    parser = _PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    relative = path.resolve().relative_to(SITE_ROOT).as_posix()
    if relative == "index.html":
        parser.page.public_url = "/"
    elif relative.endswith("/index.html"):
        parser.page.public_url = "/" + relative.removesuffix("index.html")
    else:
        parser.page.public_url = "/" + relative
    return parser.page


def root_relative_url_to_file(root: Path, url: str) -> Path:
    path = urlparse(url).path
    if not path.startswith("/"):
        raise ValueError(f"Expected root-relative URL: {url}")
    relative = path.lstrip("/")
    if not relative:
        return root / "index.html"
    candidate = root / relative
    if path.endswith("/"):
        return candidate / "index.html"
    return candidate


def all_contact_forms(root: Path) -> list[FormInfo]:
    forms: list[FormInfo] = []
    for path in public_html_files(root):
        forms.extend(parse_page(path).forms)
    return forms


def read_sitemap_urls(path: Path) -> set[str]:
    root = ElementTree.parse(path).getroot()
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return {element.text or "" for element in root.findall("sm:url/sm:loc", namespace)}
