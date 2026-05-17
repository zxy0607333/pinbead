import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getPublishedGuideBySlug,
  getPublishedGuideSummaries,
} from "@/lib/db/guides";

export const dynamic = "force-dynamic";

type GuidePageProps = {
  params: Promise<{
    guideSlug: string;
  }>;
};

type GuideContentBlock =
  | {
      items: string[];
      type: "list";
    }
  | {
      text: string;
      type: "paragraph";
    };

const internalGuideLinks: Record<string, string> = {
  "/convert": "image converter",
  "/editor": "Pinbead editor",
  "/patterns": "pattern library",
};

function formatGuideDate(date: Date | null) {
  return date
    ? date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Updated recently";
}

function parseGuideContent(content: string) {
  const blocks: GuideContentBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      type: "list",
      items: listItems,
    });
    listItems = [];
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function GuideInlineText({ text }: { text: string }) {
  const parts = text.split(/(\/editor|\/convert|\/patterns)/g);

  return (
    <>
      {parts.map((part, index) => {
        const label = internalGuideLinks[part];

        if (!label) {
          return part;
        }

        return (
          <Link
            className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
            href={part}
            key={`${part}-${index}`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

function GuideContent({ content }: { content: string | null }) {
  const blocks = parseGuideContent(content ?? "");

  if (blocks.length === 0) {
    return (
      <p className="text-base leading-8 text-[var(--muted)]">
        This guide is being expanded with step-by-step notes and examples.
      </p>
    );
  }

  return (
    <div className="grid gap-5">
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p className="text-base leading-8 text-[var(--muted)]" key={index}>
            <GuideInlineText text={block.text} />
          </p>
        ) : (
          <ul
            className="grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-sm leading-6 text-[var(--muted)]"
            key={index}
          >
            {block.items.map((item, itemIndex) => (
              <li className="flex gap-3" key={`${item}-${itemIndex}`}>
                <span
                  aria-hidden="true"
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]"
                />
                <span>
                  <GuideInlineText text={item} />
                </span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { guideSlug } = await params;
  const guide = await getPublishedGuideBySlug(guideSlug);

  if (!guide) {
    return {
      title: "Guide Not Found",
      robots: {
        follow: false,
        index: false,
      },
    };
  }

  return {
    title: guide.seoTitle ?? guide.title,
    description:
      guide.seoDescription ??
      guide.summary ??
      `Read ${guide.title}, a bead pattern guide from Pinbead.`,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { guideSlug } = await params;
  const guide = await getPublishedGuideBySlug(guideSlug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = (await getPublishedGuideSummaries())
    .filter((relatedGuide) => relatedGuide.slug !== guide.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[var(--background)] px-5 py-6 text-[var(--foreground)] md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <Link
            className="text-[var(--foreground)] hover:text-[var(--accent)]"
            href="/"
          >
            Pinbead
          </Link>
          <span>/</span>
          <Link className="hover:text-[var(--accent)]" href="/guides">
            Guides
          </Link>
        </nav>

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Pinbead guide
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
              {guide.title}
            </h1>
            {guide.summary ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {guide.summary}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-[var(--muted)]">
              {formatGuideDate(guide.publishedAt)}
            </p>
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Make while you read</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Keep the editor, converter, and pattern library close while you
              follow the guide.
            </p>
            <div className="mt-5 grid gap-2">
              <Link
                className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                href="/editor"
              >
                Open editor
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/convert"
              >
                Convert image
              </Link>
              <Link
                className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                href="/patterns"
              >
                Browse patterns
              </Link>
            </div>
          </aside>
        </section>

        <section className="grid gap-8 border-y border-[var(--border)] py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm md:p-8">
            <GuideContent content={guide.content} />
          </article>

          <aside className="grid content-start gap-4">
            {[
              ["Best for", "New bead makers and pattern editors"],
              ["Tools", "Editor, converter, printable charts"],
              ["Next step", "Open a pattern and adjust it yourself"],
            ].map(([label, value]) => (
              <div
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
                key={label}
              >
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {label}
                </p>
                <p className="mt-2 text-base font-semibold">{value}</p>
              </div>
            ))}
          </aside>
        </section>

        {relatedGuides.length > 0 ? (
          <section className="py-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Related guides</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Continue learning with more Pinbead tutorials.
                </p>
              </div>
              <Link
                className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                href="/guides"
              >
                View all guides
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--accent)]"
                  href={`/guides/${relatedGuide.slug}`}
                  key={relatedGuide.id}
                >
                  <h3 className="text-lg font-semibold">
                    {relatedGuide.title}
                  </h3>
                  {relatedGuide.summary ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {relatedGuide.summary}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
