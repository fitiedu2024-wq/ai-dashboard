"""
Based on Facebook's official open source repo
https://github.com/facebookresearch/Ad-Library-API-Script-Repository
"""

import requests
from typing import List, Dict

class MetaAdsLibraryScraper:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://graph.facebook.com/v21.0/ads_archive"
    
    def search_ads(self, search_terms: str, countries: List[str] = None, limit: int = 20) -> Dict:
        """Search Meta Ad Library"""
        
        if countries is None:
            countries = ['US', 'AE', 'SA']
        
        params = {
            'access_token': self.access_token,
            'search_terms': search_terms,
            'ad_reached_countries': countries,
            'ad_active_status': 'ALL',
            'fields': 'id,ad_creative_link_captions,ad_delivery_start_time,ad_snapshot_url,page_name,spend,impressions',
            'limit': limit
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=20)
            
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': response.json()}
        except Exception as e:
            return {'error': str(e)}
