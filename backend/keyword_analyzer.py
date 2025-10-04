"""
Deep Keyword Analysis - finds keyword gaps & opportunities
"""

import requests
from bs4 import BeautifulSoup
from collections import Counter
import re
from typing import Dict, List

class KeywordAnalyzer:
    def __init__(self):
        self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
    
    def analyze_keywords(self, your_domain: str, competitor_domains: List[str]) -> Dict:
        """Compare your keywords vs competitors"""
        
        # Get your keywords
        your_keywords = self._extract_keywords(your_domain)
        
        # Get competitor keywords
        competitor_keywords = {}
        for comp in competitor_domains:
            competitor_keywords[comp] = self._extract_keywords(comp)
        
        # Find gaps
        gaps = self._find_keyword_gaps(your_keywords, competitor_keywords)
        
        # Find opportunities
        opportunities = self._find_opportunities(your_keywords, competitor_keywords)
        
        return {
            'your_keywords': your_keywords[:30],
            'keyword_gaps': gaps,
            'opportunities': opportunities,
            'competitor_keywords': {k: v[:20] for k, v in competitor_keywords.items()}
        }
    
    def _extract_keywords(self, domain: str) -> List[tuple]:
        """Extract keywords from domain"""
        try:
            if not domain.startswith('http'):
                domain = f'https://{domain}'
            
            response = requests.get(domain, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Get text
            text = soup.get_text().lower()
            
            # Extract words
            words = re.findall(r'\b[a-z]{3,}\b', text)
            
            # Filter stop words
            filtered = [w for w in words if w not in self.stop_words]
            
            # Count frequency
            freq = Counter(filtered)
            
            return freq.most_common(100)
            
        except Exception as e:
            return []
    
    def _find_keyword_gaps(self, your_kw: List, comp_kw: Dict) -> List[str]:
        """Find keywords competitors use but you don't"""
        
        your_words = set([w[0] for w in your_kw])
        
        gaps = set()
        for comp, keywords in comp_kw.items():
            comp_words = set([w[0] for w in keywords[:30]])
            gaps.update(comp_words - your_words)
        
        return list(gaps)[:20]
    
    def _find_opportunities(self, your_kw: List, comp_kw: Dict) -> List[Dict]:
        """Find high-value keywords to target"""
        
        opportunities = []
        
        # Keywords used by multiple competitors but not by you
        your_words = set([w[0] for w in your_kw])
        
        keyword_counts = Counter()
        for comp, keywords in comp_kw.items():
            for word, freq in keywords[:50]:
                if word not in your_words:
                    keyword_counts[word] += 1
        
        # High-frequency gaps
        for word, count in keyword_counts.most_common(15):
            if count >= 2:  # Used by at least 2 competitors
                opportunities.append({
                    'keyword': word,
                    'competitor_usage': count,
                    'priority': 'high' if count >= 3 else 'medium'
                })
        
        return opportunities


def analyze_keywords(your_domain: str, competitor_domains: List[str]) -> Dict:
    analyzer = KeywordAnalyzer()
    return analyzer.analyze_keywords(your_domain, competitor_domains)
