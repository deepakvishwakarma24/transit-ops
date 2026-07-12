import { NextResponse } from "next/server";
import { parseSignInCredentials } from "@/lib/auth/credentials";
import { problem } from "@/lib/auth/access";
import { setupInitialFleetManager } from "@/lib/auth/bootstrap";
import { auth } from "@/lib/auth/server";

export async function POST(request: Request) {
  const credentials = await parseSignInCredentials(request);

  if (!credentials) {
    return problem(422, "Validation Failed", "Provide a valid email and password.");
  }

  const { data, error } = await auth.signIn.email(credentials);
  const user = data?.user;

  if (error || !user?.id || !user.email) {
    return problem(401, "Unauthorized", "Email or password is incorrect.");
  }

  const initialFleetManager = await setupInitialFleetManager(user);

  return NextResponse.json({
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      role: initialFleetManager.profile.role,
      initialFleetManager: initialFleetManager.status === "initialized",
    },
  });
}
