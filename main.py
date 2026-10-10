"""Main entry point for Padhoorion Verification Service.

Usage:
    python3 main.py                  # Run interactive terminal CLI (default)
    python3 main.py --server         # Run REST API Server with web dashboard
    python3 main.py --send <email>   # Quick dispatch to input email
    python3 main.py --test           # Run automated test suite
"""

import argparse
import sys
import unittest
from cli import run_interactive_cli
from api_server import run_server
from verification_service import VerificationService
from email_dispatcher import EmailDispatcher


def quick_send(email: str):
    """Sends a verification code to the input email and displays status."""
    dispatcher = EmailDispatcher()
    service = VerificationService(dispatcher)
    success, res = service.send_verification_code(email)
    if success:
        print(f"\n✅ Verification code dispatched successfully to: {email}")
        if res.get("code"):
            print(f"🔑 Code: {res['code']} (expires in {res['expires_in_seconds']} seconds)")
    else:
        print(f"\n❌ Failed to dispatch code: {res.get('message')}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Padhoorion Email Verification Service",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--server",
        action="store_true",
        help="Start the REST API server and developer dashboard",
    )
    parser.add_argument(
        "--cli",
        action="store_true",
        help="Start the interactive terminal CLI (default)",
    )
    parser.add_argument(
        "--send",
        metavar="EMAIL",
        help="Immediately send a verification code to the specified email",
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Run unit tests",
    )

    args = parser.parse_args()

    if args.test:
        loader = unittest.TestLoader()
        suite = loader.discover(".", pattern="test_*.py")
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        sys.exit(0 if result.wasSuccessful() else 1)

    if args.send:
        quick_send(args.send)
        return

    if args.server:
        run_server()
        return

    # Default to interactive CLI
    run_interactive_cli()


if __name__ == "__main__":
    main()
