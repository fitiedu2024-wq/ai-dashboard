"""
Gemini-Powered Deep Analysis Engine
The brain of the system
"""

import os
import google.generativeai as genai
from typing import Dict, List
import json

genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

class GeminiAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    def deep_competitor_analysis(self, your_site_data: Dict, competitor_data: List[Dict]) -> Dict:
        """Deep competitive intelligence using Gemini"""
        
        prompt = f"""You are a marketing intelligence expert. Analyze this competitive landscape:

YOUR SITE:
- Domain: {your_site_data.get('domain')}
- Keywords: {your_site_data.get('keywords', [])[:30]}
- Content Focus: {your_site_data.get('h1_tags', [])}
- SEO Score: {your_site_data.get('seo_score')}

COMPETITORS:
{json.dumps(competitor_data, indent=2)}

Provide a comprehensive analysis in JSON format:
{{
  "competitive_position": "strong/medium/weak",
  "key_differentiators": ["list of what makes you unique"],
  "keyword_gaps": ["high-value keywords competitors use but you don't"],
  "content_opportunities": ["specific content topics to create"],
  "strategic_recommendations": ["actionable marketing strategies"],
  "threat_level": {{"competitor_name": "high/medium/low"}},
  "quick_wins": ["immediate actions to take"]
}}"""

        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def analyze_ad_strategy(self, ads_data: Dict) -> Dict:
        """Analyze competitor advertising strategy"""
        
        prompt = f"""Analyze this advertising data and provide strategic insights:

{json.dumps(ads_data, indent=2)}

Return JSON:
{{
  "ad_spend_estimate": "low/medium/high",
  "messaging_themes": ["key themes in their ads"],
  "target_audience": "who they're targeting",
  "creative_strategy": "their creative approach",
  "recommended_counter_strategy": ["how to compete"],
  "platform_focus": ["which platforms they prioritize"]
}}"""

        try:
            response = self.model.generate_content(prompt)
            return json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        except:
            return {}
    
    def generate_content_strategy(self, analysis_data: Dict) -> Dict:
        """Generate complete content marketing strategy"""
        
        prompt = f"""Based on this analysis, create a 30-day content marketing plan:

{json.dumps(analysis_data, indent=2)}

Return JSON with:
{{
  "content_pillars": ["main content themes"],
  "blog_topics": ["30 specific blog post ideas"],
  "social_content": ["20 social media post ideas"],
  "seo_priorities": ["keywords to target by priority"],
  "content_calendar": ["week-by-week plan"]
}}"""

        try:
            response = self.model.generate_content(prompt)
            return json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        except:
            return {}


def analyze_with_gemini(site_data: Dict, competitor_data: List[Dict]) -> Dict:
    analyzer = GeminiAnalyzer()
    return analyzer.deep_competitor_analysis(site_data, competitor_data)
