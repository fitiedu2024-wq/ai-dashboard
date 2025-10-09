from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import os

from models import Base, engine, SessionLocal, User
from credentials import DEFAULT_ADMIN, get_password_hash, verify_password

# App
app = FastAPI(title="AI Dashboard API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Clear and recreate admin
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

# Routes
@app.get("/")
def root():
    return {"message": "AI Dashboard API", "status": "running"}

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
        return {"email": user.email, "id": user.id}
    except:
        raise HTTPException(401, "Invalid token")

# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.get("/api/admin/stats")
def get_admin_stats(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get admin statistics"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Get stats
        total_users = db.query(User).count()
        
        return {
            "total_users": total_users,
            "total_analyses": 0,
            "active_today": 0,
            "quota_used": 0
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/users")
def get_all_users(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get all users"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        users = db.query(User).all()
        
        return {
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "quota": u.quota,
                    "is_active": u.is_active,
                    "created_at": u.created_at.isoformat() if hasattr(u, 'created_at') else None
                }
                for u in users
            ]
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/activity")
def get_activity_logs(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get activity logs"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Return empty for now
        return {
            "logs": []
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")


# ============================================
# ADMIN ENDPOINTS
# ============================================

@app.get("/api/admin/stats")
def get_admin_stats(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get admin statistics"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Get stats
        total_users = db.query(User).count()
        
        return {
            "total_users": total_users,
            "total_analyses": 0,
            "active_today": 0,
            "quota_used": 0
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/users")
def get_all_users(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get all users"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        users = db.query(User).all()
        
        return {
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "quota": u.quota,
                    "is_active": u.is_active,
                    "created_at": u.created_at.isoformat() if hasattr(u, 'created_at') else None
                }
                for u in users
            ]
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

@app.get("/api/admin/activity")
def get_activity_logs(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get activity logs"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = payload.get("sub")
        
        # Check if admin
        if email != DEFAULT_ADMIN["email"]:
            raise HTTPException(403, "Admin access required")
        
        # Return empty for now
        return {
            "logs": []
        }
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

