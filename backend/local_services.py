"""
Local Services - Replacements for Google Cloud Services
No GCP dependencies required!

Replaces:
- Cloud Vision API -> Simple rule-based detection
- Cloud Language API -> TextBlob sentiment analysis
- BigQuery -> PostgreSQL with SQLAlchemy
"""

import os
import re
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import Counter

# TextBlob for sentiment analysis (free, local)
try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("⚠️  TextBlob not installed. Install with: pip install textblob")

# PysSentimiento for advanced multilingual sentiment (optional)
try:
    from pysentimiento import create_analyzer
    PYSENTIMIENTO_AVAILABLE = True
    # Create analyzers lazily to avoid startup delays
    _sentiment_analyzer = None
    _emotion_analyzer = None
except ImportError:
    PYSENTIMIENTO_AVAILABLE = False
    _sentiment_analyzer = None
    _emotion_analyzer = None


def get_sentiment_analyzer():
    """Lazy load sentiment analyzer"""
    global _sentiment_analyzer
    if PYSENTIMIENTO_AVAILABLE and _sentiment_analyzer is None:
        try:
            _sentiment_analyzer = create_analyzer(task="sentiment", lang="en")
        except Exception:
            pass
    return _sentiment_analyzer


def get_emotion_analyzer():
    """Lazy load emotion analyzer"""
    global _emotion_analyzer
    if PYSENTIMIENTO_AVAILABLE and _emotion_analyzer is None:
        try:
            _emotion_analyzer = create_analyzer(task="emotion", lang="en")
        except Exception:
            pass
    return _emotion_analyzer

# Database imports for local analytics storage
try:
    from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float
    from sqlalchemy.ext.declarative import declarative_base
    from sqlalchemy.orm import sessionmaker
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./analytics.db")
Base = declarative_base() if SQLALCHEMY_AVAILABLE else None


# ============= Analytics Storage (Replaces BigQuery) =============

if SQLALCHEMY_AVAILABLE:
    class AnalysisHistory(Base):
        """Local analytics storage table"""
        __tablename__ = "analysis_history"

        id = Column(Integer, primary_key=True, index=True)
        timestamp = Column(DateTime, default=datetime.utcnow)
        domain = Column(String(255))
        analysis_type = Column(String(100))
        results = Column(Text)
        user_id = Column(Integer, nullable=True)


def get_db_session():
    """Get database session"""
    if not SQLALCHEMY_AVAILABLE:
        return None

    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    return Session()


def save_analytics(analysis_data: dict) -> Dict:
    """Save analysis results to local database (replaces BigQuery)"""
    try:
        session = get_db_session()
        if not session:
            return {"success": False, "error": "Database not available"}

        record = AnalysisHistory(
            domain=analysis_data.get("domain"),
            analysis_type=analysis_data.get("type"),
            results=json.dumps(analysis_data.get("results", {})),
            user_id=analysis_data.get("user_id")
        )

        session.add(record)
        session.commit()
        session.close()

        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


def query_analytics(days: int = 30) -> Dict:
    """Query analytics from local database (replaces BigQuery)"""
    try:
        session = get_db_session()
        if not session:
            return {"success": False, "error": "Database not available"}

        cutoff_date = datetime.utcnow() - timedelta(days=days)

        results = session.query(AnalysisHistory).filter(
            AnalysisHistory.timestamp >= cutoff_date
        ).order_by(AnalysisHistory.timestamp.desc()).all()

        # Aggregate by date and type
        data = {}
        for record in results:
            date_key = record.timestamp.strftime("%Y-%m-%d")
            if date_key not in data:
                data[date_key] = {}
            analysis_type = record.analysis_type or "unknown"
            data[date_key][analysis_type] = data[date_key].get(analysis_type, 0) + 1

        # Format for response
        formatted = []
        for date, types in data.items():
            for analysis_type, count in types.items():
                formatted.append({
                    "date": date,
                    "type": analysis_type,
                    "count": count
                })

        session.close()
        return {"success": True, "data": formatted}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ============= Sentiment Analysis (Replaces Cloud Language API) =============

