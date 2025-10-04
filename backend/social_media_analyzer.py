import re
from typing import Dict, Optional

def extract_facebook_username(facebook_url: str) -> Optional[str]:
    """Extract Facebook page username from URL"""
    if not facebook_url:
        return None
    
    # Patterns: facebook.com/username or facebook.com/pages/name/id
    patterns = [
        r'facebook\.com/([^/?]+)',
        r'facebook\.com/pages/[^/]+/(\d+)',
        r'fb\.com/([^/?]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, facebook_url)
        if match:
            username = match.group(1)
            # Filter out common non-usernames
            if username not in ['pages', 'profile.php', 'people']:
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

def generate_ads_library_url(social_links: Dict, country: str = "AE") -> Optional[str]:
    """Generate Facebook Ads Library URL using actual username"""
    
    # Try Facebook username first
    fb_username = extract_facebook_username(social_links.get('facebook'))
    if fb_username:
        return f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country={country}&q={fb_username}&search_type=page&media_type=all"
    
    # Fallback to Instagram username
    ig_username = extract_instagram_username(social_links.get('instagram'))
    if ig_username:
        return f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country={country}&q={ig_username}&search_type=page&media_type=all"
    
    return None

def analyze_social_presence(social_links: Dict) -> Dict:
    """Analyze competitor's social media presence"""
    
    platforms_found = [k for k, v in social_links.items() if v]
    
    return {
        'platforms': platforms_found,
        'platform_count': len(platforms_found),
        'has_facebook': bool(social_links.get('facebook')),
        'has_instagram': bool(social_links.get('instagram')),
        'facebook_username': extract_facebook_username(social_links.get('facebook')),
        'instagram_username': extract_instagram_username(social_links.get('instagram'))
    }
