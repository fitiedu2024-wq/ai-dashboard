"""
Local AI Analysis Engine
Rule-based analysis to replace Google Gemini
No external API dependencies!
"""

from typing import Dict, List
import json
from collections import Counter
import re


class LocalAnalyzer:
    """Rule-based marketing intelligence analyzer"""

    def __init__(self):
        # Common marketing-related keywords by category
        self.keyword_categories = {
            "commercial": ["buy", "price", "cost", "cheap", "discount", "sale", "offer", "deal", "shop", "purchase"],
            "informational": ["how", "what", "why", "guide", "tutorial", "learn", "tips", "best", "review", "comparison"],
            "transactional": ["order", "subscribe", "download", "register", "signup", "free", "trial", "demo", "quote"],
            "navigational": ["login", "contact", "about", "home", "support", "help", "faq", "blog", "news"]
        }

        # SEO scoring factors
        self.seo_factors = {
            "title_length": {"min": 30, "max": 60, "weight": 10},
            "meta_description": {"min": 120, "max": 160, "weight": 10},
            "h1_present": {"weight": 15},
            "word_count": {"min": 300, "weight": 10},
            "alt_coverage": {"min": 80, "weight": 10},
            "schema_present": {"weight": 15}
        }

    def deep_competitor_analysis(self, your_site_data: Dict, competitor_data: List[Dict]) -> Dict:
        """Analyze competitive landscape using rule-based logic"""

        your_score = your_site_data.get('seo_score', 0)
        your_keywords = set(your_site_data.get('keywords', []))
        your_pages = your_site_data.get('pages_analyzed', 0)

        # Analyze competitors
        competitor_scores = []
        all_competitor_keywords = set()
        threat_levels = {}

        for comp in competitor_data:
            comp_score = comp.get('avg_seo_score', comp.get('seo_score', 0))
            comp_domain = comp.get('domain', 'Unknown')
            comp_keywords = set(comp.get('keywords', []))

            competitor_scores.append(comp_score)
            all_competitor_keywords.update(comp_keywords)

            # Calculate threat level
            if comp_score > your_score + 15:
                threat_levels[comp_domain] = "high"
            elif comp_score > your_score:
                threat_levels[comp_domain] = "medium"
            else:
                threat_levels[comp_domain] = "low"

        # Determine competitive position
        avg_competitor_score = sum(competitor_scores) / len(competitor_scores) if competitor_scores else 0
        if your_score > avg_competitor_score + 10:
            position = "strong"
        elif your_score < avg_competitor_score - 10:
            position = "weak"
        else:
            position = "medium"

        # Find keyword gaps
        keyword_gaps = list(all_competitor_keywords - your_keywords)[:15]

        # Generate differentiators based on your site's strengths
        differentiators = self._generate_differentiators(your_site_data, competitor_data)

        # Content opportunities
        content_opportunities = self._generate_content_opportunities(
            your_site_data, keyword_gaps
        )

        # Strategic recommendations
        recommendations = self._generate_strategic_recommendations(
            your_site_data, competitor_data, position
        )

        # Quick wins
        quick_wins = self._generate_quick_wins(your_site_data, keyword_gaps)

        return {
            "competitive_position": position,
            "key_differentiators": differentiators,
            "keyword_gaps": keyword_gaps,
            "content_opportunities": content_opportunities,
            "strategic_recommendations": recommendations,
            "threat_level": threat_levels,
            "quick_wins": quick_wins
        }

    def _generate_differentiators(self, your_data: Dict, competitors: List[Dict]) -> List[str]:
        """Generate key differentiators"""
        differentiators = []
        your_score = your_data.get('seo_score', 0)

        if your_score > 80:
            differentiators.append("Strong overall SEO foundation")

        if your_data.get('schema_coverage', 0) > 50:
            differentiators.append("Rich structured data implementation")

        if your_data.get('avg_word_count', 0) > 1000:
            differentiators.append("In-depth, comprehensive content")

        if your_data.get('avg_alt_coverage', 0) > 80:
            differentiators.append("Strong accessibility and image SEO")

        if len(your_data.get('keywords', [])) > 20:
            differentiators.append("Diverse keyword coverage")

        # Add default if none found
        if not differentiators:
            differentiators = [
                "Opportunity to build unique brand positioning",
                "Room for differentiation through quality content",
                "Potential for niche market targeting"
            ]

        return differentiators[:5]

    def _generate_content_opportunities(self, your_data: Dict, keyword_gaps: List[str]) -> List[str]:
        """Generate content opportunities"""
        opportunities = []

        # Based on keyword gaps
        for keyword in keyword_gaps[:5]:
            opportunities.append(f"Create comprehensive guide targeting '{keyword}'")

        # Based on content analysis
        if your_data.get('avg_word_count', 0) < 800:
            opportunities.append("Develop long-form pillar content (2000+ words)")

        if your_data.get('pages_analyzed', 0) < 20:
            opportunities.append("Expand content library with targeted blog posts")

        # General opportunities
        opportunities.extend([
            "Create comparison content vs competitors",
            "Develop video content for key topics",
            "Build interactive tools or calculators"
        ])

        return opportunities[:8]

    def _generate_strategic_recommendations(self, your_data: Dict, competitors: List[Dict], position: str) -> List[str]:
        """Generate strategic recommendations"""
        recommendations = []

        if position == "weak":
            recommendations.extend([
                "Focus on technical SEO improvements first",
                "Target long-tail keywords with less competition",
                "Build backlinks through guest posting and partnerships"
            ])
        elif position == "medium":
            recommendations.extend([
                "Double down on content marketing",
                "Improve page speed and Core Web Vitals",
                "Develop topical authority in your niche"
            ])
        else:  # strong
            recommendations.extend([
                "Maintain competitive advantage with fresh content",
                "Explore new keyword opportunities",
                "Build brand authority through thought leadership"
            ])

        # Common recommendations
        if your_data.get('avg_alt_coverage', 0) < 80:
            recommendations.append("Improve image alt text coverage")

        if your_data.get('schema_coverage', 0) < 50:
            recommendations.append("Implement structured data markup")

        return recommendations[:7]

    def _generate_quick_wins(self, your_data: Dict, keyword_gaps: List[str]) -> List[str]:
        """Generate quick win actions"""
        quick_wins = []

        if your_data.get('avg_alt_coverage', 0) < 80:
            quick_wins.append("Add alt text to all images (1-2 hours)")

        if your_data.get('schema_coverage', 0) < 50:
            quick_wins.append("Add Organization schema to homepage")

        if keyword_gaps:
            quick_wins.append(f"Optimize existing page for '{keyword_gaps[0]}'")

        quick_wins.extend([
            "Update meta titles with target keywords",
            "Add internal links between related pages",
            "Compress and optimize images"
        ])

        return quick_wins[:5]

    def analyze_ad_strategy(self, ads_data: Dict) -> Dict:
        """Analyze advertising strategy from ad data"""
        ads = ads_data.get('ads', [])

        if not ads:
            return {
                "ad_spend_estimate": "unknown",
                "messaging_themes": ["No ads detected"],
                "target_audience": "Unknown",
                "creative_strategy": "No advertising presence detected",
                "recommended_counter_strategy": [
                    "Opportunity to gain first-mover advantage in paid advertising",
                    "Consider PPC campaigns for high-intent keywords",
                    "Test social media advertising"
                ],
                "platform_focus": []
            }

        # Analyze ad count for spend estimate
        ad_count = len(ads)
        if ad_count > 20:
            spend_estimate = "high"
        elif ad_count > 5:
            spend_estimate = "medium"
        else:
            spend_estimate = "low"

        # Extract themes from ad copy
        all_text = " ".join([ad.get('title', '') + ' ' + ad.get('description', '') for ad in ads])
        themes = self._extract_themes(all_text)

        # Detect platforms
        platforms = list(set([ad.get('platform', 'Unknown') for ad in ads if ad.get('platform')]))

        # Determine target audience based on ad content
        audience = self._infer_audience(all_text)

        # Creative strategy
        creative_strategy = self._analyze_creative(ads)

        # Counter strategy
        counter_strategy = [
            "Differentiate messaging from competitor themes",
            "Target keywords they might be missing",
            "Focus on unique value propositions",
            "Test different ad formats and platforms",
            "Optimize landing pages for higher conversion"
        ]

        return {
            "ad_spend_estimate": spend_estimate,
            "messaging_themes": themes,
            "target_audience": audience,
            "creative_strategy": creative_strategy,
            "recommended_counter_strategy": counter_strategy,
            "platform_focus": platforms if platforms else ["Not detected"]
        }

    def _extract_themes(self, text: str) -> List[str]:
        """Extract messaging themes from text"""
        text_lower = text.lower()
        themes = []

        theme_keywords = {
            "Price/Value Focus": ["save", "cheap", "affordable", "discount", "deal", "free"],
            "Quality Focus": ["best", "premium", "quality", "professional", "expert"],
            "Speed/Convenience": ["fast", "quick", "easy", "instant", "simple"],
            "Trust/Authority": ["trusted", "reliable", "guaranteed", "certified", "proven"],
            "Urgency": ["now", "today", "limited", "hurry", "last chance"],
            "Innovation": ["new", "innovative", "latest", "advanced", "modern"]
        }

        for theme, keywords in theme_keywords.items():
            if any(kw in text_lower for kw in keywords):
                themes.append(theme)

        return themes if themes else ["General marketing"]

    def _infer_audience(self, text: str) -> str:
        """Infer target audience from ad text"""
        text_lower = text.lower()

        if any(word in text_lower for word in ["business", "enterprise", "b2b", "company"]):
            return "Business professionals and enterprises"
        elif any(word in text_lower for word in ["beginner", "learn", "start", "first time"]):
            return "Beginners and newcomers"
        elif any(word in text_lower for word in ["professional", "expert", "advanced"]):
            return "Professionals and experts"
        elif any(word in text_lower for word in ["family", "parent", "kids", "home"]):
            return "Families and homeowners"
        else:
            return "General consumers"

    def _analyze_creative(self, ads: List[Dict]) -> str:
        """Analyze creative strategy from ads"""
        if not ads:
            return "No creative data available"

        has_images = sum(1 for ad in ads if ad.get('image_url'))
        has_video = sum(1 for ad in ads if ad.get('video_url'))

        if has_video > len(ads) * 0.5:
            return "Video-first approach with dynamic content"
        elif has_images > len(ads) * 0.7:
            return "Image-heavy creative strategy with visual focus"
        else:
            return "Text-focused advertising with direct messaging"

    def generate_content_strategy(self, analysis_data: Dict) -> Dict:
        """Generate content marketing strategy"""
        keywords = analysis_data.get('keywords', [])
        domain = analysis_data.get('domain', '')
        seo_score = analysis_data.get('seo_score', 50)

        # Content pillars based on keywords
        pillars = self._generate_content_pillars(keywords)

        # Blog topics
        blog_topics = self._generate_blog_topics(keywords, pillars)

        # Social content
        social_content = self._generate_social_ideas(pillars, domain)

        # SEO priorities
        seo_priorities = self._prioritize_seo(keywords, seo_score)

        # Content calendar
        calendar = self._create_content_calendar(blog_topics, pillars)

        return {
            "content_pillars": pillars,
            "blog_topics": blog_topics,
            "social_content": social_content,
            "seo_priorities": seo_priorities,
            "content_calendar": calendar
        }

    def _generate_content_pillars(self, keywords: List[str]) -> List[str]:
        """Generate content pillars from keywords"""
        if not keywords:
            return [
                "Product/Service Education",
                "Industry Trends & News",
                "How-to Guides & Tutorials",
                "Customer Success Stories",
                "Thought Leadership"
            ]

        # Group keywords by theme
        pillars = []
        keyword_text = " ".join(keywords[:30]).lower()

        if any(word in keyword_text for word in ["how", "guide", "tutorial"]):
            pillars.append("Educational Content & Guides")
        if any(word in keyword_text for word in ["best", "top", "review"]):
            pillars.append("Reviews & Comparisons")
        if any(word in keyword_text for word in ["tool", "software", "app"]):
            pillars.append("Tools & Resources")

        # Add defaults
        pillars.extend([
            "Industry Insights",
            "Practical Tips & Strategies",
            "Case Studies"
        ])

        return pillars[:5]

    def _generate_blog_topics(self, keywords: List[str], pillars: List[str]) -> List[str]:
        """Generate blog topic ideas"""
        topics = []

        # Topics from keywords
        for keyword in keywords[:10]:
            topics.append(f"Complete Guide to {keyword.title()}")
            topics.append(f"Top 10 {keyword.title()} Tips for 2024")
            topics.append(f"How to Master {keyword.title()}")

        # Generic high-performing topics
        topics.extend([
            "Beginner's Guide: Everything You Need to Know",
            "Common Mistakes to Avoid",
            "Expert Tips from Industry Leaders",
            "Step-by-Step Tutorial for Success",
            "Future Trends to Watch",
            "Case Study: Real Results & Insights",
            "FAQ: Answering Your Top Questions",
            "Tools & Resources You Need",
            "Best Practices for Maximum Results",
            "Comprehensive Comparison Guide"
        ])

        return topics[:30]

    def _generate_social_ideas(self, pillars: List[str], domain: str) -> List[str]:
        """Generate social media content ideas"""
        social_ideas = [
            "Quick tips carousel (Instagram/LinkedIn)",
            "Behind-the-scenes content",
            "User-generated content showcase",
            "Industry statistics infographic",
            "Poll: Ask your audience",
            "Quote graphics from industry experts",
            "Before/After transformation posts",
            "FAQ answer videos (short-form)",
            "Tutorial snippets (Reels/TikTok)",
            "Customer testimonial highlights",
            "Team spotlight posts",
            "Industry news commentary",
            "Myth-busting content",
            "Day-in-the-life content",
            "Tool recommendations thread",
            "Trending topic commentary",
            "Checklist downloads",
            "Live Q&A announcements",
            "Milestone celebrations",
            "Throwback content"
        ]

        return social_ideas[:20]

    def _prioritize_seo(self, keywords: List[str], seo_score: int) -> List[str]:
        """Prioritize SEO actions"""
        priorities = []

        if seo_score < 50:
            priorities.append("Technical SEO fixes (high priority)")

        # Keyword-based priorities
        for keyword in keywords[:5]:
            priorities.append(f"Optimize content for: {keyword}")

        priorities.extend([
            "Improve page load speed",
            "Build quality backlinks",
            "Create more long-form content",
            "Enhance internal linking structure"
        ])

        return priorities[:10]

    def _create_content_calendar(self, topics: List[str], pillars: List[str]) -> List[str]:
        """Create weekly content calendar"""
        calendar = [
            "Week 1: Foundation content - Pillar page + 2 blog posts",
            "Week 2: Educational focus - 3 how-to articles + social promotion",
            "Week 3: Engagement - Case study + user content + polls",
            "Week 4: Authority building - Expert roundup + industry analysis"
        ]

        return calendar


# Wrapper function for backward compatibility
def analyze_with_local_ai(site_data: Dict, competitor_data: List[Dict]) -> Dict:
    """Analyze using local AI (replaces Gemini)"""
    analyzer = LocalAnalyzer()
    return analyzer.deep_competitor_analysis(site_data, competitor_data)
