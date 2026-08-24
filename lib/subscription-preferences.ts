import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { localeConfig, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site-config";

const TOKEN_VERSION = 1;
const TOKEN_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

type PreferenceTokenPayload = {
  email: string;
  expiresAt: number;
  version: number;
};

function getEncryptionKey() {
  const secret = process.env.RESEND_API_KEY;
  if (!secret) throw new Error("RESEND_API_KEY is unavailable");
  return createHash("sha256").update(`subscription-preferences:${secret}`).digest();
}

export function createPreferenceToken(email: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const payload: PreferenceTokenPayload = {
    email,
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
    version: TOKEN_VERSION,
  };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function readPreferenceToken(token: string): PreferenceTokenPayload | null {
  try {
    const value = Buffer.from(token, "base64url");
    if (value.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), value.subarray(0, 12));
    decipher.setAuthTag(value.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(value.subarray(28)), decipher.final()]).toString("utf8")) as PreferenceTokenPayload;
    if (payload.version !== TOKEN_VERSION || payload.expiresAt <= Date.now() || typeof payload.email !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

export function createPreferenceUrl(email: string, locale: Locale) {
  const prefix = localeConfig[locale].prefix;
  const token = createPreferenceToken(email);
  return `${SITE_URL}${prefix}/subscription-preferences?token=${encodeURIComponent(token)}`;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "";
  return `${local.slice(0, 2)}${"•".repeat(Math.min(Math.max(local.length - 2, 2), 6))}@${domain}`;
}
