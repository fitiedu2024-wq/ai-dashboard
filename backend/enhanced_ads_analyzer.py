"""
Enhanced Ads Analyzer with social discovery
"""

from social_extractor import extract_social_links
from unified_ads_analyzer import UnifiedAdsAnalyzer
from typing import Dict

def analyze_competitor_ads_enhanced(domain: str, brand_name: str = None) -> Dict:
    """Enhanced ads analysis with social discovery"""
    
    # Extract social links from website
    social_links = extract_social_links(domain)
    
    # Use discovered usernames for ads search
    results = {
        'domain': domain,
        'social_accounts_found': social_links,
        'platforms': {}
    }
    
    # Analyze with discovered accounts
    analyzer = UnifiedAdsAnalyzer()
    
    # Meta
    fb_username = social_links.get('facebook') or social_links.get('instagram') or brand_name
    if fb_username:
        meta_result = analyzer.meta_scraper.search_ads(fb_username)
        results['platforms']['meta'] = meta_result
        if social_links.get('facebook'):
            results['platforms']['meta']['discovered_from'] = 'website'
    
    # TikTok
    tiktok_username = social_links.get('tiktok') or brand_name
    if tiktok_username:
        results['platforms']['tiktok'] = {
            'username': tiktok_username,
            'discovered': bool(social_links.get('tiktok')),
            'search_url': f"https://library.tiktok.com/ads?region=all&query_type=1&adv_name={tiktok_username}"
        }
    
    return results
