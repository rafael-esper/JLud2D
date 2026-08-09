/**
 * PSCloudStats - play statistics for signed-in Phantasy Cloud players.
 *
 * Counters accumulate in memory as deltas and are merged server-side by the
 * report_stats RPC, which adds playtime/battles/deaths and only ever raises
 * max_level. Two consequences worth keeping in mind when editing this file:
 *
 *  - Nothing about the save format changes. GameData.serialize() gains no
 *    playtime field, so old saves stay loadable and cloud saves stay identical
 *    to local ones.
 *  - A flush is idempotent-ish by construction: deltas are only cleared once
 *    the server has accepted them, so a failed flush is retried later rather
 *    than lost, and a duplicated one can never lower a total.
 *
 * Statistics are only ever sent while a player is signed in — the account is
 * the consent. Signed-out players accumulate nothing that leaves the device.
 */

import { PSCloudClient, type StatsPayload } from './PSCloudClient';
import { PersistenceManager } from '../../../utils/PersistenceManager';

/** Don't hit the network more than once a minute during normal play. */
const MIN_FLUSH_INTERVAL_MS = 60_000;

/** Ignore absurd gaps (laptop suspended for a day) rather than bank them. */
const MAX_TICK_MS = 5 * 60_000;

export class PSCloudStats {
  private static pendingPlaytimeMs = 0;
  private static pendingBattles = 0;
  private static pendingDeaths = 0;
  private static completed = false;

  /** Wall-clock mark for the stretch currently being timed; null when paused. */
  private static mark: number | null = null;

  private static lastFlush = 0;
  private static flushing = false;
  private static installed = false;

  /**
   * Begin counting playtime and register the lifecycle hooks. Safe to call on
   * every GameScene creation; only the first call installs listeners.
   */
  public static start(): void {
    PSCloudStats.resume();
    if (PSCloudStats.installed) return;
    PSCloudStats.installed = true;

    // Stop the clock while the tab is hidden so "playtime" means time actually
    // spent playing, not time the tab sat in a background window.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        PSCloudStats.pause();
      } else {
        PSCloudStats.resume();
      }
    });

    // PersistenceManager callbacks run inside visibilitychange/pagehide and
    // must be synchronous — beaconStats() issues a keepalive request and
    // returns immediately rather than awaiting a response the dying tab would
    // never receive.
    PersistenceManager.register(() => PSCloudStats.flushBeacon());
  }

  /** Start (or restart) timing. */
  public static resume(): void {
    if (PSCloudStats.mark === null) PSCloudStats.mark = Date.now();
  }

  /** Bank the current stretch and stop timing. */
  public static pause(): void {
    PSCloudStats.harvest();
    PSCloudStats.mark = null;
  }

  /** Move elapsed wall-clock time into the pending delta. */
  private static harvest(): void {
    if (PSCloudStats.mark === null) return;
    const now = Date.now();
    const elapsed = now - PSCloudStats.mark;
    PSCloudStats.mark = now;
    if (elapsed > 0 && elapsed < MAX_TICK_MS) {
      PSCloudStats.pendingPlaytimeMs += elapsed;
    }
  }

  // ------------------------------------------------------------ counters

  public static noteBattleWon(): void {
    PSCloudStats.pendingBattles++;
  }

  public static noteDeath(): void {
    PSCloudStats.pendingDeaths++;
  }

  public static noteGameCompleted(): void {
    PSCloudStats.completed = true;
  }

  // -------------------------------------------------------------- flush

  /**
   * Send the pending delta if there is one and enough time has passed.
   * @param force skip the rate limit (used on sign-in and on manual save).
   */
  public static async flush(force = false): Promise<void> {
    if (!PSCloudClient.isConfigured() || !PSCloudClient.isSignedIn()) return;
    if (PSCloudStats.flushing) return;

    const now = Date.now();
    if (!force && now - PSCloudStats.lastFlush < MIN_FLUSH_INTERVAL_MS) return;

    PSCloudStats.harvest();
    const payload = PSCloudStats.buildPayload();
    if (!payload) return;

    PSCloudStats.flushing = true;
    // Zero the deltas only after the server accepts them, so a failed flush is
    // retried on the next one instead of silently dropping a play session.
    const sent = await PSCloudClient.reportStats(payload);
    PSCloudStats.flushing = false;

    if (sent.ok) {
      PSCloudStats.consume(payload);
      PSCloudStats.lastFlush = now;
    }
  }

  /**
   * Last-gasp flush for a page that is going away. Fire-and-forget, so the
   * deltas are cleared optimistically — the alternative is double-counting them
   * on the next load, which report_stats cannot detect.
   */
  private static flushBeacon(): void {
    if (!PSCloudClient.isConfigured() || !PSCloudClient.isSignedIn()) return;
    PSCloudStats.harvest();
    const payload = PSCloudStats.buildPayload();
    if (!payload) return;
    PSCloudClient.beaconStats(payload);
    PSCloudStats.consume(payload);
  }

  /** Build a payload, or null when there is nothing worth sending. */
  private static buildPayload(): StatsPayload | null {
    const seconds = Math.floor(PSCloudStats.pendingPlaytimeMs / 1000);
    if (seconds === 0 && PSCloudStats.pendingBattles === 0 &&
        PSCloudStats.pendingDeaths === 0 && !PSCloudStats.completed) {
      return null;
    }

    const context = PSCloudStats.readContext();
    return {
      playtime_seconds: seconds,
      battles_won: PSCloudStats.pendingBattles,
      deaths: PSCloudStats.pendingDeaths,
      max_level: context.maxLevel ?? 0,
      furthest_place: context.place ?? null,
      locale: context.locale ?? null,
      platform: PSCloudStats.readPlatform(),
      game_completed: PSCloudStats.completed
    };
  }

  /** Subtract an accepted payload from the pending deltas. */
  private static consume(payload: StatsPayload): void {
    PSCloudStats.pendingPlaytimeMs -= payload.playtime_seconds * 1000;
    if (PSCloudStats.pendingPlaytimeMs < 0) PSCloudStats.pendingPlaytimeMs = 0;
    PSCloudStats.pendingBattles -= payload.battles_won;
    PSCloudStats.pendingDeaths -= payload.deaths;
    if (PSCloudStats.pendingBattles < 0) PSCloudStats.pendingBattles = 0;
    if (PSCloudStats.pendingDeaths < 0) PSCloudStats.pendingDeaths = 0;
    if (payload.game_completed) PSCloudStats.completed = false;
  }

  // ------------------------------------------------------------ readers

  /**
   * Supplies the descriptive fields (level, place, locale) at flush time.
   * Injected by GameScene rather than imported, so this module never takes a
   * dependency on PSGame — which imports it back for the save-time flush.
   */
  private static context: (() => StatsContext) | null = null;

  /** Register the source of the descriptive stat fields. */
  public static setContextProvider(provider: () => StatsContext): void {
    PSCloudStats.context = provider;
  }

  /**
   * Read the current context. Defensive by design: statistics are a side
   * feature and must never throw into a save, a battle, or a teardown handler.
   */
  private static readContext(): StatsContext {
    try {
      return PSCloudStats.context?.() ?? {};
    } catch (error) {
      console.error('PSCloudStats: context provider failed', error);
      return {};
    }
  }

  private static readPlatform(): 'mobile' | 'desktop' {
    const coarse = typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;
    return coarse ? 'mobile' : 'desktop';
  }
}

/** Descriptive fields the game supplies at flush time. All optional. */
export interface StatsContext {
  maxLevel?: number;
  place?: string | null;
  locale?: string | null;
}
