"""
Async Web Crawler using Crawl4AI
For faster, more efficient crawling with JavaScript support
"""

import asyncio
import logging
from typing import Dict, List, Set
from urllib.parse import urljoin, urlparse
import re

logger = logging.getLogger("ai-grinners.async_crawler")

# Try to import Crawl4AI
try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
    CRAWL4AI_AVAILABLE = True
except ImportError:
    CRAWL4AI_AVAILABLE = False
    logger.warning("⚠️  Crawl4AI not installed. Using sync scraper. Install with: pip install crawl4ai")


async def crawl_page_async(crawler, url: str, timeout: int = 30) -> Dict:
    """Crawl a single page asynchronously using Crawl4AI"""
    try:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=timeout * 1000,  # Convert to milliseconds
            wait_until="domcontentloaded"
        )

        result = await crawler.arun(url=url, config=config)

        if not result.success:
            return {'url': url, 'status': 'error', 'error': result.error_message or 'Failed to crawl'}

        # Parse the HTML content
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(result.html, 'html.parser')

        # Extract SEO metrics
        analysis = analyze_page_seo(soup, url)

        # Extract internal links
        links = extract_links(soup, url)

        return {
            'url': url,
            'status': 'success',
            'analysis': analysis,
            'internal_links': links,
            'markdown': result.markdown[:1000] if result.markdown else None  # First 1000 chars
        }

    except asyncio.TimeoutError:
        return {'url': url, 'status': 'error', 'error': 'Timeout'}
    except Exception as e:
        logger.error(f"Error crawling {url}: {e}")
        return {'url': url, 'status': 'error', 'error': str(e)}


def analyze_page_seo(soup, url: str) -> Dict:
    """Analyze page SEO metrics"""
    try:
        title = soup.find('title')
        title_text = title.text.strip() if title else ""
        title_score = 100 if 30 <= len(title_text) <= 60 else 50

        meta_desc = soup.find('meta', attrs={'name': 'description'})
        desc_text = meta_desc.get('content', '') if meta_desc else ""
        desc_score = 100 if 120 <= len(desc_text) <= 160 else 50

        h1_tags = soup.find_all('h1')
        h2_tags = soup.find_all('h2')
        h3_tags = soup.find_all('h3')
        headers_score = 100 if len(h1_tags) == 1 else 50

        images = soup.find_all('img')
        images_with_alt = [img for img in images if img.get('alt')]
        alt_coverage = round((len(images_with_alt) / len(images) * 100) if images else 0, 1)

        text = soup.get_text(separator=' ', strip=True)
        word_count = len(text.split())

        has_schema = bool(soup.find('script', type='application/ld+json'))
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        mobile_friendly = bool(viewport)
        og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
        has_og = len(og_tags) > 0

        overall_score = round((
            title_score * 0.20 +
            desc_score * 0.15 +
            headers_score * 0.15 +
            (alt_coverage * 0.10) +
            (100 if has_schema else 0) * 0.10 +
            (100 if mobile_friendly else 0) * 0.10 +
            (100 if has_og else 0) * 0.05 +
            min(100, (word_count / 1000) * 50)
        ))

        return {
            'title': {'text': title_text, 'length': len(title_text), 'score': title_score},
            'meta_description': {'text': desc_text, 'length': len(desc_text), 'score': desc_score},
            'headers': {
                'h1_count': len(h1_tags),
                'h2_count': len(h2_tags),
                'h3_count': len(h3_tags),
                'score': headers_score,
                'h1_texts': [h1.text.strip() for h1 in h1_tags][:3]
            },
            'images': {'total': len(images), 'with_alt': len(images_with_alt), 'alt_coverage': alt_coverage},
            'content': {'word_count': word_count},
            'technical': {'has_schema': has_schema, 'mobile_friendly': mobile_friendly, 'has_open_graph': has_og},
            'overall_score': overall_score
        }
    except Exception as e:
        logger.error(f"Error analyzing page: {e}")
        return {'overall_score': 0, 'error': str(e)}


def extract_links(soup, base_url: str) -> List[str]:
    """Extract internal links from page"""
    links = set()
    base_domain = urlparse(base_url).netloc

    exclude_patterns = [
        '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
        '.css', '.js', '.ico', '.woff', '#', 'mailto:', 'tel:', 'javascript:'
    ]

    for link in soup.find_all('a', href=True):
        href = link['href'].strip()
        if not href or href == '#':
            continue

        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)

        if parsed.netloc != base_domain:
            continue

        if any(pattern in full_url.lower() for pattern in exclude_patterns):
            continue

        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip('/')
        links.add(clean_url)

    return list(links)[:50]


