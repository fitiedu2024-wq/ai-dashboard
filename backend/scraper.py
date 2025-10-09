import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import Dict, List
import re

def analyze_page_technical_seo(soup, url: str) -> Dict:
    """Deep technical SEO analysis"""
    
    # Title analysis
    title = soup.find('title')
    title_text = title.text.strip() if title else ""
    title_score = 0
    if 30 <= len(title_text) <= 60:
        title_score = 100
    elif len(title_text) < 30:
        title_score = 50
    else:
        title_score = 70
    
    # Meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    desc_text = meta_desc.get('content', '') if meta_desc else ""
    desc_score = 100 if 120 <= len(desc_text) <= 160 else 50
    
    # Headers structure
    h1_tags = soup.find_all('h1')
    h2_tags = soup.find_all('h2')
    h3_tags = soup.find_all('h3')
    
    headers_score = 100 if len(h1_tags) == 1 else 50
    
    # Images
    images = soup.find_all('img')
    images_with_alt = [img for img in images if img.get('alt')]
    alt_coverage = round((len(images_with_alt) / len(images) * 100) if images else 0, 1)
    
    # Links
    internal_links = []
    external_links = []
    for link in soup.find_all('a', href=True):
        href = link['href']
        full_url = urljoin(url, href)
        if urlparse(full_url).netloc == urlparse(url).netloc:
            internal_links.append(full_url)
        else:
            external_links.append(full_url)
    
    # Content analysis
    text = soup.get_text(separator=' ', strip=True)
    words = text.split()
    word_count = len(words)
    
    # Readability (simplified)
    sentences = re.split(r'[.!?]+', text)
    avg_words_per_sentence = word_count / max(len(sentences), 1)
    readability_score = 100 if 15 <= avg_words_per_sentence <= 25 else 70
    
    # Schema markup
    has_schema = bool(soup.find('script', type='application/ld+json'))
    
    # Mobile viewport
    viewport = soup.find('meta', attrs={'name': 'viewport'})
    mobile_friendly = bool(viewport)
    
    # Open Graph
    og_tags = soup.find_all('meta', property=re.compile(r'^og:'))
    has_og = len(og_tags) > 0
    
    # Canonical
    canonical = soup.find('link', rel='canonical')
    has_canonical = bool(canonical)
    
    # Calculate overall page score
    overall_score = round((
        title_score * 0.20 +
        desc_score * 0.15 +
        headers_score * 0.15 +
        (alt_coverage * 0.10) +
        readability_score * 0.15 +
        (100 if has_schema else 0) * 0.10 +
        (100 if mobile_friendly else 0) * 0.10 +
        (100 if has_og else 0) * 0.05
    ))
    
    return {
        'title': {
            'text': title_text,
            'length': len(title_text),
            'score': title_score,
            'recommendation': 'Good' if title_score == 100 else 'Optimize to 30-60 chars'
        },
        'meta_description': {
            'text': desc_text,
            'length': len(desc_text),
            'score': desc_score,
            'recommendation': 'Good' if desc_score == 100 else 'Optimize to 120-160 chars'
        },
        'headers': {
            'h1_count': len(h1_tags),
            'h2_count': len(h2_tags),
            'h3_count': len(h3_tags),
            'score': headers_score,
            'h1_texts': [h1.text.strip() for h1 in h1_tags][:3]
        },
        'images': {
            'total': len(images),
            'with_alt': len(images_with_alt),
            'alt_coverage': alt_coverage,
            'recommendation': 'Excellent' if alt_coverage > 90 else 'Add alt text to more images'
        },
        'links': {
            'internal': len(set(internal_links)),
            'external': len(set(external_links))
        },
        'content': {
            'word_count': word_count,
            'sentences': len(sentences),
            'avg_words_per_sentence': round(avg_words_per_sentence, 1),
            'readability_score': readability_score
        },
        'technical': {
            'has_schema': has_schema,
            'mobile_friendly': mobile_friendly,
            'has_open_graph': has_og,
            'has_canonical': has_canonical
        },
        'overall_score': overall_score
    }

