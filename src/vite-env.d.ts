/// <reference types="vite/client" />

/**
 * Build-time environment variables. Only VITE_-prefixed names are exposed to
 * client code by Vite; both of these are safe to ship in the bundle (the
 * Supabase anon key is designed for browser use — row-level security on the
 * tables, not key secrecy, is what protects player data).
 *
 * Set them in Vercel → Settings → Environment Variables, and locally in a
 * .env.local file (git-ignored). When they are absent, PSCloudClient reports
 * itself unconfigured and the Phantasy Cloud menu degrades to a notice.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
