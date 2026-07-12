# Local setup

Follow these steps to run Transit Ops locally.

## Prerequisites

- Node.js 20.9 or newer
- Corepack (included with recent Node.js releases)
- Access to the project's Postgres/Neon database if you are working on database features

## Install dependencies

From the project directory:

```bash
corepack enable
pnpm install
```

## Configure environment variables

Create a `.env` file in the project root. Add the database connection string and Neon Auth values from the linked Neon branch:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEON_AUTH_BASE_URL="https://YOUR-NEON-AUTH-HOST/neondb/auth"
NEON_AUTH_COOKIE_SECRET="generate-a-unique-32-plus-character-secret"
INITIAL_FLEET_MANAGER_EMAIL="karpesahil2007@gmail.com"
```

Generate the cookie secret with:

```bash
openssl rand -base64 32
```

Do not commit `.env` or any file containing credentials. Environment files are ignored by Git.

`DATABASE_URL` is required for Prisma commands and application data access. `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` are required for sign-in, session validation, and route protection.

`INITIAL_FLEET_MANAGER_EMAIL` is a one-time bootstrap allowlist. After OTP verification, the first successful sign-in by `karpesahil2007@gmail.com` becomes the Fleet Manager, but only if no Fleet Manager profile exists. Remove the variable after the initial role is established; all other users begin with pending access until a Fleet Manager assigns a role.

## Generate the Prisma client

After installing dependencies, generate the client used by the application:

```bash
pnpm exec prisma generate
```

Run this again whenever the Prisma schema changes.

## Apply database migrations

Apply migrations before starting the app against a new branch or deployment environment:

```bash
pnpm exec prisma migrate deploy
```

The included auth migration replaces the obsolete local credential table with application-only authorization profiles. Back up or branch a production database before applying it.

## Configure Neon Auth

For development, email/password authentication and localhost access are already enabled on the linked Neon branch. Before production:

1. Add each HTTPS application origin to Neon Auth's trusted origins.
2. Enable verification at sign-up and require verified email addresses. OTP verification works with Neon shared email; use custom SMTP for production delivery.
3. Disable localhost access on the production branch.
4. Create the bootstrap Fleet Manager account using `INITIAL_FLEET_MANAGER_EMAIL`, then remove that environment variable.

## Authentication API

The Next.js app exposes these first-class authentication routes. Neon Auth callback, password-reset, and OTP routes continue to be handled by `/api/auth/[...path]`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/sign-up` | Register with `name`, `email`, and a password of at least 12 characters; Neon sends the OTP. |
| `POST` | `/api/auth/verify-email` | Verify an email address with its six-digit OTP. |
| `POST` | `/api/auth/resend-verification` | Request a replacement OTP without disclosing account state. |
| `POST` | `/api/auth/sign-in` | Start an authenticated session. It also attempts the one-time initial Fleet Manager setup. |
| `POST` | `/api/auth/sign-out` | End the current session. |
| `GET` | `/api/auth/me` | Return the authenticated Neon Auth user and application role profile. |
| `POST` | `/api/auth/setup-initial-fleet-manager` | Explicitly retry the one-time Fleet Manager bootstrap for the authenticated configured email. |

The custom screens at `/auth/sign-up`, `/auth/verify-email`, and `/auth/sign-in` use these API routes. The bootstrap endpoint is authenticated and only promotes the configured email when no Fleet Manager role exists. It never accepts an email or role from the request body.

## Start the development server

```bash
pnpm dev
```

Open <http://localhost:3000> in a browser.

## Useful commands

```bash
pnpm lint      # Check the code with ESLint
pnpm build     # Create a production build
pnpm start     # Start the production build locally
```

## Troubleshooting

- If `pnpm` is not available, run `corepack enable` and try again.
- If Prisma reports a missing `DATABASE_URL`, check that `.env` is in the project root and contains a valid connection string.
- If Neon Auth fails to start, ensure `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET` are set and that the cookie secret is at least 32 characters.
- If dependencies appear out of sync, remove `node_modules` and run `pnpm install` again.
