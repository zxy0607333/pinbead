"use server";

import { redirect } from "next/navigation";

import { authenticateAdmin, createFirstAdmin } from "@/lib/admin/auth";
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

export type AdminSetupActionState = {
  error?: string;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getSafeNextPath(value: string) {
  if (
    !value.startsWith("/admin") ||
    value.startsWith("/admin/login") ||
    value.startsWith("/admin/setup")
  ) {
    return "/admin";
  }

  return value;
}

function isValidAdminEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loginAdminAction(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  try {
    await assertSameOriginRequest();
  } catch {
    return {
      error: "登录请求校验失败，请刷新页面后重试。",
    };
  }

  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const nextPath = getSafeNextPath(getFormValue(formData, "next"));

  if (!email || !password) {
    return {
      error: "请输入管理员邮箱和密码。",
    };
  }

  const rateLimitKey = await getAdminLoginRateLimitKey(email);

  if (isAdminLoginRateLimited(rateLimitKey)) {
    return {
      error: "登录失败次数过多，请稍后再试。",
    };
  }

  let adminUser: Awaited<ReturnType<typeof authenticateAdmin>>;

  try {
    adminUser = await authenticateAdmin(email, password);
  } catch {
    return {
      error: "后台登录暂时不可用，请稍后再试。",
    };
  }

  if (!adminUser) {
    recordFailedAdminLogin(rateLimitKey);
    return {
      error: "管理员邮箱或密码不正确。",
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

export async function setupFirstAdminAction(
  _previousState: AdminSetupActionState,
  formData: FormData,
): Promise<AdminSetupActionState> {
  try {
    await assertSameOriginRequest();
  } catch {
    return {
      error: "初始化请求校验失败，请刷新页面后重试。",
    };
  }

  const email = getFormValue(formData, "email").trim().toLowerCase();
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirmPassword");

  if (!email || !password || !confirmPassword) {
    return {
      error: "请输入邮箱和密码。",
    };
  }

  if (!isValidAdminEmail(email)) {
    return {
      error: "请输入有效的管理员邮箱。",
    };
  }

  if (password.length < 12) {
    return {
      error: "密码至少需要 12 个字符。",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "两次输入的密码不一致。",
    };
  }

  const rateLimitKey = await getAdminLoginRateLimitKey(email);

  if (isAdminLoginRateLimited(rateLimitKey)) {
    return {
      error: "初始化尝试次数过多，请稍后再试。",
    };
  }

  let adminUser: Awaited<ReturnType<typeof createFirstAdmin>>;

  try {
    adminUser = await createFirstAdmin({ email, password });
  } catch (error) {
    recordFailedAdminLogin(rateLimitKey);
    return {
      error:
        error instanceof Error
          ? error.message
          : "主号创建失败。",
    };
  }

  clearAdminLoginAttempts(rateLimitKey);
  await setAdminSession(adminUser);
  redirect("/admin");
}
