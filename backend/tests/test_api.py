"""
Unit tests for AI Grinners API
Run with: pytest tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app, rate_limiter, analysis_cache


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    """Get authentication token"""
    response = client.post(
        "/api/token",
        data={"username": os.getenv("ADMIN_EMAIL", "admin@example.com"),
              "password": os.getenv("ADMIN_PASSWORD", "testpassword")}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter before each test"""
    rate_limiter.requests.clear()
    yield


class TestHealthEndpoints:
    """Test health check endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "version" in data

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "database" in data

    def test_api_stats(self, client):
        """Test API stats endpoint"""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "cache_entries" in data
        assert "version" in data


class TestAuthentication:
    """Test authentication endpoints"""

    def test_login_missing_credentials(self, client):
        """Test login with missing credentials"""
        response = client.post("/api/token", data={})
        assert response.status_code == 422  # Validation error

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/token",
            data={"username": "invalid@test.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401

    def test_rate_limiting_login(self, client):
        """Test rate limiting on login endpoint"""
        # Make 6 login attempts (limit is 5)
        for i in range(6):
            response = client.post(
                "/api/token",
                data={"username": "test@test.com", "password": "wrong"}
            )
            if i < 5:
                assert response.status_code in [401, 403]
            else:
                assert response.status_code == 429  # Rate limited


class TestProtectedEndpoints:
    """Test protected API endpoints"""

    def test_get_user_no_token(self, client):
        """Test accessing user endpoint without token"""
        response = client.get("/api/user")
        assert response.status_code == 401

    def test_get_me_no_token(self, client):
        """Test accessing me endpoint without token"""
        response = client.get("/api/me")
        assert response.status_code == 401


class TestRateLimiter:
    """Test rate limiter functionality"""

    def test_rate_limiter_allows_initial_requests(self):
        """Test that rate limiter allows initial requests"""
        assert rate_limiter.is_allowed("test_key", "default") == True
        assert rate_limiter.is_allowed("test_key", "default") == True

    def test_rate_limiter_blocks_excessive_requests(self):
        """Test that rate limiter blocks after limit exceeded"""
        # Login limit is 5 per minute
        for i in range(5):
            assert rate_limiter.is_allowed("login_test", "login") == True

        # 6th request should be blocked
        assert rate_limiter.is_allowed("login_test", "login") == False

    def test_rate_limiter_different_keys(self):
        """Test that rate limiter tracks keys separately"""
        rate_limiter.is_allowed("key1", "login")
        rate_limiter.is_allowed("key1", "login")

        # Different key should have its own limit
        assert rate_limiter.is_allowed("key2", "login") == True


class TestCache:
    """Test caching functionality"""

    def test_cache_set_and_get(self):
        """Test cache set and get"""
        analysis_cache.set("test_key", {"data": "test"}, ttl=60)
        result = analysis_cache.get("test_key")
        assert result == {"data": "test"}

    def test_cache_miss(self):
        """Test cache miss returns None"""
        result = analysis_cache.get("nonexistent_key")
        assert result is None

    def test_cache_clear(self):
        """Test cache clear"""
        analysis_cache.set("key1", "value1")
        analysis_cache.set("key2", "value2")
        analysis_cache.clear()
        assert analysis_cache.get("key1") is None
        assert analysis_cache.get("key2") is None


class TestScraper:
    """Test scraper functionality"""

    def test_extract_keywords_with_yake(self):
        """Test keyword extraction"""
        from scraper import extract_keywords_with_yake

        text = "Python programming is great for web development. Python is also used for data science and machine learning."
        keywords = extract_keywords_with_yake(text, top_n=5)

        assert isinstance(keywords, list)
        assert len(keywords) <= 5

    def test_detect_tracking_pixels(self):
        """Test tracking pixel detection"""
        from scraper import detect_tracking_pixels
        from bs4 import BeautifulSoup

        html = """
        <html>
        <head>
            <script src="https://www.googletagmanager.com/gtag/js?id=G-123456"></script>
        </head>
        <body></body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        trackers = detect_tracking_pixels(soup, html)

        assert isinstance(trackers, dict)
        assert "google_analytics" in trackers

    def test_analyze_page_technical_seo(self):
        """Test technical SEO analysis"""
        from scraper import analyze_page_technical_seo
        from bs4 import BeautifulSoup

        html = """
        <html>
        <head>
            <title>Test Page Title</title>
            <meta name="description" content="This is a test description for SEO purposes.">
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
            <h1>Main Heading</h1>
            <p>Some content here.</p>
            <img src="test.jpg" alt="Test image">
        </body>
        </html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        analysis = analyze_page_technical_seo(soup, "https://test.com")

        assert "title" in analysis
        assert "meta_description" in analysis
        assert "headers" in analysis
        assert "images" in analysis
        assert "overall_score" in analysis
        assert analysis["headers"]["h1_count"] == 1


class TestAdminEndpoints:
    """Test admin endpoints"""

    def test_admin_stats_no_token(self, client):
        """Test admin stats without token"""
        response = client.get("/api/admin/stats")
        assert response.status_code == 401

    def test_admin_users_no_token(self, client):
        """Test admin users without token"""
        response = client.get("/api/admin/users")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
