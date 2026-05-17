"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/lib/site";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/copyright", label: "Copyright / DMCA" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const shouldHide =
    pathname === "/editor" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/uploads");

  if (shouldHide) {
    return null;
  }

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-[var(--foreground)] md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link className="text-lg font-semibold" href="/">
            {siteConfig.name}
          </Link>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
            Printable bead pattern tools, guides, and library pages for makers.
          </p>
        </div>
        <nav
          aria-label="Legal navigation"
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[var(--muted)]"
        >
          {footerLinks.map((link) => (
            <Link
              className="hover:text-[var(--accent)]"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
