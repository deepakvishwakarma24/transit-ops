import { auth } from "@/lib/auth/server";

export const proxy = auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
