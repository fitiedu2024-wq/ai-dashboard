from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os

app = FastAPI()

# CORS - allow frontend domain
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")

fake_users_db = {
    "user@example.com": {
        "email": "user@example.com",
        "password": "password",
        "full_name": "Test User",
        "quota": 15
    }
}

class User(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    quota: int = 15

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    if not token.startswith("fake_token_for_"):
        raise HTTPException(status_code=401, detail="Invalid token")
    user_email = token.replace("fake_token_for_", "")
    user_data = fake_users_db.get(user_email)
    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_data)

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
    return {"access_token": f"fake_token_for_{credentials.email}", "token_type": "bearer"}

@app.get("/api/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
