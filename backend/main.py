from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime
import os
import uuid

app = FastAPI(title="AI Marketing Dashboard API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

# Database simulation
fake_users_db = {
    "3ayoty@gmail.com": {
        "email": "3ayoty@gmail.com",
        "password": "ALI@TIA@20",
        "full_name": "Admin User",
        "quota": 50,
        "role": "admin"
    }
}

fake_jobs_db = {}

class User(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    quota: int = 15
    role: str = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class JobRequest(BaseModel):
    domain: str
    max_pages: int = 150

class Job(BaseModel):
    id: str
    domain: str
    status: str
    created_at: str
    progress: int
    pages_analyzed: int
    insights: Optional[dict] = None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    if not token.startswith("token_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    user_email = token.replace("token_", "").split("_")[0]
    user_data = fake_users_db.get(user_email)
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_data)

def analyze_website_task(job_id: str, domain: str):
    """Simulate website analysis"""
    import time
    job = fake_jobs_db[job_id]
    
    for i in range(1, 151):
        time.sleep(0.1)  # Simulate work
        job["progress"] = int((i / 150) * 100)
        job["pages_analyzed"] = i
    
    job["status"] = "completed"
    job["insights"] = {
        "total_pages": 150,
        "seo_score": 78,
        "performance_score": 85,
        "accessibility_score": 92,
        "keywords": ["marketing", "AI", "automation", "analytics"],
        "recommendations": [
            "Improve meta descriptions on 23 pages",
            "Add alt text to 45 images",
            "Reduce page load time by 30%"
        ]
    }

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Marketing Dashboard API"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/token", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    user_data = fake_users_db.get(credentials.email)
    if not user_data or user_data["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": f"token_{credentials.email}_{uuid.uuid4().hex[:8]}", "token_type": "bearer"}

@app.get("/api/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/api/jobs", response_model=Job)
async def create_job(
    job_request: JobRequest, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    if current_user.quota <= 0:
        raise HTTPException(status_code=400, detail="No quota remaining")
    
    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "domain": job_request.domain,
        "status": "processing",
        "created_at": datetime.now().isoformat(),
        "progress": 0,
        "pages_analyzed": 0,
        "insights": None
    }
    
    fake_jobs_db[job_id] = job
    fake_users_db[current_user.email]["quota"] -= 1
    
    background_tasks.add_task(analyze_website_task, job_id, job_request.domain)
    
    return Job(**job)

@app.get("/api/jobs", response_model=List[Job])
async def get_jobs(current_user: User = Depends(get_current_user)):
    return [Job(**job) for job in fake_jobs_db.values()]

@app.get("/api/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str, current_user: User = Depends(get_current_user)):
    job = fake_jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)
