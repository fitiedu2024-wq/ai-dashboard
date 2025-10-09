from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import os
from pydantic import BaseModel
from typing import List, Optional

from models import Base, engine, SessionLocal, User
from credentials import DEFAULT_ADMIN, get_password_hash, verify_password

app = FastAPI(title="AI Grinners API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(User).delete()
    db.commit()
    admin = User(
        email=DEFAULT_ADMIN["email"],
        hashed_password=get_password_hash(DEFAULT_ADMIN["password"])
    )
    db.add(admin)
    db.commit()
    print(f"✅ Admin: {DEFAULT_ADMIN['email']}")
    db.close()

@app.get("/")
def root():
    return {"message": "AI Grinners API", "status": "running"}

@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
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
            "is_admin": user.email == DEFAULT_ADMIN["email"]
        }
    except:
        raise HTTPException(401, "Invalid token")

class AnalyzeRequest(BaseModel):
    domain: str
    competitors: List[str] = []
    max_pages: int = 20

class AdsRequest(BaseModel):
    domain: str
    brand_name: Optional[str] = None

class SEORequest(BaseModel):
    your_domain: str
    competitors: List[str]

class KeywordRequest(BaseModel):
    domain: str

@app.post("/api/analyze")
async def deep_analysis(request: AnalyzeRequest, token: str = Depends(oauth2_scheme)):
    return {
        "success": True,
        "job_id": "job_123",
        "status": "completed",
        "data": {
            "your_site": {
                "total_pages": 25,
                "avg_word_count": 1200,
                "seo_score": 85
            },
            "competitors": request.competitors,
            "content_gaps": {
                "keyword_gaps": [
                    {"keyword": "AI marketing tools", "competitor_usage": 3, "priority": "high"},
                    {"keyword": "automated analytics", "competitor_usage": 2, "priority": "medium"}
                ]
            }
        }
    }

@app.post("/api/analyze-ads")
async def analyze_ads(request: AdsRequest, token: str = Depends(oauth2_scheme)):
    return {
        "success": True,
        "data": {
            "platforms": {
                "meta": {
                    "status": "success",
                    "total_ads": 42,
                    "ads": [{"page_name": f"{request.domain} Official", "start_date": "2024-01-15", "preview_url": "https://www.facebook.com/ads/library"}]
                },
                "tiktok": {"url": f"https://library.tiktok.com/search?keyword={request.brand_name or request.domain}"},
                "google": {"url": f"https://adstransparency.google.com/?domain={request.domain}"}
            }
        }
    }

@app.post("/api/seo-comparison")
async def seo_comparison(request: SEORequest, token: str = Depends(oauth2_scheme)):
    competitors_data = {}
    for comp in request.competitors:
        competitors_data[comp] = {"seo_score": 78, "title_length": 58, "h1_count": 1, "alt_coverage": 85}
    return {
        "success": True,
        "data": {
            "your_site": {"seo_score": 82, "title_length": 62, "h1_count": 1, "alt_coverage": 90},
            "competitors": competitors_data,
            "insights": ["Your SEO score is 4% higher than average competitor", "Good alt text coverage"]
        }
    }

@app.post("/api/keyword-analysis")
async def keyword_analysis(request: KeywordRequest, token: str = Depends(oauth2_scheme)):
    return {
        "success": True,
        "data": {
            "keywords": [
                {"term": "AI marketing automation", "volume": "12.5K", "difficulty": "Medium", "priority": "high"},
                {"term": "competitive intelligence tools", "volume": "8.2K", "difficulty": "Low", "priority": "high"}
            ],
            "opportunities": 24
        }
    }

def verify_admin(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        return email
    except:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/stats")
def get_admin_stats(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    return {
        "total_users": db.query(User).count(),
        "total_analyses": 156,
        "active_today": 12,
        "quota_used": 68
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
                "quota": u.quota if hasattr(u, 'quota') else 15,
                "is_active": u.is_active if hasattr(u, 'is_active') else True,
                "created_at": u.created_at.isoformat() if hasattr(u, 'created_at') else datetime.now().isoformat()
            }
            for u in users
        ]
    }

@app.get("/api/admin/activity")
def get_activity_logs(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verify_admin(token, db)
    return {
        "logs": [
            {"action": "Deep Analysis", "details": "Analyzed nike.com", "created_at": datetime.now().isoformat()},
            {"action": "Login", "details": "User logged in", "created_at": (datetime.now() - timedelta(hours=1)).isoformat()}
        ]
    }

@app.get("/api/analytics/dashboard")
async def analytics_dashboard(token: str = Depends(oauth2_scheme)):
    daily_data = []
    for i in range(30, 0, -1):
        date = (datetime.now() - timedelta(days=i)).date()
        daily_data.append({"date": date.isoformat(), "total": 10 + (i % 5) * 3})
    return {"success": True, "data": {"daily": daily_data, "raw": []}}

class ImageRequest(BaseModel):
    image_url: str

class SentimentRequest(BaseModel):
    text: str

@app.post("/api/vision/detect-brands")
async def detect_brands(request: ImageRequest, token: str = Depends(oauth2_scheme)):
    return {
        "success": True,
        "data": {
            "logos": [{"name": "Sample Brand", "confidence": 95.5}],
            "web_entities": [{"name": "Technology", "score": 85}],
            "labels": [{"name": "Product", "confidence": 92}]
        }
    }

@app.post("/api/language/sentiment")
async def sentiment_analysis(request: SentimentRequest, token: str = Depends(oauth2_scheme)):
    return {
        "success": True,
        "sentiment": {"score": 0.5, "magnitude": 0.5, "label": "Positive"},
        "entities": [{"name": "Product", "type": "CONSUMER_GOOD", "salience": 0.8, "sentiment": {"score": 0.5, "magnitude": 0.5}}]
    }
