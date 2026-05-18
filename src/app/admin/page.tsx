import type { Metadata } from "next";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "后台",
};

const adminSections = [
  {
    href: "/admin/patterns",
    title: "图纸管理",
    text: "创建草稿、维护图纸元数据、上传预览图，并发布到公开图库。",
    status: "进行中",
  },
  {
    href: "/admin",
    title: "分类管理",
    text: "维护公开图纸库的 SEO 分类。当前先通过图纸管理页创建基础分类。",
    status: "未开始",
  },
  {
    href: "/admin/guides",
    title: "教程管理",
    text: "准备教程草稿、SEO 字段和发布状态，用于承接长尾搜索。",
    status: "进行中",
  },
];

export default async function AdminPage() {
  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold">内容后台</h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              这里用于管理 Pinbead 的图纸库、分类和教程内容。只有发布后的内容才会进入公开页面和 sitemap。
            </p>
          </div>
          <Link
            className="rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            href="/admin/patterns/new"
          >
            新建图纸
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {adminSections.map((section) => (
            <Link
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
              href={section.href}
              key={section.title}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                {section.status}
              </span>
              <h2 className="mt-3 text-xl font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {section.text}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
