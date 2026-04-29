import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Self-hosted Supabase (e.g. on a VPS) is configured via Vite env vars.
// Both must be set in your `.env` (or `.env.local`) at build time:
//
//   VITE_SUPABASE_URL=http://<your-vps-host>:8000
//   VITE_SUPABASE_PUBLISHABLE_KEY=<anon key from your self-hosted instance>
//
// For a fresh `supabase start` on the same machine the defaults are
// http://127.0.0.1:54321 and the anon key printed by the CLI.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
).trim();

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Fail fast in the browser console so misconfigured deployments are obvious
  // instead of silently failing on every query.
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set. ' +
      'Copy .env.example to .env and point them at your self-hosted Supabase.',
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL || 'http://127.0.0.1:54321',
  SUPABASE_PUBLISHABLE_KEY || 'anon-key-not-configured',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
