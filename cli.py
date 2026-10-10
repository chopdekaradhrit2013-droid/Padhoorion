"""Interactive Command-Line Interface for Padhoorion Verification.

Allows running an interactive verification flow in the terminal.
"""

import sys
import time
from email_dispatcher import EmailDispatcher
from verification_service import VerificationService
import config


def print_header():
    print("""
======================================================================
     ____            _ _                      _             
    |  _ \\ __ _   __| | |__   ___   ___  _ __(_) ___  _ __  
    | |_) / _` | / _` | '_ \\ / _ \\ / _ \\| '__| |/ _ \\| '_ \\ 
    |  __/ (_| || (_| | | | | (_) | (_) | |  | | (_) | | | |
    |_|   \\__,_| \\__,_|_| |_|\\___/ \\___/|_|  |_|\\___/|_| |_|
               Email Verification System
======================================================================
 Mode: Local Development Simulator (Emails displayed in console)
 Expiry: 5 minutes | Max Attempts: 3 | Cooldown: 30s
======================================================================
""")


def run_interactive_cli():
    print_header()
    dispatcher = EmailDispatcher()
    service = VerificationService(dispatcher)

    while True:
        try:
            print("\n----------------------------------------------------------------------")
            email_input = input("Enter email address to send verification code (or 'q' to quit): ").strip()
            if email_input.lower() in ("q", "quit", "exit"):
                print("\nGoodbye! Thank you for using Padhoorion.")
                break

            if not email_input:
                print("⚠️  Email cannot be empty. Please enter an email.")
                continue

            success, send_res = service.send_verification_code(email_input)
            if not success:
                print(f"❌ Error: {send_res.get('message')}")
                continue

            target_email = send_res["email"]
            print(f"\n✅ {send_res.get('message')}")
            print("⏳ Awaiting code entry...")

            # Verification loop for this email
            while True:
                prompt_text = (
                    f"\nEnter the 6-digit code sent to [{target_email}]\n"
                    f"('r' to resend, 'c' to enter different email, 'q' to quit): "
                )
                user_code = input(prompt_text).strip()

                if user_code.lower() in ("q", "quit"):
                    print("\nGoodbye!")
                    sys.exit(0)

                if user_code.lower() == "c":
                    print("Switching email address...")
                    break

                if user_code.lower() == "r":
                    print(f"Requesting new verification code for {target_email}...")
                    resend_success, resend_res = service.send_verification_code(target_email)
                    if resend_success:
                        print(f"✅ {resend_res.get('message')}")
                    else:
                        print(f"⚠️  {resend_res.get('message')}")
                    continue

                if not user_code:
                    print("⚠️  Please enter a code.")
                    continue

                verify_success, verify_res = service.verify_code(target_email, user_code)
                if verify_success:
                    print("\n" + "=" * 60)
                    print(f"🎉 SUCCESS! Email [{target_email}] has been verified!")
                    print("=" * 60)
                    time.sleep(1)
                    break
                else:
                    print(f"❌ Verification failed: {verify_res.get('message')}")
                    if verify_res.get("error") in ("CODE_EXPIRED", "MAX_ATTEMPTS_EXCEEDED", "NO_CODE_FOUND"):
                        print("👉 Please request a new code or re-enter your email.")
                        break

        except KeyboardInterrupt:
            print("\n\nOperation cancelled by user. Exiting...")
            break


if __name__ == "__main__":
    run_interactive_cli()
