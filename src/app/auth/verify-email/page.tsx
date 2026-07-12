"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

type ApiError = { detail?: string; data?: { message?: string } };

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiError | null;
      setError(body?.detail ?? "We could not verify that code.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  async function resendCode() {
    setError(null);
    setMessage(null);
    setIsResending(true);

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await response.json().catch(() => null)) as ApiError | null;

    if (!response.ok) {
      setError(body?.detail ?? "We could not send another code.");
    } else {
      setMessage(body?.data?.message ?? "A new verification code has been sent.");
    }

    setIsResending(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">TransitOps</p>
          <h1 className="text-2xl font-semibold">Verify your email</h1>
          <p className="text-sm text-muted-foreground">
            Enter the six-digit code we sent to your email address.
          </p>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="h-10 rounded-md border border-input bg-background px-3"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Verification code
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            className="h-10 rounded-md border border-input bg-background px-3 tracking-[0.4em]"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Verifying…" : "Verify email"}
        </button>

        <button
          type="button"
          onClick={resendCode}
          disabled={isResending || !email}
          className="w-full text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
        >
          {isResending ? "Sending code…" : "Resend code"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Already verified?{" "}
          <Link href="/auth/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-background" aria-busy="true" />}
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
