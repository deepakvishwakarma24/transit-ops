"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiError = { detail?: string };

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      setError(body?.detail ?? "We could not sign you in.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">TransitOps</p>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use the email and password for your verified account.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-10 rounded-md border border-input bg-background px-3"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-10 rounded-md border border-input bg-background px-3"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
