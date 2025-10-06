from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, create_engine
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import os

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String, nullable=True)
    role = Column(String, default="user")
    quota = Column(Integer, default=15)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./grinners.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
