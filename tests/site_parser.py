from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


PUBLIC_ORIGIN = "https://ronronlivneh-prog.github.io"


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


@dataclass
class FormInfo:
    action: str
    speaker: str
    required_names: set[str] = field(default_factory=set)
    status_target_exists: bool = False


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
        if tag == "form":
            self._active_form = FormInfo(
                action=values.get("action", "") or "",
                speaker=values.get("data-speaker", "") or "",
            )
            self.page.forms.append(self._active_form)
        elif self._active_form is not None:
            if tag in {"input", "select", "textarea"} and "required" in values and values.get("name"):
                self._active_form.required_names.add(values["name"] or "")
            if "data-form-status" in values:
                self._active_form.status_target_exists = True
        elif tag == "meta" and values.get("name"):
            self.page.meta[values["name"] or ""] = values.get("content", "") or ""
        elif tag == "link" and values.get("rel") == "stylesheet":
            self.page.stylesheets.append(values.get("href", "") or "")
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
