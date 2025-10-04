import requests
import os
from competitor_analyzer import find_competitors, analyze_competitor_pages

SCRAPER_URL = os.getenv("SCRAPER_SERVICE_URL", "http://34.63.165.165:8080")

def analyze_domain(domain: str) -> dict:
    """Enhanced domain analysis with competitors"""
    
    domain = domain.replace("https://", "").replace("http://", "").split("/")[0]
    url = f"https://{domain}"
    
    results = {
        "domain": domain,
        "url": url,
        "scores": {},
        "platform": {},
        "trackers": {},
        "recommendations": [],
        "competitors": []
    }
    
    try:
        # Main scraping
        scrape_response = requests.post(
            f"{SCRAPER_URL}/scrape",
            json={"url": url, "options": {"screenshot": False}},
            timeout=30
        )
        
        if scrape_response.status_code == 200:
            scrape_data = scrape_response.json().get("data", {})
            page_info = scrape_data.get("pageInfo", {})
            html = scrape_data.get("html", "")
            
            # Existing analysis
            seo_score = analyze_seo(page_info, html)
            platform_info = detect_platform(html)
            tracker_info = detect_trackers(html)
            perf_score = 75
            marketing_score = calculate_marketing_score(tracker_info)
            overall = (seo_score + perf_score + marketing_score) // 3
            
            results["scores"] = {
                "seo_score": seo_score,
                "performance_score": perf_score,
                "marketing_score": marketing_score,
                "overall_score": overall
            }
            results["platform"] = platform_info
            results["trackers"] = tracker_info
            results["recommendations"] = generate_recommendations(
                seo_score, marketing_score, tracker_info, platform_info
            )
            
            # NEW: Find competitors
            competitors = find_competitors(domain, page_info, max_results=4)
            
            # Analyze each competitor
            for comp in competitors:
                detailed_comp = analyze_competitor_pages(comp)
                results["competitors"].append(detailed_comp)
                
    except Exception as e:
        print(f"Analysis error: {e}")
        results = basic_analysis(domain)
    
    return results

# Keep all existing functions (analyze_seo, detect_platform, etc.)
# ... [باقي الكود من analyzers.py القديم]
