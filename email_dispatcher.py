"""Email dispatching module for Padhoorion.

Supports both a Local Simulator mode (for development and testing)
and real SMTP delivery (Gmail, Outlook, custom SMTP server).
"""

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import json
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import List, Optional

import config

logger = logging.getLogger("PadhoorionEmail")


@dataclass
class DispatchedEmail:
    recipient: str
    subject: str
    code: str
    plain_text: str
    html_content: str
    timestamp: str
    mode: str


class EmailDispatcher:
    """Handles email generation and delivery for verification codes."""

    def __init__(self, simulator_mode: Optional[bool] = None, log_file: str = "simulated_emails.log"):
        self.simulator_mode = simulator_mode if simulator_mode is not None else config.SIMULATOR_MODE
        self.log_file = Path(log_file)
        self.outbox: List[DispatchedEmail] = []

    def build_templates(self, recipient: str, code: str, expiry_minutes: int) -> tuple[str, str, str]:
        """Returns (subject, plain_text, html_content)."""
        subject = f"Your Padhoorion Verification Code: {code}"

        plain_text = (
            f"Hello,\n\n"
            f"You requested a verification code for Padhoorion.\n\n"
            f"Your verification code is: {code}\n\n"
            f"This code will expire in {expiry_minutes} minutes.\n"
            f"If you did not make this request, please disregard this email.\n\n"
            f"— The Padhoorion Team\n"
        )

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{subject}</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 24px;
      color: #1e293b;
    }}
    .container {{
      max-width: 540px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }}
    .header {{
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      padding: 32px 24px;
      text-align: center;
    }}
    .header h1 {{
      margin: 0;
      font-size: 26px;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 6px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }}
    .content {{
      padding: 32px 28px;
      text-align: center;
    }}
    .content p {{
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 20px 0;
    }}
    .otp-box {{
      display: inline-block;
      margin: 16px 0 24px 0;
      padding: 18px 36px;
      background: #f8fafc;
      border: 2px dashed #6366f1;
      border-radius: 10px;
    }}
    .otp-code {{
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4338ca;
    }}
    .expiry {{
      font-size: 13px;
      color: #64748b;
      margin-top: 12px;
    }}
    .footer {{
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 18px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Padhoorion</h1>
      <p>Empowering Your Learning Journey</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Please use the following verification code to confirm your email address (<strong>{recipient}</strong>):</p>
      <div class="otp-box">
        <div class="otp-code">{code}</div>
      </div>
      <p class="expiry">&#9201; This code expires in <strong>{expiry_minutes} minutes</strong>.</p>
      <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If you did not request this verification code, please ignore this email or reach out to support.
      </p>
    </div>
    <div class="footer">
      &copy; {datetime.now().year} Padhoorion Platform &bull; Security Verification Service
    </div>
  </div>
</body>
</html>"""
        return subject, plain_text, html_content

    def send_verification_email(self, recipient: str, code: str, expiry_seconds: int) -> dict:
        """Sends the verification code to the given recipient email address."""
        expiry_minutes = max(1, expiry_seconds // 60)
        subject, plain_text, html_content = self.build_templates(recipient, code, expiry_minutes)
        now_iso = datetime.now(timezone.utc).isoformat()

        record = DispatchedEmail(
            recipient=recipient,
            subject=subject,
            code=code,
            plain_text=plain_text,
            html_content=html_content,
            timestamp=now_iso,
            mode="SIMULATOR" if self.simulator_mode else "SMTP",
        )

        if self.simulator_mode:
            return self._dispatch_simulator(record)
        else:
            return self._dispatch_smtp(record)

    def _dispatch_simulator(self, record: DispatchedEmail) -> dict:
        """Simulates email delivery by logging and formatting in terminal."""
        self.outbox.append(record)

        # Append to log file
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(asdict(record)) + "\n")
        except Exception as e:
            logger.warning(f"Could not write to simulator log file: {e}")

        # Terminal banner display
        banner = (
            "\n"
            + "=" * 68 + "\n"
            + " 📧  [PADHOORION EMAIL SIMULATOR] Outgoing Email Dispatched\n"
            + "=" * 68 + "\n"
            + f"  TO:        {record.recipient}\n"
            + f"  FROM:      {config.SENDER_NAME} <{config.SENDER_EMAIL}>\n"
            + f"  SUBJECT:   {record.subject}\n"
            + f"  TIMESTAMP: {record.timestamp}\n"
            + "-" * 68 + "\n"
            + "  MESSAGE PREVIEW:\n"
            + "  ----------------\n"
            + f"  Your verification code for Padhoorion is:\n\n"
            + f"              ★ ★ ★   [ {record.code} ]   ★ ★ ★\n\n"
            + "  (Enter this code to complete verification)\n"
            + "=" * 68 + "\n"
        )
        print(banner)

        return {
            "success": True,
            "mode": "SIMULATOR",
            "recipient": record.recipient,
            "code": record.code,
            "message": f"Verification code simulated successfully and dispatched to {record.recipient}",
            "timestamp": record.timestamp,
        }

    def _dispatch_smtp(self, record: DispatchedEmail) -> dict:
        """Sends real email via configured SMTP server."""
        if not config.SMTP_USER or not config.SMTP_PASSWORD:
            error_msg = (
                "SMTP configuration missing: SMTP_USER or SMTP_PASSWORD is not set. "
                "Enable SIMULATOR_MODE=true or configure .env credentials."
            )
            logger.error(error_msg)
            return {"success": False, "mode": "SMTP", "error": error_msg}

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = record.subject
            msg["From"] = f"{config.SENDER_NAME} <{config.SENDER_EMAIL or config.SMTP_USER}>"
            msg["To"] = record.recipient

            part1 = MIMEText(record.plain_text, "plain")
            part2 = MIMEText(record.html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            if config.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=15)
            else:
                server = smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=15)
                if config.SMTP_USE_TLS:
                    server.starttls()

            server.login(config.SMTP_USER, config.SMTP_PASSWORD)
            server.sendmail(msg["From"], [record.recipient], msg.as_string())
            server.quit()

            self.outbox.append(record)
            return {
                "success": True,
                "mode": "SMTP",
                "recipient": record.recipient,
                "message": f"Verification email successfully sent to {record.recipient} via SMTP",
                "timestamp": record.timestamp,
            }
        except Exception as e:
            logger.exception("SMTP send failed")
            return {
                "success": False,
                "mode": "SMTP",
                "recipient": record.recipient,
                "error": f"Failed to send email via SMTP: {str(e)}",
            }

    def get_outbox(self) -> List[dict]:
        """Returns the list of dispatched emails."""
        return [asdict(e) for e in self.outbox]

    def get_latest_for_email(self, email: str) -> Optional[dict]:
        """Returns the most recent dispatched email for a recipient."""
        email_clean = email.strip().lower()
        for item in reversed(self.outbox):
            if item.recipient.strip().lower() == email_clean:
                return asdict(item)
        return None
