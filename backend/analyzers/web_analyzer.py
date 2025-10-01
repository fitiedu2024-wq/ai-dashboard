import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import json

def analyze_domain(domain: str) -> dict:
    """
    Comprehensive domain analysis
    """
    # Ensure domain has protocol
    if not domain.startswith(('http://', 'https://')):
        domain = f'https://{domain}'
    
    results = {
        'domain': domain,
        'status': 'completed',
        'technical': {},
        'platform': {},
        'trackers': {},
        'seo': {},
        'recommendations': []
    }
    
    try:
        # Fetch website
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(domain, headers=headers, timeout=10, allow_redirects=True)
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
        
        # Technical Analysis
        results['technical'] = analyze_technical(response, soup)
        
        # Platform Detection
        results['platform'] = detect_platform(html, response.headers)
        
        # Tracker Scanning
        results['trackers'] = scan_trackers(html, soup)
        
        # SEO Analysis
        results['seo'] = analyze_seo(soup, response)
        
        # Generate Recommendations
        results['recommendations'] = generate_recommendations(results)
        
        # Calculate scores
        results['scores'] = calculate_scores(results)
        
    except Exception as e:
        results['status'] = 'failed'
        results['error'] = str(e)
    
    return results


def analyze_technical(response, soup):
    """Analyze technical infrastructure"""
    tech = {
        'status_code': response.status_code,
        'response_time_ms': int(response.elapsed.total_seconds() * 1000),
        'ssl_enabled': response.url.startswith('https://'),
        'redirects': len(response.history),
        'server': response.headers.get('Server', 'Unknown'),
        'cdn': detect_cdn(response.headers),
        'compression': 'gzip' in response.headers.get('Content-Encoding', ''),
    }
    return tech


def detect_platform(html, headers):
    """Detect CMS/platform"""
    platforms = {
        'wordpress': False,
        'shopify': False,
        'woocommerce': False,
        'wix': False,
        'squarespace': False,
        'salla': False,
        'zid': False,
        'magento': False,
        'custom': False
    }
    
    html_lower = html.lower()
    
    # WordPress
    if 'wp-content' in html_lower or 'wordpress' in html_lower:
        platforms['wordpress'] = True
        if 'woocommerce' in html_lower:
            platforms['woocommerce'] = True
    
    # Shopify
    if 'shopify' in html_lower or 'cdn.shopify.com' in html_lower:
        platforms['shopify'] = True
    
    # Salla
    if 'salla.sa' in html_lower or 'salla.network' in html_lower:
        platforms['salla'] = True
    
    # Zid
    if 'zid.sa' in html_lower or 'zid.store' in html_lower:
        platforms['zid'] = True
    
    # Wix
    if 'wix.com' in html_lower or 'wixstatic.com' in html_lower:
        platforms['wix'] = True
    
    # Squarespace
    if 'squarespace' in html_lower:
        platforms['squarespace'] = True
    
    # Magento
    if 'magento' in html_lower or 'mage' in html_lower:
        platforms['magento'] = True
    
    detected = [k for k, v in platforms.items() if v]
    
    return {
        'detected_platforms': detected,
        'primary_platform': detected[0] if detected else 'custom',
        'is_ecommerce': any(p in detected for p in ['shopify', 'woocommerce', 'salla', 'zid', 'magento'])
    }


def detect_cdn(headers):
    """Detect CDN provider"""
    cdn_headers = {
        'cloudflare': ['cf-ray', 'cf-cache-status'],
        'cloudfront': ['x-amz-cf-id'],
        'fastly': ['fastly-'],
        'akamai': ['akamai-'],
    }
    
    for cdn, header_keys in cdn_headers.items():
        for key in header_keys:
            if any(key in h.lower() for h in headers.keys()):
                return cdn
    return 'none'