def analyze_sentiment(text: str) -> Dict:
    """
    Analyze sentiment using pysentimiento (if available) or TextBlob.
    pysentimiento provides advanced multilingual sentiment and emotion analysis.
    """
    if not text or not text.strip():
        return {
            "success": False,
            "error": "No text provided"
        }

    try:
        # Try pysentimiento first (more accurate)
        sentiment_analyzer = get_sentiment_analyzer()
        if sentiment_analyzer:
            return analyze_sentiment_pysentimiento(text, sentiment_analyzer)

        # Fallback to TextBlob
        if TEXTBLOB_AVAILABLE:
            return analyze_sentiment_textblob(text)

        # Final fallback: Simple rule-based sentiment
        return analyze_sentiment_simple(text)

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def analyze_sentiment_pysentimiento(text: str, analyzer) -> Dict:
    """Analyze sentiment using pysentimiento (transformer-based)"""
    try:
        # Get sentiment prediction
        result = analyzer.predict(text)

        # Map pysentimiento output to our format
        # pysentimiento returns: NEG, NEU, POS with probabilities
        label_map = {"NEG": "Negative", "NEU": "Neutral", "POS": "Positive"}
        label = label_map.get(result.output, "Neutral")

        # Get confidence scores
        probas = result.probas
        pos_score = probas.get("POS", 0)
        neg_score = probas.get("NEG", 0)
        polarity = pos_score - neg_score  # Convert to -1 to 1 scale

        # Try to get emotions too
        emotions = []
        emotion_analyzer = get_emotion_analyzer()
        if emotion_analyzer:
            try:
                emotion_result = emotion_analyzer.predict(text)
                for emotion, score in emotion_result.probas.items():
                    if score > 0.1:  # Only include significant emotions
                        emotions.append({
                            "emotion": emotion.capitalize(),
                            "score": round(score, 3)
                        })
                emotions.sort(key=lambda x: x["score"], reverse=True)
            except Exception:
                pass

        # Extract entities using TextBlob
        entities = []
        if TEXTBLOB_AVAILABLE:
            blob = TextBlob(text)
            for i, phrase in enumerate(blob.noun_phrases[:10]):
                entity_type = classify_entity(phrase)
                entities.append({
                    "name": phrase,
                    "type": entity_type,
                    "salience": round(1.0 / (i + 1), 3),
                    "sentiment": {
                        "score": round(polarity, 3),
                        "magnitude": round(abs(polarity), 3)
                    }
                })

        return {
            "success": True,
            "sentiment": {
                "score": round(polarity, 3),
                "magnitude": round(max(pos_score, neg_score), 3),
                "label": label,
                "confidence": round(max(probas.values()) * 100, 1)
            },
            "emotions": emotions[:5] if emotions else None,
            "entities": entities,
            "method": "pysentimiento"
        }
    except Exception as e:
        # Fall back to TextBlob on error
        if TEXTBLOB_AVAILABLE:
            return analyze_sentiment_textblob(text)
        return {"success": False, "error": str(e)}


def analyze_sentiment_textblob(text: str) -> Dict:
    """Analyze sentiment using TextBlob"""
    blob = TextBlob(text)

    # Sentiment analysis
    polarity = blob.sentiment.polarity  # -1 to 1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    # Extract entities (noun phrases)
    entities = []
    for i, phrase in enumerate(blob.noun_phrases[:10]):
        entity_type = classify_entity(phrase)
        entities.append({
            "name": phrase,
            "type": entity_type,
            "salience": round(1.0 / (i + 1), 3),
            "sentiment": {
                "score": round(polarity, 3),
                "magnitude": round(abs(polarity) * subjectivity, 3)
            }
        })

    return {
        "success": True,
        "sentiment": {
            "score": round(polarity, 3),
            "magnitude": round(subjectivity, 3),
            "label": get_sentiment_label(polarity)
        },
        "entities": entities,
        "method": "textblob"
    }


