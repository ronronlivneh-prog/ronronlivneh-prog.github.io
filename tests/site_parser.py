from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path


PUBLIC_ORIGIN = "https://ronronlivneh-prog.github.io"


@dataclass
class ParsedPage:
    lang: str = ""
    direction: str = ""
    title: str = ""
    meta: dict[str, str] = field(default_factory=dict)
    h1_texts: list[str] = field(default_factory=list)
    stylesheets: list[str] = field(default_factory=list)


class _PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.page = ParsedPage()
        self._capture: str | None = None
        self._buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "html":
            self.page.lang = values.get("lang", "") or ""
            self.page.direction = values.get("dir", "") or ""
        elif tag == "meta" and values.get("name"):
            self.page.meta[values["name"] or ""] = values.get("content", "") or ""
        elif tag == "link" and values.get("rel") == "stylesheet":
            self.page.stylesheets.append(values.get("href", "") or "")
        elif tag in {"title", "h1"}:
            self._capture = tag
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag != self._capture:
            return
        text = " ".join("".join(self._buffer).split())
        if tag == "title":
            self.page.title = text
        elif tag == "h1":
            self.page.h1_texts.append(text)
        self._capture = None
        self._buffer = []


def parse_page(path: Path) -> ParsedPage:
    parser = _PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser.page
