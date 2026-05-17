"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginAdminAction,
  type AdminLoginActionState,
} from "@/app/admin/actions";

const initialState: AdminLoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-5 w-full rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <input name="next" type="hidden" value={nextPath} />

      <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
        Email
        <input
          autoComplete="username"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(36,120,106,0.15)]"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--foreground)]">
        Password
        <input
          autoComplete="current-password"
          className="rounded-md border border-[var(--border)] bg-white px-3 py-3 font-normal outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(36,120,106,0.15)]"
          name="password"
          required
          type="password"
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
