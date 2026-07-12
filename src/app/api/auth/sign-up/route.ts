import { NextResponse } from "next/server";
import { parseSignUpCredentials } from "@/lib/auth/credentials";
import { problem } from "@/lib/auth/access";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request) {
  const credentials = await parseSignUpCredentials(request);

  if (!credentials) {
    return problem(
      422,
      "Validation Failed",
      "Provide a name, a valid email address, and a password with at least 12 characters.",
    );
  }

  const { error } = await auth.signUp.email(credentials);

  if (error) {
    return problem(
      400,
      "Registration Failed",
      "We could not create an account with those details.",
    );
  }

  return NextResponse.json(
    {
      data: {
        message: "Check your email for the verification code before signing in.",
      },
    },
    { status: 201 },
  );
}
