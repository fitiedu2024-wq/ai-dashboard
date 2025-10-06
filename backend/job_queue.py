"""
Simple background job system using threading
"""

import threading
import queue
import time
from typing import Callable, Dict, Any
import json
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from models import Base, engine, AnalysisJob  # Import from models

class JobQueue:
    def __init__(self):
        self.queue = queue.Queue()
        self.worker_thread = None
        self.running = False
        
    def start_worker(self):
        """Start background worker"""
        if not self.running:
            self.running = True
            self.worker_thread = threading.Thread(target=self._worker, daemon=True)
            self.worker_thread.start()
    
    def _worker(self):
        """Background worker loop"""
        while self.running:
            try:
                job = self.queue.get(timeout=1)
                self._execute_job(job)
                self.queue.task_done()
            except queue.Empty:
                continue
    
    def _execute_job(self, job: Dict):
        """Execute a job"""
        Session = sessionmaker(bind=engine)
        db = Session()
        
        job_id = job['job_id']
        func = job['func']
        args = job['args']
        
        try:
            # Update status
            db_job = db.query(AnalysisJob).filter(AnalysisJob.job_id == job_id).first()
            if db_job:
                db_job.status = 'running'
                db.commit()
            
            # Execute
            result = func(*args)
            
            # Save result
            if db_job:
                db_job.status = 'completed'
                db_job.result = json.dumps(result)
                db_job.completed_at = datetime.utcnow()
                db.commit()
                
        except Exception as e:
            if db_job:
                db_job.status = 'failed'
                db_job.error = str(e)
                db.commit()
        finally:
            db.close()
    
    def enqueue(self, job_id: str, analysis_type: str, func: Callable, *args, **kwargs) -> str:
        """Add job to queue"""
        Session = sessionmaker(bind=engine)
        db = Session()
        
        # Create job record
        db_job = AnalysisJob(
            job_id=job_id,
            status='pending',
            domain=kwargs.get('domain', 'unknown'),
            analysis_type=analysis_type
        )
        db.add(db_job)
        db.commit()
        db.close()
        
        # Add to queue
        self.queue.put({
            'job_id': job_id,
            'func': func,
            'args': args
        })
        
        return job_id
    
    def get_status(self, job_id: str) -> Dict:
        """Get job status"""
        Session = sessionmaker(bind=engine)
        db = Session()
        
        job = db.query(AnalysisJob).filter(AnalysisJob.job_id == job_id).first()
        
        if not job:
            return {'error': 'Job not found'}
        
        result = {
            'job_id': job.job_id,
            'status': job.status,
            'domain': job.domain,
            'type': job.analysis_type,
            'created_at': job.created_at.isoformat()
        }
        
        if job.status == 'completed' and job.result:
            result['result'] = json.loads(job.result)
            result['completed_at'] = job.completed_at.isoformat()
        elif job.status == 'failed':
            result['error'] = job.error
        
        db.close()
        return result

# Global queue instance
job_queue = JobQueue()
job_queue.start_worker()
