import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from competitor_analyzer import find_competitors, analyze_competitor_pages

def analyze_domain(domain: str) -> dict:
    if not domain.startswith(('http://', 'https://')):
        domain = f'https://{domain}'
    
    results = {
        'domain': domain,
        'status': 'completed',
        'technical': {},
        'platform': {},
        'trackers': {},
        'seo': {},
        'recommendations': [],
        'scores': {},
        'competitors': []
    }
    
    try:
        response = requests.get(domain, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        html = response.text
        soup = BeautifulSoup(html, 'html.parser')
        
        results['technical'] = analyze_technical(response)
        results['platform'] = detect_platform(html, soup)
        results['trackers'] = detect_trackers_with_ids(html)  # NEW: with IDs
        results['seo'] = analyze_seo(soup, html, response)
        results['scores'] = calculate_scores(results)
        results['recommendations'] = generate_recommendations(results)
        
        # Competitor analysis
        try:
            page_info = {
                'title': results['seo'].get('title', ''),
                'meta': {'description': results['seo'].get('meta_description', '')}
            }
            
            competitors = find_competitors(
                domain.replace('https://', '').replace('http://', '').split('/')[0],
                page_info,
                max_results=5  # Changed to 5
            )
            
            for comp in competitors:
                detailed_comp = analyze_competitor_pages(comp)
                results['competitors'].append(detailed_comp)
                
        except Exception as comp_err:
            print(f"Competitor analysis error: {comp_err}")
            results['competitors'] = []
        
    except Exception as e:
        print(f"Analysis error: {e}")
        results['status'] = 'failed'
        results['error'] = str(e)
    
    return results

def analyze_technical(response):
    return {
        'status_code': response.status_code,
        'response_time_ms': int(response.elapsed.total_seconds() * 1000),
        'ssl_enabled': response.url.startswith('https'),
        'redirects': len(response.history),
        'server': response.headers.get('Server', 'unknown'),
        'cdn': detect_cdn(response.headers),
        'compression': 'Content-Encoding' in response.headers
    }

def detect_cdn(headers):
    cdn_headers = {
        'cloudflare': 'cf-ray',
        'fastly': 'fastly-',
        'akamai': 'akamai',
        'cloudfront': 'cloudfront'
    }
    
    for cdn, header in cdn_headers.items():
        if any(header in k.lower() for k in headers.keys()):
            return cdn
    return 'none'

def detect_platform(html, soup):
    html_lower = html.lower()
    platforms = []
    
    signatures = {
        'wordpress': ['wp-content', 'wp-includes'],
        'shopify': ['shopify', 'cdn.shopify.com'],
        'woocommerce': ['woocommerce'],
        'magento': ['magento'],
        'wix': ['wix.com'],
        'squarespace': ['squarespace']
    }
    
    for platform, sigs in signatures.items():
        if any(sig in html_lower for sig in sigs):
            platforms.append(platform)
    
    is_ecommerce = any(kw in html_lower for kw in ['cart', 'checkout', 'add to cart', 'product'])
    
    return {
        'detected_platforms': platforms,
        'primary_platform': platforms[0] if platforms else 'unknown',
        'is_ecommerce': is_ecommerce
    }

def detect_trackers_with_ids(html):
    """Detect trackers AND extract their IDs"""
    
    trackers_found = {}
    
    # Google Analytics (GA4 and Universal)
    ga_patterns = [
        r"G-[A-Z0-9]{10}",  # GA4
        r"UA-\d{4,10}-\d{1,4}",  # Universal Analytics
        r"gtag\('config',\s*'([^']+)'\)"
    ]
    ga_ids = []
    for pattern in ga_patterns:
        matches = re.findall(pattern, html)
        ga_ids.extend(matches)
    
    trackers_found['google_analytics'] = {
        'active': len(ga_ids) > 0,
        'ids': list(set(ga_ids))
    }
    
    # Google Tag Manager
    gtm_pattern = r"GTM-[A-Z0-9]+"
    gtm_ids = re.findall(gtm_pattern, html)
    trackers_found['google_tag_manager'] = {
        'active': len(gtm_ids) > 0,
        'ids': list(set(gtm_ids))
    }
    
    # Facebook Pixel
    fb_patterns = [
        r"fbq\('init',\s*'(\d+)'\)",
        r"facebook\.net/tr\?id=(\d+)"
    ]
    fb_ids = []
    for pattern in fb_patterns:
        matches = re.findall(pattern, html)
        fb_ids.extend(matches)
    
    trackers_found['facebook_pixel'] = {
        'active': len(fb_ids) > 0,
        'ids': list(set(fb_ids))
    }
    
    # TikTok Pixel
    tiktok_pattern = r"ttq\.load\('([A-Z0-9]+)'\)"
    tiktok_ids = re.findall(tiktok_pattern, html)
    trackers_found['tiktok_pixel'] = {
        'active': len(tiktok_ids) > 0,
        'ids': list(set(tiktok_ids))
    }
    
    # Snapchat Pixel
    snap_pattern = r"snaptr\('init',\s*'([a-f0-9-]+)'\)"
    snap_ids = re.findall(snap_pattern, html)
    trackers_found['snapchat_pixel'] = {
        'active': len(snap_ids) > 0,
        'ids': list(set(snap_ids))
    }
    
    # Twitter Pixel
    twitter_pattern = r"twitter\.com/i/adsct\?txn_id=([a-z0-9]+)"
    twitter_ids = re.findall(twitter_pattern, html)
    trackers_found['twitter_pixel'] = {
        'active': len(twitter_ids) > 0 or 'static.ads-twitter.com' in html,
        'ids': list(set(twitter_ids))
    }
    
    # Hotjar
    hotjar_pattern = r"hotjar\.com/c/hotjar-(\d+)\.js"
    hotjar_ids = re.findall(hotjar_pattern, html)
    trackers_found['hotjar'] = {
        'active': 'hotjar.com' in html,
        'ids': list(set(hotjar_ids))
    }
    
    # LinkedIn Insight
    linkedin_pattern = r"_linkedin_partner_id\s*=\s*\"(\d+)\""
    linkedin_ids = re.findall(linkedin_pattern, html)
    trackers_found['linkedin_insight'] = {
        'active': 'snap.licdn.com' in html,
        'ids': list(set(linkedin_ids))
    }
    
    # Google Ads
    google_ads_pattern = r"AW-\d+"
    google_ads_ids = re.findall(google_ads_pattern, html)
    trackers_found['google_ads'] = {
        'active': 'googleadservices' in html or len(google_ads_ids) > 0,
        'ids': list(set(google_ads_ids))
    }
    
    # Build active lists
    active_trackers = [name for name, data in trackers_found.items() if data['active']]
    
    return {
        'trackers': trackers_found,
        'active_count': len(active_trackers),
        'active_trackers': active_trackers,
        'has_analytics': trackers_found['google_analytics']['active'] or trackers_found['google_tag_manager']['active'],
        'has_advertising': any([
            trackers_found['facebook_pixel']['active'],
            trackers_found['google_ads']['active'],
            trackers_found['tiktok_pixel']['active']
        ])
    }

def analyze_seo(soup, html, response):
    title = soup.find('title')
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    
    images = soup.find_all('img')
    images_without_alt = [img for img in images if not img.get('alt')]
    
    return {
        'title': title.text.strip() if title else None,
        'title_length': len(title.text.strip()) if title else 0,
        'meta_description': meta_desc.get('content') if meta_desc else None,
        'meta_description_length': len(meta_desc.get('content')) if meta_desc else 0,
        'h1_count': len(soup.find_all('h1')),
        'image_count': len(images),
        'images_without_alt': len(images_without_alt),
        'has_robots_meta': soup.find('meta', attrs={'name': 'robots'}) is not None,
        'has_canonical': soup.find('link', attrs={'rel': 'canonical'}) is not None,
        'has_og_tags': soup.find('meta', property=re.compile('og:')) is not None,
        'page_size_kb': len(response.content) / 1024
    }

def calculate_scores(results):
    seo = results.get('seo', {})
    technical = results.get('technical', {})
    trackers = results.get('trackers', {})
    
    seo_score = 100
    if not seo.get('title') or seo.get('title_length', 0) < 10:
        seo_score -= 20
    if not seo.get('meta_description') or seo.get('meta_description_length', 0) < 50:
        seo_score -= 15
    if seo.get('images_without_alt', 0) > 10:
        seo_score -= 15
    
    perf_score = 100
    response_time = technical.get('response_time_ms', 0)
    if response_time > 3000:
        perf_score -= 40
    elif response_time > 1500:
        perf_score -= 20
    if technical.get('cdn') == 'none':
        perf_score -= 10
    
    marketing_score = 50
    if trackers.get('has_analytics'):
        marketing_score += 20
    if trackers.get('has_advertising'):
        marketing_score += 30
    
    overall = int((seo_score + perf_score + marketing_score) / 3)
    
    return {
        'seo_score': max(seo_score, 0),
        'performance_score': max(perf_score, 0),
        'marketing_score': max(marketing_score, 0),
        'overall_score': max(overall, 0)
    }

def generate_recommendations(results):
    recs = []
    seo = results.get('seo', {})
    technical = results.get('technical', {})
    trackers = results.get('trackers', {})
    platform = results.get('platform', {})
    
    if seo.get('images_without_alt', 0) > 0:
        recs.append({
            'category': 'SEO',
            'priority': 'medium',
            'issue': f"{seo['images_without_alt']} images missing alt text",
            'recommendation': 'Add descriptive alt text to all images for accessibility and SEO.',
            'impact': 'Better accessibility and image search visibility'
        })
    
    if technical.get('response_time_ms', 0) > 3000:
        recs.append({
            'category': 'Performance',
            'priority': 'high',
            'issue': f"Slow page load time ({technical['response_time_ms']}ms)",
            'recommendation': 'Optimize images, enable caching, and consider using a CDN to improve load times.',
            'impact': 'Better user experience and SEO rankings'
        })
    
    if technical.get('cdn') == 'none':
        recs.append({
            'category': 'Performance',
            'priority': 'medium',
            'issue': 'No CDN detected',
            'recommendation': 'Use a Content Delivery Network (CDN) like Cloudflare to improve global loading speeds.',
            'impact': 'Faster loading times for international visitors'
        })
    
    if not trackers.get('has_advertising') and platform.get('is_ecommerce'):
        recs.append({
            'category': 'Marketing',
            'priority': 'high',
            'issue': 'No advertising pixels detected on e-commerce site',
            'recommendation': 'Install Facebook Pixel and Google Ads conversion tracking to measure ROI and create retargeting campaigns.',
            'impact': 'Better ad targeting and conversion tracking'
        })
    
    return recs
