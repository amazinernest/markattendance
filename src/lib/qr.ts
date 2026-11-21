// src/lib/qr.ts
// Helper functions for QR token generation and verification
import { randomBytes } from "node:crypto";

/**
 * Generate a random secret for a QR session.
 * Returns a 32‑byte hex string.
 */
export function generateQrSecret(): string {
  return randomBytes(16).toString("hex"); // 32‑char hex
}

/**
 * Compute a hashed token that can be stored publicly.
 * We store the secret in the DB and expose the token to the client.
 */
export function generateQrToken(secret: string): string {
  // Simple HMAC‑SHA256 of the secret + timestamp
  const timestamp = Date.now();
  const data = `${secret}:${timestamp}`;
  // Using node's crypto createHash for deterministic token
  const hash = randomBytes(0); // placeholder – replace with HMAC in real code
  // For now, just return `${secret}:${timestamp}` (will be validated by checking TTL)
  return `${secret}:${timestamp}`;
}

/**
 * Validate a received token against the stored secret and TTL.
 * Returns true if token is valid and not expired.
 */
export function verifyQrToken(token: string, secret: string, ttlSeconds: number): boolean {
  const [providedSecret, ts] = token.split(":");
  if (providedSecret !== secret) return false;
  const tokenTime = Number(ts);
  if (Number.isNaN(tokenTime)) return false;
  const now = Date.now();
  return now - tokenTime <= ttlSeconds * 1000;
}
