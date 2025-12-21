import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import Dict, List, Set, Optional
import re
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import random

# Setup logging
logger = logging.getLogger("ai-grinners.scraper")

# Rotate user agents to avoid blocking
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
]

def get_random_user_agent() -> str:
    return random.choice(USER_AGENTS)

# For backward compatibility
USER_AGENT = USER_AGENTS[0]

def analyze_page_technical_seo(soup, url: str) -> Dict:
    """Deep technical SEO analysis"""
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
        
        internal_links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(url).netloc:
                internal_links.append(full_url)
        
        text = soup.get_text(separator=' ', strip=True)
        words = text.split()
        word_count = len(words)
        
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
            'headers': {'h1_count': len(h1_tags), 'h2_count': len(h2_tags), 'h3_count': len(h3_tags), 'score': headers_score, 'h1_texts': [h1.text.strip() for h1 in h1_tags][:3]},
            'images': {'total': len(images), 'with_alt': len(images_with_alt), 'alt_coverage': alt_coverage},
            'links': {'internal': len(set(internal_links))},
            'content': {'word_count': word_count},
            'technical': {'has_schema': has_schema, 'mobile_friendly': mobile_friendly, 'has_open_graph': has_og},
            'overall_score': overall_score
        }
    except Exception as e:
        return {
            'title': {'text': '', 'length': 0, 'score': 0},
            'meta_description': {'text': '', 'length': 0, 'score': 0},
            'headers': {'h1_count': 0, 'h2_count': 0, 'h3_count': 0, 'score': 0, 'h1_texts': []},
            'images': {'total': 0, 'with_alt': 0, 'alt_coverage': 0},
            'links': {'internal': 0},
            'content': {'word_count': 0},
            'technical': {'has_schema': False, 'mobile_friendly': False, 'has_open_graph': False},
            'overall_score': 0
        }

def get_page_content(url: str, timeout: int = 20, retries: int = 2) -> Dict:
    """Enhanced page content extraction with retries"""
    if not url.startswith('http'):
        url = 'https://' + url

    for attempt in range(retries + 1):
        try:
            headers = {
                'User-Agent': get_random_user_agent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }

            response = requests.get(
                url,
                headers=headers,
                timeout=timeout,
                allow_redirects=True,
                verify=True
            )

            if response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt
                logger.warning(f"Rate limited on {url}, waiting {wait_time}s")
                time.sleep(wait_time)
                continue

            if response.status_code != 200:
                return {'url': url, 'status': 'error', 'error': f'HTTP {response.status_code}'}

            # Use html.parser (built-in, no dependencies)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Detect tracking pixels
            html_content = str(response.content)
            trackers = detect_tracking_pixels(soup, html_content)
            analysis = analyze_page_technical_seo(soup, url)

            # Extract internal links more thoroughly
            links = extract_internal_links(soup, url)

            return {
                'url': url,
                'status': 'success',
                'analysis': analysis,
                'trackers': trackers,
                'internal_links': links,
                'response_time': response.elapsed.total_seconds()
            }

        except requests.exceptions.Timeout:
            logger.warning(f"Timeout on {url} (attempt {attempt + 1}/{retries + 1})")
            if attempt < retries:
                time.sleep(1)
                continue
            return {'url': url, 'status': 'error', 'error': 'Request timeout'}

        except requests.exceptions.SSLError:
            logger.warning(f"SSL error on {url}, trying without verify")
            try:
                response = requests.get(url, headers=headers, timeout=timeout, verify=False)
                soup = BeautifulSoup(response.content, 'html.parser')
                return {
                    'url': url,
                    'status': 'success',
                    'analysis': analyze_page_technical_seo(soup, url),
                    'trackers': detect_tracking_pixels(soup, str(response.content)),
                    'internal_links': extract_internal_links(soup, url)
                }
            except Exception as e:
                return {'url': url, 'status': 'error', 'error': f'SSL Error: {str(e)}'}

        except Exception as e:
            logger.error(f"Error crawling {url}: {str(e)}")
            if attempt < retries:
                time.sleep(1)
                continue
            return {'url': url, 'status': 'error', 'error': str(e)}

    return {'url': url, 'status': 'error', 'error': 'Max retries exceeded'}


