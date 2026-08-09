/**
 * PSCloudClient - "Phantasy Cloud" backend wrapper (Supabase).
 *
 * An opt-in account, identified by an email address and verified with a
 * 6-digit code, that mirrors the local save slots to a server and reports play
 * statistics. Deliberately a MIRROR of SaveManager, never a replacement: the
 * game always reads and writes localStorage synchronously (the auto-resume
 * snapshot depends on that during pagehide), and this layer only pushes copies
 * up and pulls copies back down into ordinary slots.
 *
 * Two design rules everything here follows:
 *
 *  - Nothing throws. Every method resolves to a CloudResult whose `error` is an
 *    i18n key, so the caller (PSCloudMenu) can render it without try/catch
 *    inside the menu loops.
 *  - Nothing is required. When the VITE_SUPABASE_* build variables are absent,
 *    isConfigured() is false and the whole feature reports itself unavailable;
 *    a clone of the repo with no Supabase project still builds and plays.
 *
 * The SDK is imported lazily so players who never open the menu never download
 * it. The anon key is public by design — row-level security on ps_cloud_saves
 * and ps_players is what protects player data. See docs/phantasy-cloud.md.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { SaveManager, type SaveSlotMeta } from '../game/SaveManager';

/** Uniform result: `error` is an i18n key, never a raw provider message. */
export interface CloudResult<T = void> {
  ok: boolean;
  error?: string;
  value?: T;
}

/** A save slot as it exists on the server. */
export interface CloudSlot {
  slot: number;
  meta: SaveSlotMeta;
  updatedAt: number;
}

/** Statistics delta sent to the report_stats RPC. Additive fields accumulate. */
export interface StatsPayload {
  playtime_seconds: number;
  battles_won: number;
  deaths: number;
  max_level: number;
  furthest_place: string | null;
  locale: string | null;
  platform: 'mobile' | 'desktop';
  game_completed: boolean;
}

const SAVES_TABLE = 'ps_cloud_saves';

export class PSCloudClient {
  private static client: SupabaseClient | null = null;
  private static clientPromise: Promise<SupabaseClient | null> | null = null;

  /** Cached email of the signed-in player, or null. Kept for menu rendering. */
  private static email: string | null = null;

  /** Set once restoreSession() has run, so the menu can skip a second probe. */
  private static sessionChecked = false;

  private static get url(): string {
    return import.meta.env.VITE_SUPABASE_URL ?? '';
  }

  private static get anonKey(): string {
    return import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  }

  /**
   * True when the build carries Supabase credentials. Everything downstream
   * must check this first: without it the menu shows Cloud_Unavailable instead
   * of a form the player could never complete.
   */
  public static isConfigured(): boolean {
    return this.url.length > 0 && this.anonKey.length > 0;
  }

  /**
   * Lazily create the Supabase client. The dynamic import keeps the SDK in its
   * own chunk, out of the initial page load. Returns null when unconfigured or
   * when the chunk fails to load (offline first visit).
   */
  private static async sdk(): Promise<SupabaseClient | null> {
    if (!this.isConfigured()) return null;
    if (this.client) return this.client;
    if (!this.clientPromise) {
      this.clientPromise = import('@supabase/supabase-js')
        .then(({ createClient }) => {
          this.client = createClient(this.url, this.anonKey, {
            auth: {
              // Persisted in localStorage and silently refreshed, so signing in
              // once survives reloads and tab kills — the player is asked for a
              // code only on a genuinely new device or after signing out.
              persistSession: true,
              autoRefreshToken: true,
              // The code is typed into the game; there is never a callback URL
              // to parse, and parsing one would fight the game's own routing.
              detectSessionInUrl: false
            }
          });
          return this.client;
        })
        .catch((error) => {
          console.error('PSCloudClient: failed to load the Supabase SDK', error);
          this.clientPromise = null;
          return null;
        });
    }
    return this.clientPromise;
  }

  // ----------------------------------------------------------- session

  /**
   * Restore a persisted session on boot. Cheap and safe to call repeatedly;
   * resolves to the signed-in email, or null when signed out/unconfigured.
   */
  public static async restoreSession(): Promise<string | null> {
    if (!this.isConfigured()) {
      this.sessionChecked = true;
      return null;
    }
    try {
      const supabase = await this.sdk();
      if (!supabase) {
        this.sessionChecked = true;
        return null;
      }
      const { data } = await supabase.auth.getSession();
      this.email = data.session?.user?.email ?? null;
    } catch (error) {
      console.error('PSCloudClient: session restore failed', error);
      this.email = null;
    }
    this.sessionChecked = true;
    return this.email;
  }

  /** True once restoreSession() has completed at least once. */
  public static isSessionChecked(): boolean {
    return this.sessionChecked;
  }

  /** Email of the signed-in player, or null. Reflects the last known session. */
  public static getEmail(): string | null {
    return this.email;
  }

  /** True when a player is signed in (per the cached session state). */
  public static isSignedIn(): boolean {
    return this.email !== null;
  }

  // -------------------------------------------------------------- auth

