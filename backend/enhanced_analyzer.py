"""
Enhanced analyzer with multi-page analysis
"""

from deep_crawler import deep_crawl_site
from content_gap_analyzer import analyze_content_gaps
from gemini_analyzer import GeminiAnalyzer
from typing import Dict, List

def full_site_analysis(domain: str, competitors: List[str] = None) -> Dict:
    """Complete deep site analysis"""
    
    results = {
        'domain': domain,
        'your_site': {},
        'competitors': [],
        'content_gaps': {},
        'ai_insights': {}
    }
    
    # Deep crawl your site
    print(f"Deep crawling {domain}...")
    your_site_data = deep_crawl_site(domain, max_pages=30)
    results['your_site'] = your_site_data
    
    # Analyze competitors
    if competitors:
        comp_data = []
        for comp_domain in competitors[:3]:
            try:
                print(f"Analyzing competitor: {comp_domain}")
                comp_analysis = deep_crawl_site(comp_domain, max_pages=20)
                comp_data.append(comp_analysis)
            except Exception as e:
                print(f"Failed to analyze {comp_domain}: {e}")
                continue
        
        results['competitors'] = comp_data
        
        # Content gap analysis
        if comp_data:
            gaps = analyze_content_gaps(your_site_data, comp_data)
            results['content_gaps'] = gaps
        
        # Gemini insights
        try:
            gemini = GeminiAnalyzer()
            insights = gemini.deep_competitor_analysis(your_site_data, comp_data)
            results['ai_insights'] = insights
        except Exception as e:
            results['ai_insights'] = {'error': str(e)}
    
    return results
