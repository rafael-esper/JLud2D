/**
 * SaveManager - Multi-slot save system for the Phantasy Star demo
 *
 * Replaces the Java JFileChooser .SAV flow with browser localStorage. The game
 * exposes up to MAX_SLOTS named slots; each stores a serialized GameData plus a
 * small metadata header used to label the slot in the save/load menus
 * (e.g. "Naula, lvl 15, 16-set").
 *
 * Mobile (Capacitor Filesystem) and an optional "Submit to the Cloud" flow for
 * registered users can layer on top of this later; only the storage backend in
 * readRaw()/writeRaw()/removeRaw() would change.
 */

import { GameData } from './GameData';

/** Human-readable header shown for a save slot. */
export interface SaveSlotMeta {
  /** Where the party is (city/dungeon/planet name). */
  place: string;
  /** Highest level in the party at save time. */
  maxLevel: number;
  /** Short localized date, e.g. "16-set". */
  date: string;
  /** Epoch millis, for sorting / "most recent" logic. */
  timestamp: number;
  /** Pre-composed label, e.g. "Naula, lvl 15, 16-set". */
  label: string;
}

interface SaveSlotEntry {
  meta: SaveSlotMeta;
  data: any; // GameData.serialize() output
}

/** PS Arena run state needed to resume a gauntlet mid-way (small, all numbers). */
export interface ArenaResume {
  /** Index of the battle to (re)enter on resume. */
  battleIndex: number;
  /** Accumulated reward progression (weapon/armor/shield/exp indices, revives). */
  state: {
    weaponIndex: number;
    shieldIndex: number;
    armorIndex: number;
    numRevives: number;
    expLevel: number;
  };
}

/**
 * Auto-resume envelope. `mode` tells the boot path how to re-enter: a normal
 * field session (GameScene) or an in-progress PS Arena gauntlet (TitleScene).
 * `gameData` is always a GameData.serialize() snapshot (the party lives here);
 * `arena` is present only for mode 'arena'.
 */
export interface AutoResumeSnapshot {
  mode: 'field' | 'arena';
  gameData: any;
  arena?: ArenaResume;
}

export class SaveManager {
  /** Number of save slots offered in the menus. */
  public static readonly MAX_SLOTS = 15;

  private static readonly KEY_PREFIX = 'PS_SAVE_SLOT_';

  /**
   * Dedicated key for the automatic "resume where you left off" snapshot,
   * written on backgrounding / at safe checkpoints and consumed on boot. Kept
   * separate from the numbered manual slots so the two never collide.
   */
  public static readonly AUTO_KEY = 'PS_AUTORESUME';

  private static keyFor(slot: number): string {
    return `${SaveManager.KEY_PREFIX}${slot}`;
  }

  private static readRaw(slot: number): SaveSlotEntry | null {
    try {
      const raw = localStorage.getItem(SaveManager.keyFor(slot));
      if (!raw) return null;
      return JSON.parse(raw) as SaveSlotEntry;
    } catch (error) {
      console.error(`SaveManager: failed to read slot ${slot}`, error);
      return null;
    }
  }

  /** Metadata for a single slot, or null if the slot is empty/corrupt. */
  public static getMeta(slot: number): SaveSlotMeta | null {
    return SaveManager.readRaw(slot)?.meta ?? null;
  }

  /** Metadata for every slot (index === slot number); null entries are empty. */
  public static listMetas(): (SaveSlotMeta | null)[] {
    const metas: (SaveSlotMeta | null)[] = [];
    for (let slot = 0; slot < SaveManager.MAX_SLOTS; slot++) {
      metas.push(SaveManager.getMeta(slot));
    }
    return metas;
  }

  /** True if at least one slot holds a save. */
  public static hasAnySave(): boolean {
    return SaveManager.listMetas().some(m => m !== null);
  }

  /** Write a game state + metadata into a slot. */
  public static saveToSlot(slot: number, gameData: GameData, meta: SaveSlotMeta): boolean {
    if (slot < 0 || slot >= SaveManager.MAX_SLOTS) {
      console.error(`SaveManager: invalid slot ${slot}`);
      return false;
    }
    try {
      const entry: SaveSlotEntry = { meta, data: gameData.serialize() };
      localStorage.setItem(SaveManager.keyFor(slot), JSON.stringify(entry));
      return true;
    } catch (error) {
      console.error(`SaveManager: failed to save slot ${slot}`, error);
      return false;
    }
  }

  /** Rebuild the GameData stored in a slot, or null if empty/corrupt. */
  public static loadFromSlot(slot: number): GameData | null {
    const entry = SaveManager.readRaw(slot);
    if (!entry || !entry.data) return null;
    try {
      return GameData.fromSerialized(entry.data);
    } catch (error) {
      console.error(`SaveManager: failed to deserialize slot ${slot}`, error);
      return null;
    }
  }

  /** Erase a slot. */
  public static deleteSlot(slot: number): void {
    localStorage.removeItem(SaveManager.keyFor(slot));
  }

  // --- Auto-resume snapshot (mobile process-kill recovery) ---
  //
  // Uses SYNCHRONOUS localStorage on purpose: the snapshot is written from
  // visibilitychange/pagehide handlers and must land before the OS can kill the
  // tab. localStorage.setItem completes before the handler returns; an async
  // IndexedDB write could be dropped mid-flush at exactly that moment.

  /** Write a pre-serialized snapshot JSON to the auto-resume key. */
  public static writeAutoResumeJson(json: string): void {
    try {
      localStorage.setItem(SaveManager.AUTO_KEY, json);
    } catch (error) {
      console.error('SaveManager: failed to write auto-resume snapshot', error);
    }
  }

  /** True if an auto-resume snapshot is present. */
  public static hasAutoResume(): boolean {
    try {
      return localStorage.getItem(SaveManager.AUTO_KEY) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Read the auto-resume envelope (gameData still in serialized form), or null
   * if absent/corrupt. Tolerates the legacy shape (a bare GameData.serialize()
   * output written before the envelope existed) by treating it as mode 'field'.
   */
  public static readAutoResumeSnapshot(): AutoResumeSnapshot | null {
    try {
      const raw = localStorage.getItem(SaveManager.AUTO_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.mode) {
        return parsed as AutoResumeSnapshot;
      }
      return { mode: 'field', gameData: parsed };
    } catch (error) {
      console.error('SaveManager: failed to read auto-resume snapshot', error);
      return null;
    }
  }

  /** Erase the auto-resume snapshot (on intentional exit / new game). */
  public static clearAutoResume(): void {
    try {
      localStorage.removeItem(SaveManager.AUTO_KEY);
    } catch (error) {
      console.error('SaveManager: failed to clear auto-resume snapshot', error);
    }
  }

  /**
   * Compose a slot label from its parts, e.g. "Naula, lvl 15, 16-set".
   */
  public static composeLabel(place: string, maxLevel: number, date: string): string {
    return `${place}, lvl ${maxLevel}, ${date}`;
  }

  /**
   * Short localized day-month string, e.g. "16-set". `localeTag` should be a
   * BCP-47 tag; a bad tag falls back to the runtime default.
   */
  public static formatDate(now: Date = new Date(), localeTag?: string): string {
    const day = now.getDate();
    let month: string;
    try {
      month = now.toLocaleString(localeTag || undefined, { month: 'short' });
    } catch {
      month = now.toLocaleString(undefined, { month: 'short' });
    }
    month = month.replace(/\./g, '').toLowerCase();
    return `${day}-${month}`;
  }
}
