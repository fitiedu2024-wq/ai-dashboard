"""
Find content gaps vs competitors
"""

from typing import Dict, List
from collections import Counter
import re

class ContentGapAnalyzer:
    def analyze_gaps(self, your_content: Dict, competitor_content: List[Dict]) -> Dict:
        """Find content opportunities"""
        
        # Your keywords
        your_keywords = set()
        for page in your_content.get('pages_analyzed', []):
            your_keywords.update(page.get('keywords', []))
        
        # Competitor keywords
        competitor_keywords = Counter()
        for comp in competitor_content:
            for page in comp.get('pages_analyzed', []):
                competitor_keywords.update(page.get('keywords', []))
        
        # Find gaps
        gaps = []
        for keyword, freq in competitor_keywords.most_common(50):
            if keyword not in your_keywords:
                # Count how many competitors use it
                comp_count = sum(
                    1 for comp in competitor_content
                    if any(keyword in page.get('keywords', []) for page in comp.get('pages_analyzed', []))
                )
                
                if comp_count >= 2:  # Used by at least 2 competitors
                    gaps.append({
                        'keyword': keyword,
                        'competitor_usage': comp_count,
                        'total_frequency': freq,
                        'priority': 'high' if comp_count >= 3 else 'medium'
                    })
        
        # Content type gaps
        your_topics = self._extract_topics(your_content)
        comp_topics = []
        for comp in competitor_content:
            comp_topics.extend(self._extract_topics(comp))
        
        topic_gaps = [topic for topic in set(comp_topics) if topic not in your_topics]
        
        return {
            'keyword_gaps': gaps[:30],
            'topic_gaps': topic_gaps[:20],
            'content_recommendations': self._generate_recommendations(gaps, topic_gaps)
        }
    
    def _extract_topics(self, content: Dict) -> List[str]:
        """Extract main topics from content"""
        topics = []
        
        for page in content.get('pages_analyzed', []):
            # Use H1 and H2 as topic indicators
            topics.extend(page.get('h1_tags', []))
            topics.extend(page.get('h2_tags', []))
        
        return topics
    
    def _generate_recommendations(self, keyword_gaps: List, topic_gaps: List) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        if keyword_gaps:
            high_priority = [g for g in keyword_gaps if g['priority'] == 'high']
            if high_priority:
                recommendations.append(
                    f"Create content targeting high-priority keywords: {', '.join([g['keyword'] for g in high_priority[:5]])}"
                )
        
        if topic_gaps:
            recommendations.append(
                f"Missing content topics found in competitors: {', '.join(topic_gaps[:5])}"
            )
        
        return recommendations


def analyze_content_gaps(your_site: Dict, competitors: List[Dict]) -> Dict:
    analyzer = ContentGapAnalyzer()
    return analyzer.analyze_gaps(your_site, competitors)