def analyze_sentiment_simple(text: str) -> Dict:
    """Simple rule-based sentiment analysis (fallback)"""
    text_lower = text.lower()

    # Positive and negative word lists
    positive_words = [
        "good", "great", "excellent", "amazing", "wonderful", "fantastic",
        "love", "best", "happy", "awesome", "perfect", "beautiful", "nice",
        "helpful", "recommend", "satisfied", "positive", "success", "easy"
    ]

    negative_words = [
        "bad", "terrible", "horrible", "awful", "worst", "hate", "poor",
        "disappointing", "frustrated", "angry", "difficult", "problem",
        "fail", "broken", "useless", "negative", "annoying", "confusing"
    ]

    # Count positive and negative words
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)

    # Calculate simple score
    total = pos_count + neg_count
    if total == 0:
        score = 0
    else:
        score = (pos_count - neg_count) / total

    # Extract simple entities (capitalized words)
    words = text.split()
    entities = []
    seen = set()
    for word in words:
        clean_word = re.sub(r'[^\w]', '', word)
        if clean_word and clean_word[0].isupper() and clean_word.lower() not in seen:
            seen.add(clean_word.lower())
            entities.append({
                "name": clean_word,
                "type": "UNKNOWN",
                "salience": 0.5,
                "sentiment": {"score": score, "magnitude": abs(score)}
            })
            if len(entities) >= 10:
                break

    return {
        "success": True,
        "sentiment": {
            "score": round(score, 3),
            "magnitude": round(abs(score), 3),
            "label": get_sentiment_label(score)
        },
        "entities": entities
    }


def classify_entity(phrase: str) -> str:
    """Simple entity classification"""
    phrase_lower = phrase.lower()

    # Organization indicators
    if any(word in phrase_lower for word in ["inc", "corp", "company", "ltd", "llc", "group"]):
        return "ORGANIZATION"

    # Location indicators
    if any(word in phrase_lower for word in ["city", "country", "state", "street", "avenue"]):
        return "LOCATION"

    # Person indicators (titles)
    if any(word in phrase_lower for word in ["mr", "mrs", "dr", "professor", "ceo"]):
        return "PERSON"

    # Product/service indicators
    if any(word in phrase_lower for word in ["product", "service", "software", "app"]):
        return "CONSUMER_GOOD"

    return "OTHER"


def get_sentiment_label(score: float) -> str:
    """Convert sentiment score to label"""
    if score > 0.25:
        return "Positive"
    elif score < -0.25:
        return "Negative"
    else:
        return "Neutral"


# ============= Image Analysis (Replaces Cloud Vision API) =============

# Common brand/logo names for detection
KNOWN_BRANDS = [
    "google", "facebook", "meta", "apple", "microsoft", "amazon", "twitter",
    "instagram", "linkedin", "youtube", "netflix", "spotify", "uber", "airbnb",
    "nike", "adidas", "coca-cola", "pepsi", "mcdonald", "starbucks", "walmart",
    "target", "visa", "mastercard", "paypal", "samsung", "sony", "honda", "toyota",
    "bmw", "mercedes", "audi", "tesla", "ford", "chevrolet", "adobe", "salesforce",
    "slack", "zoom", "shopify", "stripe", "square", "notion", "figma", "canva"
]

COMMON_LABELS = [
    "logo", "brand", "advertisement", "banner", "text", "graphic", "icon",
    "symbol", "image", "photo", "illustration", "design", "marketing"
]


