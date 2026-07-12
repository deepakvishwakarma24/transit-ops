import { NextResponse } from "next/server";
import { problem } from "@/lib/auth/access";
import { setupInitialFleetManager } from "@/lib/auth/bootstrap";
import { parseEmailVerificationInput } from "@/lib/auth/credentials";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request) {
  const input = await parseEmailVerificationInput(request);

  if (!input) {
    return problem(
      422,
      "Validation Failed",
      "Provide the email address and the six-digit verification code.",
    );
  }

  const { data, error } = await auth.emailOtp.verifyEmail(input);

  if (error) {
    return problem(
      400,
      "Verification Failed",
      "The verification code is invalid or has expired.",
    );
  }

  const user = data?.user;
  const initialFleetManager =
    user?.id && user.email ? await setupInitialFleetManager(user) : null;

  return NextResponse.json({
    data: {
      verified: true,
      initialFleetManager: initialFleetManager?.status === "initialized",
    },
  });
}
