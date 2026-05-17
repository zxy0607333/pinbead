import Link from "next/link";

import { siteConfig } from "@/lib/site";

type LegalSection = {
  body?: string[];
  items?: string[];
  title: string;
};

export function LegalPage({
  children,
  description,
  sections,
  title,
}: Readonly<{
  children?: React.ReactNode;
  description: string;
  sections: LegalSection[];
  title: string;
}>) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <Link
            className="text-[var(--foreground)] hover:text-[var(--accent)]"
            href="/"
          >
            {siteConfig.name}
          </Link>
          <span>/</span>
          <span>{title}</span>
        </nav>

        <section className="py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
            {description}
          </p>
          <p className="mt-4 text-sm font-semibold text-[var(--muted)]">
            Effective date: May 17, 2026
          </p>
        </section>

        {children ? <div className="mb-6">{children}</div> : null}

        <article className="grid gap-5 pb-12">
          {sections.map((section) => (
            <section
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              key={section.title}
            >
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p
                  className="mt-4 text-sm leading-7 text-[var(--muted)]"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
              {section.items ? (
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--muted)]">
                  {section.items.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
