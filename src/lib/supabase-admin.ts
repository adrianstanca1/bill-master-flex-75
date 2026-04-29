// Helpers for linking out to the Supabase Studio of the configured
// instance. For self-hosted Supabase the Studio URL is whatever the
// operator runs the dashboard on (default `http://localhost:3000`),
// configurable via `VITE_SUPABASE_STUDIO_URL`. As a fallback we derive
// it from `VITE_SUPABASE_URL` so legacy hardcoded admin links stop
// pointing at strangers' cloud projects.

const FALLBACK_STUDIO = 'http://localhost:3000';

function trimSlash(s: string): string {
  return s.replace(/\/+$/, '');
}

function getSupabaseStudioUrl(): string {
  const explicit = (import.meta.env.VITE_SUPABASE_STUDIO_URL ?? '').trim();
  if (explicit) return trimSlash(explicit);

  const projectUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
  if (!projectUrl) return FALLBACK_STUDIO;

  try {
    const u = new URL(projectUrl);
    // Common self-hosted layout: API on :8000 / :54321, Studio on :3000
    // of the same host. If unsure, just point at the host root.
    return `${u.protocol}//${u.hostname}:3000`;
  } catch {
    return FALLBACK_STUDIO;
  }
}

function getProjectRef(): string {
  const ref = (import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '').trim();
  return ref || 'default';
}

/**
 * Build a Studio admin URL. Accepts the same path suffix that the legacy
 * Supabase cloud links used (e.g. "auth/settings", "sql/new") so callers
 * can swap in this helper without restructuring their UI strings.
 */
export function studioPath(path: string): string {
  const base = getSupabaseStudioUrl();
  const ref = getProjectRef();
  const trimmed = path.replace(/^\/+/, '');
  const projectBase = `${base}/project/${ref}`;
  return trimmed ? `${projectBase}/${trimmed}` : projectBase;
}
