import { auth } from "@/lib/auth/server";

// This route proxies all auth requests to Neon Auth.
// It must be dynamic — static generation breaks cookie-based session handling.
export const dynamic = "force-dynamic";

export const { GET, POST } = auth.handler();
