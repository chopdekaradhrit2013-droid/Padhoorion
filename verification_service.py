"""Core OTP Verification Service for Padhoorion.

Handles generation, timing, security rate limits, and verification of codes.
"""

from dataclasses import dataclass
import hmac
import re
import secrets
import time
from typing import Dict, Optional, Tuple

import config
from email_dispatcher import EmailDispatcher

# RFC 5322 compatible regex for email validation
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)


@dataclass
class OTPRecord:
    email: str
    code: str
    created_at: float
    expires_at: float
    attempts_left: int
    verified: bool = False


class VerificationService:
    """Service to issue and verify OTP codes for user email addresses."""

    def __init__(self, dispatcher: Optional[EmailDispatcher] = None):
        self.dispatcher = dispatcher or EmailDispatcher()
        self.records: Dict[str, OTPRecord] = {}

    @staticmethod
    def normalize_email(email: str) -> str:
        """Strips whitespace and converts email to lowercase."""
        return email.strip().lower()

    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Validates email format."""
        if not email or len(email) > 254:
            return False
        return bool(EMAIL_REGEX.match(email))

    @staticmethod
    def generate_code(length: int = 6) -> str:
        """Generates a cryptographically secure numeric OTP of given length."""
        # Use secrets for cryptographically secure random numbers
        max_value = 10 ** length
        code_int = secrets.randbelow(max_value)
        return f"{code_int:0{length}d}"

    def send_verification_code(self, email: str) -> Tuple[bool, dict]:
        """Validates email, generates OTP, and dispatches to the input email.

        Returns (success_boolean, response_data_dict).
        """
        normalized = self.normalize_email(email)

        if not self.is_valid_email(normalized):
            return False, {
                "success": False,
                "error": "INVALID_EMAIL",
                "message": f"'{email}' is not a valid email address.",
            }

        now = time.time()
        existing = self.records.get(normalized)

        # Check resend cooldown
        if existing and (now - existing.created_at) < config.RESEND_COOLDOWN_SECONDS:
            remaining = int(config.RESEND_COOLDOWN_SECONDS - (now - existing.created_at))
            return False, {
                "success": False,
                "error": "RATE_LIMITED",
                "message": f"Please wait {remaining} seconds before requesting a new code.",
                "cooldown_remaining": remaining,
            }

        # Generate new OTP
        code = self.generate_code(config.OTP_LENGTH)
        expires_at = now + config.OTP_EXPIRY_SECONDS

        record = OTPRecord(
            email=normalized,
            code=code,
            created_at=now,
            expires_at=expires_at,
            attempts_left=config.MAX_ATTEMPTS,
            verified=False,
        )
        self.records[normalized] = record

        # Dispatch email
        dispatch_result = self.dispatcher.send_verification_email(
            recipient=normalized,
            code=code,
            expiry_seconds=config.OTP_EXPIRY_SECONDS,
        )

        return True, {
            "success": True,
            "message": f"Verification code successfully sent to {normalized}",
            "email": normalized,
            "expires_in_seconds": config.OTP_EXPIRY_SECONDS,
            "max_attempts": config.MAX_ATTEMPTS,
            "dispatch_mode": dispatch_result.get("mode", "UNKNOWN"),
            # For developer simulator mode, include code in payload for convenience
            "code": code if self.dispatcher.simulator_mode else None,
        }

    def verify_code(self, email: str, user_code: str) -> Tuple[bool, dict]:
        """Validates the input code against the record for the given email.

        Returns (success_boolean, response_data_dict).
        """
        normalized = self.normalize_email(email)
        cleaned_code = user_code.strip()

        if not self.is_valid_email(normalized):
            return False, {
                "success": False,
                "error": "INVALID_EMAIL",
                "message": f"'{email}' is not a valid email address.",
            }

        if not cleaned_code:
            return False, {
                "success": False,
                "error": "EMPTY_CODE",
                "message": "Verification code cannot be empty.",
            }

        record = self.records.get(normalized)
        if not record:
            return False, {
                "success": False,
                "error": "NO_CODE_FOUND",
                "message": f"No active verification code found for {normalized}. Please request one first.",
            }

        if record.verified:
            return False, {
                "success": False,
                "error": "ALREADY_VERIFIED",
                "message": f"Email {normalized} has already been verified.",
            }

        now = time.time()
        if now > record.expires_at:
            # Code expired
            del self.records[normalized]
            return False, {
                "success": False,
                "error": "CODE_EXPIRED",
                "message": "The verification code has expired. Please request a new code.",
            }

        if record.attempts_left <= 0:
            del self.records[normalized]
            return False, {
                "success": False,
                "error": "MAX_ATTEMPTS_EXCEEDED",
                "message": "Maximum verification attempts exceeded. Code invalidated. Please request a new code.",
            }

        # Constant-time comparison to prevent timing attacks
        is_match = hmac.compare_digest(record.code, cleaned_code)

        if is_match:
            record.verified = True
            return True, {
                "success": True,
                "message": f"Email {normalized} successfully verified!",
                "email": normalized,
            }
        else:
            record.attempts_left -= 1
            attempts_left = record.attempts_left

            if attempts_left <= 0:
                del self.records[normalized]
                return False, {
                    "success": False,
                    "error": "MAX_ATTEMPTS_EXCEEDED",
                    "message": "Incorrect code. Maximum attempts exceeded. Please request a new code.",
                    "attempts_left": 0,
                }

            return False, {
                "success": False,
                "error": "INVALID_CODE",
                "message": f"Incorrect verification code. {attempts_left} attempt(s) remaining.",
                "attempts_left": attempts_left,
            }

    def get_status(self, email: str) -> dict:
        """Inspects status of verification for an email address."""
        normalized = self.normalize_email(email)
        record = self.records.get(normalized)
        if not record:
            return {"exists": False, "email": normalized}

        now = time.time()
        is_expired = now > record.expires_at
        remaining_seconds = max(0, int(record.expires_at - now))

        return {
            "exists": True,
            "email": normalized,
            "verified": record.verified,
            "is_expired": is_expired,
            "expires_in_seconds": remaining_seconds,
            "attempts_left": record.attempts_left,
        }
