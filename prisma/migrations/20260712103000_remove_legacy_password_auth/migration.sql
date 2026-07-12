-- Neon Auth owns credentials and sessions. TransitOps keeps only app-level
-- authorization profiles in UserProfile.
DROP TABLE IF EXISTS "User";
DROP TABLE IF EXISTS "Role";
DROP TYPE IF EXISTS "UserRole";
