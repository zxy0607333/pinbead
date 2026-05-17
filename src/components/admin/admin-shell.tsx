import Link from "next/link";

import { logoutAdminAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/auth";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/patterns", label: "Patterns" },
  { href: "/admin/guides", label: "Guides" },
];

export async function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <Link
              className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]"
              href="/admin"
            >
              Pinbead Admin
            </Link>
            <p className="mt-1 text-sm text-[var(--muted)]">{session.email}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {adminNavItems.map((item) => (
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
            <form action={logoutAdminAction}>
              <button
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
