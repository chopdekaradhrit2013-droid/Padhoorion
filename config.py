"""Configuration for Padhoorion Verification Service."""

import os
from pathlib import Path


def load_env_file(filepath: str = ".env") -> None:
    """Lightweight .env loader without third-party dependencies."""
    env_path = Path(filepath)
    if not env_path.is_file():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("\"'")
                    if key and key not in os.environ:
                        os.environ[key] = val
    except Exception:
        pass


# Load local .env if present
load_env_file()

# Core OTP Settings
SIMULATOR_MODE: bool = os.getenv("SIMULATOR_MODE", "true").lower() in ("true", "1", "yes")
OTP_LENGTH: int = int(os.getenv("OTP_LENGTH", "6"))
OTP_EXPIRY_SECONDS: int = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))  # 5 minutes
MAX_ATTEMPTS: int = int(os.getenv("MAX_ATTEMPTS", "3"))
RESEND_COOLDOWN_SECONDS: int = int(os.getenv("RESEND_COOLDOWN_SECONDS", "30"))

# Email Sender Information
SENDER_NAME: str = os.getenv("SENDER_NAME", "Padhoorion Security")
SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "noreply@padhoorion.com")

# SMTP Settings (Optional, active when SIMULATOR_MODE is False)
SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")

# API Server Settings
API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
API_PORT: int = int(os.getenv("API_PORT", "8000"))
