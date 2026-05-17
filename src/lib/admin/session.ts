import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const adminSessionCookieName = "pinbead_admin_session";

type AdminSessionPayload = {
  email: string;
  exp: number;
  sub: string;
};

function getAdminSessionMaxAge() {
  const configuredMaxAge = Number(process.env.ADMIN_SESSION_MAX_AGE);

  if (Number.isFinite(configuredMaxAge) && configuredMaxAge > 0) {
    return configuredMaxAge;
  }

  return 60 * 60 * 24 * 7;
}

function getAdminSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }

  return "pinbead-development-session-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("base64url");
}

function createAdminSessionToken(payload: AdminSessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyAdminSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as unknown;

  if (!isAdminSessionPayload(payload)) {
    return null;
  }

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function isAdminSessionPayload(
  payload: unknown,
): payload is AdminSessionPayload {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const sessionPayload = payload as Partial<AdminSessionPayload>;

  return (
    typeof sessionPayload.sub === "string" &&
    typeof sessionPayload.email === "string" &&
    typeof sessionPayload.exp === "number"
  );
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    return verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}

export async function setAdminSession({
  email,
  id,
}: {
  email: string;
  id: string;
}) {
  const maxAge = getAdminSessionMaxAge();
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  const token = createAdminSessionToken({
    sub: id,
    email,
    exp: expiresAt,
  });
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, token, {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(adminSessionCookieName);
}
