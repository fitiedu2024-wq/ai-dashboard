import requests
import os

PAGESPEED_API_KEY = os.getenv("GOOGLE_API_KEY")

def get_pagespeed_insights(url: str) -> dict:
    """Get PageSpeed Insights scores and Core Web Vitals"""
    
    api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed"
    params = {
        'url': url,
        'key': PAGESPEED_API_KEY,
        'category': ['performance', 'accessibility', 'best-practices', 'seo']
    }
    
    try:
        response = requests.get(api_url, params=params, timeout=30)
        if response.status_code != 200:
            return {}
        
        data = response.json()
        lighthouse = data.get('lighthouseResult', {})
        
        return {
            'scores': {
                'performance': int(lighthouse.get('categories', {}).get('performance', {}).get('score', 0) * 100),
                'accessibility': int(lighthouse.get('categories', {}).get('accessibility', {}).get('score', 0) * 100),
                'best_practices': int(lighthouse.get('categories', {}).get('best-practices', {}).get('score', 0) * 100),
                'seo': int(lighthouse.get('categories', {}).get('seo', {}).get('score', 0) * 100)
            },
            'core_web_vitals': {
                'lcp': lighthouse.get('audits', {}).get('largest-contentful-paint', {}).get('displayValue', 'N/A'),
                'fid': lighthouse.get('audits', {}).get('max-potential-fid', {}).get('displayValue', 'N/A'),
                'cls': lighthouse.get('audits', {}).get('cumulative-layout-shift', {}).get('displayValue', 'N/A'),
                'fcp': lighthouse.get('audits', {}).get('first-contentful-paint', {}).get('displayValue', 'N/A'),
                'tti': lighthouse.get('audits', {}).get('interactive', {}).get('displayValue', 'N/A')
            }
        }
    except Exception as e:
        print(f"PageSpeed error: {e}")
        return {}
