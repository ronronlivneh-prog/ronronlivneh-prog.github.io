from pathlib import Path
import unittest

from tests.site_parser import (
    PUBLIC_ORIGIN,
    all_contact_forms,
    parse_page,
    public_html_files,
    read_sitemap_urls,
    root_relative_url_to_file,
)


ROOT = Path(__file__).resolve().parents[1]


class SiteTests(unittest.TestCase):
    def test_every_page_has_unique_indexable_metadata(self):
        pages = [parse_page(path) for path in public_html_files(ROOT) if path.name != "404.html"]
        self.assertEqual(len({page.title for page in pages}), len(pages))
        descriptions = [page.meta.get("description", "") for page in pages]
        self.assertTrue(all(descriptions))
        self.assertEqual(len(set(descriptions)), len(pages))
        for page in pages:
            self.assertEqual(page.canonical, PUBLIC_ORIGIN + page.public_url)
            self.assertNotIn("noindex", page.meta.get("robots", ""))
            self.assertEqual(len(page.h1_texts), 1)
            self.assertFalse(page.hidden_text_markers)

    def test_sitemap_matches_public_pages(self):
        expected = {
            PUBLIC_ORIGIN + parse_page(path).public_url
            for path in public_html_files(ROOT)
            if path.name != "404.html"
        }
        self.assertEqual(read_sitemap_urls(ROOT / "sitemap.xml"), expected)

    def test_contact_routes_match_page_owner_in_local_mode(self):
        for path in public_html_files(ROOT):
            page = parse_page(path)
            if page.speaker not in {"ron", "erez"}:
                continue
            self.assertEqual({form.speaker for form in page.forms}, {page.speaker}, str(path))
            self.assertEqual({form.action for form in page.forms}, {""}, str(path))
            self.assertEqual({link.speaker for link in page.whatsapp_links}, {page.speaker}, str(path))
            self.assertRegex(page.whatsapp_links[0].href, r"^https://wa\.me/[1-9]\d{7,14}\?text=", str(path))

    def test_contact_forms_have_required_fields_and_status_target(self):
        forms = all_contact_forms(ROOT)
        self.assertEqual(len(forms), 9)
        for form in forms:
            self.assertEqual(
                form.required_names,
                {"name", "organization", "phone", "email", "service", "message"},
            )
            self.assertTrue(form.status_target_exists)

    def test_erez_lecture_pages_and_service_sections(self):
        expected = {
            "erez-livneh/evolution-of-ai/index.html": "האבולוציה של הבינה המלאכותית",
            "erez-livneh/create-the-future/index.html": "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו",
            "erez-livneh/cinema-vs-science/index.html": "עתיד האנושות: קולנוע מול מדע",
        }
        for rel, heading in expected.items():
            path = ROOT / rel
            self.assertTrue(path.exists(), rel)
            self.assertEqual(parse_page(path).h1_texts, [heading])
        profile = parse_page(ROOT / "erez-livneh/index.html")
        self.assertEqual(
            profile.section_ids & {"lectures", "workshops", "consulting"},
            {"lectures", "workshops", "consulting"},
        )

    def test_ron_lecture_pages_and_positioning(self):
        expected = {
            "ron-livneh/ai-understand-the-revolution/index.html": "AI: להבין את המהפכה",
            "ron-livneh/future-of-work/index.html": "עתיד העבודה: מה יישאר אנושי בעולם אוטומטי?",
            "ron-livneh/future-of-the-human-body/index.html": "עתיד הגוף האנושי",
            "ron-livneh/dark-side-of-beauty/index.html": "הצד האפל של היופי",
        }
        for rel, heading in expected.items():
            path = ROOT / rel
            self.assertTrue(path.exists(), rel)
            page = parse_page(path)
            self.assertEqual(page.h1_texts, [heading])
            self.assertIn("/ron-livneh/", page.internal_links)

    def test_ron_copy_avoids_outdated_positioning(self):
        text = " ".join(
            parse_page(path).visible_text
            for path in public_html_files(ROOT)
            if "ron-livneh" in str(path)
        )
        self.assertNotIn("עתידנית הבית", text)
        self.assertNotIn("מנהלת המיזם החינוכי", text)

    def test_ron_ai_page_mentions_former_names_visibly(self):
        text = parse_page(ROOT / "ron-livneh/ai-understand-the-revolution/index.html").visible_text
        for former_name in [
            "אני הרובוט שלך",
            "כשבינה מלאכותית כותבת שירה",
            "מהפכת הבינה המלאכותית",
            "בינה מלאכותית למתחילים",
        ]:
            self.assertIn(former_name, text)

    def test_home_has_exactly_two_primary_speaker_routes(self):
        page = parse_page(ROOT / "index.html")
        self.assertEqual(page.primary_routes, ["/ron-livneh/", "/erez-livneh/"])
        self.assertIn("רון ליבנה — מרצה ומומחית לאוטומציה ובינה מלאכותית", page.visible_text)
        self.assertIn("מנגישה מדע וטכנולוגיה לקהל הרחב", page.visible_text)
        self.assertIn("ארז ליבנה — מדען, יזם וחוקר עתידים", page.visible_text)
        self.assertIn("יועץ לארגונים ומומחה לתהליכי חדשנות", page.visible_text)

    def test_home_internal_links_resolve(self):
        page = parse_page(ROOT / "index.html")
        for href in page.internal_links:
            self.assertTrue(root_relative_url_to_file(ROOT, href).exists(), href)

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
