import type { Metadata } from "next";
import Link from "next/link";

import { seedStarterCategoriesAction } from "@/app/admin/patterns/actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContentStatus, Prisma } from "@/generated/prisma/client";
import { requireAdminSession } from "@/lib/admin/auth";
import { prisma } from "@/lib/db/prisma";

export const metadata: Metadata = {
  title: "图纸管理",
};

type AdminPatternsPageProps = {
  searchParams: Promise<{
    categoryId?: string;
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

export default async function AdminPatternsPage({
  searchParams,
}: AdminPatternsPageProps) {
  await requireAdminSession();

  const { categoryId = "", q = "", status = "all" } = await searchParams;
  const statusFilter = getStatusFilter(status);
  const query = q.trim();
  const where: Prisma.PatternWhereInput = {
    status: statusFilter,
    categoryId: categoryId || undefined,
    OR: query
      ? [
          { title: { contains: query } },
          { slug: { contains: query } },
          { summary: { contains: query } },
        ]
      : undefined,
  };
  const [patterns, categories] = await Promise.all([
    prisma.pattern.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">图纸管理</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              管理图纸草稿、元数据、发布状态、预览图和下载文件。
            </p>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            href="/admin/patterns/new"
          >
            新建图纸
          </Link>
        </div>

        {categories.length === 0 ? (
          <form
            action={seedStarterCategoriesAction}
            className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"
          >
            <p className="text-sm leading-6 text-[var(--muted)]">
              当前还没有分类。先创建基础分类，发布图纸时才能通过校验。
            </p>
            <button
              className="mt-3 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              type="submit"
            >
              创建基础分类
            </button>
          </form>
        ) : null}

        <form className="mt-6 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm md:grid-cols-[1fr_180px_220px_auto]">
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
          <select
            className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            defaultValue={categoryId}
            name="categoryId"
          >
            <option value="">全部分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
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
          <div className="grid grid-cols-[1fr_130px_120px_120px] gap-4 border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            <span>图纸</span>
            <span>状态</span>
            <span>分类</span>
            <span>更新</span>
          </div>
          {patterns.length > 0 ? (
            patterns.map((pattern) => (
              <Link
                className="grid grid-cols-[1fr_130px_120px_120px] gap-4 border-b border-[var(--border)] px-4 py-4 text-sm last:border-b-0 hover:bg-[var(--surface-soft)]"
                href={`/admin/patterns/${pattern.id}`}
                key={pattern.id}
              >
                <span>
                  <span className="block font-semibold">{pattern.title}</span>
                  <span className="mt-1 block text-xs text-[var(--muted)]">
                    /pattern/{pattern.slug} · {pattern.width} x {pattern.height}
                  </span>
                </span>
                <span className="font-semibold">
                  {formatStatus(pattern.status)}
                </span>
                <span>{pattern.category?.name ?? "未分类"}</span>
                <span>{pattern.updatedAt.toLocaleDateString("zh-CN")}</span>
              </Link>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              没有找到图纸。
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
