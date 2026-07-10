// VGM music manager (vgm2).
//
// Backed by the streaming VgmEnginePlayer (AudioWorklet). Because playback is
// streamed on the audio thread, there is no whole-track pre-render and no
// AudioBuffer/LRU cache — the only cache is the fetched-and-inflated VGM bytes,
// which just avoids re-fetching. Preserves the public surface the app already
// uses (ScriptEngine / EmulatorUI).

import { VgmEnginePlayer, VgmEngineOptions, inflateVgmIfNeeded } from './VgmEnginePlayer';
import { parseVGMInfo, VGMInfo } from './vgmInfo';

export type { VGMInfo };

interface CachedMusic {
  data: Uint8Array; // inflated VGM bytes
  info: VGMInfo;
  loop: boolean;
}

export class VGMMusicManager {
  private static instance: VGMMusicManager | null = null;

  private player: VgmEnginePlayer | null = null;
  // Cached by PATH (unique), not by short keys — different demos reuse keys
  // like 'title' for different files, so a key-keyed cache would collide
  // (e.g. play Sonic's title inside Phantasy Star).
  private cache = new Map<string, CachedMusic>();
  // Resolves a loadMusicAsset() key to its path; refreshed on every load, so
  // it always reflects the scene that most recently loaded that key.
  private keyToPath = new Map<string, string>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  // Effective gain = volume (emulator master) × musicVolume (in-game option).
  // Kept here so values set before the player exists still get applied.
  private volume = 1;
  private musicVolume = 1;
  private muted = false;

  // Last-request-wins guard for async play (a late-resolving play must not
  // override a newer play/stop).
  private playRequestId = 0;

  // Path of the track currently loaded in the player, and of the track
  // shelved by pauseMusic() (resumable mid-track via resumeMusic()).
  private currentPath: string | null = null;
  private pausedPath: string | null = null;

  private constructor() {}

  static getInstance(): VGMMusicManager {
    if (!VGMMusicManager.instance) VGMMusicManager.instance = new VGMMusicManager();
    return VGMMusicManager.instance;
  }

  async initialize(options?: VgmEngineOptions): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      this.player = new VgmEnginePlayer({ sampleRate: 44100, ...options });
      await this.player.initialize();
      this.applyVolume();
      this.player.setMuted(this.muted);
      this.initialized = true;
    })();

    return this.initPromise;
  }

  /** Fetch + inflate a track's bytes into the cache (no audio pre-render). */
  async loadMusicAsset(key: string, path: string, _pregenerate = false, loop = true): Promise<VGMInfo | null> {
    // Always refresh the key→path mapping so it reflects this caller's file,
    // even when the bytes are already cached from a previous load.
    this.keyToPath.set(key, path);

    const cached = this.cache.get(path);
    if (cached) return cached.info;

    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to fetch VGM file: ${path}`);
      const raw = new Uint8Array(await response.arrayBuffer());
      const data = await inflateVgmIfNeeded(raw);

      // Another load may have cached this path while we were fetching
      const existing = this.cache.get(path);
      if (existing) return existing.info;

      const info = parseVGMInfo(data);
      this.cache.set(path, { data, info, loop });
      return info;
    } catch (error) {
      console.error(`VGMMusicManager: Failed to load ${key}:`, error);
      return null;
    }
  }

  /**
   * Play a track (streams instantly; loads on demand if not cached). The
   * argument is a path, or a key previously registered via loadMusicAsset().
   */
  async playMusic(key: string, loop?: boolean): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    if (!this.player) return false;

    const requestId = ++this.playRequestId;

    // Resolve the key to a concrete path (most-recent loader wins; otherwise
    // treat the argument as a path itself).
    const path = this.keyToPath.get(key) ?? key;
    const effectiveLoop = loop ?? this.cache.get(path)?.loop ?? true;

    let cached = this.cache.get(path);
    if (!cached) {
      const info = await this.loadMusicAsset(key, path, false, effectiveLoop);
      if (!info) {
        console.error(`VGMMusicManager: Music '${key}' (${path}) could not be loaded`);
        return false;
      }
      cached = this.cache.get(path);
    }
    if (!cached) return false;

    // Superseded by a newer play/stop while loading
    if (requestId !== this.playRequestId) return false;

    try {
      await this.player.play(cached.data, effectiveLoop);
      if (requestId === this.playRequestId) {
        this.currentPath = path;
        return true;
      }
      return false;
    } catch (error) {
      console.error(`VGMMusicManager: Failed to play '${key}':`, error);
      return false;
    }
  }

  /**
   * Shelve the current track so a later resumeMusic() of the same track
   * continues from the exact point it was interrupted (battle interludes).
   */
  pauseMusic(): void {
    if (!this.player || !this.currentPath || !this.player.isPlaying()) return;
    this.player.pause();
    this.pausedPath = this.currentPath;
    this.currentPath = null;
  }

  /**
   * Resume the shelved track, but only if it is the one being requested.
   * Returns false when there is nothing (or a different track) shelved —
   * the caller should fall back to a normal playMusic().
   */
  resumeMusic(key: string): boolean {
    const path = this.keyToPath.get(key) ?? key;
    if (!this.player || this.pausedPath !== path) return false;
    this.playRequestId++; // invalidate any pending async play
    this.player.resume();
    this.currentPath = path;
    this.pausedPath = null;
    return true;
  }

  stopMusic(): void {
    this.playRequestId++; // invalidate any pending async play
    this.player?.stop();
    // pausedPath is kept: a stop between pause and resume (e.g. silencing
    // a battle jingle) must not discard the shelved overworld track
    this.currentPath = null;
  }

  isPlaying(): boolean {
    return this.player ? this.player.isPlaying() : false;
  }

  isCached(key: string): boolean {
    const path = this.keyToPath.get(key) ?? key;
    return this.cache.has(path);
  }

  clearCache(): void {
    this.cache.clear();
    this.keyToPath.clear();
  }

  /** Master volume (emulator UI). */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyVolume();
  }

  /** In-game music volume; multiplies with master. */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.applyVolume();
  }

  private applyVolume(): void {
    this.player?.setVolume(this.volume * this.musicVolume);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.player?.setMuted(muted);
  }

  resumeAudio(): void {
    this.player?.resumeAudio();
  }

  cleanup(): void {
    this.stopMusic();
    this.clearCache();
  }
}
