import { redirect } from "next/navigation";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

import { getAdminSession } from "./session";
import { hashAdminPassword, verifyAdminPassword } from "./password";

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hasAdminUsers() {
  const adminUserCount = await prisma.adminUser.count();

  return adminUserCount > 0;
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

  return null;
}

export async function createFirstAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeAdminEmail(email);
  const passwordHash = await hashAdminPassword(password);

  return prisma.$transaction(
    async (tx) => {
      const adminUserCount = await tx.adminUser.count();

      if (adminUserCount > 0) {
        throw new Error("主号已经创建，不能重复初始化。");
      }

      return tx.adminUser.create({
        data: {
          email: normalizedEmail,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
