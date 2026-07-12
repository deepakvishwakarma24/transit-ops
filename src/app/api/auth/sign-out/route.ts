import { NextResponse } from "next/server";
import { problem } from "@/lib/auth/access";
import { auth } from "@/lib/auth/server";

export async function POST() {
  const { error } = await auth.signOut();

  if (error) {
    return problem(500, "Sign Out Failed", "We could not end this session.");
  }

  return new NextResponse(null, { status: 204 });
}
