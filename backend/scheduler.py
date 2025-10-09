"""
Background Scheduler for Automated Tasks
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from email_service import send_weekly_report
from models import SessionLocal, User
from gcp_services import query_analytics
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def send_weekly_reports():
    """Send weekly reports to all active users"""
    logger.info("Starting weekly report generation...")
    
    db = SessionLocal()
    users = db.query(User).filter(User.is_active == True).all()
    
    for user in users:
        try:
            # Get analytics data
            analytics = query_analytics(days=7)
            
            report_data = {
                "total_analyses": 0,
                "competitors_tracked": 0,
                "insights_generated": 0
            }
            
            # Send email
            result = send_weekly_report(user.email, report_data)
            
            if result["success"]:
                logger.info(f"Report sent to {user.email}")
            else:
                logger.error(f"Failed to send report to {user.email}: {result.get('error')}")
                
        except Exception as e:
            logger.error(f"Error sending report to {user.email}: {str(e)}")
    
    db.close()
    logger.info("Weekly reports completed")

def start_scheduler():
    """Start the background scheduler"""
    # Weekly reports every Monday at 9 AM
    scheduler.add_job(
        send_weekly_reports,
        CronTrigger(day_of_week='mon', hour=9, minute=0),
        id='weekly_reports',
        name='Send weekly reports',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started")

def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    logger.info("Scheduler stopped")

