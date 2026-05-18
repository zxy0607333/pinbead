import type { Metadata } from "next";
import Link from "next/link";

import { seedStarterGuidesAction } from "@/app/admin/guides/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStatus, Prisma } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "教程管理",
};

type AdminGuidesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

function getStatusFilter(status?: string) {
  if (!status || status === "all") {
    return undefined;
  }

  return Object.values(ContentStatus).includes(status as ContentStatus)
    ? (status as ContentStatus)
    : undefined;
}

function formatStatus(status: ContentStatus) {
  const statusLabels: Record<ContentStatus, string> = {
    [ContentStatus.DRAFT]: "草稿",
    [ContentStatus.PUBLISHED]: "已发布",
    [ContentStatus.ARCHIVED]: "已归档",
  };

  return statusLabels[status];
}

export default async function AdminGuidesPage({
  searchParams,
}: AdminGuidesPageProps) {
  await requireAdminSession();

  const { q = "", status = "all" } = await searchParams;
  const query = q.trim();
  const statusFilter = getStatusFilter(status);
  const where: Prisma.GuideWhereInput = {
    status: statusFilter,
    OR: query
      ? [
          { title: { contains: query } },
          { slug: { contains: query } },
          { summary: { contains: query } },
        ]
      : undefined,
  };
  const guides = await prisma.guide.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">教程管理</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              管理教程草稿、SEO 字段和发布状态。
            </p>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            href="/admin/guides/new"
          >
            新建教程
          </Link>
        </div>

        {guides.length === 0 && !query && status === "all" ? (
          <form
            action={seedStarterGuidesAction}
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <p className="text-sm leading-6 text-[var(--muted)]">
              当前还没有教程。可以先按上线计划创建首批 5 篇教程草稿。
            </p>
            <button
              className="mt-3 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              type="submit"
            >
              创建首批教程草稿
            </button>
          </form>
        ) : null}

        <form className="mt-6 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-[1fr_180px_auto]">
          <input
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            defaultValue={query}
            name="q"
            placeholder="搜索标题、slug、摘要"
          />
          <select
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            defaultValue={status}
            name="status"
          >
            <option value="all">全部状态</option>
            {Object.values(ContentStatus).map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {formatStatus(statusOption)}
              </option>
            ))}
          </select>
          <button
            className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            type="submit"
          >
            筛选
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="grid grid-cols-[1fr_130px_120px] gap-4 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            <span>教程</span>
            <span>状态</span>
            <span>更新</span>
          </div>
          {guides.length > 0 ? (
            guides.map((guide) => (
              <Link
                className="grid grid-cols-[1fr_130px_120px] gap-4 border-b border-[var(--border)] px-4 py-4 text-sm last:border-b-0 hover:bg-[var(--surface-soft)]"
                href={`/admin/guides/${guide.id}`}
                key={guide.id}
              >
                <span>
                  <span className="block font-semibold">{guide.title}</span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    /guides/{guide.slug}
                  </span>
                </span>
                <span className="font-semibold">
                  {formatStatus(guide.status)}
                </span>
                <span>{guide.updatedAt.toLocaleDateString("zh-CN")}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              没有找到教程。
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
