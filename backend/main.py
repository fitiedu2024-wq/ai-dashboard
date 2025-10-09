from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker, Session
from credentials import DEFAULT_ADMIN, get_password_hash, verify_password
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from models import Base, User, ActivityLog, AnalysisJob
import json
from analyzers import analyze_domain

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize database and reset admin"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clear all users
    try:
        db.query(User).delete()
        db.commit()
        print("🗑️ Cleared old users")
    except:
        db.rollback()
    
    # Create admin
    admin_user = User(
        email=DEFAULT_ADMIN["email"],
        hashed_password=get_password_hash(DEFAULT_ADMIN["password"]),
        name=DEFAULT_ADMIN["name"]
    )
    db.add(admin_user)
    db.commit()
    print(f"✅ Admin created: {DEFAULT_ADMIN['email']}")
    
    db.close()


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./grinners.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# Using credentials.py for password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str):
    return get_password_hash(password)

def verify_password(plain_password, hashed_password):
    return verify_password(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def log_activity(db: Session, request: Request, action: str, user_id: int = None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent", "")
    )
    db.add(log)
    db.commit()

@app.get("/")
def read_root():
    return {"message": "Grinners.ai API - Crafting Smiles through Marketing"}

@app.post("/api/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db), request: Request = None):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is deactivated")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    log_activity(db, request, "login", user.id)
    
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "quota": current_user.quota,
        "created_at": current_user.created_at.isoformat()
    }

# Analysis Endpoints
@app.post("/api/analyze")
async def create_analysis(
    domain: dict,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.quota <= 0:
        raise HTTPException(status_code=403, detail="Quota exceeded")
    
    domain_name = domain.get("domain", "").strip().lower()
    if not domain_name:
        raise HTTPException(status_code=400, detail="Domain is required")
    
    # Remove http/https
    domain_name = domain_name.replace("https://", "").replace("http://", "").split("/")[0]
    
    # Create analysis job
    job = AnalysisJob(
        user_id=current_user.id,
        domain=domain_name,
        status="processing"
    )
    db.add(job)
    
    # Decrease quota
    current_user.quota -= 1
    db.commit()
    db.refresh(job)
    
    log_activity(db, request, f"analysis_started:{domain_name}", current_user.id)
    
    # Run analysis
    try:
        analysis_results = analyze_domain(domain_name)
        
        job.results = json.dumps(analysis_results)
        job.status = "completed"
        job.completed_at = datetime.utcnow()
        db.commit()
        
        return {"job_id": job.id, "status": job.status, "message": "Analysis completed"}
    except Exception as e:
        job.status = "failed"
        job.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/jobs")
def get_user_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jobs = db.query(AnalysisJob).filter(AnalysisJob.user_id == current_user.id).order_by(AnalysisJob.created_at.desc()).all()
    
    return [{
        "id": job.id,
        "domain": job.domain,
        "status": job.status,
        "created_at": job.created_at.isoformat(),
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "results": json.loads(job.results) if job.results else None
    } for job in jobs]

@app.get("/api/jobs/{job_id}")
def get_job_details(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id,
        AnalysisJob.user_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "id": job.id,
        "domain": job.domain,
        "status": job.status,
        "created_at": job.created_at.isoformat(),
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "results": json.loads(job.results) if job.results else None,
        "error_message": job.error_message
    }

# Admin endpoints
@app.get("/api/admin/stats")
def get_admin_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    admin_users = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    total_quota = db.query(func.sum(User.quota)).scalar() or 0
    total_jobs = db.query(func.count(AnalysisJob.id)).scalar()
    completed_jobs = db.query(func.count(AnalysisJob.id)).filter(AnalysisJob.status == "completed").scalar()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_users": admin_users,
        "total_quota": total_quota,
        "total_jobs": total_jobs,
        "completed_jobs": completed_jobs
    }

@app.get("/api/admin/users")
def get_all_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "quota": user.quota,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None
    } for user in users]