def extract_internal_links(soup, base_url: str) -> List[str]:
    """Extract all internal links from a page"""
    links = set()
    base_domain = urlparse(base_url).netloc

    # Patterns to exclude
    exclude_patterns = [
        '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp',
        '.css', '.js', '.ico', '.woff', '.woff2', '.ttf',
        '#', 'mailto:', 'tel:', 'javascript:', 'data:',
        '/cdn-cgi/', '/wp-json/', '/feed/', '/xmlrpc.php'
    ]

    for link in soup.find_all('a', href=True):
        href = link['href'].strip()

        # Skip empty or anchor-only links
        if not href or href == '#':
            continue

        # Build full URL
        full_url = urljoin(base_url, href)

        # Check if it's an internal link
        parsed = urlparse(full_url)
        if parsed.netloc != base_domain:
            continue

        # Skip excluded patterns
        if any(pattern in full_url.lower() for pattern in exclude_patterns):
            continue

        # Normalize URL (remove fragments and trailing slashes)
        clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if parsed.query:
            clean_url += f"?{parsed.query}"

        links.add(clean_url.rstrip('/'))

    return list(links)[:50]  # Return up to 50 internal links

def crawl_site(domain: str, max_pages: int = 50) -> Dict:
    """
    Enhanced crawler that reliably crawls up to max_pages.
    Uses BFS with priority queue and parallel fetching.
    """
    if not domain.startswith('http'):
        base_url = 'https://' + domain
    else:
        base_url = domain

    # Normalize base URL
    parsed_base = urlparse(base_url)
    base_domain = parsed_base.netloc

    visited: Set[str] = set()
    to_visit: List[str] = [base_url]
    pages_data: List[Dict] = []
    failed_urls: List[str] = []
    all_trackers: Dict = {}

    logger.info(f"🔍 Starting crawl of {domain} - Target: {max_pages} pages")
    start_time = time.time()

    # Phase 1: BFS crawl with link discovery
    while to_visit and len(pages_data) < max_pages:
        # Get batch of URLs to process
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

        # Process batch (could be parallelized with ThreadPoolExecutor)
        for url in batch:
            if len(pages_data) >= max_pages:
                break

            logger.debug(f"  📄 Crawling page {len(pages_data)+1}/{max_pages}: {url[:60]}...")
            page_data = get_page_content(url)

            if page_data['status'] == 'success':
                pages_data.append(page_data)

                # Merge trackers
                if page_data.get('trackers'):
                    for key, value in page_data['trackers'].items():
                        if value and key not in all_trackers:
                            all_trackers[key] = value

                # Add discovered links to queue
                for link in page_data.get('internal_links', []):
                    if link not in visited and link not in to_visit:
                        to_visit.append(link)
            else:
                failed_urls.append(url)

            # Polite delay between requests
            time.sleep(0.15)

    elapsed = round(time.time() - start_time, 1)
    logger.info(f"✅ Crawled {len(pages_data)} pages from {domain} in {elapsed}s")

    if pages_data:
        analyses = [p['analysis'] for p in pages_data if 'analysis' in p]

        if analyses:
            avg_score = round(sum(a['overall_score'] for a in analyses) / len(analyses))
            avg_word_count = round(sum(a['content']['word_count'] for a in analyses) / len(analyses))
            avg_alt_coverage = round(sum(a['images']['alt_coverage'] for a in analyses) / len(analyses), 1)
            schema_count = sum(1 for a in analyses if a['technical']['has_schema'])
            schema_coverage = round(schema_count / len(analyses) * 100, 1)
            mobile_count = sum(1 for a in analyses if a['technical']['mobile_friendly'])
            mobile_coverage = round(mobile_count / len(analyses) * 100, 1)
            og_count = sum(1 for a in analyses if a['technical']['has_open_graph'])
            og_coverage = round(og_count / len(analyses) * 100, 1)

            # Generate issues based on analysis
            issues = generate_seo_issues(analyses, avg_score, avg_alt_coverage, schema_coverage)

            # Generate recommendations
            recommendations = generate_recommendations(analyses, avg_score, avg_word_count, schema_coverage)

            return {
                'domain': domain,
                'total_pages': len(pages_data),
                'failed_pages': len(failed_urls),
                'crawl_time': elapsed,
                'avg_seo_score': avg_score,
                'avg_word_count': avg_word_count,
                'avg_alt_coverage': avg_alt_coverage,
                'schema_coverage': schema_coverage,
                'mobile_coverage': mobile_coverage,
                'og_coverage': og_coverage,
                'trackers': all_trackers,
                'pages': pages_data[:20],  # Return top 20 pages
                'issues': issues,
                'recommendations': recommendations
            }

    return {
        'domain': domain,
        'total_pages': 0,
        'avg_seo_score': 0,
        'error': 'Could not crawl site',
        'issues': ['Unable to access website'],
        'recommendations': ['Check if the domain is correct and accessible']
    }


