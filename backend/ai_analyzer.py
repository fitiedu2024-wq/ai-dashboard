import vertexai
from vertexai.generative_models import GenerativeModel
import json
import os

# Initialize Vertex AI
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "jack-sparo-2892026")
LOCATION = "us-central1"

vertexai.init(project=PROJECT_ID, location=LOCATION)

def generate_ai_report(analysis_data: dict) -> dict:
    """Generate AI-powered marketing analysis"""
    
    domain = analysis_data.get('domain', '')
    scores = analysis_data.get('scores', {})
    seo = analysis_data.get('seo', {})
    competitors = analysis_data.get('competitors', [])[:3]
    trackers = analysis_data.get('trackers', {})
    
    prompt = f"""You are a senior digital marketing consultant. Analyze this website data and provide actionable insights.

WEBSITE: {domain}
SCORES: SEO {scores.get('seo_score', 0)}/100, Performance {scores.get('performance_score', 0)}/100
SEO ISSUES: {seo.get('seo_issues', {})}
ACTIVE TRACKERS: {trackers.get('active_count', 0)}
COMPETITORS FOUND: {len(competitors)}

Respond with ONLY valid JSON:
{{
  "executive_summary": "2-3 sentence overview",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": [
    {{"action": "specific task", "priority": "critical|high|medium", "impact": "expected result", "effort": "easy|medium|hard"}}
  ],
  "quick_wins": ["quick action 1", "quick action 2"]
}}

Be specific, data-driven, and actionable."""

    model = GenerativeModel("gemini-2.0-flash-exp")
    response = model.generate_content(prompt)
    
    try:
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        return json.loads(text)
    except Exception as e:
        return {"error": f"AI error: {str(e)}", "raw": response.text}