def scan_trackers(html, soup):
    """Scan for marketing trackers and pixels"""
    trackers = {
        'google_analytics': False,
        'google_tag_manager': False,
        'facebook_pixel': False,
        'tiktok_pixel': False,
        'snapchat_pixel': False,
        'twitter_pixel': False,
        'hotjar': False,
        'linkedin_insight': False,
        'google_ads': False,
    }
    
    html_lower = html.lower()
    
    # Google Analytics
    if 'google-analytics.com/analytics.js' in html_lower or 'googletagmanager.com/gtag/js' in html_lower or 'ga(' in html_lower:
        trackers['google_analytics'] = True
    
    # Google Tag Manager
    if 'googletagmanager.com/gtm.js' in html_lower or 'gtm.start' in html_lower:
        trackers['google_tag_manager'] = True
    
    # Facebook Pixel
    if 'connect.facebook.net' in html_lower or 'fbq(' in html_lower:
        trackers['facebook_pixel'] = True
    
    # TikTok Pixel
    if 'tiktok.com/i18n/pixel' in html_lower or 'ttq.' in html_lower:
        trackers['tiktok_pixel'] = True
    
    # Snapchat Pixel
    if 'sc-static.net' in html_lower or 'snaptr(' in html_lower:
        trackers['snapchat_pixel'] = True
    
    # Twitter Pixel
    if 'static.ads-twitter.com' in html_lower or 'twq(' in html_lower:
        trackers['twitter_pixel'] = True
    
    # Hotjar
    if 'hotjar.com' in html_lower or 'hj(' in html_lower:
        trackers['hotjar'] = True
    
    # LinkedIn Insight
    if 'snap.licdn.com' in html_lower or 'linkedin.com/px' in html_lower:
        trackers['linkedin_insight'] = True
    
    # Google Ads
    if 'googleadservices.com' in html_lower or 'googlesyndication.com' in html_lower:
        trackers['google_ads'] = True
    
    active_trackers = [k for k, v in trackers.items() if v]
    
    return {
        'trackers': trackers,
        'active_count': len(active_trackers),
        'active_trackers': active_trackers,
        'has_analytics': trackers['google_analytics'] or trackers['google_tag_manager'],
        'has_advertising': any([trackers['facebook_pixel'], trackers['google_ads'], trackers['tiktok_pixel']])
    }


def analyze_seo(soup, response):
    """Analyze SEO elements"""
    seo = {
        'title': None,
        'title_length': 0,
        'meta_description': None,
        'meta_description_length': 0,
        'h1_count': 0,
        'image_count': 0,
        'images_without_alt': 0,
        'has_robots_meta': False,
        'has_canonical': False,
        'has_og_tags': False,
        'page_size_kb': len(response.content) / 1024,
    }
    
    # Title
    title_tag = soup.find('title')
    if title_tag:
        seo['title'] = title_tag.get_text().strip()
        seo['title_length'] = len(seo['title'])
    
    # Meta Description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        seo['meta_description'] = meta_desc['content']
        seo['meta_description_length'] = len(seo['meta_description'])
    
    # H1 tags
    seo['h1_count'] = len(soup.find_all('h1'))
    
    # Images
    images = soup.find_all('img')
    seo['image_count'] = len(images)
    seo['images_without_alt'] = len([img for img in images if not img.get('alt')])
    
    # Robots meta
    seo['has_robots_meta'] = bool(soup.find('meta', attrs={'name': 'robots'}))
    
    # Canonical
    seo['has_canonical'] = bool(soup.find('link', attrs={'rel': 'canonical'}))
    
    # Open Graph
    seo['has_og_tags'] = bool(soup.find('meta', attrs={'property': re.compile('^og:')}))
    
    return seo


