import re
import requests
from typing import List, Dict, Optional
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET

PRIORITY_PATTERNS = [
    (r'/(product|منتج|منتجات)', 90),
    (r'/(service|خدمة|خدمات)', 90),
    (r'/(course|دورة|دورات|كورس)', 90),
    (r'/(program|برنامج|برامج)', 90),
    (r'/(category|categories|قسم|اقسام|تصنيف)', 85),
    (r'/(shop|متجر|تسوق)', 85),
    (r'/(about|من-نحن|عنا|حول)', 80),
    (r'/(pricing|price|اسعار|تسعير)', 75),
    (r'/(features|مميزات|خصائص)', 75),
    (r'/(contact|اتصل|تواصل)', 70),
    (r'/(blog|مدونة|مقالات)', 60),
    (r'/(news|اخبار|جديد)', 60),
    (r'/(portfolio|معرض|اعمال)', 65),
    (r'/(training|تدريب)', 85),
    (r'/(certification|شهادة|شهادات)', 85),
    (r'/(offer|عرض|عروض)', 70),
]

def parse_sitemap(content: bytes) -> List[str]:
    """Parse sitemap XML and return URLs"""
    urls = []
    try:
        root = ET.fromstring(content)
        
        # Check if sitemap index (contains other sitemaps)
        if 'sitemapindex' in root.tag.lower():
            # This is a sitemap index
            ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
            sitemap_locs = root.findall('.//ns:loc', ns)
            if not sitemap_locs:
                sitemap_locs = root.findall('.//loc')
            
            return [loc.text for loc in sitemap_locs if loc.text]
        
        # Regular sitemap with URLs
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        url_locs = root.findall('.//ns:loc', ns)
        if not url_locs:
            url_locs = root.findall('.//loc')
        
        return [loc.text for loc in url_locs if loc.text]
    except:
        return []

def get_sitemap_urls(domain: str) -> List[str]:
    """Fetch URLs from sitemap.xml (handles sitemap indexes)"""
    if not domain.startswith('http'):
        domain = f'https://{domain}'
    
    sitemap_url = urljoin(domain, '/sitemap.xml')
    all_urls = []
    
    try:
        response = requests.get(sitemap_url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        if response.status_code == 200:
            urls = parse_sitemap(response.content)
            
            # Check if these are sub-sitemaps
            if urls and all(url.endswith('.xml') for url in urls[:3]):
                print(f"Found sitemap index with {len(urls)} sub-sitemaps")
                
                # Fetch each sub-sitemap (limit to 5)
                for sub_sitemap in urls[:5]:
                    try:
                        sub_response = requests.get(sub_sitemap, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                        if sub_response.status_code == 200:
                            sub_urls = parse_sitemap(sub_response.content)
                            all_urls.extend(sub_urls)
                            print(f"  {sub_sitemap.split('/')[-1]}: {len(sub_urls)} URLs")
                    except:
                        continue
            else:
                all_urls = urls
    except Exception as e:
        print(f"Sitemap error: {e}")
    
    return all_urls

def crawl_internal_links(domain: str, max_depth: int = 2) -> List[str]:
    """Fallback: crawl internal links"""
    if not domain.startswith('http'):
        domain = f'https://{domain}'
    
    base_domain = urlparse(domain).netloc
    visited = set()
    to_visit = [(domain, 0)]
    found_urls = []
    
    while to_visit and len(found_urls) < 50:
        url, depth = to_visit.pop(0)
        
        if url in visited or depth > max_depth:
            continue
        
        visited.add(url)
        found_urls.append(url)
        
        try:
            response = requests.get(url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
            soup = BeautifulSoup(response.text, 'html.parser')
            
            for link in soup.find_all('a', href=True):
                href = urljoin(url, link['href'])
                parsed = urlparse(href)
                clean_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
                
                if parsed.netloc == base_domain and clean_url not in visited:
                    to_visit.append((clean_url, depth + 1))
        except:
            continue
    
    return found_urls

def select_important_pages(urls: List[str], max_pages: int = 20) -> List[str]:
    """Select most important pages"""
    if not urls:
        return []
    
    scored_urls = []
    
    for url in urls:
        score = 0
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        # Homepage
        if path in ['/', '', '/index.html', '/index.php', '/ar', '/en', '/ar/', '/en/']:
            score = 100
        else:
            # Check patterns
            matched = False
            for pattern, pattern_score in PRIORITY_PATTERNS:
                if re.search(pattern, path):
                    score = pattern_score
                    matched = True
                    break
            
            # Default score for non-matching but shallow pages
            if not matched and path.count('/') <= 2:
                score = 30
            
            # Penalize deep URLs
            if score > 0:
                depth = path.count('/')
                score -= max(0, (depth - 2) * 3)
        
        scored_urls.append({'url': url, 'score': score, 'path': path})
    
    scored_urls.sort(key=lambda x: x['score'], reverse=True)
    
    print("\nTop scored pages:")
    for item in scored_urls[:10]:
        print(f"  {item['score']:3d} - {item['path']}")
    
    selected = [item['url'] for item in scored_urls if item['score'] > 0][:max_pages]
    return selected

def get_pages_to_analyze(domain: str, max_pages: int = 20) -> List[str]:
    """Main function"""
    print(f"Looking for sitemap at {domain}")
    urls = get_sitemap_urls(domain)
    
    if not urls:
        print("No sitemap found, crawling...")
        urls = crawl_internal_links(domain)
    else:
        print(f"Found {len(urls)} total URLs")
    
    selected = select_important_pages(urls, max_pages)
    print(f"\nSelected {len(selected)} pages for analysis")
    return selected
