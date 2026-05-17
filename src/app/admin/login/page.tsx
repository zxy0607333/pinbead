import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/session";

import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login",
};

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

function getNextPath(next?: string | string[]) {
  const nextPath = Array.isArray(next) ? next[0] : next;

  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin";
  }

  return nextPath;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const { next } = await searchParams;
  const nextPath = getNextPath(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <section className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Pinbead Admin
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Use your administrator account to manage patterns, categories, and
          guides.
        </p>

        <AdminLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
