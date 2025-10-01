from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from datetime import datetime, timedelta
from typing import Optional, List
import user_agents
import requests
import os

from database import get_db, User, ActivityLog, Job, SessionLocal, engine

app = FastAPI(title="AI Grinners Dashboard API")

SECRET_KEY = os.getenv("SECRET_KEY", "grinners-secret-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ph = PasswordHasher()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    quota: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    email: Optional[str]
    action: str
    ip_address: Optional[str]
    country: Optional[str]
    city: Optional[str]
    os: Optional[str]
    browser: Optional[str]
    device_type: Optional[str]
    timestamp: datetime
    success: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str]
    role: str = "user"
    quota: int = 15

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    quota: Optional[int] = None
    is_active: Optional[bool] = None

def hash_password(password: str):
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_location_from_ip(ip: str):
    """Get location using free IP geolocation API"""
    try:
        if ip in ["127.0.0.1", "localhost", None]:
            return None, None
        
        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=2)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                return data.get("country"), data.get("city")
    except:
        pass
    return None, None

def log_activity(db: Session, request: Request, email: str, action: str, success: bool = True, user_id: int = None):
    ua_string = request.headers.get("user-agent", "")
    ua = user_agents.parse(ua_string)
    
    ip_address = request.client.host if request.client else None
    country, city = get_location_from_ip(ip_address)
    
    # Determine device type
    device_type = "pc"
    if ua.is_mobile:
        device_type = "mobile"
    elif ua.is_tablet:
        device_type = "tablet"
    
    log = ActivityLog(
        user_id=user_id,
        email=email,
        action=action,
        ip_address=ip_address,
        country=country,
        city=city,
        user_agent=ua_string,
        os=f"{ua.os.family} {ua.os.version_string}" if ua.os.family else None,
        browser=f"{ua.browser.family} {ua.browser.version_string}" if ua.browser.family else None,
        device_type=device_type,
        success=success
    )
    db.add(log)
    db.commit()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@app.on_event("startup")
def startup():
    from database import Base
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "3ayoty@gmail.com").first()
        if not admin:
            admin = User(
                email="3ayoty@gmail.com",
                hashed_password=hash_password("ALI@TIA@20"),
                full_name="Admin User",
                role="admin",
                quota=999,
                is_active=True
            )
            db.add(admin)
            db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Grinners Dashboard API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/token", response_model=Token)
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        log_activity(db, request, form_data.username, "login_failed", success=False)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        log_activity(db, request, form_data.username, "login_inactive", success=False, user_id=user.id)
        raise HTTPException(status_code=401, detail="Account inactive")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    log_activity(db, request, user.email, "login_success", user_id=user.id)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/admin/users", response_model=List[UserResponse])
async def get_users(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/api/admin/users/{user_id}/activity", response_model=List[ActivityLogResponse])
async def get_user_activity(
    user_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get activity logs for specific user"""
    return db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

@app.post("/api/admin/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    new_user = User(
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        quota=user_data.quota
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    log_activity(db, request, admin.email, f"created_user:{user_data.email}", user_id=admin.id)
    return new_user

@app.put("/api/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.quota is not None:
        user.quota = user_data.quota
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    
    db.commit()
    db.refresh(user)
    
    log_activity(db, request, admin.email, f"updated_user:{user.email}", user_id=admin.id)
    return user

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == "admin" and user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    email = user.email
    db.delete(user)
    db.commit()
    
    log_activity(db, request, admin.email, f"deleted_user:{email}", user_id=admin.id)
    return {"message": "User deleted"}

@app.get("/api/admin/activity", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    limit: int = 100
):
    return db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit).all()

@app.get("/api/admin/stats")
async def get_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_jobs = db.query(Job).count()
    completed_jobs = db.query(Job).filter(Job.status == "completed").count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "total_jobs": total_jobs,
        "completed_jobs": completed_jobs,
        "pending_jobs": total_jobs - completed_jobs
    }

@app.post("/api/admin/users/{user_id}/reset-password")
async def reset_user_password(
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
    
    log_activity(db, request, admin.email, f"reset_password:{user.email}", user_id=admin.id)
    return {"message": "Password reset successfully"}
