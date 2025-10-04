from google.cloud import vision, language_v1
import requests
import json
import os
from typing import Dict, List
import vertexai
from vertexai.generative_models import GenerativeModel

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "jack-sparo-2892026")
vertexai.init(project=PROJECT_ID, location="us-central1")

def analyze_visual_design(url: str) -> Dict:
    """Analyze website visual design using Vision API"""
    try:
        # Take screenshot using simple service
        screenshot_api = f"https://image.thum.io/get/width/1200/crop/900/{url}"
        
        client = vision.ImageAnnotatorClient()
        image = vision.Image()
        image.source.image_uri = screenshot_api
        
        response = client.annotate_image({
            'image': image,
            'features': [
                {'type_': vision.Feature.Type.LABEL_DETECTION, 'max_results': 10},
                {'type_': vision.Feature.Type.IMAGE_PROPERTIES},
                {'type_': vision.Feature.Type.TEXT_DETECTION},
                {'type_': vision.Feature.Type.SAFE_SEARCH_DETECTION}
            ]
        })
        
        colors = response.image_properties_annotation.dominant_colors.colors
        
        return {
            'dominant_colors': [
                {
                    'rgb': f'rgb({int(c.color.red)},{int(c.color.green)},{int(c.color.blue)})',
                    'percentage': round(c.pixel_fraction * 100, 1)
                } for c in colors[:5]
            ],
            'visual_elements': [l.description for l in response.label_annotations[:8]],
            'text_detected': bool(response.text_annotations),
            'safe_for_ads': response.safe_search_annotation.adult == vision.SafeSearchAnnotation.Likelihood.VERY_UNLIKELY
        }
    except Exception as e:
        print(f"Visual analysis error: {e}")
        return {}

def analyze_content_intelligence(text: str) -> Dict:
    """Deep content analysis using Natural Language API"""
    try:
        client = language_v1.LanguageServiceClient()
        document = language_v1.Document(content=text[:10000], type_=language_v1.Document.Type.PLAIN_TEXT)
        
        # Sentiment Analysis
        sentiment = client.analyze_sentiment(request={'document': document})
        
        # Entity Analysis
        entities = client.analyze_entities(request={'document': document})
        
        # Content Classification
        try:
            categories = client.classify_text(request={'document': document})
            content_categories = [{'name': c.name, 'confidence': round(c.confidence, 2)} for c in categories.categories[:5]]
        except:
            content_categories = []
        
        return {
            'sentiment': {
                'score': round(sentiment.document_sentiment.score, 2),
                'magnitude': round(sentiment.document_sentiment.magnitude, 2),
                'interpretation': get_sentiment_label(sentiment.document_sentiment.score)
            },
            'key_entities': [
                {
                    'name': e.name,
                    'type': e.type_.name,
                    'salience': round(e.salience, 3),
                    'mentions': len(e.mentions)
                } for e in entities.entities[:15]
            ],
            'content_categories': content_categories
        }
    except Exception as e:
        print(f"Content intelligence error: {e}")
        return {}

def get_sentiment_label(score: float) -> str:
    if score > 0.25:
        return 'Positive & Engaging'
    elif score < -0.25:
        return 'Negative or Critical'
    else:
        return 'Neutral'

def analyze_social_media_readiness(data: Dict) -> Dict:
    """Analyze social media strategy completeness"""
    social = data.get('social', {})
    trackers = data.get('trackers', {}).get('tracker_ids', {})
    
    platforms = {
        'facebook': bool(social.get('facebook')),
        'instagram': bool(social.get('instagram')),
        'twitter': bool(social.get('twitter')),
        'linkedin': bool(social.get('linkedin')),
        'tiktok': bool(social.get('tiktok')),
        'snapchat': bool(social.get('snapchat'))
    }
    
    tracking = {
        'facebook_pixel': 'Facebook Pixel' in trackers or 'Meta Pixel' in trackers,
        'google_ads': 'Google Ads' in trackers,
        'linkedin_insight': 'LinkedIn Insight' in trackers,
        'tiktok_pixel': 'TikTok Pixel' in trackers
    }
    
    active_platforms = sum(platforms.values())
    active_tracking = sum(tracking.values())
    
    return {
        'platforms': platforms,
        'tracking': tracking,
        'score': int((active_platforms * 10) + (active_tracking * 15)),
        'active_platforms': active_platforms,
        'active_tracking': active_tracking,
        'recommendations': generate_social_recommendations(platforms, tracking)
    }

def generate_social_recommendations(platforms, tracking):
    recs = []
    
    if not platforms['instagram']:
        recs.append('Create Instagram Business account - critical for UAE market')
    if not platforms['linkedin']:
        recs.append('Establish LinkedIn Company Page - essential for B2B credibility')
    if not tracking['facebook_pixel']:
        recs.append('Install Facebook Pixel - losing 60% of retargeting opportunities')
    if not tracking['google_ads']:
        recs.append('Implement Google Ads conversion tracking - blind to ROI currently')
    
    return recs[:5]