async def crawl_site_async(domain: str, max_pages: int = 50) -> Dict:
    """
    Crawl a website asynchronously using Crawl4AI.
    Much faster than sync crawling - can crawl 50 pages in seconds.
    """
    if not CRAWL4AI_AVAILABLE:
        # Fall back to sync scraper
        from scraper import crawl_site
        return crawl_site(domain, max_pages)

    if not domain.startswith('http'):
        base_url = 'https://' + domain
    else:
        base_url = domain

    base_domain = urlparse(base_url).netloc
    visited: Set[str] = set()
    to_visit: List[str] = [base_url]
    pages_data: List[Dict] = []

    logger.info(f"🚀 Starting async crawl of {domain} - Target: {max_pages} pages")

    browser_config = BrowserConfig(
        headless=True,
        verbose=False
    )

    async with AsyncWebCrawler(config=browser_config) as crawler:
        while to_visit and len(pages_data) < max_pages:
            # Process in batches of 5 for efficiency
            batch_size = min(5, max_pages - len(pages_data), len(to_visit))
            batch = []

            for _ in range(batch_size):
                if not to_visit:
                    break
                url = to_visit.pop(0)
                if url not in visited:
                    batch.append(url)
                    visited.add(url)

            if not batch:
                break

            # Crawl batch concurrently
            tasks = [crawl_page_async(crawler, url) for url in batch]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, Exception):
                    continue

                if result.get('status') == 'success':
                    pages_data.append(result)

                    # Add discovered links to queue
                    for link in result.get('internal_links', []):
                        if link not in visited and link not in to_visit:
                            to_visit.append(link)

    logger.info(f"✅ Async crawl completed: {len(pages_data)} pages from {domain}")

    # Calculate aggregates
    if pages_data:
        analyses = [p['analysis'] for p in pages_data if 'analysis' in p]

        if analyses:
            avg_score = round(sum(a.get('overall_score', 0) for a in analyses) / len(analyses))
            avg_word_count = round(sum(a.get('content', {}).get('word_count', 0) for a in analyses) / len(analyses))
            avg_alt_coverage = round(sum(a.get('images', {}).get('alt_coverage', 0) for a in analyses) / len(analyses), 1)
            schema_count = sum(1 for a in analyses if a.get('technical', {}).get('has_schema'))
            schema_coverage = round(schema_count / len(analyses) * 100, 1)
            mobile_count = sum(1 for a in analyses if a.get('technical', {}).get('mobile_friendly'))
            mobile_coverage = round(mobile_count / len(analyses) * 100, 1)

            return {
                'domain': domain,
                'total_pages': len(pages_data),
                'avg_seo_score': avg_score,
                'avg_word_count': avg_word_count,
                'avg_alt_coverage': avg_alt_coverage,
                'schema_coverage': schema_coverage,
                'mobile_coverage': mobile_coverage,
                'pages': pages_data,
                'method': 'crawl4ai_async',
                'issues': generate_issues(analyses, avg_score, avg_alt_coverage, schema_coverage),
                'recommendations': generate_recommendations(analyses, avg_score, avg_word_count, schema_coverage)
            }

    return {
        'domain': domain,
        'total_pages': 0,
        'avg_seo_score': 0,
        'error': 'Could not crawl site',
        'issues': ['Unable to access website'],
        'recommendations': ['Check if the domain is correct and accessible']
    }


def generate_issues(analyses: List[Dict], avg_score: float, avg_alt: float, schema_pct: float) -> List[str]:
    """Generate SEO issues based on analysis"""
    issues = []

    if avg_score < 60:
        issues.append(f"⚠️ Low average SEO score ({avg_score}/100)")

    if avg_alt < 50:
        issues.append(f"⚠️ Poor image alt text coverage ({avg_alt}%)")

    if schema_pct < 30:
        issues.append(f"⚠️ Missing schema markup on {100-schema_pct}% of pages")

    short_titles = sum(1 for a in analyses if a.get('title', {}).get('length', 0) < 30)
    if short_titles > len(analyses) * 0.3:
        issues.append(f"⚠️ {short_titles} pages have short titles (<30 chars)")

    missing_desc = sum(1 for a in analyses if a.get('meta_description', {}).get('length', 0) == 0)
    if missing_desc > 0:
        issues.append(f"⚠️ {missing_desc} pages missing meta descriptions")

    return issues[:10]


def generate_recommendations(analyses: List[Dict], avg_score: float, avg_words: int, schema_pct: float) -> List[str]:
    """Generate SEO recommendations"""
    recommendations = []

    if avg_score < 70:
        recommendations.append("📌 Improve overall SEO by optimizing titles, descriptions, and content structure")

    if avg_words < 500:
        recommendations.append("📌 Add more content - aim for at least 800-1000 words per page")

    if schema_pct < 50:
        recommendations.append("📌 Add structured data (Schema.org) to improve rich snippets in search results")

    low_alt_pages = sum(1 for a in analyses if a.get('images', {}).get('alt_coverage', 100) < 50 and a.get('images', {}).get('total', 0) > 0)
    if low_alt_pages > 0:
        recommendations.append(f"📌 Add descriptive alt text to images on {low_alt_pages} pages")

    return recommendations[:8]


# Sync wrapper for async function
def crawl_site_fast(domain: str, max_pages: int = 50) -> Dict:
    """Sync wrapper for async crawl (for use in non-async code)"""
    return asyncio.run(crawl_site_async(domain, max_pages))
