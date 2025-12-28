from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
import logging
import time
from functools import wraps
from collections import defaultdict
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import requests
import asyncio

from models import Base, engine, SessionLocal, User, ActivityLog, AnalysisReport
from credentials import DEFAULT_ADMIN, get_password_hash, verify_password
from scraper import crawl_site, find_social_accounts

# Local AI services (NO Google Cloud required!)
from ai_local import LocalAnalyzer, analyze_with_local_ai
from local_services import (
    analyze_sentiment as local_sentiment,
    detect_brands_in_image as local_detect_brands,
    analyze_image_content,
    save_analytics,
    query_analytics as local_query_analytics
)

# ==================== LOGGING SETUP ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger("ai-grinners")

# ==================== RATE LIMITING ====================
class RateLimiter:
    """Simple in-memory rate limiter"""
    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.limits = {
            "default": (60, 60),      # 60 requests per 60 seconds
            "analyze": (10, 60),       # 10 analysis requests per minute
            "login": (5, 60),          # 5 login attempts per minute
        }

    def is_allowed(self, key: str, limit_type: str = "default") -> bool:
        """Check if request is allowed"""
        now = time.time()
        max_requests, window = self.limits.get(limit_type, self.limits["default"])

        # Clean old requests
        self.requests[key] = [t for t in self.requests[key] if now - t < window]

        if len(self.requests[key]) >= max_requests:
            return False

        self.requests[key].append(now)
        return True

    def get_retry_after(self, key: str, limit_type: str = "default") -> int:
        """Get seconds until rate limit resets"""
        if not self.requests[key]:
            return 0
        max_requests, window = self.limits.get(limit_type, self.limits["default"])
        oldest = min(self.requests[key])
        return int(window - (time.time() - oldest))

rate_limiter = RateLimiter()

# ==================== CACHING ====================
class SimpleCache:
    """Simple in-memory cache with TTL"""
    def __init__(self):
        self.cache: Dict[str, tuple] = {}  # key: (value, expiry_time)

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key in self.cache:
            value, expiry = self.cache[key]
            if time.time() < expiry:
                logger.debug(f"Cache HIT: {key}")
                return value
            else:
                del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300):
        """Cache value with TTL in seconds"""
        self.cache[key] = (value, time.time() + ttl)
        logger.debug(f"Cache SET: {key} (TTL: {ttl}s)")

    def clear(self):
        """Clear all cache"""
        self.cache.clear()

    def cleanup(self):
        """Remove expired entries"""
        now = time.time()
        expired = [k for k, (v, exp) in self.cache.items() if exp < now]
        for k in expired:
            del self.cache[k]

analysis_cache = SimpleCache()

# ==================== APP SETUP ====================
app = FastAPI(
    title="AI Grinners API",
    description="Marketing Intelligence & Competitive Analysis Platform (100% Local - No Google Cloud Required!)",
    version="4.0.0"
)

# CORS - Configure allowed origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://ai-dashboard-frontend.onrender.com,https://ai-grinners.online").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Security - SECRET_KEY Management
SECRET_KEY = os.getenv("SECRET_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if not SECRET_KEY:
    if ENVIRONMENT == "production":
        # In production, SECRET_KEY is REQUIRED
        logger.error("🚨 CRITICAL: SECRET_KEY not set in production! Server cannot start safely.")
        raise RuntimeError("SECRET_KEY environment variable is required in production!")
    else:
        # In development, generate a stable key based on machine identifier
        import hashlib
        import platform
        # Create a stable key from machine characteristics (won't change on restart)
        machine_id = f"{platform.node()}-{os.getcwd()}-ai-grinners-dev"
        SECRET_KEY = hashlib.sha256(machine_id.encode()).hexdigest()
        logger.warning(f"⚠️  Development mode: Using auto-generated SECRET_KEY (set SECRET_KEY env var for production)")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"

def get_geo_location(ip: str) -> str:
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
        data = response.json()
        if data.get("status") == "success":
            return f"{data.get('city', 'Unknown')}, {data.get('country', 'Unknown')}"
    except:
        pass
    return "Unknown"

def log_activity(db: Session, user_id: int, user_email: str, action: str, details: str = None, ip: str = None):
    geo = get_geo_location(ip) if ip else None
    log = ActivityLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        details=details,
        ip_address=ip,
        geo_location=geo
    )
    db.add(log)
    db.commit()

