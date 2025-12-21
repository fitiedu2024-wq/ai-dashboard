"""
Unit tests for scraper module
Run with: pytest tests/test_scraper.py -v
"""
import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import (
    analyze_page_technical_seo,
    detect_tracking_pixels,
    extract_keywords_with_yake,
    extract_internal_links,
    generate_seo_issues,
    generate_recommendations,
    get_random_user_agent,
    USER_AGENTS
)
from bs4 import BeautifulSoup


class TestUserAgentRotation:
    """Test user agent rotation"""

    def test_get_random_user_agent(self):
        """Test random user agent selection"""
        ua = get_random_user_agent()
        assert ua in USER_AGENTS

    def test_user_agents_list_not_empty(self):
        """Test user agents list is not empty"""
        assert len(USER_AGENTS) > 0


class TestTechnicalSEOAnalysis:
    """Test technical SEO analysis functions"""

    def test_complete_page_analysis(self):
        """Test analysis of a complete page"""
        html = """
        <html>
        <head>
            <title>Perfect Title Length for SEO Testing</title>
            <meta name="description" content="This is a perfect meta description that is between 120 and 160 characters long for optimal SEO performance in search results.">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta property="og:title" content="Test">
            <script type="application/ld+json">{"@type": "WebSite"}</script>
        </head>
        <body>
            <h1>Main Heading</h1>
            <h2>Subheading 1</h2>
            <h2>Subheading 2</h2>
            <p>Content paragraph with lots of words to make the content length good.</p>
            <img src="test1.jpg" alt="Test image 1">
            <img src="test2.jpg" alt="Test image 2">
            <a href="/page1">Internal Link 1</a>
            <a href="/page2">Internal Link 2</a>
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        analysis = analyze_page_technical_seo(soup, "https://example.com")

        # Check all required fields exist
        assert "title" in analysis
        assert "meta_description" in analysis
        assert "headers" in analysis
        assert "images" in analysis
        assert "links" in analysis
        assert "content" in analysis
        assert "technical" in analysis
        assert "overall_score" in analysis

        # Check values
        assert analysis["headers"]["h1_count"] == 1
        assert analysis["headers"]["h2_count"] == 2
        assert analysis["images"]["total"] == 2
        assert analysis["images"]["with_alt"] == 2
        assert analysis["images"]["alt_coverage"] == 100
        assert analysis["technical"]["has_schema"] == True
        assert analysis["technical"]["mobile_friendly"] == True
        assert analysis["technical"]["has_open_graph"] == True

    def test_page_with_missing_elements(self):
        """Test analysis of page with missing elements"""
        html = """
        <html>
        <head></head>
        <body>
            <p>Just some content.</p>
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        analysis = analyze_page_technical_seo(soup, "https://example.com")

        assert analysis["title"]["text"] == ""
        assert analysis["meta_description"]["text"] == ""
        assert analysis["headers"]["h1_count"] == 0
        assert analysis["technical"]["has_schema"] == False
        assert analysis["technical"]["mobile_friendly"] == False

    def test_images_without_alt(self):
        """Test image alt coverage calculation"""
        html = """
        <html>
        <body>
            <img src="1.jpg" alt="Has alt">
            <img src="2.jpg">
            <img src="3.jpg">
            <img src="4.jpg" alt="Has alt too">
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        analysis = analyze_page_technical_seo(soup, "https://example.com")

        assert analysis["images"]["total"] == 4
        assert analysis["images"]["with_alt"] == 2
        assert analysis["images"]["alt_coverage"] == 50.0


class TestTrackingPixelDetection:
    """Test tracking pixel detection"""

    def test_detect_google_analytics(self):
        """Test Google Analytics detection"""
        html = """
        <script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert trackers["google_analytics"] == True

    def test_detect_facebook_pixel(self):
        """Test Facebook Pixel detection"""
        html = """
        <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
        <script>fbq('init', '1234567890');</script>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert trackers["facebook_pixel"] == True
        assert trackers["fb_pixel_id"] == "1234567890"

    def test_detect_gtm(self):
        """Test Google Tag Manager detection"""
        html = """
        <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXX"></script>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert trackers["google_tag_manager"] == True

    def test_detect_tiktok_pixel(self):
        """Test TikTok Pixel detection"""
        html = """
        <script src="https://analytics.tiktok.com/i18n/pixel/sdk.js"></script>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert trackers["tiktok_pixel"] == True

    def test_no_trackers(self):
        """Test page with no trackers"""
        html = """
        <html><body><p>Clean page</p></body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert trackers["google_analytics"] == False
        assert trackers["facebook_pixel"] == False
        assert trackers["google_tag_manager"] == False


