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
    def test_homepage_refresh(self):
        page = parse_page(ROOT / "index.html")
        css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
        self.assertEqual(page.h1_texts, ["העתיד מתחיל כאן"])
        self.assertIn(
            "רעיונות גדולים, טכנולוגיות חדשות ושינויים שמעצבים את המחר - "
            "בהרצאות, סדנאות וייעוץ שמביאים אותו אל הבמה ואל תוך הארגון.",
            page.visible_text,
        )
        self.assertIn("gateway-section--shared-accent", (ROOT / "index.html").read_text(encoding="utf-8"))
        self.assertIn("--gateway-accent: #405c66", css)
        self.assertIn("text-align: center", css)

    def test_public_html_avoids_long_dashes(self):
        offenders = {
            str(path.relative_to(ROOT)): [character for character in ("\u2013", "\u2014") if character in path.read_text(encoding="utf-8")]
            for path in public_html_files(ROOT)
            if any(character in path.read_text(encoding="utf-8") for character in ("\u2013", "\u2014"))
        }
        self.assertEqual(offenders, {})

    def test_ron_uses_approved_portraits_instead_of_pink_portrait(self):
        public_html = "\n".join(path.read_text(encoding="utf-8") for path in public_html_files(ROOT))
        self.assertNotIn("ron-livneh-portrait.webp", public_html)
        self.assertIn("ron-livneh-blue-shirt.jpg", (ROOT / "index.html").read_text(encoding="utf-8"))
        profile_html = (ROOT / "ron-livneh/index.html").read_text(encoding="utf-8")
        self.assertIn("ron-livneh-black-suit-corrected.png", profile_html)
        self.assertNotIn("ron-livneh-black-suit.jpg", profile_html)
        self.assertIn("ron-livneh-tea.jpg", profile_html)

    def test_speaker_profiles_show_company_logos_and_approved_testimonial(self):
        ron = (ROOT / "ron-livneh/index.html").read_text(encoding="utf-8")
        erez = (ROOT / "erez-livneh/index.html").read_text(encoding="utf-8")
        self.assertEqual(ron.count('/assets/images/ron/logos/logo-'), 9)
        self.assertGreaterEqual(erez.count('<img src="/assets/images/erez/logos/logo-'), 6)
        self.assertNotIn('class="client-list"', erez)
        self.assertIn('class="logo-strip logo-strip--erez"', erez)
        self.assertIn(">בין לקוחותינו</h2>", ron)
        self.assertIn(">בין לקוחותינו</h2>", erez)
        self.assertIn("יעל, אלייד יוניברסל", ron)
        self.assertIn("הרצאה מרתקת, סוחפת וסופר מעניינת אודות עתיד הגוף האנושי.", ron)

    def test_images_and_forms_are_accessible(self):
        for page in map(parse_page, public_html_files(ROOT)):
            for image in page.images:
                self.assertTrue(image.alt.strip() or image.decorative)
            for form in page.forms:
                self.assertTrue(form.every_control_has_label)
                self.assertTrue(form.status_target_exists)

    def test_mobile_media_contract(self):
        css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
        self.assertIn("img", css)
        self.assertIn("max-inline-size: 100%", css)
        self.assertIn("@media (max-width: 48rem)", css)

    def test_local_video_assets_are_web_optimized_and_have_posters(self):
        video_dir = ROOT / "assets/videos/ron"
        image_dir = ROOT / "assets/images/ron"
        self.assertLess((video_dir / "channel-14.mp4").stat().st_size, 20_000_000)
        self.assertLess((video_dir / "galileo-kan.mp4").stat().st_size, 8_000_000)
        for filename in ["video-channel-14-poster.jpg", "video-galileo-kan-poster.jpg"]:
            poster = image_dir / filename
            self.assertTrue(poster.exists(), filename)
            self.assertGreater(poster.stat().st_size, 10_000, filename)

    def test_every_page_has_unique_indexable_metadata(self):
        pages = [
            parse_page(path)
            for path in public_html_files(ROOT)
            if path.name not in {"404.html", "googlef522861f96138838.html"}
        ]
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
            if path.name not in {"404.html", "googlef522861f96138838.html"}
        }
        self.assertEqual(read_sitemap_urls(ROOT / "sitemap.xml"), expected)

    def test_contact_routes_match_page_owner_and_live_endpoint(self):
        endpoints = {
            "ron": "https://formspree.io/f/xeagpwby",
            "erez": "https://formspree.io/f/xdegyaql",
        }
        for path in public_html_files(ROOT):
            page = parse_page(path)
            if page.speaker not in {"ron", "erez"}:
                continue
            self.assertEqual({form.speaker for form in page.forms}, {page.speaker}, str(path))
            self.assertEqual({form.action for form in page.forms}, {endpoints[page.speaker]}, str(path))
            self.assertEqual({link.speaker for link in page.whatsapp_links}, {page.speaker}, str(path))
            self.assertRegex(page.whatsapp_links[0].href, r"^https://wa\.me/[1-9]\d{7,14}\?text=", str(path))

    def test_contact_forms_have_required_fields_and_status_target(self):
        forms = all_contact_forms(ROOT)
        self.assertEqual(len(forms), 11)
        for form in forms:
            self.assertEqual(
                form.required_names,
                {"name", "organization", "phone", "email", "service", "message"},
            )
            self.assertTrue(form.status_target_exists)

    def test_live_forms_are_enabled_without_local_pending_notice(self):
        for form in all_contact_forms(ROOT):
            self.assertFalse(form.pending_notice_exists)
            self.assertFalse(form.pending_controls_disabled)

    def test_contact_whatsapp_buttons_keep_accessible_contrast(self):
        css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
        self.assertIn(".speaker-ron .contact-panel__intro .button", css)
        self.assertIn(".speaker-erez .contact-panel__intro .button", css)
        self.assertIn("background: white; color: var(--ink);", css)

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
        self.assertIn("רון ליבנה - מרצה ומומחית לאוטומציה ובינה מלאכותית", page.visible_text)
        self.assertIn("מנגישה מדע וטכנולוגיה לקהל הרחב", page.visible_text)
        self.assertIn("ארז ליבנה - מדען, יזם וחוקר עתידים", page.visible_text)
        self.assertIn("יועץ לארגונים ומומחה לתהליכי חדשנות", page.visible_text)

    def test_home_shows_both_speakers_with_portraits(self):
        page = parse_page(ROOT / "index.html")
        self.assertEqual({image.alt for image in page.images}, {"רון ליבנה", "ארז ליבנה"})

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
