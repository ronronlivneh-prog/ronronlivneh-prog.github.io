from pathlib import Path
import unittest

from tests.site_parser import parse_page


ROOT = Path(__file__).resolve().parents[1]


class SiteTests(unittest.TestCase):
    def test_top_level_pages_have_hebrew_shell(self):
        for rel in ["index.html", "ron-livneh/index.html", "erez-livneh/index.html"]:
            path = ROOT / rel
            self.assertTrue(path.exists(), rel)
            page = parse_page(path)
            self.assertEqual(page.lang, "he")
            self.assertEqual(page.direction, "rtl")
            self.assertEqual(len(page.h1_texts), 1)
            self.assertIn("width=device-width", page.meta["viewport"])
            self.assertEqual(page.stylesheets, ["/assets/css/styles.css"])

    def test_rtl_responsive_foundation(self):
        css_path = ROOT / "assets/css/styles.css"
        self.assertTrue(css_path.exists())
        css = css_path.read_text(encoding="utf-8")
        self.assertIn("padding-inline", css)
        self.assertIn("@media (max-width: 48rem)", css)
        self.assertIn("prefers-reduced-motion", css)


if __name__ == "__main__":
    unittest.main()