class TestInternalLinkExtraction:
    """Test internal link extraction"""

    def test_extract_internal_links(self):
        """Test extraction of internal links"""
        html = """
        <html>
        <body>
            <a href="/page1">Page 1</a>
            <a href="/page2">Page 2</a>
            <a href="https://example.com/page3">Page 3</a>
            <a href="https://external.com/page">External</a>
            <a href="mailto:test@test.com">Email</a>
            <a href="tel:123456">Phone</a>
            <a href="#anchor">Anchor</a>
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = extract_internal_links(soup, "https://example.com")

        # Should include internal links only
        assert len(links) == 3
        assert any("/page1" in link for link in links)
        assert any("/page2" in link for link in links)
        assert any("/page3" in link for link in links)

    def test_exclude_files(self):
        """Test exclusion of file links"""
        html = """
        <html>
        <body>
            <a href="/document.pdf">PDF</a>
            <a href="/image.jpg">Image</a>
            <a href="/page">Page</a>
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = extract_internal_links(soup, "https://example.com")

        assert len(links) == 1
        assert any("/page" in link for link in links)


class TestKeywordExtraction:
    """Test keyword extraction"""

    def test_extract_keywords(self):
        """Test keyword extraction from text"""
        text = """
        Search engine optimization is crucial for digital marketing success.
        SEO helps websites rank higher in search results. Good SEO practices
        include keyword research, content optimization, and link building.
        """
        keywords = extract_keywords_with_yake(text, top_n=10)

        assert isinstance(keywords, list)
        assert len(keywords) <= 10
        if keywords:
            assert "term" in keywords[0]
            assert "priority" in keywords[0]

    def test_empty_text(self):
        """Test keyword extraction with empty text"""
        keywords = extract_keywords_with_yake("", top_n=5)
        assert keywords == [] or isinstance(keywords, list)


class TestIssueGeneration:
    """Test SEO issue generation"""

    def test_generate_issues_low_score(self):
        """Test issue generation for low SEO score"""
        analyses = [
            {"overall_score": 40, "title": {"length": 50}, "meta_description": {"length": 150},
             "headers": {"h1_count": 1}, "images": {"alt_coverage": 80, "total": 5},
             "technical": {"has_schema": False}}
        ]
        issues = generate_seo_issues(analyses, 40, 80, 0)

        assert any("Low average SEO score" in issue for issue in issues)
        assert any("schema" in issue.lower() for issue in issues)

    def test_generate_issues_missing_h1(self):
        """Test issue generation for missing H1"""
        analyses = [
            {"overall_score": 70, "title": {"length": 50}, "meta_description": {"length": 0},
             "headers": {"h1_count": 0}, "images": {"alt_coverage": 100, "total": 0},
             "technical": {"has_schema": True}}
        ]
        issues = generate_seo_issues(analyses, 70, 100, 100)

        assert any("H1" in issue for issue in issues)
        assert any("meta description" in issue.lower() for issue in issues)


class TestRecommendationGeneration:
    """Test recommendation generation"""

    def test_generate_recommendations_low_content(self):
        """Test recommendations for low content"""
        analyses = [
            {"content": {"word_count": 200}, "images": {"alt_coverage": 100, "total": 0},
             "meta_description": {"length": 150}, "technical": {"mobile_friendly": True}}
        ]
        recommendations = generate_recommendations(analyses, 50, 200, 20)

        assert any("content" in rec.lower() for rec in recommendations)
        assert any("schema" in rec.lower() or "structured" in rec.lower() for rec in recommendations)

    def test_generate_recommendations_good_site(self):
        """Test recommendations for well-optimized site"""
        analyses = [
            {"content": {"word_count": 1500}, "images": {"alt_coverage": 100, "total": 5},
             "meta_description": {"length": 155}, "technical": {"mobile_friendly": True}}
        ]
        recommendations = generate_recommendations(analyses, 85, 1500, 80)

        # Should have fewer recommendations for good sites
        assert len(recommendations) <= 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
