import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_auth";
const MAX_AGE_DAYS = 7;

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return secret;
}

function sign(timestamp: string): string {
  const secret = getSecret();
  return createHmac("sha256", secret).update(timestamp).digest("base64url");
}

export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = sign(timestamp);
  return Buffer.from(`${timestamp}:${signature}`, "utf-8").toString("base64url");
}

export function verifyAdminToken(token: string): boolean {
  try {
    const secret = getSecret();
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [timestamp, signature] = decoded.split(":");
    if (!timestamp || !signature) return false;

    const ageMs = Date.now() - parseInt(timestamp, 10);
    if (ageMs < 0 || ageMs > MAX_AGE_DAYS * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expected = sign(timestamp);
    if (expected.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(expected, "utf-8"), Buffer.from(signature, "utf-8"));
  } catch {
    return false;
  }
}

export function getAdminAuthCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key.trim(), v.join("=").trim()];
    })
  );
  return cookies[COOKIE_NAME] ?? null;
}

export function setAdminAuthCookieHeader(): string {
  const token = createAdminToken();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}
