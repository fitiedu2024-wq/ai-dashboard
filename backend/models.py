from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
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
    last_login = Column(DateTime, nullable=True)
    last_ip = Column(String, nullable=True)
    last_geo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    user_email = Column(String)
    action = Column(String)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    geo_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    report_type = Column(String)  # deep_analysis, seo_compare, etc.
    domain = Column(String)
    competitors = Column(Text, nullable=True)
    results = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
