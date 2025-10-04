import requests
import os
from typing import List, Dict
from urllib.parse import urlparse
import re

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
SCRAPER_URL = os.getenv("SCRAPER_SERVICE_URL")

BLACKLIST = [
    'amazon', 'noon.com', 'jumia', 'namshi', 'ebay', 'alibaba', 
    'walmart', 'target', 'bestbuy', 'aliexpress', 'facebook',
    'instagram', 'twitter', 'linkedin', 'youtube', 'wikipedia'
]

def find_competitors(domain: str, page_info: dict, max_results: int = 5) -> List[Dict]:
    """Smarter competitor finding with multiple search strategies"""
    
    title = page_info.get('title', '')
    description = page_info.get('meta', {}).get('description', '')
    
    stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']
    keywords = extract_smart_keywords(title, description, stopwords)
    industry = detect_industry(title, description)
    
    queries = [
        f"{keywords} alternative",
        f"{keywords} competitor",
        f"best {industry} companies",
        f"{industry} similar to {domain.split('.')[0]}"
    ]
    
    all_competitors = {}
    
    for query in queries:
        try:
            response = requests.get(
                'https://www.googleapis.com/customsearch/v1',
                params={
                    'key': GOOGLE_API_KEY,
                    'cx': GOOGLE_CSE_ID,
                    'q': query,
                    'num': 10
                },
                timeout=10
            )
            
            if response.status_code == 200:
                results = response.json().get('items', [])
                
                for item in results:
                    url = item.get('link', '')
                    comp_domain = extract_domain(url)
                    
                    if comp_domain == domain:
                        continue
                    if any(bl in comp_domain.lower() for bl in BLACKLIST):
                        continue
                    if comp_domain in all_competitors:
                        continue
                    
                    all_competitors[comp_domain] = {
                        'domain': comp_domain,
                        'url': url,
                        'title': item.get('title', ''),
                        'snippet': item.get('snippet', ''),
                        'relevance_score': calculate_relevance(item, keywords, domain)
                    }
                    
                    if len(all_competitors) >= max_results * 2:
                        break
            
        except Exception as e:
            print(f"Search error for '{query}': {e}")
            continue
    
    sorted_competitors = sorted(
        all_competitors.values(),
        key=lambda x: x['relevance_score'],
        reverse=True
    )
    
    return sorted_competitors[:max_results]

def extract_smart_keywords(title: str, description: str, stopwords: list) -> str:
    text = f"{title} {description}".lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    words = text.split()
    keywords = [w for w in words if w not in stopwords and len(w) > 3]
    return ' '.join(keywords[:5])

def detect_industry(title: str, description: str) -> str:
    text = f"{title} {description}".lower()
    
    industries = {
        'education': ['education', 'training', 'course', 'institute', 'academy', 'learning', 'school'],
        'ecommerce': ['shop', 'store', 'buy', 'product', 'cart', 'online shopping'],
        'saas': ['software', 'platform', 'app', 'tool', 'service', 'cloud'],
        'marketing': ['marketing', 'advertising', 'seo', 'digital', 'agency'],
        'finance': ['finance', 'banking', 'payment', 'investment', 'trading']
    }
    
    for industry, keywords in industries.items():
        if any(kw in text for kw in keywords):
            return industry
    
    return 'business'

def calculate_relevance(item: dict, keywords: str, original_domain: str) -> int:
    score = 0
    title = item.get('title', '').lower()
    snippet = item.get('snippet', '').lower()
    
    keyword_list = keywords.split()
    for kw in keyword_list:
        if kw in title:
            score += 3
        if kw in snippet:
            score += 1
    
    comp_domain = extract_domain(item.get('link', ''))
    if comp_domain.split('.')[0] in original_domain:
        score += 2
    
    return score

def analyze_competitor_pages(competitor: Dict) -> Dict:
    try:
        response = requests.post(
            f"{SCRAPER_URL}/scrape-competitor",
            json={'domain': competitor['domain'], 'maxPages': 3},
            timeout=45
        )
        
        if response.status_code == 200:
            data = response.json()
            social_links = data.get('social', {})
            
            # Import social analyzer
            from social_media_analyzer import generate_ads_library_urls, analyze_social_presence
            
            return {
                **competitor, 
                'pages': data.get('pages', []),
                'social': social_links,
                'social_analysis': analyze_social_presence(social_links),
                'ads_library_urls': generate_ads_library_urls(social_links)
            }
    except Exception as e:
        print(f"Competitor scraping error: {e}")
    
    return competitor

def extract_domain(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc.replace('www.', '')

from social_media_analyzer import generate_ads_library_urls, analyze_social_presence
