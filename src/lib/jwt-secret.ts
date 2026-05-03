/**
 * One HS256 signing key for middleware (Edge) + route handlers (Node).
 * Use explicit JWT_SECRET in Vercel if set (≥32 chars); otherwise derive
 * from DATABASE_URL via SHA-256 so login & middleware always agree.
 */
export async function jwtSigningKey(): Promise<Uint8Array> {
  const explicit = process.env.JWT_SECRET?.trim();
  if (explicit && explicit.length >= 32) {
    return new TextEncoder().encode(explicit);
  }
  const dbUrl = process.env.DATABASE_URL ?? "";
  const material = `${dbUrl}::nboog-jwt-v1`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material)
  );
  return new Uint8Array(digest);
}
