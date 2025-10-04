import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
import json
import os

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "jack-sparo-2892026")
vertexai.init(project=PROJECT_ID, location="us-central1")

def detect_industry(keywords):
    kw_text = ' '.join(keywords).lower()
    industries = {
        'Education & Training': ['course', 'training', 'institute', 'diploma', 'certification', 'learning'],
        'E-commerce': ['shop', 'store', 'product', 'cart', 'buy'],
        'Finance': ['bank', 'loan', 'investment', 'trading'],
        'Healthcare': ['medical', 'health', 'clinic', 'hospital'],
        'Real Estate': ['property', 'rent', 'apartment', 'villa'],
    }
    for ind, terms in industries.items():
        if sum(t in kw_text for t in terms) >= 2:
            return ind
    return 'General Business'

def detect_location(domain):
    if '.ae' in domain: return 'UAE'
    if '.sa' in domain: return 'Saudi Arabia'
    return 'International'

def generate_ai_report(analysis_data: dict) -> dict:
    domain = analysis_data.get('domain', '')
    keywords = [kw['word'] for kw in analysis_data.get('top_keywords', [])[:50]]
    industry = detect_industry(keywords)
    location = detect_location(domain)
    
    # Build comprehensive context
    context = f"""DEEP WEBSITE INTELLIGENCE ANALYSIS

Website: {domain}
Industry: {industry}
Market: {location}
Pages Analyzed: {len(analysis_data.get('analyzed_pages', []))}

PERFORMANCE METRICS:
- SEO Score: {analysis_data.get('scores', {}).get('seo_score', 0)}/100
- Performance: {analysis_data.get('scores', {}).get('performance_score', 0)}/100
- Marketing Tech: {analysis_data.get('scores', {}).get('marketing_score', 0)}/100

KEYWORD UNIVERSE: {', '.join(keywords[:30])}

SEO HEALTH: {json.dumps(analysis_data.get('seo', {}).get('seo_issues', {}))}

MARKETING STACK:
Active: {', '.join(analysis_data.get('trackers', {}).get('tracker_ids', {}).keys())}
Missing: {', '.join(analysis_data.get('missing_trackers', []))}

PAGESPEED: {json.dumps(analysis_data.get('pagespeed', {}))}

COMPETITIVE LANDSCAPE:
{chr(10).join([f"- {c.get('domain')}: FB Pixel={'✓' if c.get('trackers', {}).get('facebook_pixel') else '✗'}, Social={len(c.get('social', {}))}" for c in analysis_data.get('competitors', [])[:3]])}"""

    prompt = f"""{context}

YOUR MISSION: You are the #1 marketing strategist in {location} {industry}. Provide ACTIONABLE, DATA-DRIVEN intelligence.

OUTPUT STRUCTURE (JSON only, no markdown):

{{
  "executive_summary": "Comprehensive 200-word strategic analysis covering: market position vs {location} {industry} leaders, revenue blockers, competitive moats, compliance gaps, growth acceleration path",
  
  "market_intelligence": {{
    "competitive_position": "Specific benchmark comparison",
    "local_requirements": ["{location} compliance/regulations"],
    "untapped_channels": ["Specific platforms/tactics"],
    "pricing_strategy": "Market positioning analysis"
  }},
  
  "strengths": ["5 data-backed advantages"],
  "critical_gaps": ["5 revenue-blocking issues"],
  
  "recommendations": [
    {{
      "category": "SEO|Performance|Marketing|Compliance|Content",
      "title": "Specific action",
      "implementation": "1. Step one\\n2. Step two\\n3. Step three",
      "business_impact": "{location} {industry} specific ROI with numbers",
      "tools_needed": ["Tool names"],
      "investment": "AED/USD amount or free",
      "timeline": "Days/weeks",
      "priority": "critical|high|medium",
      "difficulty": "1-10"
    }}
  ],
  
  "competitor_intelligence": [
    {{
      "competitor": "domain",
      "advantage": "What they do better",
      "counter_strategy": "How to beat them"
    }}
  ],
  
  "immediate_actions": [
    {{
      "task": "Can execute TODAY",
      "result": "Immediate impact",
      "steps": "How-to"
    }}
  ],
  
  "growth_roadmap": {{
    "month_1": ["Week-by-week priorities"],
    "quarter_1": ["90-day strategic moves"],
    "year_1": "Annual vision"
  }}
}}

CRITICAL RULES:
1. Use ACTUAL DATA from analysis (real keywords, scores, competitors)
2. Mention {location}-specific platforms (WhatsApp, Tabby, Noon, etc.)
3. Reference {industry} best practices
4. Give tool recommendations (Semrush, Hotjar, Cloudflare, etc.)
5. Include cost estimates in local currency
6. Be aggressive and growth-focused
7. NO generic advice - every recommendation must be specific"""

    # Use Gemini 2.5 Pro with Deep Thinking
    model = GenerativeModel("gemini-2.5-pro")
    
    config = GenerationConfig(
        temperature=0.7,
        max_output_tokens=8000,
        top_p=0.95
    )
    
    response = model.generate_content(prompt, generation_config=config)
    
    try:
        text = response.text.strip()
        if '```' in text:
            text = text.split('```')[1].replace('json', '').strip()
        return json.loads(text)
    except Exception as e:
        return {"error": str(e), "raw": response.text[:1000]}