def generate_recommendations(results):
    """Generate AI-powered recommendations"""
    recommendations = []
    
    seo = results.get('seo', {})
    technical = results.get('technical', {})
    trackers = results.get('trackers', {})
    platform = results.get('platform', {})
    
    # SEO Recommendations
    if not seo.get('title') or seo.get('title_length', 0) < 30:
        recommendations.append({
            'category': 'SEO',
            'priority': 'high',
            'issue': 'Missing or short page title',
            'recommendation': 'Add a descriptive title tag (50-60 characters) that includes your main keywords.',
            'impact': 'Improved search engine visibility and click-through rates'
        })
    
    if not seo.get('meta_description') or seo.get('meta_description_length', 0) < 100:
        recommendations.append({
            'category': 'SEO',
            'priority': 'high',
            'issue': 'Missing or short meta description',
            'recommendation': 'Write a compelling meta description (150-160 characters) to improve click-through rates from search results.',
            'impact': 'Better search result presentation and user engagement'
        })
    
    if seo.get('h1_count', 0) == 0:
        recommendations.append({
            'category': 'SEO',
            'priority': 'medium',
            'issue': 'No H1 heading found',
            'recommendation': 'Add a clear H1 heading that describes your page content.',
            'impact': 'Improved content structure and SEO'
        })
    
    if seo.get('images_without_alt', 0) > 0:
        recommendations.append({
            'category': 'SEO',
            'priority': 'medium',
            'issue': f'{seo["images_without_alt"]} images missing alt text',
            'recommendation': 'Add descriptive alt text to all images for accessibility and SEO.',
            'impact': 'Better accessibility and image search visibility'
        })
    
    # Performance Recommendations
    if technical.get('response_time_ms', 0) > 3000:
        recommendations.append({
            'category': 'Performance',
            'priority': 'high',
            'issue': f'Slow page load time ({technical["response_time_ms"]}ms)',
            'recommendation': 'Optimize images, enable caching, and consider using a CDN to improve load times.',
            'impact': 'Better user experience and SEO rankings'
        })
    
    if not technical.get('ssl_enabled'):
        recommendations.append({
            'category': 'Security',
            'priority': 'critical',
            'issue': 'Website not using HTTPS',
            'recommendation': 'Install an SSL certificate immediately to secure your website.',
            'impact': 'User trust, data security, and SEO improvement'
        })
    
    if technical.get('cdn') == 'none':
        recommendations.append({
            'category': 'Performance',
            'priority': 'medium',
            'issue': 'No CDN detected',
            'recommendation': 'Use a Content Delivery Network (CDN) like Cloudflare to improve global loading speeds.',
            'impact': 'Faster loading times for international visitors'
        })
    
    # Marketing Recommendations
    if not trackers.get('has_analytics'):
        recommendations.append({
            'category': 'Marketing',
            'priority': 'high',
            'issue': 'No analytics tracking detected',
            'recommendation': 'Install Google Analytics or Google Tag Manager to track visitor behavior and conversions.',
            'impact': 'Data-driven decision making and campaign optimization'
        })
    
    if not trackers.get('has_advertising') and platform.get('is_ecommerce'):
        recommendations.append({
            'category': 'Marketing',
            'priority': 'high',
            'issue': 'No advertising pixels detected on e-commerce site',
            'recommendation': 'Install Facebook Pixel and Google Ads conversion tracking to measure ROI and create retargeting campaigns.',
            'impact': 'Better ad targeting and conversion tracking'
        })
    
    return recommendations


def calculate_scores(results):
    """Calculate performance scores"""
    scores = {
        'seo_score': 0,
        'performance_score': 0,
        'marketing_score': 0,
        'overall_score': 0
    }
    
    seo = results.get('seo', {})
    technical = results.get('technical', {})
    trackers = results.get('trackers', {})
    
    # SEO Score (0-100)
    seo_points = 0
    if seo.get('title') and 30 <= seo.get('title_length', 0) <= 70:
        seo_points += 20
    if seo.get('meta_description') and 120 <= seo.get('meta_description_length', 0) <= 160:
        seo_points += 20
    if seo.get('h1_count', 0) >= 1:
        seo_points += 15
    if seo.get('has_canonical'):
        seo_points += 10
    if seo.get('has_og_tags'):
        seo_points += 10
    if seo.get('images_without_alt', 1) == 0:
        seo_points += 15
    if seo.get('has_robots_meta'):
        seo_points += 10
    scores['seo_score'] = min(seo_points, 100)
    
    # Performance Score (0-100)
    perf_points = 0
    response_time = technical.get('response_time_ms', 5000)
    if response_time < 1000:
        perf_points += 40
    elif response_time < 2000:
        perf_points += 30
    elif response_time < 3000:
        perf_points += 20
    else:
        perf_points += 10
    
    if technical.get('ssl_enabled'):
        perf_points += 25
    if technical.get('compression'):
        perf_points += 15
    if technical.get('cdn') != 'none':
        perf_points += 20
    scores['performance_score'] = min(perf_points, 100)
    
    # Marketing Score (0-100)
    marketing_points = 0
    if trackers.get('has_analytics'):
        marketing_points += 30
    if trackers.get('has_advertising'):
        marketing_points += 30
    active_count = trackers.get('active_count', 0)
    marketing_points += min(active_count * 10, 40)
    scores['marketing_score'] = min(marketing_points, 100)
    
    # Overall Score
    scores['overall_score'] = int((scores['seo_score'] + scores['performance_score'] + scores['marketing_score']) / 3)
    
    return scores