def detect_logos_in_image(image_url: str) -> Dict:
    """
    Detect logos in an image (simplified version)
    Note: Without Cloud Vision, we can only do basic URL analysis
    For full functionality, consider integrating a free OCR service
    """
    try:
        if not image_url:
            return {
                "success": False,
                "error": "No image URL provided"
            }

        # Extract potential brand names from URL
        url_lower = image_url.lower()
        detected_logos = []

        for brand in KNOWN_BRANDS:
            if brand in url_lower:
                detected_logos.append({
                    "description": brand.title(),
                    "score": 0.85,
                    "confidence": 85.0,
                    "source": "url_analysis"
                })

        # Add generic detection note
        if not detected_logos:
            detected_logos.append({
                "description": "Unknown/Generic Image",
                "score": 0.5,
                "confidence": 50.0,
                "source": "default",
                "note": "Full image analysis requires Cloud Vision or similar service"
            })

        return {
            "success": True,
            "logos": detected_logos,
            "count": len(detected_logos),
            "method": "url_analysis"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def detect_brands_in_image(image_url: str) -> Dict:
    """
    Detect brands and objects in an image (simplified version)
    Returns basic analysis based on URL patterns
    """
    try:
        if not image_url:
            return {
                "success": False,
                "error": "No image URL provided"
            }

        url_lower = image_url.lower()

        result = {
            "logos": [],
            "web_entities": [],
            "labels": []
        }

        # Detect known brands from URL
        for brand in KNOWN_BRANDS:
            if brand in url_lower:
                result["logos"].append({
                    "name": brand.title(),
                    "confidence": 85.0
                })
                result["web_entities"].append({
                    "name": f"{brand.title()} Brand",
                    "score": 80.0
                })

        # Add generic labels based on URL patterns
        if any(ext in url_lower for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]):
            result["labels"].append({"name": "Image", "confidence": 95.0})

        if "logo" in url_lower:
            result["labels"].append({"name": "Logo", "confidence": 90.0})

        if "banner" in url_lower or "ad" in url_lower:
            result["labels"].append({"name": "Advertisement", "confidence": 85.0})

        if "product" in url_lower:
            result["labels"].append({"name": "Product", "confidence": 80.0})

        # Default labels
        if not result["labels"]:
            result["labels"] = [
                {"name": "Graphic", "confidence": 70.0},
                {"name": "Design", "confidence": 65.0}
            ]

        return {
            "success": True,
            "data": result,
            "method": "url_analysis",
            "note": "For advanced image analysis, consider integrating a dedicated vision API"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def analyze_image_content(image_url: str) -> Dict:
    """
    Comprehensive image analysis (simplified)
    Combines logo and brand detection
    """
    logos = detect_logos_in_image(image_url)
    brands = detect_brands_in_image(image_url)

    return {
        "success": True,
        "logos": logos.get("logos", []),
        "brands": brands.get("data", {}),
        "summary": {
            "logo_count": logos.get("count", 0),
            "brand_count": len(brands.get("data", {}).get("logos", [])),
            "labels": brands.get("data", {}).get("labels", [])
        },
        "method": "local_analysis",
        "limitations": "Full OCR and visual analysis requires external service integration"
    }


# ============= Text Analysis Utilities =============

def extract_keywords_local(text: str, top_n: int = 20) -> List[Dict]:
    """Extract keywords from text locally"""
    if not text:
        return []

    # Clean text
    text_clean = re.sub(r'[^\w\s]', ' ', text.lower())
    words = text_clean.split()

    # Remove common stop words
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
        "be", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "must", "shall", "can", "this",
        "that", "these", "those", "i", "you", "he", "she", "it", "we", "they"
    }

    filtered_words = [w for w in words if w not in stop_words and len(w) > 2]

    # Count frequency
    word_counts = Counter(filtered_words)

    # Format results
    keywords = []
    for word, count in word_counts.most_common(top_n):
        keywords.append({
            "term": word,
            "count": count,
            "score": round(count / len(filtered_words), 4) if filtered_words else 0
        })

    return keywords


def analyze_text_complexity(text: str) -> Dict:
    """Analyze text complexity and readability"""
    if not text:
        return {"success": False, "error": "No text provided"}

    words = text.split()
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    word_count = len(words)
    sentence_count = len(sentences)

    # Average word length
    avg_word_length = sum(len(w) for w in words) / word_count if word_count else 0

    # Average sentence length
    avg_sentence_length = word_count / sentence_count if sentence_count else 0

    # Simple readability score (0-100)
    readability = 100 - (avg_word_length * 5) - (avg_sentence_length * 0.5)
    readability = max(0, min(100, readability))

    return {
        "success": True,
        "metrics": {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_word_length": round(avg_word_length, 2),
            "avg_sentence_length": round(avg_sentence_length, 2),
            "readability_score": round(readability, 1)
        },
        "readability_level": get_readability_level(readability)
    }


def get_readability_level(score: float) -> str:
    """Convert readability score to level"""
    if score >= 80:
        return "Very Easy"
    elif score >= 60:
        return "Easy"
    elif score >= 40:
        return "Moderate"
    elif score >= 20:
        return "Difficult"
    else:
        return "Very Difficult"
