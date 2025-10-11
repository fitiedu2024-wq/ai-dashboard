import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import Dict, List
import re

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

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

def get_page_content(url: str, timeout: int = 15) -> Dict:
    """Enhanced page content extraction"""
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        
        if response.status_code != 200:
            return {'url': url, 'status': 'error', 'error': f'HTTP {response.status_code}'}
        
        # Use html.parser (built-in, no dependencies)
        soup = BeautifulSoup(response.content, 'html.parser')
        analysis = analyze_page_technical_seo(soup, url)
        
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(url).netloc:
                if not any(ext in full_url.lower() for ext in ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '#', 'mailto:', 'tel:']):
                    links.append(full_url)
        
        return {'url': url, 'status': 'success', 'analysis': analysis, 'internal_links': list(set(links))[:30]}
    
    except Exception as e:
        return {'url': url, 'status': 'error', 'error': str(e)}

def crawl_site(domain: str, max_pages: int = 50) -> Dict:
    """Crawl site - 50 pages"""
    if not domain.startswith('http'):
        base_url = 'https://' + domain
    else:
        base_url = domain
    
    visited = set()
    to_visit = [base_url]
    pages_data = []
    
    print(f"🔍 Crawling {domain} - Target: {max_pages} pages")
    
    while to_visit and len(pages_data) < max_pages:
        url = to_visit.pop(0)
        
        if url in visited:
            continue
        
        visited.add(url)
        print(f"  📄 Page {len(pages_data)+1}/{max_pages}")
        
        page_data = get_page_content(url)
        
        if page_data['status'] == 'success':
            pages_data.append(page_data)
            
            if len(pages_data) < max_pages:
                for link in page_data.get('internal_links', [])[:10]:
                    if link not in visited and link not in to_visit:
                        to_visit.append(link)
        
        time.sleep(0.3)
    
    print(f"✅ Crawled {len(pages_data)} pages")
    
    if pages_data:
        analyses = [p['analysis'] for p in pages_data]
        avg_score = round(sum(a['overall_score'] for a in analyses) / len(analyses))
        avg_word_count = round(sum(a['content']['word_count'] for a in analyses) / len(analyses))
        avg_alt_coverage = round(sum(a['images']['alt_coverage'] for a in analyses) / len(analyses), 1)
        schema_coverage = round(sum(1 for a in analyses if a['technical']['has_schema']) / len(analyses) * 100, 1)
        
        return {
            'total_pages': len(pages_data),
            'avg_seo_score': avg_score,
            'avg_word_count': avg_word_count,
            'avg_alt_coverage': avg_alt_coverage,
            'schema_coverage': schema_coverage,
            'pages': pages_data[:15],
            'issues': [],
            'recommendations': []
        }
    
    return {'total_pages': 0, 'avg_seo_score': 0, 'error': 'Could not crawl'}

def find_social_accounts(domain: str) -> Dict:
    try:
        url = 'https://' + domain if not domain.startswith('http') else domain
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
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
            top=top_n
        )
        
        # Extract keywords
        keywords = kw_extractor.extract_keywords(text)
        
        # Format results
        results = []
        for kw, score in keywords:
            results.append({
                "keyword": kw,
                "relevance_score": round((1 - score) * 100, 2),  # Convert to percentage
                "search_volume": "Fetching..."  # Will add Google API later
            })
        
        return results
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        return []

