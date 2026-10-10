# Padhoorion Email Verification Service

A secure, standalone Python service for generating and dispatching one-time verification codes (OTP) directly to any user-provided email address.

Built with **Python standard libraries** (zero external dependencies required).

---

## Features

- **Dynamic Recipient Dispatch**: The verification code is generated and dispatched to whichever email address the user inputs.
- **Local Development Simulator**: Enabled by default (`SIMULATOR_MODE=true`). Dispatched emails with code, timestamps, and formatting are printed to the console and stored in a local outbox log without needing real SMTP credentials.
- **Seamless Real SMTP Support**: Switch to real delivery (e.g., Gmail, Outlook, custom SMTP) simply by configuring `.env`.
- **Cryptographically Secure OTP**: 6-digit cryptographically secure random codes using Python's `secrets` module.
- **Timing Attack Prevention**: Uses constant-time `hmac.compare_digest` for verification.
- **Anti-Abuse Protections**:
  - Expiration timer (5 minutes default)
  - Rate limiting & resend cooldown (30 seconds)
  - Max attempt protection (locks and invalidates after 3 failed attempts)
- **Zero External Dependencies**: Works out-of-the-box on Python 3.10+.

---

## Quick Start

### 1. Interactive Terminal CLI
Run the interactive CLI where you can type an email, receive the verification code in the simulator, and verify it:

```bash
python3 main.py
```

### 2. One-Shot Quick Send
Send a verification code directly to any email address:

```bash
python3 main.py --send user@example.com
```

### 3. REST API Server & Developer Web Dashboard
Start the local HTTP REST server:

```bash
python3 main.py --server
```

Open your browser to:
- **Developer Test Dashboard**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Live Outbox Feed**: [http://127.0.0.1:8000/api/outbox](http://127.0.0.1:8000/api/outbox)

### 4. Run Automated Unit Tests
```bash
python3 main.py --test
```

---

## REST API Endpoints

### 1. Send Verification Code
**`POST /api/send-code`**

Request:
```json
{
  "email": "student@padhoorion.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Verification code successfully sent to student@padhoorion.com",
  "email": "student@padhoorion.com",
  "expires_in_seconds": 300,
  "max_attempts": 3,
  "dispatch_mode": "SIMULATOR",
  "code": "418923"
}
```

### 2. Verify Code
**`POST /api/verify-code`**

Request:
```json
{
  "email": "student@padhoorion.com",
  "code": "418923"
}
```

Response:
```json
{
  "success": true,
  "message": "Email student@padhoorion.com successfully verified!",
  "email": "student@padhoorion.com"
}
```

### 3. Get Dispatched Outbox
**`GET /api/outbox`**

Returns a list of all emails sent during the current session.

---

## Configuration

Copy `.env.example` to `.env` to customize settings:

```ini
# Simulator vs SMTP
SIMULATOR_MODE=true

# Security Settings
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
MAX_ATTEMPTS=3
RESEND_COOLDOWN_SECONDS=30

# Sender Details
SENDER_NAME=Padhoorion Security
SENDER_EMAIL=noreply@padhoorion.com

# SMTP Settings (if SIMULATOR_MODE=false)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=true
```
