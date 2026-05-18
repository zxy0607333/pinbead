"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { ContentStatus } from "@/generated/prisma/enums";

type GuideFormState = {
  error?: string;
  success?: string;
};

type GuideFormAction = (
  previousState: GuideFormState,
  formData: FormData,
) => Promise<GuideFormState>;

type GuideFormGuide = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentStatus;
};

const initialState: GuideFormState = {};

function formatContentStatus(status: ContentStatus) {
  const statusLabels: Record<ContentStatus, string> = {
    [ContentStatus.DRAFT]: "草稿",
    [ContentStatus.PUBLISHED]: "已发布",
    [ContentStatus.ARCHIVED]: "已归档",
  };

  return statusLabels[status];
}

function FieldLabel({
  children,
  label,
}: Readonly<{
  children: React.ReactNode;
  label: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
      {label}
      {children}
    </label>
  );
}

function SubmitButton({
  children,
  intent,
  variant = "secondary",
}: Readonly<{
  children: React.ReactNode;
  intent: "archive" | "draft" | "publish";
  variant?: "primary" | "secondary";
}>) {
  const { pending } = useFormStatus();
  const className =
    variant === "primary"
      ? "rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      className={className}
      disabled={pending}
      name="intent"
      type="submit"
      value={intent}
    >
      {pending ? "保存中..." : children}
    </button>
  );
}

export function GuideForm({
  action,
  guide,
}: Readonly<{
  action: GuideFormAction;
  guide?: GuideFormGuide;
}>) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-6">
      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel label="标题">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.title ?? ""}
              name="title"
              required
            />
          </FieldLabel>
          <FieldLabel label="Slug（URL 标识）">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.slug ?? ""}
              name="slug"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </FieldLabel>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <FieldLabel label="摘要">
            <textarea
              className="min-h-24 rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-6 outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.summary ?? ""}
              name="summary"
            />
          </FieldLabel>
          <FieldLabel label="状态">
            <select
              className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.status ?? ContentStatus.DRAFT}
              name="status"
            >
              {Object.values(ContentStatus).map((status) => (
                <option key={status} value={status}>
                  {formatContentStatus(status)}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <FieldLabel label="正文内容">
          <textarea
            className="min-h-[420px] rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-7 outline-none focus:border-[var(--accent)]"
            defaultValue={guide?.content ?? ""}
            name="content"
          />
        </FieldLabel>
      </section>

      <section className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldLabel label="SEO 标题">
            <input
              className="rounded-md border border-[var(--border)] px-3 py-3 font-normal outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.seoTitle ?? ""}
              name="seoTitle"
            />
          </FieldLabel>
          <FieldLabel label="SEO 描述">
            <textarea
              className="min-h-24 rounded-md border border-[var(--border)] px-3 py-3 font-normal leading-6 outline-none focus:border-[var(--accent)]"
              defaultValue={guide?.seoDescription ?? ""}
              name="seoDescription"
            />
          </FieldLabel>
        </div>
      </section>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <SubmitButton intent="archive">归档</SubmitButton>
        <SubmitButton intent="draft">保存草稿</SubmitButton>
        <SubmitButton intent="publish" variant="primary">
          发布
        </SubmitButton>
      </div>
    </form>
  );
}
