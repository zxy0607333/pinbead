"use server";

import { redirect } from "next/navigation";

import { authenticateAdmin } from "@/lib/admin/auth";
import {
  clearAdminLoginAttempts,
  isAdminLoginRateLimited,
  recordFailedAdminLogin,
} from "@/lib/admin/rate-limit";
import {
  assertSameOriginRequest,
  getAdminLoginRateLimitKey,
} from "@/lib/admin/request-security";
import { clearAdminSession, setAdminSession } from "@/lib/admin/session";

export type AdminLoginActionState = {
  error?: string;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getSafeNextPath(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}

export async function loginAdminAction(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  try {
    await assertSameOriginRequest();
  } catch {
    return {
      error: "This login request could not be verified.",
    };
  }

  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const nextPath = getSafeNextPath(getFormValue(formData, "next"));

  if (!email || !password) {
    return {
      error: "Enter your admin email and password.",
    };
  }

  const rateLimitKey = await getAdminLoginRateLimitKey(email);

  if (isAdminLoginRateLimited(rateLimitKey)) {
    return {
      error: "Too many failed login attempts. Try again later.",
    };
  }

  let adminUser: Awaited<ReturnType<typeof authenticateAdmin>>;

  try {
    adminUser = await authenticateAdmin(email, password);
  } catch {
    return {
      error: "Admin login is temporarily unavailable.",
    };
  }

  if (!adminUser) {
    recordFailedAdminLogin(rateLimitKey);
    return {
      error: "Invalid admin email or password.",
    };
  }

  clearAdminLoginAttempts(rateLimitKey);
  await setAdminSession(adminUser);
  redirect(nextPath);
}

export async function logoutAdminAction() {
  await assertSameOriginRequest();
  await clearAdminSession();
  redirect("/admin/login");
}