def get_page_content(url: str) -> Dict:
    """Enhanced page content extraction"""
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Get detailed analysis
        analysis = analyze_page_technical_seo(soup, url)
        
        # Extract internal links for crawling
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(url).netloc:
                links.append(full_url)
        
        return {
            'url': url,
            'status': 'success',
            'analysis': analysis,
            'internal_links': list(set(links))[:10]
        }
    except Exception as e:
        return {
            'url': url,
            'status': 'error',
            'error': str(e)
        }

def crawl_site(domain: str, max_pages: int = 20) -> Dict:
    """Enhanced site crawling with detailed analysis"""
    if not domain.startswith('http'):
        base_url = 'https://' + domain
    else:
        base_url = domain
    
    visited = set()
    to_visit = [base_url]
    pages_data = []
    
    while to_visit and len(pages_data) < max_pages:
        url = to_visit.pop(0)
        if url in visited:
            continue
        
        visited.add(url)
        page_data = get_page_content(url)
        
        if page_data['status'] == 'success':
            pages_data.append(page_data)
            
            # Add more links to crawl
            if len(pages_data) < max_pages:
                for link in page_data.get('internal_links', [])[:3]:
                    if link not in visited and link not in to_visit:
                        to_visit.append(link)
        
        time.sleep(0.5)
    
    # Calculate aggregate stats
    if pages_data:
        analyses = [p['analysis'] for p in pages_data]
        
        avg_score = round(sum(a['overall_score'] for a in analyses) / len(analyses))
        avg_word_count = round(sum(a['content']['word_count'] for a in analyses) / len(analyses))
        avg_title_length = round(sum(a['title']['length'] for a in analyses) / len(analyses))
        avg_alt_coverage = round(sum(a['images']['alt_coverage'] for a in analyses) / len(analyses), 1)
        
        # Technical features
        schema_coverage = round(sum(1 for a in analyses if a['technical']['has_schema']) / len(analyses) * 100, 1)
        mobile_friendly_pct = round(sum(1 for a in analyses if a['technical']['mobile_friendly']) / len(analyses) * 100, 1)
        
        # Issues & Recommendations
        issues = []
        recommendations = []
        
        if avg_score < 70:
            issues.append("Overall SEO score is below optimal")
            recommendations.append("Focus on improving meta tags and content structure")
        
        if avg_alt_coverage < 80:
            issues.append(f"Only {avg_alt_coverage}% of images have alt text")
            recommendations.append("Add descriptive alt text to all images")
        
        if schema_coverage < 50:
            issues.append("Low schema markup usage")
            recommendations.append("Implement structured data (Schema.org) for better search visibility")
        
        if mobile_friendly_pct < 100:
            issues.append("Not all pages are mobile-friendly")
            recommendations.append("Add viewport meta tag to all pages")
        
        return {
            'total_pages': len(pages_data),
            'avg_seo_score': avg_score,
            'avg_word_count': avg_word_count,
            'avg_title_length': avg_title_length,
            'avg_alt_coverage': avg_alt_coverage,
            'schema_coverage': schema_coverage,
            'mobile_friendly': mobile_friendly_pct,
            'pages': pages_data,
            'issues': issues,
            'recommendations': recommendations
        }
    
    return {
        'total_pages': 0,
        'avg_seo_score': 0,
        'error': 'Could not crawl site'
    }

def find_social_accounts(domain: str) -> Dict:
    """Find social media accounts"""
    try:
        url = 'https://' + domain if not domain.startswith('http') else domain
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'lxml')
        
        social = {
            'facebook': None,
            'tiktok': None,
            'instagram': None,
            'twitter': None,
            'linkedin': None
        }
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'facebook.com' in href:
                social['facebook'] = href
            elif 'tiktok.com' in href:
                parts = href.split('tiktok.com/')
                if len(parts) > 1:
                    username = parts[1].split('?')[0].strip('/@')
                    social['tiktok'] = username
            elif 'instagram.com' in href:
                social['instagram'] = href
            elif 'twitter.com' in href or 'x.com' in href:
                social['twitter'] = href
            elif 'linkedin.com' in href:
                social['linkedin'] = href
        
        return social
    except:
        return {'facebook': None, 'tiktok': None, 'instagram': None, 'twitter': None, 'linkedin': None}
