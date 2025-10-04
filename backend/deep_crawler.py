"""
Multi-page deep site crawler and analyzer
"""

import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Set
from urllib.parse import urljoin, urlparse
import re
from collections import Counter

class DeepCrawler:
    def __init__(self, max_pages: int = 50):
        self.max_pages = max_pages
        self.visited = set()
        
    def crawl_site(self, domain: str) -> Dict:
        """Deep crawl entire site"""
        
        if not domain.startswith('http'):
            domain = f'https://{domain}'
        
        base_domain = urlparse(domain).netloc
        
        results = {
            'pages_analyzed': [],
            'total_pages': 0,
            'site_structure': {},
            'content_themes': [],
            'internal_linking': {},
            'seo_issues': {
                'missing_titles': [],
                'missing_descriptions': [],
                'duplicate_titles': [],
                'thin_content': [],
                'broken_links': []
            }
        }
        
        pages_to_visit = [domain]
        page_data = []
        all_titles = []
        all_keywords = []
        
        while pages_to_visit and len(self.visited) < self.max_pages:
            url = pages_to_visit.pop(0)
            
            if url in self.visited:
                continue
            
            try:
                self.visited.add(url)
                
                response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract page data
                page_info = self._analyze_page(url, soup)
                page_data.append(page_info)
                
                # Track titles
                if page_info['title']:
                    all_titles.append(page_info['title'])
                
                # Track keywords
                all_keywords.extend(page_info['keywords'])
                
                # Find more internal links
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    full_url = urljoin(url, href)
                    
                    # Only same domain
                    if urlparse(full_url).netloc == base_domain:
                        if full_url not in self.visited and full_url not in pages_to_visit:
                            pages_to_visit.append(full_url)
                
            except Exception as e:
                results['seo_issues']['broken_links'].append(url)
                continue
        
        # Process collected data
        results['pages_analyzed'] = page_data
        results['total_pages'] = len(page_data)
        
        # Find duplicate titles
        title_counts = Counter(all_titles)
        results['seo_issues']['duplicate_titles'] = [
            title for title, count in title_counts.items() if count > 1
        ]
        
        # Content themes
        keyword_freq = Counter(all_keywords).most_common(20)
        results['content_themes'] = [
            {'keyword': word, 'frequency': count} 
            for word, count in keyword_freq
        ]
        
        # Site structure analysis
        results['site_structure'] = self._analyze_site_structure(page_data)
        
        return results
    
    def _analyze_page(self, url: str, soup: BeautifulSoup) -> Dict:
        """Analyze individual page"""
        
        title = soup.find('title')
        title_text = title.get_text().strip() if title else None
        
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else None
        
        h1_tags = [h1.get_text().strip() for h1 in soup.find_all('h1')]
        h2_tags = [h2.get_text().strip() for h2 in soup.find_all('h2')]
        
        # Extract content
        body_text = soup.get_text()
        words = re.findall(r'\b[a-z]{4,}\b', body_text.lower())
        
        # Word count
        word_count = len(words)
        
        # Images
        images = soup.find_all('img')
        images_with_alt = len([img for img in images if img.get('alt')])
        
        # Links
        internal_links = len(soup.find_all('a', href=True))
        
        return {
            'url': url,
            'title': title_text,
            'title_length': len(title_text) if title_text else 0,
            'description': description,
            'description_length': len(description) if description else 0,
            'h1_tags': h1_tags,
            'h2_tags': h2_tags,
            'word_count': word_count,
            'keywords': words[:100],
            'images_total': len(images),
            'images_with_alt': images_with_alt,
            'internal_links': internal_links,
            'has_title': bool(title_text),
            'has_description': bool(description),
            'has_h1': len(h1_tags) > 0,
            'is_thin_content': word_count < 300
        }
    
    def _analyze_site_structure(self, pages: List[Dict]) -> Dict:
        """Analyze overall site structure"""
        
        structure = {
            'depth_levels': {},
            'content_types': {},
            'avg_word_count': 0,
            'avg_internal_links': 0
        }
        
        total_words = sum(p['word_count'] for p in pages)
        total_links = sum(p['internal_links'] for p in pages)
        
        structure['avg_word_count'] = total_words // len(pages) if pages else 0
        structure['avg_internal_links'] = total_links // len(pages) if pages else 0
        
        # Categorize by URL depth
        for page in pages:
            depth = len(urlparse(page['url']).path.split('/')) - 1
            structure['depth_levels'][f'level_{depth}'] = structure['depth_levels'].get(f'level_{depth}', 0) + 1
        
        return structure


def deep_crawl_site(domain: str, max_pages: int = 50) -> Dict:
    crawler = DeepCrawler(max_pages=max_pages)
    return crawler.crawl_site(domain)
