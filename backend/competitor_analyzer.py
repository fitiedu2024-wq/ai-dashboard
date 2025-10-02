
import requests

import os

from typing import List, Dict

GOOGLE_API_KEY = os.getenv("AIzaSyBdtRUNhrCrLByK2u3_EHmyAxc8xl8bqTg")

GOOGLE_CSE_ID = os.getenv("13ade16a282a740d5")

SCRAPER_URL = os.getenv("SCRAPER_SERVICE_URL", "http://34.63.165.165:8080")

BLACKLIST = [

    'amazon', 'noon.com', 'jumia', 'namshi', 'ebay', 'alibaba', 

    'walmart', 'target', 'bestbuy', 'aliexpress'

]

def find_competitors(domain: str, page_info: dict, max_results: int = 4) -> List[Dict]:

    """Find real competitors using Google Custom Search"""

    

    # Extract keywords from domain analysis

    title = page_info.get('title', '')

    meta = page_info.get('meta', {})

    description = meta.get('description', '')

    

    # Build search query

    keywords = extract_keywords(title, description)

    query = f"{keywords} competitors similar sites"

    

    try:

        # Google Custom Search API

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

        

        if response.status_code != 200:

            return []

        

        results = response.json().get('items', [])

        competitors = []

        

        for item in results:

            url = item.get('link', '')

            comp_domain = extract_domain(url)

            

            # Filter

            if comp_domain == domain:

                continue

            if any(bl in comp_domain.lower() for bl in BLACKLIST):

                continue

            if len(competitors) >= max_results:

                break

                

            competitors.append({

                'domain': comp_domain,

                'url': url,

                'title': item.get('title', ''),

                'snippet': item.get('snippet', '')

            })

        

        return competitors

        

    except Exception as e:

        print(f"Competitor search error: {e}")

        return []

def analyze_competitor_pages(competitor: Dict) -> Dict:

    """Scrape competitor's key pages"""

    

    try:

        response = requests.post(

            f"{SCRAPER_URL}/scrape-competitor",

            json={

                'domain': competitor['domain'],

                'maxPages': 3

            },

            timeout=45

        )

        

        if response.status_code == 200:

            data = response.json()

            return {

                **competitor,

                'pages': data.get('pages', [])

            }

    except:

        pass

    

    return competitor

def extract_keywords(title: str, description: str) -> str:

    """Extract main keywords"""

    text = f"{title} {description}".lower()

    # Simple keyword extraction - يمكن تحسينه لاحقاً

    return ' '.join(text.split()[:10])

def extract_domain(url: str) -> str:

    """Extract clean domain"""

    from urllib.parse import urlparse

    parsed = urlparse(url)

    return parsed.netloc.replace('www.', '')

