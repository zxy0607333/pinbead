import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { hasAdminUsers } from "@/lib/admin/auth";
import { getAdminSession } from "@/lib/admin/session";

import { AdminSetupForm } from "./setup-form";

export const metadata: Metadata = {
  title: "创建主号",
};

export default async function AdminSetupPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  if (await hasAdminUsers()) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <section className="w-full max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          Pinbead 后台
        </p>
        <h1 className="mt-3 text-2xl font-semibold">创建后台主号</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          这个页面只会在数据库里还没有管理员时开放。创建成功后，该账号就是当前 Pinbead 实例的主号。
        </p>

        <AdminSetupForm />
      </section>
    </main>
  );
}
