/**
 * Base URL for Stripe return_url and redirects.
 * Vercel sets VERCEL_URL (no scheme); prefer CLIENT_URL / CLIENT_URL_PROD when set.
 */
export function getPublicOrigin() {
  const explicit = process.env.CLIENT_URL || process.env.CLIENT_URL_PROD;
  if (explicit) return String(explicit).replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5174';
}