  /**
   * Send a 6-digit sign-in code to `email`, creating the account on first use.
   *
   * NOTE: Supabase mails a magic *link* until the "Magic Link" email template
   * is changed to use {{ .Token }}. Without that one-time dashboard change
   * there is no code for verifyCode() to accept.
   */
  public static async requestCode(email: string): Promise<CloudResult> {
    if (!this.isConfigured()) return { ok: false, error: 'Cloud_Unavailable' };
    const address = this.normalizeEmail(email);
    if (!this.looksLikeEmail(address)) return { ok: false, error: 'Cloud_Err_Email' };

    try {
      const supabase = await this.sdk();
      if (!supabase) return { ok: false, error: 'Cloud_Err_Network' };

      const { error } = await supabase.auth.signInWithOtp({
        email: address,
        options: { shouldCreateUser: true }
      });
      if (error) return { ok: false, error: this.mapAuthError(error) };
      return { ok: true };
    } catch (error) {
      console.error('PSCloudClient: requestCode failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /** Verify the emailed code and open a session. */
  public static async verifyCode(email: string, token: string): Promise<CloudResult<string>> {
    if (!this.isConfigured()) return { ok: false, error: 'Cloud_Unavailable' };
    const address = this.normalizeEmail(email);
    const code = token.replace(/\D/g, '');
    if (code.length === 0) return { ok: false, error: 'Cloud_Err_Code' };

    try {
      const supabase = await this.sdk();
      if (!supabase) return { ok: false, error: 'Cloud_Err_Network' };

      const { data, error } = await supabase.auth.verifyOtp({
        email: address,
        token: code,
        type: 'email'
      });
      if (error) return { ok: false, error: this.mapAuthError(error) };

      this.email = data.user?.email ?? address;
      return { ok: true, value: this.email };
    } catch (error) {
      console.error('PSCloudClient: verifyCode failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /** End the session. Local saves are deliberately left untouched. */
  public static async signOut(): Promise<CloudResult> {
    this.email = null;
    if (!this.isConfigured()) return { ok: true };
    try {
      const supabase = await this.sdk();
      if (supabase) await supabase.auth.signOut();
      return { ok: true };
    } catch (error) {
      console.error('PSCloudClient: signOut failed', error);
      // The local session is cleared either way, so report success — a network
      // failure here must not leave the player stuck "signed in".
      return { ok: true };
    }
  }

  // ------------------------------------------------------------- saves

  /**
   * Upload one slot. `data` is a GameData.serialize() output — the exact same
   * JSON that goes into localStorage, so no separate format to keep in sync.
   */
  public static async pushSlot(slot: number, meta: SaveSlotMeta, data: unknown): Promise<CloudResult> {
    const gate = await this.requireSession();
    if (gate) return gate;

    try {
      const supabase = (await this.sdk())!;
      const userId = await this.userId();
      if (!userId) return { ok: false, error: 'Cloud_Err_Signedout' };

      const { error } = await supabase
        .from(SAVES_TABLE)
        .upsert(
          { user_id: userId, slot, meta, data, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,slot' }
        );
      if (error) return { ok: false, error: this.mapDbError(error) };
      return { ok: true };
    } catch (error) {
      console.error('PSCloudClient: pushSlot failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /**
   * Upload every occupied local slot in one round trip.
   * @returns the number of slots uploaded.
   */
  public static async pushAll(): Promise<CloudResult<number>> {
    const gate = await this.requireSession();
    if (gate) return gate;

    const rows: { user_id: string; slot: number; meta: SaveSlotMeta; data: unknown; updated_at: string }[] = [];
    const userId = await this.userId();
    if (!userId) return { ok: false, error: 'Cloud_Err_Signedout' };

    const stamp = new Date().toISOString();
    SaveManager.listMetas().forEach((meta, slot) => {
      if (!meta) return;
      const data = SaveManager.readSlotData(slot);
      if (!data) return;
      rows.push({ user_id: userId, slot, meta, data, updated_at: stamp });
    });

    if (rows.length === 0) return { ok: true, value: 0 };

    try {
      const supabase = (await this.sdk())!;
      const { error } = await supabase.from(SAVES_TABLE).upsert(rows, { onConflict: 'user_id,slot' });
      if (error) return { ok: false, error: this.mapDbError(error) };
      return { ok: true, value: rows.length };
    } catch (error) {
      console.error('PSCloudClient: pushAll failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /** List the player's cloud slots, newest first. Headers only — no save data. */
  public static async listCloudSlots(): Promise<CloudResult<CloudSlot[]>> {
    const gate = await this.requireSession();
    if (gate) return gate;

    try {
      const supabase = (await this.sdk())!;
      const { data, error } = await supabase
        .from(SAVES_TABLE)
        .select('slot, meta, updated_at')
        .order('updated_at', { ascending: false });
      if (error) return { ok: false, error: this.mapDbError(error) };

      const slots: CloudSlot[] = (data ?? []).map((row: any) => ({
        slot: row.slot as number,
        meta: row.meta as SaveSlotMeta,
        updatedAt: Date.parse(row.updated_at) || 0
      }));
      return { ok: true, value: slots };
    } catch (error) {
      console.error('PSCloudClient: listCloudSlots failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /** Fetch one slot's full contents (meta + serialized GameData). */
  public static async pullSlot(slot: number): Promise<CloudResult<{ meta: SaveSlotMeta; data: unknown }>> {
    const gate = await this.requireSession();
    if (gate) return gate;

    try {
      const supabase = (await this.sdk())!;
      const { data, error } = await supabase
        .from(SAVES_TABLE)
        .select('meta, data')
        .eq('slot', slot)
        .maybeSingle();
      if (error) return { ok: false, error: this.mapDbError(error) };
      if (!data) return { ok: false, error: 'Cloud_Err_Missing' };

      return { ok: true, value: { meta: data.meta as SaveSlotMeta, data: data.data } };
    } catch (error) {
      console.error('PSCloudClient: pullSlot failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  // ------------------------------------------------------------- stats

  /**
   * Merge a statistics delta into the player's row. The server-side
   * report_stats function accumulates playtime/battles/deaths and only raises
   * max_level, so a retried or out-of-order call can never lower a total.
   */
  public static async reportStats(payload: StatsPayload): Promise<CloudResult> {
    const gate = await this.requireSession();
    if (gate) return gate;

    try {
      const supabase = (await this.sdk())!;
      const { error } = await supabase.rpc('report_stats', { p: payload });
      if (error) return { ok: false, error: this.mapDbError(error) };
      return { ok: true };
    } catch (error) {
      console.error('PSCloudClient: reportStats failed', error);
      return { ok: false, error: 'Cloud_Err_Network' };
    }
  }

  /**
   * Fire-and-forget stats flush usable from a pagehide/visibilitychange
   * handler. PersistenceManager callbacks must be synchronous, and an awaited
   * request would be cancelled when the tab dies — so this issues a keepalive
   * fetch straight at the RPC endpoint and returns immediately. (sendBeacon
   * cannot be used: it allows no Authorization header.)
   *
   * Requires an already-cached access token; when there is none the flush is
   * simply skipped, and the delta stays pending for the next online flush.
   */
  public static beaconStats(payload: StatsPayload): void {
    if (!this.isConfigured() || !this.cachedAccessToken) return;
    try {
      void fetch(`${this.url}/rest/v1/rpc/report_stats`, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          apikey: this.anonKey,
          Authorization: `Bearer ${this.cachedAccessToken}`
        },
        body: JSON.stringify({ p: payload })
      }).catch(() => { /* the tab is going away; nothing to report to */ });
    } catch {
      /* ignore — a failed last-gasp flush must never break teardown */
    }
  }

  // ----------------------------------------------------------- helpers

  /** Latest access token, refreshed on every authenticated call for beacons. */
  private static cachedAccessToken: string | null = null;

  /**
   * Resolve the signed-in user id, refreshing the cached beacon token on the
   * way. Returns null when the session has expired or was never established.
   */
  private static async userId(): Promise<string | null> {
    const supabase = await this.sdk();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    this.cachedAccessToken = session?.access_token ?? null;
    this.email = session?.user?.email ?? null;
    return session?.user?.id ?? null;
  }

  /**
   * Common precondition for every authenticated call.
   * @returns a failing CloudResult to return early, or null when good to go.
   */
  private static async requireSession(): Promise<CloudResult<any> | null> {
    if (!this.isConfigured()) return { ok: false, error: 'Cloud_Unavailable' };
    const supabase = await this.sdk();
    if (!supabase) return { ok: false, error: 'Cloud_Err_Network' };
    if (!(await this.userId())) return { ok: false, error: 'Cloud_Err_Signedout' };
    return null;
  }

  /** Trim + lowercase, so "  Alis@Algol.COM " and "alis@algol.com" are one account. */
  public static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Cheap shape check run before spending a send. Intentionally permissive —
   * the server is the real authority; this only catches obvious typos so the
   * player is not left waiting for a mail that was never going to arrive.
   */
  public static looksLikeEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  /** Map an auth failure to an i18n key. */
  private static mapAuthError(error: { message?: string; status?: number }): string {
    const message = (error.message ?? '').toLowerCase();
    if (error.status === 429 || message.includes('rate limit') || message.includes('too many')) {
      return 'Cloud_Err_RateLimit';
    }
    if (message.includes('expired')) return 'Cloud_Err_Expired';
    if (message.includes('invalid') || message.includes('token')) return 'Cloud_Err_Code';
    if (message.includes('email')) return 'Cloud_Err_Email';
    if (message.includes('fetch') || message.includes('network')) return 'Cloud_Err_Network';
    console.error('PSCloudClient: unmapped auth error', error);
    return 'Cloud_Err_Generic';
  }

  /** Map a database/RPC failure to an i18n key. */
  private static mapDbError(error: { message?: string; code?: string }): string {
    const message = (error.message ?? '').toLowerCase();
    if (error.code === 'PGRST301' || message.includes('jwt')) return 'Cloud_Err_Signedout';
    if (message.includes('fetch') || message.includes('network')) return 'Cloud_Err_Network';
    console.error('PSCloudClient: unmapped database error', error);
    return 'Cloud_Err_Generic';
  }
}
