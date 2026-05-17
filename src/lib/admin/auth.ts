import { redirect } from "next/navigation";

import { prisma } from "@/lib/db/prisma";

import { getAdminSession } from "./session";
import { verifyAdminPassword } from "./password";

function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

async function bootstrapAdminFromEnv(email: string, password: string) {
  const envEmail = normalizeAdminEmail(process.env.ADMIN_EMAIL ?? "");
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!envEmail || !envPasswordHash || normalizeAdminEmail(email) !== envEmail) {
    return null;
  }

  const isValidPassword = await verifyAdminPassword(password, envPasswordHash);

  if (!isValidPassword) {
    return null;
  }

  return prisma.adminUser.upsert({
    where: {
      email: envEmail,
    },
    create: {
      email: envEmail,
      passwordHash: envPasswordHash,
    },
    update: {
      passwordHash: envPasswordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = normalizeAdminEmail(email);
  const adminUser = await prisma.adminUser.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (adminUser) {
    const isValidPassword = await verifyAdminPassword(
      password,
      adminUser.passwordHash,
    );

    if (!isValidPassword) {
      return null;
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
    };
  }

  return bootstrapAdminFromEnv(normalizedEmail, password);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
