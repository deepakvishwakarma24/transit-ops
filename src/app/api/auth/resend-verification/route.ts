import { NextResponse } from "next/server";
import { problem } from "@/lib/auth/access";
import { parseEmailInput } from "@/lib/auth/credentials";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request) {
  const email = await parseEmailInput(request);

  if (!email) {
    return problem(422, "Validation Failed", "Provide a valid email address.");
  }

  const { error } = await auth.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });

  if (error) {
    return problem(
      400,
      "Verification Code Failed",
      "We could not send a new verification code.",
    );
  }

  return NextResponse.json({
    data: {
      message: "If an account is awaiting verification, a new code has been sent.",
    },
  });
}
