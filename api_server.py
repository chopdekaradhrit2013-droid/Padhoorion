"""REST API Server for Padhoorion Verification Service.

Pure Python standard library implementation with zero external dependencies.
Includes endpoints for sending and verifying OTP codes, checking outbox,
plus an embedded developer testing dashboard at http://127.0.0.1:8000.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import logging
import urllib.parse
from typing import Optional

import config
from email_dispatcher import EmailDispatcher
from verification_service import VerificationService

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("PadhoorionAPI")

# Global instances for server lifecycle
dispatcher = EmailDispatcher()
verification_service = VerificationService(dispatcher)


# Embedded Developer UI HTML
DEV_UI_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Padhoorion &bull; Email Verification Service</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: rgba(30, 41, 59, 0.85);
      --card-border: rgba(255, 255, 255, 0.1);
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --primary-glow: rgba(99, 102, 241, 0.35);
      --accent: #06b6d4;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --success: #10b981;
      --error: #ef4444;
      --code-bg: #1e1e2e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: radial-gradient(circle at 10% 20%, #1e1b4b 0%, #0f172a 70%);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 900px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    @media (max-width: 768px) {
      .container { grid-template-columns: 1fr; }
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .header h1 {
      font-size: 2.2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a5b4fc, #818cf8, #38bdf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    .header p {
      color: var(--text-muted);
      margin-top: 6px;
      font-size: 0.95rem;
    }
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    }
    .card h2 {
      font-size: 1.25rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input[type="email"], input[type="text"] {
      width: 100%;
      padding: 12px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      color: var(--text-main);
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    .otp-input {
      letter-spacing: 6px;
      font-size: 1.5rem !important;
      text-align: center;
      font-family: monospace;
      font-weight: bold;
    }
    button {
      width: 100%;
      padding: 12px;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
    }
    button:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .btn-secondary {
      background: #334155;
      margin-top: 8px;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .alert {
      padding: 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-top: 14px;
      display: none;
    }
    .alert.success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      display: block;
    }
    .alert.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      display: block;
    }
    .outbox-feed {
      flex: 1;
      overflow-y: auto;
      max-height: 480px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .email-item {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 14px;
      font-size: 0.85rem;
      border-left: 4px solid var(--accent);
    }
    .email-item .recipient {
      font-weight: 700;
      color: #38bdf8;
    }
    .email-item .badge {
      display: inline-block;
      font-size: 1.1rem;
      font-family: monospace;
      font-weight: 800;
      background: #1e1b4b;
      color: #a5b4fc;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px dashed #6366f1;
      margin: 8px 0;
    }
    .empty-state {
      text-align: center;
      color: var(--text-muted);
      padding: 40px 10px;
      font-size: 0.9rem;
    }
    .badge-sim {
      font-size: 0.75rem;
      padding: 4px 8px;
      background: #065f46;
      color: #6ee7b7;
      border-radius: 12px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Padhoorion</h1>
    <p>Secure Email OTP Dispatch & Verification Service <span class="badge-sim">SIMULATOR ACTIVE</span></p>
  </div>

  <div class="container">
    <!-- Verification Card -->
    <div class="card">
      <h2>🔐 Send & Verify Code</h2>
      
      <!-- Step 1: Input Email -->
      <div id="step-send">
        <div class="form-group">
          <label for="email-input">Target Email Address</label>
          <input type="email" id="email-input" placeholder="user@example.com" autofocus />
        </div>
        <button id="send-btn" onclick="sendCode()">Send Verification Code</button>
      </div>

      <!-- Step 2: Input Code -->
      <div id="step-verify" style="display: none; margin-top: 18px;">
        <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.25); border-radius: 8px; padding: 10px; margin-bottom: 14px; font-size: 0.85rem; color: #a5b4fc;">
          Verification code dispatched to: <b id="active-email"></b>
        </div>
        <div class="form-group">
          <label for="code-input">Enter 6-Digit Verification Code</label>
          <input type="text" id="code-input" class="otp-input" maxlength="6" placeholder="______" />
        </div>
        <button id="verify-btn" onclick="verifyCode()">Confirm & Verify</button>
        <button class="btn-secondary" onclick="resendCode()">Resend Code</button>
        <button class="btn-secondary" onclick="resetForm()">Change Email</button>
      </div>

      <div id="status-box" class="alert"></div>
    </div>

    <!-- Live Outbox Feed Card -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2>📬 Dispatched Emails</h2>
        <button onclick="fetchOutbox()" style="width: auto; padding: 6px 12px; font-size: 0.8rem; background: #334155;">Refresh</button>
      </div>
      <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px;">
        Emails sent to input addresses appear here in development simulator mode.
      </p>
      <div id="outbox-feed" class="outbox-feed">
        <div class="empty-state">No emails dispatched yet. Enter an email on the left to test!</div>
      </div>
    </div>
  </div>

  <script>
    let currentEmail = "";

    function showStatus(text, type) {
      const box = document.getElementById("status-box");
      box.className = "alert " + type;
      box.textContent = text;
      box.style.display = "block";
    }

    async function sendCode() {
      const email = document.getElementById("email-input").value.trim();
      if (!email) {
        showStatus("Please enter an email address.", "error");
        return;
      }
      const btn = document.getElementById("send-btn");
      btn.disabled = true;
      btn.textContent = "Dispatching Code...";

      try {
        const res = await fetch("/api/send-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          currentEmail = data.email;
          document.getElementById("active-email").textContent = currentEmail;
          document.getElementById("step-verify").style.display = "block";
          document.getElementById("code-input").focus();
          showStatus(data.message, "success");
          fetchOutbox();
        } else {
          showStatus(data.message || "Failed to send code.", "error");
        }
      } catch (err) {
        showStatus("Connection error: " + err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Send Verification Code";
      }
    }

    async function resendCode() {
      if (!currentEmail) return;
      document.getElementById("email-input").value = currentEmail;
      await sendCode();
    }

    async function verifyCode() {
      const code = document.getElementById("code-input").value.trim();
      if (!code) {
        showStatus("Please enter the 6-digit verification code.", "error");
        return;
      }
      const btn = document.getElementById("verify-btn");
      btn.disabled = true;
      btn.textContent = "Verifying...";

      try {
        const res = await fetch("/api/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentEmail, code })
        });
        const data = await res.json();
        if (data.success) {
          showStatus("🎉 " + data.message, "success");
        } else {
          showStatus("❌ " + (data.message || "Invalid code"), "error");
        }
      } catch (err) {
        showStatus("Verification error: " + err.message, "error");
      } finally {
        btn.disabled = false;
        btn.textContent = "Confirm & Verify";
      }
    }

    function resetForm() {
      document.getElementById("step-verify").style.display = "none";
      document.getElementById("code-input").value = "";
      document.getElementById("status-box").style.display = "none";
      document.getElementById("email-input").focus();
    }

    async function fetchOutbox() {
      try {
        const res = await fetch("/api/outbox");
        const list = await res.json();
        const container = document.getElementById("outbox-feed");
        if (!list || list.length === 0) {
          container.innerHTML = '<div class="empty-state">No emails dispatched yet.</div>';
          return;
        }
        container.innerHTML = list.slice().reverse().map(e => `
          <div class="email-item">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="recipient">To: ${e.recipient}</span>
              <span style="font-size:0.75rem; color:#94a3b8;">${new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
            <div style="font-size:0.8rem; color:#cbd5e1; margin-top:4px;">${e.subject}</div>
            <div class="badge">CODE: ${e.code}</div>
            <div style="font-size:0.75rem; color:#64748b;">Mode: ${e.mode}</div>
          </div>
        `).join("");
      } catch (err) {
        console.error("Outbox fetch error:", err);
      }
    }

    // Auto-refresh outbox every 4 seconds
    setInterval(fetchOutbox, 4000);
    fetchOutbox();
  </script>
</body>
</html>
"""


