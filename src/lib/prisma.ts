import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function getDatabaseUrl(): string {
  // On Vercel serverless lambda, filesystem is read-only except /tmp
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
      return `file:${tmpDbPath}`;
    } catch (e) {
      console.warn("Notice: could not copy dev.db to /tmp:", e);
    }
  }

  // If DATABASE_URL is set and starts with file:
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
    // If it is a relative path like file:./dev.db, resolve it to prisma/dev.db
    const rawPath = process.env.DATABASE_URL.replace("file:", "");
    if (!path.isAbsolute(rawPath)) {
      const resolved = path.join(process.cwd(), "prisma", path.basename(rawPath));
      return `file:${resolved}`;
    }
    return process.env.DATABASE_URL;
  }

  const defaultDbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${defaultDbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
