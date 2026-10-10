"""Unit tests for Padhoorion Verification Service."""

import time
import unittest
from email_dispatcher import EmailDispatcher
from verification_service import VerificationService
import config


class TestVerificationService(unittest.TestCase):

    def setUp(self):
        # Fresh dispatcher and service in simulator mode for each test
        self.dispatcher = EmailDispatcher(simulator_mode=True)
        self.service = VerificationService(self.dispatcher)

    def test_email_validation(self):
        self.assertTrue(self.service.is_valid_email("student@padhoorion.com"))
        self.assertTrue(self.service.is_valid_email("user.name+tag@sub.domain.org"))
        self.assertFalse(self.service.is_valid_email("invalid-email"))
        self.assertFalse(self.service.is_valid_email("@missinguser.com"))
        self.assertFalse(self.service.is_valid_email("user@no-tld"))
        self.assertFalse(self.service.is_valid_email(""))

    def test_send_and_verify_success(self):
        email = "adhrit@padhoorion.com"
        success, res = self.service.send_verification_code(email)
        self.assertTrue(success)
        self.assertEqual(res["email"], email)

        # Retrieve the code
        record = self.service.records[email]
        self.assertEqual(len(record.code), config.OTP_LENGTH)
        self.assertTrue(record.code.isdigit())

        # Verify with the exact code
        verify_success, verify_res = self.service.verify_code(email, record.code)
        self.assertTrue(verify_success)
        self.assertTrue(self.service.records[email].verified)

    def test_verify_wrong_code_and_lockout(self):
        email = "test@example.com"
        self.service.send_verification_code(email)
        record = self.service.records[email]
        real_code = record.code
        wrong_code = "999999" if real_code != "999999" else "000000"

        # Attempt 1: wrong code
        success, res = self.service.verify_code(email, wrong_code)
        self.assertFalse(success)
        self.assertEqual(res["attempts_left"], 2)

        # Attempt 2: wrong code
        success, res = self.service.verify_code(email, wrong_code)
        self.assertFalse(success)
        self.assertEqual(res["attempts_left"], 1)

        # Attempt 3: wrong code -> lockout
        success, res = self.service.verify_code(email, wrong_code)
        self.assertFalse(success)
        self.assertEqual(res["error"], "MAX_ATTEMPTS_EXCEEDED")
        self.assertNotIn(email, self.service.records)

    def test_expired_code(self):
        email = "expired@example.com"
        self.service.send_verification_code(email)
        record = self.service.records[email]
        # Simulate expiry
        record.expires_at = time.time() - 1

        success, res = self.service.verify_code(email, record.code)
        self.assertFalse(success)
        self.assertEqual(res["error"], "CODE_EXPIRED")

    def test_resend_cooldown(self):
        email = "cooldown@example.com"
        # First send
        success1, _ = self.service.send_verification_code(email)
        self.assertTrue(success1)

        # Immediate resend should be rate limited
        success2, res2 = self.service.send_verification_code(email)
        self.assertFalse(success2)
        self.assertEqual(res2["error"], "RATE_LIMITED")

    def test_simulator_outbox_contains_recipient(self):
        email = "learner@padhoorion.org"
        self.service.send_verification_code(email)
        outbox = self.dispatcher.get_outbox()
        self.assertGreaterEqual(len(outbox), 1)
        latest = self.dispatcher.get_latest_for_email(email)
        self.assertIsNotNone(latest)
        self.assertEqual(latest["recipient"], email)
        self.assertEqual(latest["mode"], "SIMULATOR")


if __name__ == "__main__":
    unittest.main()