@app.on_event("startup")
async def startup():
    print("🚀 Starting AI Grinners API v4.0.0 (100% Local - No Google Cloud!)")
    print("=" * 60)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    existing_admin = db.query(User).filter(User.email == DEFAULT_ADMIN["email"]).first()
    if not existing_admin:
        admin = User(
            email=DEFAULT_ADMIN["email"],
            hashed_password=get_password_hash(DEFAULT_ADMIN["password"]),
            role="admin",
            quota=1000
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin created: {DEFAULT_ADMIN['email']}")
    else:
        print(f"✅ Admin exists: {DEFAULT_ADMIN['email']}")
    db.close()
    print("✅ Database initialized")
    print("✅ Local AI services loaded (no external APIs required)")
    print("=" * 60)

@app.get("/")
def root():
    return {
        "message": "AI Grinners API",
        "status": "running",
        "version": "4.0.0",
        "mode": "100% Local - No Google Cloud Required"
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "cache_size": len(analysis_cache.cache),
        "version": "4.0.0",
        "mode": "local"
    }

@app.get("/api/stats")
def api_stats():
    """API statistics"""
    return {
        "cache_entries": len(analysis_cache.cache),
        "uptime": "running",
        "version": "4.0.0",
        "google_cloud": False,
        "mode": "100% Local"
    }

@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None, db: Session = Depends(get_db)):
    ip = get_client_ip(request)

    # Rate limiting for login attempts
    if not rate_limiter.is_allowed(f"login:{ip}", "login"):
        retry_after = rate_limiter.get_retry_after(f"login:{ip}", "login")
        logger.warning(f"Rate limit exceeded for login from IP: {ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Try again in {retry_after} seconds",
            headers={"Retry-After": str(retry_after)}
        )

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.info(f"Failed login attempt for: {form_data.username} from IP: {ip}")
        raise HTTPException(401, "Invalid credentials")

    if not user.is_active:
        logger.warning(f"Inactive user attempted login: {user.email}")
        raise HTTPException(403, "Account is deactivated")

    user.last_login = datetime.utcnow()
    user.last_ip = ip
    user.last_geo = get_geo_location(ip)
    db.commit()

    log_activity(db, user.id, user.email, "Login", "User logged in", ip)
    logger.info(f"Successful login: {user.email} from {ip}")

    token = jwt.encode(
        {"sub": user.email, "exp": datetime.utcnow() + timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256"
    )
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/user")
def get_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(401)
        return {
            "email": user.email,
            "id": user.id,
            "quota": user.quota,
            "is_admin": user.role == "admin"
        }
    except JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/me")
async def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(401, "User not found")
        return {
            "email": user.email,
            "id": user.id,
            "quota": user.quota,
            "is_admin": user.role == "admin"
        }
    except JWTError:
        raise HTTPException(401, "Invalid token")

class AnalyzeRequest(BaseModel):
    domain: str
    competitors: List[str] = []
    max_pages: int = 50  # Default to 50 pages

@app.post("/api/analyze")
async def deep_analysis(request: AnalyzeRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    ip = get_client_ip(req)

    # Rate limiting for analysis requests
    if not rate_limiter.is_allowed(f"analyze:{ip}", "analyze"):
        retry_after = rate_limiter.get_retry_after(f"analyze:{ip}", "analyze")
        logger.warning(f"Rate limit exceeded for analysis from IP: {ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many analysis requests. Try again in {retry_after} seconds",
            headers={"Retry-After": str(retry_after)}
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()

        if not user:
            raise HTTPException(401, "User not found")

        # Check user quota
        if user.quota <= 0:
            logger.warning(f"User {user.email} exceeded quota")
            raise HTTPException(403, "Analysis quota exceeded. Please upgrade your plan.")

        # Check cache first
        cache_key = f"analysis:{request.domain}:{request.max_pages}"
        cached_result = analysis_cache.get(cache_key)

        if cached_result:
            logger.info(f"Cache hit for {request.domain}")
            return {
                "success": True,
                "job_id": "cached",
                "status": "completed",
                "data": cached_result,
                "cached": True
            }

        logger.info(f"Starting deep analysis for {request.domain} (max_pages: {request.max_pages})")

        # Crawl with enhanced settings (50 pages default)
        your_data = crawl_site(request.domain, min(request.max_pages, 50))

        competitors_data = {}
        for comp in request.competitors[:5]:  # Limit to 5 competitors
            logger.info(f"Analyzing competitor: {comp}")
            competitors_data[comp] = crawl_site(comp, 15)

        # Generate keyword gaps based on actual data
        keyword_gaps = generate_keyword_gaps(your_data, competitors_data)

        result = {
            "your_site": your_data,
            "competitors": competitors_data,
            "content_gaps": {"keyword_gaps": keyword_gaps},
            "analyzed_at": datetime.utcnow().isoformat()
        }

        # Cache the result for 10 minutes
        analysis_cache.set(cache_key, result, ttl=600)

        # Decrease user quota
        user.quota -= 1
        db.commit()

        report = AnalysisReport(
            user_id=user.id,
            report_type="deep_analysis",
            domain=request.domain,
            competitors=",".join(request.competitors),
            results=json.dumps(result)
        )
        db.add(report)
        log_activity(db, user.id, user.email, "Deep Analysis", f"Analyzed {request.domain} ({your_data.get('total_pages', 0)} pages)", ip)
        db.commit()

        logger.info(f"Analysis completed for {request.domain}: {your_data.get('total_pages', 0)} pages crawled")

        return {
            "success": True,
            "job_id": f"job_{report.id}",
            "status": "completed",
            "data": result,
            "remaining_quota": user.quota
        }
    except HTTPException:
        raise
    except JWTError:
        logger.error("Invalid JWT token")
        raise HTTPException(401, "Invalid token")
    except Exception as e:
        logger.error(f"Analysis error for {request.domain}: {str(e)}")
        return {"success": False, "error": str(e)}


def generate_keyword_gaps(your_data: Dict, competitors_data: Dict) -> List[Dict]:
    """Generate keyword gaps based on actual crawled data"""
    gaps = []

    # Extract keywords from competitor data that are missing in your data
    your_keywords = set()
    if your_data.get('pages'):
        for page in your_data['pages']:
            if 'analysis' in page:
                # Extract from titles and headings
                title = page['analysis'].get('title', {}).get('text', '')
                your_keywords.update(title.lower().split())
                for h1 in page['analysis'].get('headers', {}).get('h1_texts', []):
                    your_keywords.update(h1.lower().split())

    comp_keywords = set()
    for comp, data in competitors_data.items():
        if data.get('pages'):
            for page in data['pages']:
                if 'analysis' in page:
                    title = page['analysis'].get('title', {}).get('text', '')
                    comp_keywords.update(title.lower().split())

    # Find keywords competitors have but you don't
    missing = comp_keywords - your_keywords
    common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', '-', '|', '–'}
    missing = [kw for kw in missing if len(kw) > 3 and kw not in common_words]

    for i, kw in enumerate(list(missing)[:10]):
        gaps.append({
            "keyword": kw,
            "competitor_usage": len(competitors_data),
            "priority": "high" if i < 3 else "medium",
            "volume": "Analyzing...",
            "difficulty": "Medium"
        })

    return gaps

class AdsRequest(BaseModel):
    domain: str
    brand_name: Optional[str] = None

@app.post("/api/analyze-ads")
async def analyze_ads(request: AdsRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        social = find_social_accounts(request.domain)
        tiktok_username = social.get('tiktok') or request.brand_name or request.domain.split('.')[0]
        google_url = f"https://adstransparency.google.com/?domain={request.domain}&region=anywhere"
        end_time = int(datetime.now().timestamp() * 1000)
        start_time = int((datetime.now() - timedelta(days=365)).timestamp() * 1000)
        tiktok_url = f'https://library.tiktok.com/ads?region=all&start_time={start_time}&end_time={end_time}&adv_name="{tiktok_username}"&query_type=1&sort_type=last_shown_date,desc'
        facebook_url = f"https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q={request.brand_name or request.domain}"
        if user:
            log_activity(db, user.id, user.email, "Ads Analysis", f"Analyzed ads for {request.domain}", get_client_ip(req))
        return {
            "success": True,
            "data": {
                "social_accounts": social,
                "platforms": {
                    "meta": {"status": "success", "url": facebook_url, "note": "Open Facebook Ad Library"},
                    "tiktok": {"status": "success", "url": tiktok_url, "username": tiktok_username},
                    "google": {"status": "success", "url": google_url}
                }
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

class SEORequest(BaseModel):
    your_domain: str
    competitors: List[str]

@app.post("/api/seo-comparison")
async def seo_comparison(request: SEORequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        your_data = crawl_site(request.your_domain, 15)
        competitors_data = {}
        for comp in request.competitors:
            competitors_data[comp] = crawl_site(comp, 10)
        insights = []
        
        # Calculate competitor averages
        if competitors_data:
            avg_comp_score = sum(c['avg_seo_score'] for c in competitors_data.values()) / len(competitors_data)
            avg_comp_words = sum(c['avg_word_count'] for c in competitors_data.values()) / len(competitors_data)
            avg_comp_alt = sum(c['avg_alt_coverage'] for c in competitors_data.values()) / len(competitors_data)
            avg_comp_schema = sum(c['schema_coverage'] for c in competitors_data.values()) / len(competitors_data)
            
            # SEO Score comparison
            score_diff = your_data['avg_seo_score'] - avg_comp_score
            if score_diff > 10:
                insights.append(f"✅ Your SEO score ({your_data['avg_seo_score']}) is {int(score_diff)} points higher than competitors")
            elif score_diff < -10:
                insights.append(f"⚠️ Your SEO score is {int(abs(score_diff))} points lower - improve technical SEO")
            else:
                insights.append(f"📊 Your SEO score is competitive (difference: {int(score_diff)} points)")
            
            # Content length comparison
            word_diff_pct = ((your_data['avg_word_count'] - avg_comp_words) / avg_comp_words * 100) if avg_comp_words > 0 else 0
            if word_diff_pct < -20:
                insights.append(f"⚠️ Your content is {int(abs(word_diff_pct))}% shorter than competitors - add more valuable content")
            elif word_diff_pct > 20:
                insights.append(f"✅ Your content is {int(word_diff_pct)}% longer than competitors")
            
            # Alt text coverage
            alt_diff = your_data['avg_alt_coverage'] - avg_comp_alt
            if alt_diff < -15:
                insights.append(f"⚠️ Your image alt text coverage is {int(abs(alt_diff))}% lower - improve accessibility")
            elif alt_diff > 15:
                insights.append(f"✅ Your alt text coverage is {int(alt_diff)}% better than competitors")
            
            # Schema markup
            schema_diff = your_data['schema_coverage'] - avg_comp_schema
            if schema_diff < -20:
                insights.append(f"⚠️ Only {your_data['schema_coverage']}% of your pages have schema vs {int(avg_comp_schema)}% for competitors")
            elif your_data['schema_coverage'] > 80:
                insights.append(f"✅ Excellent schema coverage ({your_data['schema_coverage']}%)")
        if user:
            log_activity(db, user.id, user.email, "SEO Comparison", f"Compared {request.your_domain}", get_client_ip(req))
        return {
            "success": True,
            "data": {
                "your_site": your_data,
                "competitors": competitors_data,
                "insights": insights
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

class AIRecommendationsRequest(BaseModel):
    domain: str
    competitors: List[str] = []

@app.post("/api/ai-recommendations")
async def ai_recommendations(request: AIRecommendationsRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get AI-powered marketing recommendations using local analysis (NO Google Cloud!)"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()

        if not user:
            raise HTTPException(401, "User not found")

        logger.info(f"Generating AI recommendations for {request.domain}")

        # Crawl your site
        your_data = crawl_site(request.domain, 15)

        # Crawl competitors
        competitor_data = []
        for comp in request.competitors[:3]:
            comp_crawl = crawl_site(comp, 10)
            comp_crawl['domain'] = comp
            competitor_data.append(comp_crawl)

        # Get AI analysis using local analyzer
        analyzer = LocalAnalyzer()
        competitive_analysis = analyzer.deep_competitor_analysis(your_data, competitor_data)
        content_strategy = analyzer.generate_content_strategy(your_data)

        # Save analytics
        save_analytics({
            "domain": request.domain,
            "type": "ai_recommendations",
            "user_id": user.id,
            "results": {
                "competitive_analysis": competitive_analysis,
                "content_strategy": content_strategy
            }
        })

        if user:
            log_activity(db, user.id, user.email, "AI Recommendations", f"Generated for {request.domain}", get_client_ip(req))

        return {
            "success": True,
            "data": {
                "competitive_analysis": competitive_analysis,
                "content_strategy": content_strategy,
                "generated_at": datetime.utcnow().isoformat(),
                "method": "local_ai"
            }
        }
    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(401, "Invalid token")
    except Exception as e:
        logger.error(f"AI recommendations error: {str(e)}")
        return {"success": False, "error": str(e)}


class KeywordRequest(BaseModel):
    domain: str

@app.post("/api/keyword-analysis")
async def keyword_analysis(request: KeywordRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        
        # Crawl site to get content
        site_data = crawl_site(request.domain, 15)
        
        # Combine all text from pages
        all_text = ""
        for page in site_data.get('pages', []):
            # Extract text from analysis
            if 'analysis' in page:
                analysis = page['analysis']
                # Get title
                if 'title' in analysis:
                    all_text += analysis['title'].get('text', '') + " "
                # Get meta description
                if 'meta' in analysis:
                    all_text += analysis['meta'].get('description', '') + " "
                # Get headings
                if 'content' in analysis and 'headings' in analysis['content']:
                    for h in analysis['content']['headings']:
                        all_text += h + " "
        
        # Extract keywords using YAKE
        from scraper import extract_keywords_with_yake
        keywords = extract_keywords_with_yake(all_text, top_n=20)
        
        # Log activity
        if user:
            log_activity(db, user.id, user.email, "Keyword Analysis", f"Analyzed keywords for {request.domain}", get_client_ip(req))
        
        return {
            "success": True,
            "data": {
                "site_analysis": site_data,
                "keywords": keywords,
                "opportunities": len(keywords),
                "recommendations": [
                    f"Found {len(keywords)} relevant keywords from your content",
                    "Focus on high relevance score keywords first"
                ]
            }
        }
    except Exception as e:
        print(f"Error in keyword analysis: {str(e)}")
        return {"success": False, "error": str(e)}
        date = (datetime.utcnow() - timedelta(days=i)).date()
        daily_data.append({"date": date.isoformat(), "total": 10 + (i % 5) * 3})
    return {"success": True, "data": {"daily": daily_data}}

class ImageRequest(BaseModel):
    image_url: str

@app.post("/api/vision/detect-brands")
async def detect_brands(request: ImageRequest, token: str = Depends(oauth2_scheme)):
    """Detect brands and logos in an image using local analysis"""
    result = local_detect_brands(request.image_url)

    if result.get("success"):
        return {
            "success": True,
            "data": result.get("data", {})
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Brand detection failed")
        }


@app.post("/api/vision/analyze")
async def analyze_image(request: ImageRequest, token: str = Depends(oauth2_scheme)):
    """Comprehensive image analysis using local processing"""
    result = analyze_image_content(request.image_url)
    return result

class SentimentRequest(BaseModel):
    text: str

@app.post("/api/language/sentiment")
async def sentiment_analysis(request: SentimentRequest, token: str = Depends(oauth2_scheme)):
    """Analyze text sentiment using local NLP (TextBlob)"""
    result = local_sentiment(request.text)

    if result.get("success"):
        return {
            "success": True,
            "sentiment": result.get("sentiment"),
            "entities": result.get("entities", [])
        }
    else:
        return {
            "success": False,
            "error": result.get("error", "Sentiment analysis failed")
        }

def verify_admin(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        if not user or user.role != "admin":
            raise HTTPException(403, "Admin access required")
        return user
    except JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/stats")
def get_admin_stats(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    total_users = db.query(User).count()
    thirty_min_ago = datetime.utcnow() - timedelta(minutes=30)
    online_users = db.query(User).filter(User.last_login >= thirty_min_ago).count()
    total_reports = db.query(AnalysisReport).count()
    today = datetime.utcnow().date()
    reports_today = db.query(AnalysisReport).filter(
        AnalysisReport.created_at >= datetime.combine(today, datetime.min.time())
    ).count()
    return {
        "total_users": total_users,
        "online_users": online_users,
        "total_reports": total_reports,
        "reports_today": reports_today
    }

@app.get("/api/admin/users")
def get_all_users(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    users = db.query(User).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "quota": u.quota,
                "is_active": u.is_active,
                "role": u.role if hasattr(u, 'role') else 'user',
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "last_ip": u.last_ip if hasattr(u, 'last_ip') else None,
                "last_geo": u.last_geo if hasattr(u, 'last_geo') else None,
                "created_at": u.created_at.isoformat() if u.created_at else None
            }
            for u in users
        ]
    }

class CreateUserRequest(BaseModel):
    email: str
    password: str
    quota: int = 15

@app.post("/api/admin/users/create")
def create_user(request: CreateUserRequest, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(400, "User already exists")
    new_user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        quota=request.quota
    )
    db.add(new_user)
    db.commit()
    return {"success": True, "message": "User created"}

class UpdateUserRequest(BaseModel):
    quota: Optional[int] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

@app.put("/api/admin/users/{user_id}")
def update_user(user_id: int, request: UpdateUserRequest, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if request.quota is not None:
        user.quota = request.quota
    if request.is_active is not None:
        user.is_active = request.is_active
    if request.password:
        user.hashed_password = get_password_hash(request.password)
    db.commit()
    return {"success": True, "message": "User updated"}

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"success": True, "message": "User deleted"}

@app.get("/api/admin/activity")
def get_activity_logs(limit: int = 50, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return {
        "logs": [
            {
                "id": log.id,
                "user_email": log.user_email,
                "action": log.action,
                "details": log.details,
                "ip_address": log.ip_address,
                "geo_location": log.geo_location,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ]
    }

@app.get("/api/admin/reports/{user_id}")
def get_user_reports(user_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    reports = db.query(AnalysisReport).filter(AnalysisReport.user_id == user_id).order_by(AnalysisReport.created_at.desc()).all()
    return {
        "reports": [
            {
                "id": r.id,
                "type": r.report_type,
                "domain": r.domain,
                "created_at": r.created_at.isoformat()
            }
            for r in reports
        ]
    }
