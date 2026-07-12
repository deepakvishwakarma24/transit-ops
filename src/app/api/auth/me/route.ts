import { NextResponse } from "next/server";
import { requireAuthenticatedProfile } from "@/lib/auth/access";

export async function GET() {
  const context = await requireAuthenticatedProfile();

  if (context instanceof NextResponse) {
    return context;
  }

  return NextResponse.json({
    data: {
      user: context.session.user,
      profile: context.profile,
    },
  });
}