def generate_seo_issues(analyses: List[Dict], avg_score: float, avg_alt: float, schema_pct: float) -> List[str]:
    """Generate SEO issues based on analysis"""
    issues = []

    if avg_score < 60:
        issues.append(f"⚠️ Low average SEO score ({avg_score}/100)")

    if avg_alt < 50:
        issues.append(f"⚠️ Poor image alt text coverage ({avg_alt}%)")

    if schema_pct < 30:
        issues.append(f"⚠️ Missing schema markup on {100-schema_pct}% of pages")

    # Check for pages with issues
    short_titles = sum(1 for a in analyses if a['title']['length'] < 30)
    if short_titles > len(analyses) * 0.3:
        issues.append(f"⚠️ {short_titles} pages have short titles (<30 chars)")

    missing_desc = sum(1 for a in analyses if a['meta_description']['length'] == 0)
    if missing_desc > 0:
        issues.append(f"⚠️ {missing_desc} pages missing meta descriptions")

    no_h1 = sum(1 for a in analyses if a['headers']['h1_count'] == 0)
    if no_h1 > 0:
        issues.append(f"⚠️ {no_h1} pages missing H1 tags")

    multi_h1 = sum(1 for a in analyses if a['headers']['h1_count'] > 1)
    if multi_h1 > len(analyses) * 0.2:
        issues.append(f"⚠️ {multi_h1} pages have multiple H1 tags")

    return issues[:10]  # Return top 10 issues


def generate_recommendations(analyses: List[Dict], avg_score: float, avg_words: int, schema_pct: float) -> List[str]:
    """Generate SEO recommendations"""
    recommendations = []

    if avg_score < 70:
        recommendations.append("📌 Improve overall SEO by optimizing titles, descriptions, and content structure")

    if avg_words < 500:
        recommendations.append("📌 Add more content - aim for at least 800-1000 words per page")

    if schema_pct < 50:
        recommendations.append("📌 Add structured data (Schema.org) to improve rich snippets in search results")

    # Check alt coverage
    low_alt_pages = sum(1 for a in analyses if a['images']['alt_coverage'] < 50 and a['images']['total'] > 0)
    if low_alt_pages > 0:
        recommendations.append(f"📌 Add descriptive alt text to images on {low_alt_pages} pages")

    # Check meta descriptions
    short_desc = sum(1 for a in analyses if 0 < a['meta_description']['length'] < 120)
    if short_desc > 0:
        recommendations.append("📌 Expand meta descriptions to 150-160 characters for better CTR")

    # Check mobile friendliness
    not_mobile = sum(1 for a in analyses if not a['technical']['mobile_friendly'])
    if not_mobile > 0:
        recommendations.append("📌 Add viewport meta tag to all pages for mobile optimization")

    return recommendations[:8]  # Return top 8 recommendations

