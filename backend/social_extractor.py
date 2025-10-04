"""
Extract all social media links from website
"""

import requests
from bs4 import BeautifulSoup
import re
from typing import Dict, List

class SocialExtractor:
    def __init__(self):
        self.patterns = {
            'facebook': r'facebook\.com/([^/\s\?"]+)',
            'instagram': r'instagram\.com/([^/\s\?"]+)',
            'twitter': r'twitter\.com/([^/\s\?"]+)',
            'linkedin': r'linkedin\.com/(company|in)/([^/\s\?"]+)',
            'tiktok': r'tiktok\.com/@([^/\s\?"]+)',
            'youtube': r'youtube\.com/(c|channel|user)/([^/\s\?"]+)',
        }
    
    def extract_from_website(self, domain: str) -> Dict[str, str]:
        """Extract all social links from website"""
        
        if not domain.startswith('http'):
            domain = f'https://{domain}'
        
        social_links = {}
        
        try:
            response = requests.get(domain, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # Find all links
            for link in soup.find_all('a', href=True):
                href = link['href']
                
                for platform, pattern in self.patterns.items():
                    match = re.search(pattern, href)
                    if match:
                        if platform == 'linkedin':
                            social_links[platform] = match.group(2)
                        else:
                            social_links[platform] = match.group(1)
            
            # Also check footer and header specifically
            for section in soup.find_all(['footer', 'header', 'nav']):
                text = str(section)
                for platform, pattern in self.patterns.items():
                    matches = re.findall(pattern, text)
                    if matches and platform not in social_links:
                        social_links[platform] = matches[0] if not isinstance(matches[0], tuple) else matches[0][-1]
            
            return social_links
            
        except Exception as e:
            return {}


def extract_social_links(domain: str) -> Dict[str, str]:
    extractor = SocialExtractor()
    return extractor.extract_from_website(domain)