class RequestHandler(BaseHTTPRequestHandler):
    """Handles HTTP requests for verification endpoints."""

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def _send_json(self, status_code: int, data: dict):
        response_bytes = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def _send_html(self, html_text: str):
        response_bytes = html_text.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def _read_json_body(self) -> Optional[dict]:
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0:
            return None
        body = self.rfile.read(content_length).decode("utf-8")
        try:
            return json.loads(body)
        except Exception:
            return None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ("/", "/index.html"):
            self._send_html(DEV_UI_HTML)
            return

        if path == "/api/health":
            self._send_json(200, {
                "status": "healthy",
                "service": "Padhoorion Verification API",
                "simulator_mode": dispatcher.simulator_mode,
            })
            return

        if path == "/api/outbox":
            outbox_data = dispatcher.get_outbox()
            self._send_json(200, outbox_data)
            return

        if path == "/api/status":
            query = urllib.parse.parse_qs(parsed.query)
            email = query.get("email", [""])[0]
            if not email:
                self._send_json(400, {"error": "MISSING_EMAIL", "message": "Query parameter 'email' is required."})
                return
            status = verification_service.get_status(email)
            self._send_json(200, status)
            return

        self._send_json(404, {"error": "NOT_FOUND", "message": f"Endpoint '{path}' not found."})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/send-code":
            data = self._read_json_body()
            if not data or "email" not in data:
                self._send_json(400, {"success": False, "error": "MISSING_EMAIL", "message": "Missing 'email' field in request body."})
                return

            email = str(data["email"])
            success, res = verification_service.send_verification_code(email)
            status_code = 200 if success else (429 if res.get("error") == "RATE_LIMITED" else 400)
            self._send_json(status_code, res)
            return

        if path == "/api/verify-code":
            data = self._read_json_body()
            if not data or "email" not in data or "code" not in data:
                self._send_json(400, {"success": False, "error": "MISSING_FIELDS", "message": "Fields 'email' and 'code' are required."})
                return

            email = str(data["email"])
            code = str(data["code"])
            success, res = verification_service.verify_code(email, code)
            status_code = 200 if success else 400
            self._send_json(status_code, res)
            return

        self._send_json(404, {"error": "NOT_FOUND", "message": f"Endpoint '{path}' not found."})

    def log_message(self, format, *args):
        logger.info(f"{self.address_string()} - {format % args}")


def run_server(host: str = config.API_HOST, port: int = config.API_PORT):
    server = HTTPServer((host, port), RequestHandler)
    print("\n" + "=" * 68)
    print(f"🚀 Padhoorion Verification API Server running at http://{host}:{port}")
    print(f"🔗 Developer Testing UI:      http://{host}:{port}/")
    print(f"📨 REST Endpoints:")
    print(f"   • POST http://{host}:{port}/api/send-code")
    print(f"   • POST http://{host}:{port}/api/verify-code")
    print(f"   • GET  http://{host}:{port}/api/outbox")
    print(f"   • GET  http://{host}:{port}/api/status?email=...")
    print("=" * 68 + "\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API server...")
        server.server_close()


if __name__ == "__main__":
    run_server()
