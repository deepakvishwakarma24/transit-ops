import { NextResponse } from "next/server";
import { getAuthenticatedUser, problem } from "@/lib/auth/access";
import { setupInitialFleetManager } from "@/lib/auth/bootstrap";

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return problem(401, "Unauthorized", "Sign in before setting up the Fleet Manager.");
  }

  const setup = await setupInitialFleetManager(user);

  if (setup.status === "not-configured") {
    return problem(
      503,
      "Initial Manager Not Configured",
      "INITIAL_FLEET_MANAGER_EMAIL must be configured before setup.",
    );
  }

  if (setup.status === "email-not-allowed") {
    return problem(
      403,
      "Forbidden",
      "This account is not allowed to become the initial Fleet Manager.",
    );
  }

  return NextResponse.json({
    data: {
      profile: setup.profile,
      initialized: setup.status === "initialized",
    },
  });
}
