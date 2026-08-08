import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from flask import current_app


def send_verification_email(user, token):
    """Send the email-verification link to a user.

    Reads SMTP settings from environment variables. When SMTP is not
    configured (e.g. during development/demos), no email is sent; the
    caller falls back to displaying the link directly.
    """
    base_url = current_app.config.get(
        "FRONTEND_URL",
        "http://localhost:5173"
    )
    link = f"{base_url}/verify-email/{token}"

    host = os.getenv("MAIL_SERVER")
    port = int(os.getenv("MAIL_PORT", "587"))
    sender = os.getenv("MAIL_USERNAME")
    password = os.getenv("MAIL_PASSWORD")

    # No SMTP configured — demo mode. Return link instead of sending.
    if not host or not sender:
        return {"sent": False, "link": link}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Verify your RLMS account"
    msg["From"] = sender
    msg["To"] = user.email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2 style="color: #1d4ed8;">Verify your email</h2>
        <p>Hi {user.full_name},</p>
        <p>Click the button below to verify your account email:</p>
        <p>
          <a href="{link}"
             style="background:#1d4ed8;color:#fff;padding:12px 24px;
                    border-radius:8px;text-decoration:none;display:inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy this link: <a href="{link}">{link}</a></p>
        <p>If you didn't create an account, you can ignore this email.</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, user.email, msg.as_string())
        return {"sent": True, "link": link}
    except Exception:
        current_app.logger.exception(
            "Failed to send verification email"
        )
        return {"sent": False, "link": link}
