export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = EmailPasswordCredentials & {
  name: string;
};

export type EmailVerificationInput = {
  email: string;
  otp: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^\d{6}$/;

async function readRequestBody(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return null;
  }

  return body as Record<string, unknown>;
}

function parseEmailPasswordCredentials(
  body: Record<string, unknown>,
): EmailPasswordCredentials | null {
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!emailPattern.test(email) || email.length > 254 || password.length < 12) {
    return null;
  }

  return { email, password };
}

export async function parseSignInCredentials(
  request: Request,
): Promise<EmailPasswordCredentials | null> {
  const body = await readRequestBody(request);
  return body ? parseEmailPasswordCredentials(body) : null;
}

export async function parseSignUpCredentials(
  request: Request,
): Promise<SignUpCredentials | null> {
  const body = await readRequestBody(request);

  if (!body) {
    return null;
  }

  const credentials = parseEmailPasswordCredentials(body);
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!credentials || name.length < 2 || name.length > 100) {
    return null;
  }

  return { ...credentials, name };
}

export async function parseEmailVerificationInput(
  request: Request,
): Promise<EmailVerificationInput | null> {
  const body = await readRequestBody(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

  if (!emailPattern.test(email) || email.length > 254 || !otpPattern.test(otp)) {
    return null;
  }

  return { email, otp };
}

export async function parseEmailInput(request: Request): Promise<string | null> {
  const body = await readRequestBody(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  return emailPattern.test(email) && email.length <= 254 ? email : null;
}
