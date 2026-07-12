"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ApiError = { detail?: string };

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email,
        password: formData.get("password"),
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      setError(body?.detail ?? "We could not create your account.");
      setIsSubmitting(false);
      return;
    }

    router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">TransitOps</p>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            We will send a verification code to your email address.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Name
          <input
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="h-10 rounded-md border border-input bg-background px-3"
          />
        </label>

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
            minLength={12}
            autoComplete="new-password"
            className="h-10 rounded-md border border-input bg-background px-3"
          />
          <span className="text-xs font-normal text-muted-foreground">
            Use at least 12 characters.
          </span>
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/auth/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
