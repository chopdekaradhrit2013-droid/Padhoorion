import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptPassword } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Fetch all user accounts from the database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        password: true, // Fetching the stored value to decode
        role: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    // 2. Loop through and decode each record back into raw human-readable string text
    const decryptedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      plainTextPassword: decryptPassword(user.password), 
    }));

    return NextResponse.json(decryptedUsers, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred fetching credentials.' },
      { status: 500 }
    );
  }
}
