import os
import smtplib
from dotenv import load_dotenv
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from markdown import markdown

from .models import Meeting

load_dotenv()


class EmailSender:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.example.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "your_email@example.com")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "your_password")
        self.committee_email = os.getenv("COMMITTEE_EMAIL", "committee@community.org")

    def send_minutes_email(self, meeting: Meeting, markdown_content: str) -> bool:
        try:
            html_content = markdown(markdown_content)
            
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"【绿手指】{meeting.title} - 会议纪要"
            msg["From"] = self.smtp_user
            msg["To"] = self.committee_email
            
            text_part = MIMEText(markdown_content, "plain", "utf-8")
            html_part = MIMEText(html_content, "html", "utf-8")
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"会议纪要邮件已发送至 {self.committee_email}")
            return True
        except Exception as e:
            print(f"邮件发送失败: {e}")
            return False