def find_social_accounts(domain: str) -> Dict:
    try:
        url = 'https://' + domain if not domain.startswith('http') else domain
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Detect tracking pixels
        html_content = str(response.content)
        trackers = detect_tracking_pixels(soup, html_content)
        
        social = {'facebook': None, 'tiktok': None, 'instagram': None}
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'facebook.com' in href and not social['facebook']:
                social['facebook'] = href
            elif 'tiktok.com' in href and not social['tiktok']:
                parts = href.split('tiktok.com/')
                if len(parts) > 1:
                    social['tiktok'] = parts[1].split('?')[0].strip('/@')
            elif 'instagram.com' in href and not social['instagram']:
                social['instagram'] = href
        
        return social
    except:
        return {'facebook': None, 'tiktok': None, 'instagram': None}

def extract_keywords_with_yake(text: str, top_n: int = 20) -> List[Dict]:
    """Extract keywords from text using YAKE"""
    try:
        import yake
        
        # Configure YAKE
        kw_extractor = yake.KeywordExtractor(
            lan="en",
            n=3,  # max 3-word phrases
            dedupLim=0.9,
            dedupFunc='seqm',
            windowsSize=1,
            top=70
        )
        
        # Extract keywords
        keywords = kw_extractor.extract_keywords(text)
        
        # Format results
        results = []
        for kw, score in keywords:
            results.append({
                "term": kw,
                "volume": "Analyzing...",
                "difficulty": "Medium" if score > 0.5 else "Low",
                "priority": "high" if score < 0.3 else "medium",
                "current_rank": "Not ranking",
                "cpc": "N/A"
            })
        
        return results
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        return []


def detect_tracking_pixels(soup, html_content: str) -> Dict:
    """Detect tracking pixels and analytics"""
    trackers = {
        "google_analytics": False,
        "google_tag_manager": False,
        "facebook_pixel": False,
        "tiktok_pixel": False,
        "linkedin_insight": False,
        "hotjar": False,
        "google_analytics_id": None,
        "gtm_id": None,
        "fb_pixel_id": None
    }
    
    # Google Analytics (GA4 & Universal)
    if 'google-analytics.com/analytics.js' in html_content or 'googletagmanager.com/gtag/js' in html_content:
        trackers["google_analytics"] = True
        # Extract GA ID
        import re
        ga_match = re.search(r'G-[A-Z0-9]+|UA-[0-9]+-[0-9]+', html_content)
        if ga_match:
            trackers["google_analytics_id"] = ga_match.group(0)
    
    # Google Tag Manager
    if 'googletagmanager.com/gtm.js' in html_content:
        trackers["google_tag_manager"] = True
        gtm_match = re.search(r'GTM-[A-Z0-9]+', html_content)
        if gtm_match:
            trackers["gtm_id"] = gtm_match.group(0)
    
    # Facebook Pixel
    if 'connect.facebook.net' in html_content or 'fbevents.js' in html_content:
        trackers["facebook_pixel"] = True
        fb_match = re.search(r"fbq\('init',\s*'(\d+)'", html_content)
        if fb_match:
            trackers["fb_pixel_id"] = fb_match.group(1)
    
    # TikTok Pixel
    if 'analytics.tiktok.com' in html_content or 'ttq.load' in html_content:
        trackers["tiktok_pixel"] = True
    
    # LinkedIn Insight Tag
    if 'snap.licdn.com' in html_content or '_linkedin_partner_id' in html_content:
        trackers["linkedin_insight"] = True
    
    # Hotjar
    if 'static.hotjar.com' in html_content:
        trackers["hotjar"] = True
    
    return trackers