@app.post("/api/admin/users")
def create_user(
    user_data: dict,
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_data["email"]).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_data["email"],
        hashed_password=hash_password(user_data["password"]),
        full_name=user_data.get("full_name"),
        role=user_data.get("role", "user"),
        quota=user_data.get("quota", 15)
    )
    db.add(new_user)
    db.commit()
    
    log_activity(db, request, f"user_created:{user_data['email']}", admin.id)
    
    return {"message": "User created successfully"}

@app.put("/api/admin/users/{user_id}")
def update_user(
    user_id: int,
    updates: dict,
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in updates.items():
        if hasattr(user, key) and key != "id":
            setattr(user, key, value)
    
    db.commit()
    log_activity(db, request, f"user_updated:{user.email}", admin.id)
    
    return {"message": "User updated successfully"}

@app.post("/api/admin/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    request: Request,
    new_password: dict,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = hash_password(new_password.get('new_password'))
    db.commit()
    
    log_activity(db, request, f"reset_password:{user.email}", admin.id)
    return {"message": "Password reset successfully"}

@app.get("/api/admin/activity")
def get_activity_logs(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100).all()
    
    result = []
    for log in logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        result.append({
            "id": log.id,
            "user_email": user.email if user else "Unknown",
            "action": log.action,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat()
        })
    
    return result

# Startup event
async def startup_event():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "3ayoty@gmail.com").first()
        if not admin:
            admin = User(
                email="3ayoty@gmail.com",
                hashed_password=hash_password("123456789"),
                full_name="Admin User",
                role="admin",
                quota=999,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created")
        else:
            print(f"✅ Admin exists: {admin.email}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

# ==========================================
# ADS LIBRARY ANALYSIS ENDPOINT
# ==========================================
from unified_ads_analyzer import analyze_competitor_ads

@app.post("/api/analyze-ads")
async def analyze_ads_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze competitor ads across platforms
    - Meta (Facebook/Instagram): API-powered
    - TikTok: Manual search URL
    - Google Ads: Manual search URL
    """
    try:
        body = await request.json()
        domain = body.get('domain')
        brand_name = body.get('brand_name')
        
        if not domain:
            raise HTTPException(status_code=400, detail="Domain is required")
        
        # Analyze ads
        results = analyze_competitor_ads(domain, brand_name)
        
        # Log activity
        log = ActivityLog(
            user_id=current_user.id,
            action="analyze_ads",
            details=f"Analyzed ads for {domain}"
        )
        db.add(log)
        db.commit()
        
        return {
            "success": True,
            "data": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# DEEP ANALYSIS ENDPOINTS
# ==========================================
from keyword_analyzer import analyze_keywords
from seo_comparator import compare_seo

@app.post("/api/keyword-analysis")
async def keyword_analysis_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deep keyword analysis vs competitors"""
    try:
        body = await request.json()
        your_domain = body.get('your_domain')
        competitors = body.get('competitors', [])
        
        if not your_domain or not competitors:
            raise HTTPException(status_code=400, detail="your_domain and competitors required")
        
        results = analyze_keywords(your_domain, competitors)
        
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/seo-comparison")
async def seo_comparison_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Side-by-side SEO comparison"""
    try:
        body = await request.json()
        your_domain = body.get('your_domain')
        competitors = body.get('competitors', [])
        
        if not your_domain or not competitors:
            raise HTTPException(status_code=400, detail="your_domain and competitors required")
        
        results = compare_seo(your_domain, competitors)
        
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# HISTORY TRACKING ENDPOINTS
# ==========================================
from history_tracker import save_analysis, get_history, compare_with_history

@app.get("/api/analysis-history/{domain}")
async def get_analysis_history(
    domain: str,
    analysis_type: str = None,
    current_user: User = Depends(get_current_user)
):
    """Get analysis history for a domain"""
    try:
        history = get_history(domain, analysis_type)
        return {"success": True, "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/compare-history")
async def compare_with_history_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Compare current analysis with historical data"""
    try:
        body = await request.json()
        domain = body.get('domain')
        current_results = body.get('results')
        analysis_type = body.get('type', 'general')
        
        if not domain or not current_results:
            raise HTTPException(status_code=400, detail="domain and results required")
        
        # Save current analysis
        save_analysis(domain, analysis_type, current_results)
        
        # Compare with history
        comparison = compare_with_history(domain, current_results, analysis_type)
        
        return {"success": True, "data": comparison}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# ASYNC ANALYSIS WITH JOBS
# ==========================================
from job_queue import job_queue
from simple_cache import cache
import uuid

def run_deep_analysis(domain: str, competitors: list):
    """Background job function"""
    from analyzers import analyze_domain
    from competitor_analyzer import find_competitors, analyze_competitor_pages
    from gemini_analyzer import analyze_with_gemini
    
    # Your site analysis
    your_data = analyze_domain(domain)
    
    # Competitor analysis
    comp_data = []
    for comp in competitors[:3]:
        try:
            comp_analysis = analyze_domain(comp)
            comp_data.append(comp_analysis)
        except:
            continue
    
    # Gemini intelligence
    gemini_insights = analyze_with_gemini(your_data, comp_data)
    
    return {
        'your_site': your_data,
        'competitors': comp_data,
        'ai_insights': gemini_insights
    }

@app.post("/api/analyze-async")
async def analyze_async(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Start async analysis job"""
    try:
        body = await request.json()
        domain = body.get('domain')
        competitors = body.get('competitors', [])
        
        if not domain:
            raise HTTPException(400, "Domain required")
        
        # Check cache
        cache_key = f"analysis:{domain}"
        cached = cache.get(cache_key)
        if cached:
            return {"success": True, "data": cached, "from_cache": True}
        
        # Create job
        job_id = str(uuid.uuid4())
        job_queue.enqueue(
            job_id,
            'deep_analysis',
            run_deep_analysis,
            domain,
            competitors,
            domain=domain
        )
        
        return {
            "success": True,
            "job_id": job_id,
            "message": "Analysis started in background",
            "status_endpoint": f"/api/job-status/{job_id}"
        }
        
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/job-status/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get job status and results"""
    status = job_queue.get_status(job_id)
    
    # Cache completed results
    if status.get('status') == 'completed' and status.get('result'):
        cache_key = f"analysis:{status.get('domain')}"
        cache.set(cache_key, status['result'])
    
    return {"success": True, "data": status}

# ==========================================
# ENHANCED DEEP ANALYSIS
# ==========================================
from enhanced_analyzer import full_site_analysis

@app.post("/api/deep-analysis")
async def deep_analysis_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Full deep site analysis with multi-page crawl"""
    try:
        body = await request.json()
        domain = body.get('domain')
        competitors = body.get('competitors', [])
        
        if not domain:
            raise HTTPException(400, "Domain required")
        
        # Check cache
        cache_key = f"deep:{domain}:{','.join(competitors)}"
        cached = cache.get(cache_key)
        if cached:
            return {"success": True, "data": cached, "from_cache": True}
        
        # Create background job
        job_id = str(uuid.uuid4())
        job_queue.enqueue(
            job_id,
            domain,
            'deep_site_analysis',
            full_site_analysis,
            domain,
            competitors
        )
        
        return {
            "success": True,
            "job_id": job_id,
            "estimated_time": "2-3 minutes",
            "status_endpoint": f"/api/job-status/{job_id}"
        }
        
    except Exception as e:
        raise HTTPException(500, str(e))

# Override default admin on startup
async def update_admin_credentials():
    """Update admin user with credentials from credentials.py"""
    try:
        db = SessionLocal()
        admin = db.query(User).filter(User.email == "admin@grinners.com").first()
        
        # Update to new credentials
        if admin:
            admin.email = DEFAULT_ADMIN["email"]
            admin.hashed_password = get_password_hash(DEFAULT_ADMIN["password"])
            admin.name = DEFAULT_ADMIN["name"]
            db.commit()
            print(f"✅ Admin updated: {DEFAULT_ADMIN['email']}")
        else:
            # Create new admin
            new_admin = User(
                email=DEFAULT_ADMIN["email"],
                hashed_password=get_password_hash(DEFAULT_ADMIN["password"]),
                name=DEFAULT_ADMIN["name"]
            )
            db.add(new_admin)
            db.commit()
            print(f"✅ Admin created: {DEFAULT_ADMIN['email']}")
        
        db.close()
    except Exception as e:
        print(f"❌ Admin update error: {e}")
