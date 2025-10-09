"""
Google Cloud Platform Services Integration
"""
from google.cloud import vision
from google.cloud import language_v1
from google.cloud import bigquery
import os
from datetime import datetime
import json

# Initialize clients
vision_client = vision.ImageAnnotatorClient()
language_client = language_v1.LanguageServiceClient()
bigquery_client = bigquery.Client()

# BigQuery dataset and table
DATASET_ID = "ai_grinners_analytics"
TABLE_ID = "analysis_history"

def detect_logos_in_image(image_url: str):
    """Detect logos in an image using Cloud Vision API"""
    try:
        image = vision.Image()
        image.source.image_uri = image_url
        
        response = vision_client.logo_detection(image=image)
        logos = response.logo_annotations
        
        detected_logos = []
        for logo in logos:
            detected_logos.append({
                "description": logo.description,
                "score": logo.score,
                "confidence": round(logo.score * 100, 2)
            })
        
        return {
            "success": True,
            "logos": detected_logos,
            "count": len(detected_logos)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def detect_brands_in_image(image_url: str):
    """Detect brands and objects using Cloud Vision API"""
    try:
        image = vision.Image()
        image.source.image_uri = image_url
        
        # Multiple detection types
        response = vision_client.annotate_image({
            'image': image,
            'features': [
                {'type_': vision.Feature.Type.LOGO_DETECTION},
                {'type_': vision.Feature.Type.WEB_DETECTION},
                {'type_': vision.Feature.Type.LABEL_DETECTION},
            ],
        })
        
        result = {
            "logos": [],
            "web_entities": [],
            "labels": []
        }
        
        # Logos
        for logo in response.logo_annotations:
            result["logos"].append({
                "name": logo.description,
                "confidence": round(logo.score * 100, 2)
            })
        
        # Web entities (brands)
        if response.web_detection:
            for entity in response.web_detection.web_entities:
                if entity.score > 0.5:
                    result["web_entities"].append({
                        "name": entity.description,
                        "score": round(entity.score * 100, 2)
                    })
        
        # Labels
        for label in response.label_annotations[:10]:
            result["labels"].append({
                "name": label.description,
                "confidence": round(label.score * 100, 2)
            })
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def analyze_sentiment(text: str):
    """Analyze sentiment of text using Cloud Natural Language API"""
    try:
        document = language_v1.Document(
            content=text,
            type_=language_v1.Document.Type.PLAIN_TEXT
        )
        
        # Sentiment analysis
        sentiment_response = language_client.analyze_sentiment(
            request={'document': document}
        )
        sentiment = sentiment_response.document_sentiment
        
        # Entity analysis
        entities_response = language_client.analyze_entities(
            request={'document': document}
        )
        
        entities = []
        for entity in entities_response.entities[:10]:
            entities.append({
                "name": entity.name,
                "type": language_v1.Entity.Type(entity.type_).name,
                "salience": round(entity.salience, 3),
                "sentiment": {
                    "score": round(entity.sentiment.score, 3),
                    "magnitude": round(entity.sentiment.magnitude, 3)
                }
            })
        
        return {
            "success": True,
            "sentiment": {
                "score": round(sentiment.score, 3),
                "magnitude": round(sentiment.magnitude, 3),
                "label": get_sentiment_label(sentiment.score)
            },
            "entities": entities
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def get_sentiment_label(score: float) -> str:
    """Convert sentiment score to label"""
    if score > 0.25:
        return "Positive"
    elif score < -0.25:
        return "Negative"
    else:
        return "Neutral"

def save_to_bigquery(analysis_data: dict):
    """Save analysis results to BigQuery"""
    try:
        table_ref = bigquery_client.dataset(DATASET_ID).table(TABLE_ID)
        
        rows_to_insert = [{
            "timestamp": datetime.utcnow().isoformat(),
            "domain": analysis_data.get("domain"),
            "analysis_type": analysis_data.get("type"),
            "results": json.dumps(analysis_data.get("results")),
            "user_id": analysis_data.get("user_id")
        }]
        
        errors = bigquery_client.insert_rows_json(table_ref, rows_to_insert)
        
        if errors:
            return {"success": False, "errors": errors}
        
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

def query_analytics(days: int = 30):
    """Query analytics from BigQuery"""
    try:
        query = f"""
        SELECT 
            DATE(timestamp) as date,
            analysis_type,
            COUNT(*) as count
        FROM `{DATASET_ID}.{TABLE_ID}`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {days} DAY)
        GROUP BY date, analysis_type
        ORDER BY date DESC
        """
        
        query_job = bigquery_client.query(query)
        results = query_job.result()
        
        data = []
        for row in results:
            data.append({
                "date": row.date.isoformat(),
                "type": row.analysis_type,
                "count": row.count
            })
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