def analyze_ads_strategy(data: Dict) -> Dict:
    """Comprehensive ads strategy analysis"""
    trackers = data.get('trackers', {}).get('tracker_ids', {})
    competitors = data.get('competitors', [])
    
    platforms_setup = {
        'google_ads': 'Google Ads' in trackers,
        'facebook_ads': any(x in trackers for x in ['Facebook Pixel', 'Meta Pixel']),
        'linkedin_ads': 'LinkedIn Insight' in trackers,
        'tiktok_ads': 'TikTok Pixel' in trackers,
        'snapchat_ads': 'Snapchat Pixel' in trackers
    }
    
    competitor_advantage = sum(
        1 for c in competitors[:3] 
        if c.get('trackers', {}).get('facebook_pixel')
    )
    
    return {
        'platforms_ready': platforms_setup,
        'setup_score': sum(platforms_setup.values()) * 20,
        'competitor_gap': competitor_advantage > sum(platforms_setup.values()),
        'missing_platforms': [k for k, v in platforms_setup.items() if not v],
        'estimated_lost_revenue': calculate_lost_revenue(platforms_setup)
    }

def calculate_lost_revenue(platforms):
    base_traffic = 1000
    if not platforms['google_ads']:
        return f"~${base_traffic * 2.5:.0f}/month (no Google Ads tracking)"
    if not platforms['facebook_ads']:
        return f"~${base_traffic * 1.8:.0f}/month (no Facebook retargeting)"
    return "Minimal - good tracking setup"

def generate_master_report(analysis_data: Dict) -> Dict:
    """Generate comprehensive master analysis report"""
    
    # Collect all content
    all_text = ' '.join([
        analysis_data.get('seo', {}).get('title', ''),
        analysis_data.get('seo', {}).get('meta_description', ''),
        ' '.join(analysis_data.get('seo', {}).get('h1_tags', []))
    ])
    
    # Run all analyses
    visual = analyze_visual_design(analysis_data.get('domain', ''))
    content_intel = analyze_content_intelligence(all_text)
    social_readiness = analyze_social_media_readiness(analysis_data)
    ads_strategy = analyze_ads_strategy(analysis_data)
    
    # Generate AI insights with ALL context
    model = GenerativeModel("gemini-2.5-pro")
    
    mega_prompt = f"""COMPLETE DIGITAL MARKETING INTELLIGENCE REPORT

WEBSITE: {analysis_data.get('domain')}
INDUSTRY: {analysis_data.get('industry', 'Unknown')}
MARKET: {analysis_data.get('location', 'Unknown')}

PERFORMANCE METRICS:
{json.dumps(analysis_data.get('scores', {}), indent=2)}

CONTENT INTELLIGENCE:
{json.dumps(content_intel, indent=2)}

VISUAL ANALYSIS:
{json.dumps(visual, indent=2)}

SOCIAL MEDIA STATUS:
{json.dumps(social_readiness, indent=2)}

ADS STRATEGY STATUS:
{json.dumps(ads_strategy, indent=2)}

SEO HEALTH:
{json.dumps(analysis_data.get('seo', {}), indent=2)}

COMPETITORS:
{json.dumps([c.get('domain') for c in analysis_data.get('competitors', [])[:3]], indent=2)}

GENERATE MASTERPIECE REPORT (JSON only):
{{
  "executive_brief": "200-word strategic overview",
  "overall_grade": "A+|A|B|C|D|F",
  "critical_alerts": ["Urgent issues blocking revenue NOW"],
  
  "seo_analysis": {{
    "score": 0-100,
    "grade": "A-F",
    "strengths": [],
    "weaknesses": [],
    "priority_actions": []
  }},
  
  "content_strategy": {{
    "tone_assessment": "Analysis of messaging tone",
    "key_topics": [],
    "content_gaps": [],
    "recommendations": []
  }},
  
  "social_media_audit": {{
    "score": 0-100,
    "platform_strategy": [],
    "competitor_comparison": "",
    "growth_opportunities": []
  }},
  
  "ads_readiness": {{
    "score": 0-100,
    "conversion_tracking": "status",
    "retargeting_capability": "status",
    "monthly_revenue_at_risk": "estimate",
    "setup_priority": []
  }},
  
  "visual_brand_analysis": {{
    "design_quality": "assessment",
    "brand_consistency": "assessment",
    "ux_score": 0-100,
    "improvements": []
  }},
  
  "action_plan_90_days": {{
    "week_1": [],
    "month_1": [],
    "month_2": [],
    "month_3": []
  }},
  
  "roi_projections": {{
    "quick_wins_revenue": "estimate",
    "3_month_impact": "estimate",
    "annual_potential": "estimate"
  }}
}}"""

    response = model.generate_content(mega_prompt)
    
    try:
        text = response.text.strip()
        if '```' in text:
            text = text.split('```')[1].replace('json', '').strip()
        ai_report = json.loads(text)
    except:
        ai_report = {}
    
    return {
        'visual_analysis': visual,
        'content_intelligence': content_intel,
        'social_readiness': social_readiness,
        'ads_strategy': ads_strategy,
        'ai_master_report': ai_report
    }
