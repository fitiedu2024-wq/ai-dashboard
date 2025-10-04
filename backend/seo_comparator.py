"""
Side-by-side SEO comparison
"""

import requests
from bs4 import BeautifulSoup
from typing import Dict, List

class SEOComparator:
    def compare(self, your_domain: str, competitors: List[str]) -> Dict:
        """Compare SEO metrics side by side"""
        
        results = {
            'your_site': self._analyze_seo(your_domain),
            'competitors': {}
        }
        
        for comp in competitors:
            results['competitors'][comp] = self._analyze_seo(comp)
        
        # Add comparison insights
        results['insights'] = self._generate_insights(results)
        
        return results
    
    def _analyze_seo(self, domain: str) -> Dict:
        """Analyze SEO metrics for a domain"""
        try:
            if not domain.startswith('http'):
                domain = f'https://{domain}'
            
            response = requests.get(domain, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Basic SEO metrics
            title = soup.find('title')
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            h1_tags = soup.find_all('h1')
            h2_tags = soup.find_all('h2')
            
            # Images with/without alt
            images = soup.find_all('img')
            images_with_alt = len([img for img in images if img.get('alt')])
            
            # Internal links
            internal_links = len(soup.find_all('a', href=True))
            
            return {
                'title': title.get_text() if title else None,
                'title_length': len(title.get_text()) if title else 0,
                'meta_description': meta_desc.get('content') if meta_desc else None,
                'meta_desc_length': len(meta_desc.get('content')) if meta_desc else 0,
                'h1_count': len(h1_tags),
                'h2_count': len(h2_tags),
                'total_images': len(images),
                'images_with_alt': images_with_alt,
                'alt_coverage': round(images_with_alt / len(images) * 100, 1) if images else 0,
                'internal_links': internal_links,
                'seo_score': self._calculate_score(title, meta_desc, h1_tags, images_with_alt, len(images))
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _calculate_score(self, title, meta_desc, h1_tags, images_with_alt, total_images) -> int:
        """Simple SEO score"""
        score = 0
        
        if title:
            score += 20
            if 30 <= len(title.get_text()) <= 60:
                score += 10
        
        if meta_desc:
            score += 20
            if 120 <= len(meta_desc.get('content')) <= 160:
                score += 10
        
        if h1_tags and len(h1_tags) >= 1:
            score += 20
        
        if total_images > 0:
            alt_ratio = images_with_alt / total_images
            score += int(alt_ratio * 20)
        
        return min(score, 100)
    
    def _generate_insights(self, results: Dict) -> List[str]:
        """Generate comparison insights"""
        insights = []
        
        your_score = results['your_site'].get('seo_score', 0)
        comp_scores = [data.get('seo_score', 0) for data in results['competitors'].values()]
        
        if comp_scores:
            avg_comp_score = sum(comp_scores) / len(comp_scores)
            
            if your_score < avg_comp_score:
                insights.append(f"Your SEO score ({your_score}) is below competitor average ({avg_comp_score:.1f})")
            else:
                insights.append(f"Your SEO score ({your_score}) is above competitor average ({avg_comp_score:.1f})")
        
        # Title length comparison
        your_title_len = results['your_site'].get('title_length', 0)
        if your_title_len == 0:
            insights.append("Missing page title - critical SEO issue")
        elif your_title_len < 30:
            insights.append("Page title too short (recommended 30-60 chars)")
        elif your_title_len > 60:
            insights.append("Page title too long (recommended 30-60 chars)")
        
        # Alt text comparison
        your_alt = results['your_site'].get('alt_coverage', 0)
        if your_alt < 80:
            insights.append(f"Only {your_alt}% of images have alt text (target 100%)")
        
        return insights


def compare_seo(your_domain: str, competitors: List[str]) -> Dict:
    comparator = SEOComparator()
    return comparator.compare(your_domain, competitors)
