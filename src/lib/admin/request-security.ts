import { headers } from "next/headers";

export async function assertSameOriginRequest() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!origin || !host) {
    return;
  }

  if (new URL(origin).host !== host) {
    throw new Error("Invalid request origin.");
  }
}

export async function getAdminLoginRateLimitKey(email: string) {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? "unknown";

  return `${ip}:${email.toLowerCase()}`;
}
