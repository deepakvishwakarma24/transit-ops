-- Application authorization profiles are intentionally separate from Neon Auth.
-- Neon Auth owns passwords, sessions, and identities in the neon_auth schema.
CREATE TYPE "ApplicationRole" AS ENUM (
    'UNASSIGNED',
    'FLEET_MANAGER',
    'DISPATCHER',
    'SAFETY_OFFICER',
    'FINANCIAL_ANALYST'
);

CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "authUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "ApplicationRole" NOT NULL DEFAULT 'UNASSIGNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
CREATE INDEX "UserProfile_role_idx" ON "UserProfile"("role");
