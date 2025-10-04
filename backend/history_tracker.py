"""
Track analysis history over time
Compare current vs past performance
"""

import json
from datetime import datetime
from typing import Dict, List
from sqlalchemy import Column, Integer, String, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./grinners.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True)
    analysis_type = Column(String)  # 'seo', 'ads', 'keywords'
    results = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

class HistoryTracker:
    def __init__(self):
        self.db = SessionLocal()
    
    def save_analysis(self, domain: str, analysis_type: str, results: Dict):
        """Save analysis to history"""
        try:
            history = AnalysisHistory(
                domain=domain,
                analysis_type=analysis_type,
                results=json.dumps(results)
            )
            self.db.add(history)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            return False
    
    def get_history(self, domain: str, analysis_type: str = None, limit: int = 10) -> List[Dict]:
        """Get analysis history"""
        try:
            query = self.db.query(AnalysisHistory).filter(
                AnalysisHistory.domain == domain
            )
            
            if analysis_type:
                query = query.filter(AnalysisHistory.analysis_type == analysis_type)
            
            query = query.order_by(AnalysisHistory.created_at.desc()).limit(limit)
            
            results = []
            for record in query.all():
                results.append({
                    'id': record.id,
                    'domain': record.domain,
                    'type': record.analysis_type,
                    'date': record.created_at.isoformat(),
                    'results': json.loads(record.results)
                })
            
            return results
        except Exception as e:
            return []
    
    def compare_with_history(self, domain: str, current_results: Dict, analysis_type: str) -> Dict:
        """Compare current results with historical data"""
        history = self.get_history(domain, analysis_type, limit=5)
        
        if not history:
            return {
                'has_history': False,
                'message': 'No historical data available for comparison'
            }
        
        # Get last analysis
        last_analysis = history[0]
        
        comparison = {
            'has_history': True,
            'current_date': datetime.utcnow().isoformat(),
            'last_analysis_date': last_analysis['date'],
            'changes': self._calculate_changes(current_results, last_analysis['results']),
            'trend': self._calculate_trend(history),
            'total_analyses': len(history)
        }
        
        return comparison
    
    def _calculate_changes(self, current: Dict, previous: Dict) -> Dict:
        """Calculate changes between current and previous"""
        changes = {}
        
        # SEO score changes
        if 'seo_score' in current and 'seo_score' in previous:
            diff = current['seo_score'] - previous['seo_score']
            changes['seo_score'] = {
                'current': current['seo_score'],
                'previous': previous['seo_score'],
                'change': diff,
                'direction': 'up' if diff > 0 else 'down' if diff < 0 else 'stable'
            }
        
        # Ads count changes
        if 'total_ads' in current and 'total_ads' in previous:
            diff = current['total_ads'] - previous['total_ads']
            changes['ads_count'] = {
                'current': current['total_ads'],
                'previous': previous['total_ads'],
                'change': diff,
                'direction': 'up' if diff > 0 else 'down' if diff < 0 else 'stable'
            }
        
        return changes
    
    def _calculate_trend(self, history: List[Dict]) -> str:
        """Calculate overall trend"""
        if len(history) < 2:
            return 'insufficient_data'
        
        # Simple trend based on scores
        scores = []
        for h in history:
            results = h['results']
            if 'seo_score' in results:
                scores.append(results['seo_score'])
        
        if len(scores) >= 2:
            if scores[0] > scores[-1]:
                return 'improving'
            elif scores[0] < scores[-1]:
                return 'declining'
        
        return 'stable'


def save_analysis(domain: str, analysis_type: str, results: Dict):
    tracker = HistoryTracker()
    return tracker.save_analysis(domain, analysis_type, results)

def get_history(domain: str, analysis_type: str = None):
    tracker = HistoryTracker()
    return tracker.get_history(domain, analysis_type)

def compare_with_history(domain: str, current_results: Dict, analysis_type: str):
    tracker = HistoryTracker()
    return tracker.compare_with_history(domain, current_results, analysis_type)
