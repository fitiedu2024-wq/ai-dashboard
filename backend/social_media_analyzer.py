import re
import requests
from typing import Dict, Optional

def extract_facebook_page_id(facebook_url: str) -> Optional[str]:
    """Extract Facebook page ID from URL"""
    if not facebook_url:
        return None
    
    # Pattern 1: /pages/name/ID
    match = re.search(r'/pages/[^/]+/(\d+)', facebook_url)
    if match:
        return match.group(1)
    
    # Pattern 2: Try to scrape page_id from page HTML (simplified)
    # In production, you'd use Facebook Graph API
    try:
        # Extract username
        username_match = re.search(r'facebook\.com/([^/?]+)', facebook_url)
        if username_match:
            username = username_match.group(1)
            # For now, return username (can be improved with Graph API)
            return username
    except:
        pass
    
    return None

def extract_facebook_username(facebook_url: str) -> Optional[str]:
    """Extract Facebook page username from URL"""
    if not facebook_url:
        return None
    
    patterns = [
        r'facebook\.com/([^/?]+)',
        r'fb\.com/([^/?]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, facebook_url)
        if match:
            username = match.group(1)
            if username not in ['pages', 'profile.php', 'people', 'pg']:
                return username
    
    return None

def extract_instagram_username(instagram_url: str) -> Optional[str]:
    """Extract Instagram username from URL"""
    if not instagram_url:
        return None
    
    match = re.search(r'instagram\.com/([^/?]+)', instagram_url)
    if match:
        return match.group(1)
    return None

def extract_snapchat_username(snapchat_url: str) -> Optional[str]:
    """Extract Snapchat username from URL"""
    if not snapchat_url:
        return None
    
    match = re.search(r'snapchat\.com/add/([^/?]+)', snapchat_url)
    if match:
        return match.group(1)
    return None

def extract_tiktok_username(tiktok_url: str) -> Optional[str]:
    """Extract TikTok username from URL"""
    if not tiktok_url:
        return None
    
    match = re.search(r'tiktok\.com/@([^/?]+)', tiktok_url)
    if match:
        return match.group(1)
    return None

def generate_ads_library_urls(social_links: Dict, country: str = "AE") -> Dict[str, str]:
    """Generate ads library URLs for different platforms"""
    
    ads_urls = {}
    
    # Facebook Ads Library
    fb_username = extract_facebook_username(social_links.get('facebook'))
    if fb_username:
        # Try page search first (more accurate)
        ads_urls['facebook'] = f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country={country}&q={fb_username}&search_type=page&media_type=all"
    
    # Snapchat Ads Library
    snap_username = extract_snapchat_username(social_links.get('snapchat'))
    if snap_username:
        ads_urls['snapchat'] = f"https://ads.snapchat.com/political-ads/advertiser/{snap_username}"
    
    # TikTok Ads Library
    tiktok_username = extract_tiktok_username(social_links.get('tiktok'))
    if tiktok_username:
        ads_urls['tiktok'] = f"https://library.tiktok.com/ads?region={country}&q={tiktok_username}"
    
    return ads_urls

def analyze_social_presence(social_links: Dict) -> Dict:
    """Analyze competitor's social media presence"""
    
    platforms_found = [k for k, v in social_links.items() if v]
    
    return {
        'platforms': platforms_found,
        'platform_count': len(platforms_found),
        'has_facebook': bool(social_links.get('facebook')),
        'has_instagram': bool(social_links.get('instagram')),
        'has_snapchat': bool(social_links.get('snapchat')),
        'has_tiktok': bool(social_links.get('tiktok')),
        'facebook_username': extract_facebook_username(social_links.get('facebook')),
        'instagram_username': extract_instagram_username(social_links.get('instagram')),
        'snapchat_username': extract_snapchat_username(social_links.get('snapchat')),
        'tiktok_username': extract_tiktok_username(social_links.get('tiktok'))
    }
