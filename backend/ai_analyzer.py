import vertexai
from vertexai.generative_models import GenerativeModel
import json
import os
from collections import Counter

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "jack-sparo-2892026")
LOCATION = "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

def detect_industry(keywords: list) -> str:
    kw_text = ' '.join(keywords).lower()
    industries = {
        'Education & Training': ['course', 'training', 'institute', 'diploma', 'certification', 'learning', 'student', 'education'],
        'E-commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'buy', 'sell'],
        'Finance & Banking': ['bank', 'loan', 'investment', 'trading', 'insurance', 'finance', 'credit'],
        'Healthcare': ['medical', 'health', 'clinic', 'hospital', 'doctor', 'patient', 'treatment'],
        'Real Estate': ['property', 'rent', 'apartment', 'villa', 'real estate', 'broker'],
        'Technology': ['software', 'saas', 'app', 'platform', 'api', 'tech', 'digital'],
    }
    for industry, terms in industries.items():
        if sum(term in kw_text for term in terms) >= 2:
            return industry
    return 'General Business'

def detect_location(domain: str) -> str:
    if '.ae' in domain: return 'UAE'
    if '.sa' in domain: return 'Saudi Arabia'
    if '.eg' in domain: return 'Egypt'
    if '.com.kw' in domain: return 'Kuwait'
    return 'International'

def generate_ai_report(analysis_data: dict) -> dict:
    domain = analysis_data.get('domain', '')
    keywords = [kw['word'] for kw in analysis_data.get('top_keywords', [])[:50]]
    industry = detect_industry(keywords)
    location = detect_location(domain)
    
    scores = analysis_data.get('scores', {})
    seo = analysis_data.get('seo', {})
    competitors = analysis_data.get('competitors', [])[:5]
    trackers = analysis_data.get('trackers', {})
    pagespeed = analysis_data.get('pagespeed', {})
    
    comp_summary = '\n'.join([
        f"- {c.get('domain')}: Social={len(c.get('social', {}))}, Has FB Pixel={'Yes' if c.get('trackers', {}).get('facebook_pixel') else 'No'}"
        for c in competitors[:3]
    ]) if competitors else "No competitors found"
    
    prompt = f"""You are THE TOP digital marketing strategist in {location} specializing in {industry}.

COMPLETE WEBSITE INTELLIGENCE:
Domain: {domain}
Industry: {industry} in {location}
Pages Analyzed: {len(analysis_data.get('analyzed_pages', []))}

SCORES:
- SEO: {scores.get('seo_score', 0)}/100
- Performance: {scores.get('performance_score', 0)}/100
- Marketing: {scores.get('marketing_score', 0)}/100

TOP KEYWORDS: {', '.join(keywords[:20])}

SEO ISSUES: {json.dumps(seo.get('seo_issues', {}))}

TRACKERS INSTALLED: {', '.join(trackers.get('tracker_ids', {}).keys())}
MISSING CRITICAL TRACKERS: {', '.join(analysis_data.get('missing_trackers', []))}

PAGESPEED SCORES: {json.dumps(pagespeed.get('scores', {}))}
CORE WEB VITALS: {json.dumps(pagespeed.get('core_web_vitals', {}))}

COMPETITORS:
{comp_summary}

YOUR TASK - DEEP STRATEGIC ANALYSIS:

Respond ONLY with valid JSON (no markdown):

{{
  "executive_summary": "Comprehensive 7-sentence analysis covering: market position in {location} {industry}, unique value proposition, critical competitive gaps, revenue impact areas, compliance risks, opportunity cost of inaction, and primary growth lever",
  
  "market_intelligence": {{
    "competitive_position": "Where they stand vs {location} {industry} benchmarks",
    "local_compliance": ["Specific {location} requirements: KHDA, VAT, GDPR, etc."],
    "market_opportunities": ["Untapped channels in {location} {industry}"],
    "pricing_insights": "How their positioning compares"
  }},
  
  "strengths": ["3-5 specific competitive advantages with data"],
  "critical_weaknesses": ["3-5 issues blocking growth RIGHT NOW"],
  
  "recommendations": [
    {{
      "category": "SEO|Performance|Marketing|Content|Compliance|Strategy",
      "title": "Specific action title",
      "action": "Detailed implementation steps (1, 2, 3...)",
      "why": "Business impact for {location} {industry} specifically",
      "roi": "Expected revenue/traffic/conversion impact with numbers",
      "tools": ["Specific tools/platforms to use"],
      "cost": "Estimated cost (AED/USD) or 'free'",
      "timeline": "Days/weeks to implement",
      "priority": "critical|high|medium|low",
      "effort": "1-10 scale"
    }}
  ],
  
  "competitor_gaps": [
    {{
      "competitor": "domain",
      "what_they_do_better": "Specific tactic",
      "how_to_counter": "Your response strategy"
    }}
  ],
  
  "quick_wins": [
    {{
      "action": "Can be done TODAY",
      "impact": "Immediate result",
      "how": "Step by step"
    }}
  ],
  
  "growth_strategy": {{
    "30_days": ["Priority actions for month 1"],
    "90_days": ["Strategic initiatives for Q1"],
    "annual": "Long-term vision"
  }}
}}

CRITICAL RULES:
- Use REAL data from the analysis (actual keywords, scores, competitors)
- Be SPECIFIC to {location} and {industry} - mention local platforms, regulations, customer behavior
- Give ACTIONABLE steps, not generic advice
- Include actual tool names (Semrush, Hotjar, Cloudflare, etc.)
- Mention {location} specifics: WhatsApp, Tabby, Aramex, etc.
- Use competitor data to show gaps
- Be aggressive and growth-focused"""

    model = GenerativeModel("gemini-2.0-flash-exp")
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.7, "max_output_tokens": 8000}
    )
    
    try:
        text = response.text.strip()
        if '```json' in text:
            text = text.split('```json')[1].split('```')[0]
        elif '```' in text:
            text = text.split('```')[1].split('```')[0]
        return json.loads(text.strip())
    except Exception as e:
        return {"error": str(e), "raw": response.text[:500]}
