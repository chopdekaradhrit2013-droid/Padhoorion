import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { GRADES } from "@/lib/constants";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, grade, avatarUrl } = body;

    // Validation
    if (!username || !email || !password || !grade) {
      return NextResponse.json(
        { error: "Username, email, password, and grade are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!GRADES.includes(grade as any)) {
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
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername } },
          { email: { equals: email.toLowerCase().trim() } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return NextResponse.json(
          { error: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Email address is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: email.toLowerCase().trim(),
        passwordHash,
        grade,
        avatarUrl: avatarUrl || null,
        role: "STUDENT",
        isVerified: false,
        verificationToken,
      },
      select: {
        id: true,
        username: true,
        email: true,
        grade: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
      },
    });

    // Create session token
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      grade: user.grade,
    });

    const response = NextResponse.json(
      {
        message: "Registration successful! Welcome to PadhoOrion.",
        user,
        verificationToken,
      },
      { status: 201 }
    );

    // Set HTTP-only session cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user. Please try again." },
      { status: 500 }
    );
  }
}

