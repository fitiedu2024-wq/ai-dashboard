import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from typing import List, Dict

def get_page_content(url: str, timeout: int = 10) -> Dict:
    """Fetch and parse a single page"""
    try:
        if not url.startswith('http'):
            url = 'https://' + url
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=timeout)
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Extract text content
        text = soup.get_text(separator=' ', strip=True)
        words = text.split()
        
        # Extract metadata
        title = soup.find('title')
        title_text = title.text.strip() if title else ""
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ""
        
        # Count elements
        h1_tags = soup.find_all('h1')
        h2_tags = soup.find_all('h2')
        images = soup.find_all('img')
        images_with_alt = [img for img in images if img.get('alt')]
        
        # Extract links
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(url, href)
            if urlparse(full_url).netloc == urlparse(url).netloc:
                links.append(full_url)
        
        return {
            'url': url,
            'title': title_text,
            'title_length': len(title_text),
            'description': description,
            'description_length': len(description),
            'word_count': len(words),
            'h1_count': len(h1_tags),
            'h2_count': len(h2_tags),
            'total_images': len(images),
            'images_with_alt': len(images_with_alt),
            'alt_coverage': round((len(images_with_alt) / len(images) * 100) if images else 0, 1),
            'internal_links': len(set(links)),
            'text_preview': ' '.join(words[:100])
        }
    except Exception as e:
        return {
            'url': url,
            'error': str(e),
            'word_count': 0
        }

def crawl_site(domain: str, max_pages: int = 20) -> Dict:
    """Crawl multiple pages of a site"""
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
        
        if 'error' not in page_data:
            pages_data.append(page_data)
            
            # Add internal links to queue
            if len(pages_data) < max_pages:
                try:
                    soup = BeautifulSoup(requests.get(url).content, 'lxml')
                    for link in soup.find_all('a', href=True)[:5]:
                        full_url = urljoin(url, link['href'])
                        if urlparse(full_url).netloc == urlparse(base_url).netloc and full_url not in visited:
                            to_visit.append(full_url)
                except:
                    pass
        
        time.sleep(0.5)  # Be polite
    
    # Calculate aggregate stats
    if pages_data:
        total_words = sum(p['word_count'] for p in pages_data)
        avg_words = round(total_words / len(pages_data))
        avg_title = round(sum(p['title_length'] for p in pages_data) / len(pages_data))
        avg_h1 = round(sum(p['h1_count'] for p in pages_data) / len(pages_data), 1)
        avg_alt = round(sum(p['alt_coverage'] for p in pages_data) / len(pages_data), 1)
        
        # Calculate SEO score
        seo_score = min(100, round(
            (avg_title / 60 * 20) +  # Title length score
            (min(avg_h1, 1) * 20) +   # H1 usage
            (avg_alt * 0.3) +         # Alt text coverage
            (min(avg_words / 1000, 1) * 30)  # Content depth
        ))
        
        return {
            'total_pages': len(pages_data),
            'avg_word_count': avg_words,
            'avg_title_length': avg_title,
            'avg_h1_count': avg_h1,
            'avg_alt_coverage': avg_alt,
            'seo_score': seo_score,
            'pages': pages_data[:5]  # Return first 5 pages details
        }
    
    return {
        'total_pages': 0,
        'avg_word_count': 0,
        'seo_score': 0
    }

def find_social_accounts(domain: str) -> Dict:
    """Try to find social media accounts"""
    try:
        url = 'https://' + domain if not domain.startswith('http') else domain
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Look for social links
        social = {
            'facebook': None,
            'tiktok': None,
            'instagram': None
        }
        
        for link in soup.find_all('a', href=True):
            href = link['href'].lower()
            if 'facebook.com' in href:
                social['facebook'] = href
            elif 'tiktok.com' in href:
                # Extract username
                parts = href.split('tiktok.com/')
                if len(parts) > 1:
                    username = parts[1].split('?')[0].strip('/@')
                    social['tiktok'] = username
            elif 'instagram.com' in href:
                social['instagram'] = href
        
        return social
    except:
        return {'facebook': None, 'tiktok': None, 'instagram': None}
