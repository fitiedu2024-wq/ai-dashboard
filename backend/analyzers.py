import requests
import os
from urllib.parse import urlparse

SCRAPER_URL = os.getenv("SCRAPER_SERVICE_URL", "http://34.63.165.165:8080")

def analyze_domain(domain: str) -> dict:
    """Enhanced domain analysis using VM scraper"""
    
    # Clean domain
    domain = domain.replace("https://", "").replace("http://", "").split("/")[0]
    url = f"https://{domain}"
    
    results = {
        "domain": domain,
        "url": url,
        "scores": {},
        "platform": {},
        "trackers": {},
        "recommendations": []
    }
    
    try:
        # Use VM scraper for better data
        scrape_response = requests.post(
            f"{SCRAPER_URL}/scrape",
            json={"url": url, "options": {"screenshot": False}},
            timeout=30
        )
        
        if scrape_response.status_code == 200:
            scrape_data = scrape_response.json().get("data", {})
            page_info = scrape_data.get("pageInfo", {})
            html = scrape_data.get("html", "")
            
            # SEO Analysis
            seo_score = analyze_seo(page_info, html)
            
            # Platform Detection
            platform_info = detect_platform(html)
            
            # Tracker Detection
            tracker_info = detect_trackers(html)
            
            # Performance
            perf_score = 75  # Placeholder
            
            # Marketing Score
            marketing_score = calculate_marketing_score(tracker_info)
            
            # Overall Score
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
            
        else:
            # Fallback to basic analysis
            results = basic_analysis(domain)
            
    except Exception as e:
        print(f"Analysis error: {e}")
        results = basic_analysis(domain)
    
    return results

def analyze_seo(page_info: dict, html: str) -> int:
    score = 100
    issues = []
    
    title = page_info.get("title", "")
    meta_desc = page_info.get("meta", {}).get("description", "")
    
    if not title or len(title) < 10:
        score -= 20
        issues.append("Missing or short title")
    
    if not meta_desc or len(meta_desc) < 50:
        score -= 15
        issues.append("Missing or short meta description")
    
    if "<h1" not in html.lower():
        score -= 15
        issues.append("Missing H1 tag")
    
    return max(score, 0)

def detect_platform(html: str) -> dict:
    platforms = []
    html_lower = html.lower()
    
    platform_signatures = {
        "WordPress": ["wp-content", "wp-includes"],
        "Shopify": ["shopify", "cdn.shopify.com"],
        "Salla": ["salla.sa", "salla-cdn"],
        "Zid": ["zid.sa", "zid-store"],
        "WooCommerce": ["woocommerce"],
        "Magento": ["magento"],
        "Wix": ["wix.com", "parastorage"],
        "Squarespace": ["squarespace"]
    }
    
    for platform, signatures in platform_signatures.items():
        if any(sig in html_lower for sig in signatures):
            platforms.append(platform)
    
    return {
        "primary_platform": platforms[0] if platforms else "Unknown",
        "detected_platforms": platforms
    }

def detect_trackers(html: str) -> dict:
    html_lower = html.lower()
    trackers = []
    
    tracker_signatures = {
        "Google Analytics": ["google-analytics", "gtag"],
        "Google Tag Manager": ["googletagmanager"],
        "Facebook Pixel": ["facebook.net/tr", "fbq"],
        "TikTok Pixel": ["tiktok.com/i18n/pixel"],
        "Snapchat Pixel": ["snapchat.com/pixel"],
        "Twitter Pixel": ["static.ads-twitter.com"],
        "Hotjar": ["hotjar.com"],
        "Clarity": ["clarity.ms"]
    }
    
    for tracker, signatures in tracker_signatures.items():
        if any(sig in html_lower for sig in signatures):
            trackers.append(tracker)
    
    return {
        "active_trackers": trackers,
        "active_count": len(trackers)
    }

def calculate_marketing_score(tracker_info: dict) -> int:
    count = tracker_info.get("active_count", 0)
    if count >= 4:
        return 90
    elif count >= 2:
        return 70
    elif count == 1:
        return 50
    return 30

def generate_recommendations(seo_score: int, marketing_score: int, 
                            tracker_info: dict, platform_info: dict) -> list:
    recs = []
    
    if seo_score < 70:
        recs.append({
            "category": "SEO",
            "priority": "high",
            "issue": "SEO optimization needed",
            "recommendation": "Improve title tags, meta descriptions, and heading structure",
            "impact": "Better search engine visibility and click-through rates"
        })
    
    if marketing_score < 60:
        recs.append({
            "category": "Marketing",
            "priority": "high",
            "issue": "Limited tracking implementation",
            "recommendation": "Install Google Analytics and Facebook Pixel for better insights",
            "impact": "Better understanding of user behavior and ad performance"
        })
    
    if tracker_info.get("active_count", 0) == 0:
        recs.append({
            "category": "Analytics",
            "priority": "critical",
            "issue": "No analytics or tracking detected",
            "recommendation": "Implement at minimum: Google Analytics 4 and Google Tag Manager",
            "impact": "Essential for data-driven decision making"
        })
    
    return recs

def basic_analysis(domain: str) -> dict:
    return {
        "domain": domain,
        "scores": {
            "seo_score": 50,
            "performance_score": 50,
            "marketing_score": 50,
            "overall_score": 50
        },
        "platform": {"primary_platform": "Unknown", "detected_platforms": []},
        "trackers": {"active_trackers": [], "active_count": 0},
        "recommendations": [{
            "category": "General",
            "priority": "medium",
            "issue": "Could not fetch detailed data",
            "recommendation": "Ensure website is accessible and try again",
            "impact": "Better analysis results"
        }]
    }
