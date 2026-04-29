// Build the connect-src allowlist for the configured Supabase origin so we
// can keep CSP strict regardless of whether the deployment talks to the
// hosted cloud, a self-hosted VPS, or the local CLI.

const FALLBACK = 'http://127.0.0.1:54321';

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function getSupabaseConnectSources(): string {
  const raw = (import.meta.env.VITE_SUPABASE_URL ?? '').trim() || FALLBACK;
  const url = safeUrl(raw) ?? safeUrl(FALLBACK)!;

  const httpOrigin = `${url.protocol}//${url.host}`;
  const wsScheme = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsOrigin = `${wsScheme}//${url.host}`;

  return `${httpOrigin} ${wsOrigin}`;
}
