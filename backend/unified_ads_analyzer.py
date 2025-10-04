"""
Unified Ads Library Analyzer
Uses: Open Source + Public APIs + Manual URLs
"""

import os
from typing import Dict
from meta_ads_scraper import MetaAdsLibraryScraper
from tiktok_ads_scraper import TikTokAdsLibraryScraper
from google_ads_scraper import GoogleAdsTransparencyScraper

class UnifiedAdsAnalyzer:
    def __init__(self):
        # Meta token from env
        meta_token = os.getenv("META_ACCESS_TOKEN", 
            "EAAI1jNhIKv4BPnAjADBY7QtaOvRaHWF2KFC2p71bQlz8sHKSlHSEpeMtXYlJDksRQSOozj5iAWia2InTg6UHhZc5WZBIJAH94RAsu2Bffp4wDekpBXTLb12zSAj5bi79n1MTgMtWicvCWdcYq2lkiFNKui9pNJmrlHz7bbKNT7jXVaWIrBuv3mE0Q8pLvXzkrJhmXQVCOgrgQ2DZD")
        
        self.meta_scraper = MetaAdsLibraryScraper(meta_token)
        self.tiktok_scraper = TikTokAdsLibraryScraper()
        self.google_scraper = GoogleAdsTransparencyScraper()
    
    def analyze(self, domain: str, brand_name: str = None) -> Dict:
        """Analyze all platforms"""
        
        if not brand_name:
            brand_name = domain.split('.')[0].replace('-', ' ').title()
        
        results = {
            'domain': domain,
            'brand_name': brand_name,
            'platforms': {}
        }
        
        # Meta (WORKING with API)
        try:
            meta_data = self.meta_scraper.search_ads(brand_name)
            ads = meta_data.get('data', [])
            
            results['platforms']['meta'] = {
                'status': 'success' if not meta_data.get('error') else 'error',
                'total_ads': len(ads),
                'ads': ads[:10],
                'manual_url': f"https://www.facebook.com/ads/library/?q={brand_name}"
            }
        except Exception as e:
            results['platforms']['meta'] = {'status': 'error', 'error': str(e)}
        
        # TikTok (Manual URL)
        try:
            tiktok_data = self.tiktok_scraper.search_ads(brand_name)
            results['platforms']['tiktok'] = tiktok_data
        except Exception as e:
            results['platforms']['tiktok'] = {'status': 'error', 'error': str(e)}
        
        # Google (Manual URL)
        try:
            google_data = self.google_scraper.search_ads(domain)
            results['platforms']['google'] = google_data
        except Exception as e:
            results['platforms']['google'] = {'status': 'error', 'error': str(e)}
        
        return results


def analyze_competitor_ads(domain: str, brand_name: str = None) -> Dict:
    """Main function"""
    analyzer = UnifiedAdsAnalyzer()
    return analyzer.analyze(domain, brand_name)
