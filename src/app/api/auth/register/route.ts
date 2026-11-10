import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { GRADES } from "@/lib/constants";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const CODE_TTL_MS = 24 * 60 * 60 * 1000;

function createVerificationCode() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, grade, avatarUrl } = body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof grade !== "string"
    ) {
      return NextResponse.json(
        { error: "Username, email, password, and grade are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!GRADES.includes(grade as (typeof GRADES)[number])) {
      return NextResponse.json(
        { error: "Please select a valid grade from 6th to 10th Grade." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const banned = await prisma.bannedEmail.findUnique({ where: { email: cleanEmail } });
    if (banned) {
      return NextResponse.json(
        { error: "This email address is not allowed to register." },
        { status: 403 }
      );
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingByEmail?.isVerified) {
      return NextResponse.json(
        { error: "This email is already registered. Please log in instead." },
        { status: 409 }
      );
    }

    const existingByUsername = await prisma.user.findUnique({ where: { username: cleanUsername } });
    if (existingByUsername && existingByUsername.id !== existingByEmail?.id) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Keep an unverified account's original credentials; registration retries must not
    // silently change its password. The code can be resent from the verification page.
    const code = createVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const user = existingByEmail
      ? await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { verificationToken: code, verificationTokenExpiry: expiresAt },
        })
      : await prisma.user.create({
          data: {
            username: cleanUsername,
            email: cleanEmail,
            passwordHash: await hashPassword(password),
            grade,
            avatarUrl: typeof avatarUrl === "string" && avatarUrl.trim() ? avatarUrl.trim() : null,
            role: "STUDENT",
            isVerified: false,
            verificationToken: code,
            verificationTokenExpiry: expiresAt,
          },
        });

    const emailResult = await sendVerificationEmail({
      to: cleanEmail,
      username: user.username,
      code,
    });

    if (!emailResult.delivered) {
      console.error("Verification email was not delivered:", emailResult.error || "Email provider error");
      return NextResponse.json(
        {
          error: "Your account was created, but the verification email could not be sent. Check the email settings and try resending the code.",
          requiresVerification: true,
          email: cleanEmail,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: "A verification code has been sent to your email address.",
        requiresVerification: true,
        email: cleanEmail,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}
