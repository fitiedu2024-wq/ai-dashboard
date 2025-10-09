from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os
from pydantic import BaseModel
from typing import List, Optional
import json
import requests

from models import Base, engine, SessionLocal, User, ActivityLog, AnalysisReport
from credentials import DEFAULT_ADMIN, get_password_hash, verify_password
from scraper import crawl_site, find_social_accounts

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

@app.get("/")
def root():
    return {"message": "AI Grinners API", "status": "running", "version": "2.0"}

@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), request: Request = None, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    ip = get_client_ip(request)
    user.last_login = datetime.utcnow()
    user.last_ip = ip
    user.last_geo = get_geo_location(ip)
    db.commit()
    log_activity(db, user.id, user.email, "Login", f"User logged in", ip)
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
    max_pages: int = 20

@app.post("/api/analyze")
async def deep_analysis(request: AnalyzeRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        your_data = crawl_site(request.domain, request.max_pages)
        competitors_data = {}
        for comp in request.competitors:
            competitors_data[comp] = crawl_site(comp, 10)
        keyword_gaps = [
            {"keyword": "AI marketing automation", "competitor_usage": len(request.competitors), "priority": "high", "volume": "12.5K", "difficulty": "Medium"},
            {"keyword": "competitive intelligence tools", "competitor_usage": len(request.competitors) - 1, "priority": "high", "volume": "8.2K", "difficulty": "Low"},
        ]
        result = {
            "your_site": your_data,
            "competitors": competitors_data,
            "content_gaps": {"keyword_gaps": keyword_gaps}
        }
        report = AnalysisReport(
            user_id=user.id,
            report_type="deep_analysis",
            domain=request.domain,
            competitors=",".join(request.competitors),
            results=json.dumps(result)
        )
        db.add(report)
        log_activity(db, user.id, user.email, "Deep Analysis", f"Analyzed {request.domain}", get_client_ip(req))
        db.commit()
        return {
            "success": True,
            "job_id": f"job_{report.id}",
            "status": "completed",
            "data": result
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

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
        avg_comp_score = sum(c['avg_seo_score'] for c in competitors_data.values()) / len(competitors_data) if competitors_data else 0
        if your_data['avg_seo_score'] > avg_comp_score:
            insights.append(f"✅ Your SEO score is higher")
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

class KeywordRequest(BaseModel):
    domain: str

@app.post("/api/keyword-analysis")
async def keyword_analysis(request: KeywordRequest, req: Request = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.email == payload.get("sub")).first()
        site_data = crawl_site(request.domain, 15)
        keywords = [
            {"term": "AI marketing automation", "volume": "12.5K", "difficulty": "Medium", "priority": "high", "current_rank": "Not ranking", "cpc": "$8.50"},
            {"term": "competitive intelligence tools", "volume": "8.2K", "difficulty": "Low", "priority": "high", "current_rank": "Not ranking", "cpc": "$6.20"},
        ]
        if user:
            log_activity(db, user.id, user.email, "Keyword Analysis", f"Analyzed keywords for {request.domain}", get_client_ip(req))
        return {
            "success": True,
            "data": {
                "site_analysis": site_data,
                "keywords": keywords,
                "opportunities": len(keywords),
                "recommendations": ["Focus on long-tail keywords"]
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/analytics/dashboard")
async def analytics_dashboard(token: str = Depends(oauth2_scheme)):
    daily_data = []
    for i in range(30, 0, -1):
        date = (datetime.utcnow() - timedelta(days=i)).date()
        daily_data.append({"date": date.isoformat(), "total": 10 + (i % 5) * 3})
    return {"success": True, "data": {"daily": daily_data}}

class ImageRequest(BaseModel):
    image_url: str

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

class SentimentRequest(BaseModel):
    text: str

@app.post("/api/language/sentiment")
async def sentiment_analysis(request: SentimentRequest, token: str = Depends(oauth2_scheme)):
    positive_words = ['good', 'great', 'excellent', 'amazing']
    negative_words = ['bad', 'poor', 'terrible', 'awful']
    text_lower = request.text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    if pos_count > neg_count:
        sentiment_label = "Positive"
        score = 0.7
    elif neg_count > pos_count:
        sentiment_label = "Negative"
        score = -0.7
    else:
        sentiment_label = "Neutral"
        score = 0.0
    return {
        "success": True,
        "sentiment": {"score": round(score, 3), "magnitude": abs(score), "label": sentiment_label},
        "entities": [{"name": "Product", "type": "CONSUMER_GOOD", "salience": 0.8}]
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
