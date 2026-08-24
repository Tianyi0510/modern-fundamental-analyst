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

function getEncryptionKey(secret: string) {
  return createHash("sha256").update(`subscription-preferences:${secret}`).digest();
}

function getEncryptionSecrets() {
  const resendKey = process.env.RESEND_API_KEY;
  const primarySecret = process.env.SUBSCRIPTION_PREFERENCES_SECRET || resendKey;
  if (!primarySecret) throw new Error("SUBSCRIPTION_PREFERENCES_SECRET is unavailable");

  // Retain the Resend-derived key as a migration fallback so links created
  // before the dedicated secret was configured continue to work.
  return [...new Set([primarySecret, resendKey].filter((secret): secret is string => Boolean(secret)))];
}

export function createPreferenceToken(email: string, lifetimeMs = TOKEN_LIFETIME_MS) {
  const iv = randomBytes(12);
  const [primarySecret] = getEncryptionSecrets();
  if (!primarySecret) throw new Error("SUBSCRIPTION_PREFERENCES_SECRET is unavailable");
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(primarySecret), iv);
  const payload: PreferenceTokenPayload = {
    email,
    expiresAt: Date.now() + lifetimeMs,
    version: TOKEN_VERSION,
  };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function readPreferenceToken(token: string): PreferenceTokenPayload | null {
  let value: Buffer;
  let secrets: string[];
  try {
    value = Buffer.from(token, "base64url");
    secrets = getEncryptionSecrets();
  } catch {
    return null;
  }
  if (value.length < 29) return null;

  for (const secret of secrets) {
    try {
      const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(secret), value.subarray(0, 12));
      decipher.setAuthTag(value.subarray(12, 28));
      const payload = JSON.parse(Buffer.concat([decipher.update(value.subarray(28)), decipher.final()]).toString("utf8")) as PreferenceTokenPayload;
      if (payload.version !== TOKEN_VERSION || payload.expiresAt <= Date.now() || typeof payload.email !== "string") return null;
      return payload;
    } catch {
      // Try the migration fallback, if present.
    }
  }

  return null;
}

export function createPreferenceUrl(email: string, locale: Locale, lifetimeMs?: number) {
  const prefix = localeConfig[locale].prefix;
  const token = createPreferenceToken(email, lifetimeMs);
  return `${SITE_URL}${prefix}/subscription-preferences?token=${encodeURIComponent(token)}`;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "";
  return `${local.slice(0, 2)}${"•".repeat(Math.min(Math.max(local.length - 2, 2), 6))}@${domain}`;
}
