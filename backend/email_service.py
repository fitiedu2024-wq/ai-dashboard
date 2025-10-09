"""
Email Service for Scheduled Reports
"""
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
import os
from datetime import datetime, timedelta

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_weekly_report(user_email: str, report_data: dict):
    """Send weekly analysis report via email"""
    try:
        # Generate HTML report
        html_content = generate_report_html(report_data)
        
        message = Mail(
            from_email=Email("reports@aigrinners.com"),
            to_emails=To(user_email),
            subject=f"AI Grinners Weekly Report - {datetime.now().strftime('%B %d, %Y')}",
            html_content=Content("text/html", html_content)
        )
        
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        
        return {
            "success": True,
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_report_html(data: dict) -> str:
    """Generate HTML email template"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }}
            .container {{ background: white; padding: 40px; border-radius: 10px; max-width: 600px; margin: 0 auto; }}
            .header {{ background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }}
            .stat {{ background: #f9fafb; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #7C3AED; }}
            .stat-number {{ font-size: 32px; font-weight: bold; color: #7C3AED; }}
            .stat-label {{ color: #6b7280; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Your Weekly Report</h1>
                <p>AI Grinners Marketing Intelligence</p>
            </div>
            
            <h2>This Week's Highlights</h2>
            
            <div class="stat">
                <div class="stat-number">{data.get('total_analyses', 0)}</div>
                <div class="stat-label">Total Analyses Run</div>
            </div>
            
            <div class="stat">
                <div class="stat-number">{data.get('competitors_tracked', 0)}</div>
                <div class="stat-label">Competitors Tracked</div>
            </div>
            
            <div class="stat">
                <div class="stat-number">{data.get('insights_generated', 0)}</div>
                <div class="stat-label">Insights Generated</div>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; text-align: center;">
                <a href="https://ai-grinners.online" style="color: #7C3AED; text-decoration: none; font-weight: bold;">
                    View Full Dashboard →
                </a>
            </p>
        </div>
    </body>
    </html>
    """

