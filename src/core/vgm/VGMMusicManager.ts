/**
 * VGM Music Manager
 * Handles bulk music preloading and caching to eliminate gameplay interruptions
 * Provides instant music switching by pre-processing all VGM files upfront
 */

import { VGMPlayer, VGMPlayerOptions, VGMInfo } from './VGMPlayer';

export interface MusicAsset {
  key: string;
  path: string;
  preload: boolean;
  loop?: boolean; // Optional: per-track looping control (default: true)
}

export interface MusicManifest {
  name: string;
  assets: MusicAsset[];
}

export interface CachedMusic {
  data: Uint8Array;
  info: VGMInfo;
  audioBuffer?: AudioBuffer;
  lastUsed: number;
  loop: boolean; // Per-track looping setting
}

export class VGMMusicManager {
  private static instance: VGMMusicManager | null = null;
  private vgmPlayer: VGMPlayer | null = null;
  private musicCache = new Map<string, CachedMusic>();
  private initialized = false;
  private maxCacheSize = 100; // Maximum number of cached tracks
  private maxCacheMemoryMB = 50; // Maximum memory usage in MB
  private preloadInProgress = false;
  private totalCacheMemory = 0; // Track total memory usage in bytes
  private loadedManifests: Map<string, MusicManifest> = new Map(); // Registry of loaded manifests

  private constructor() {}

  public static getInstance(): VGMMusicManager {
    if (!VGMMusicManager.instance) {
      VGMMusicManager.instance = new VGMMusicManager();
    }
    return VGMMusicManager.instance;
  }

  /**
   * Initialize the music manager
   */
  public async initialize(options?: VGMPlayerOptions): Promise<void> {
    if (this.initialized) return;

    try {
      const defaultOptions: VGMPlayerOptions = {
        sampleRate: 44100,
        enableLooping: true,
        ...options
      };

      this.vgmPlayer = new VGMPlayer(defaultOptions);
      await this.vgmPlayer.initialize();
      this.initialized = true;

      console.log('VGMMusicManager: Initialized successfully');
    } catch (error) {
      console.error('VGMMusicManager: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Preload music from a manifest
   * This should be called during scene initialization to avoid gameplay interruptions
   */
  public async preloadMusicManifest(manifest: MusicManifest): Promise<void> {
    if (!this.initialized) {
      throw new Error('VGMMusicManager not initialized');
    }

    if (this.preloadInProgress) {
      console.warn('VGMMusicManager: Preload already in progress, skipping');
      return;
    }

    this.preloadInProgress = true;

    // Register this manifest for on-demand loading
    this.loadedManifests.set(manifest.name, manifest);

    console.log(`VGMMusicManager: Preloading ${manifest.name} music manifest...`);

    const preloadAssets = manifest.assets.filter(asset => asset.preload);
    let loaded = 0;
    const total = preloadAssets.length;

    try {
      // Load assets in parallel for better performance
      const loadPromises = preloadAssets.map(async (asset) => {
        try {
          await this.loadMusicAsset(asset.key, asset.path, true, asset.loop ?? true);
          loaded++;
          console.log(`VGMMusicManager: Preloaded ${asset.key} (${loaded}/${total})`);
        } catch (error) {
          console.error(`VGMMusicManager: Failed to preload ${asset.key}:`, error);
        }
      });

      await Promise.all(loadPromises);
      console.log(`VGMMusicManager: Preloading complete for ${manifest.name} (${loaded}/${total} successful)`);
    } finally {
      this.preloadInProgress = false;
    }
  }

  /**
   * Load a single music asset (with caching)
   */
  public async loadMusicAsset(key: string, path: string, pregenerate: boolean = false, loop: boolean = true): Promise<VGMInfo | null> {
    if (!this.initialized || !this.vgmPlayer) {
      throw new Error('VGMMusicManager not initialized');
    }

    // Return cached version if available
    if (this.musicCache.has(key)) {
      const cached = this.musicCache.get(key)!;
      cached.lastUsed = Date.now();
      console.log(`VGMMusicManager: Using cached ${key}`);
      return cached.info;
    }

    try {
      // Fetch VGM file
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch VGM file: ${path}`);
      }

      const vgmData = new Uint8Array(await response.arrayBuffer());

      // Parse VGM and get info
      const info = await this.vgmPlayer.loadVGM(vgmData);

      // Optionally pre-generate audio buffer during preload phase
      let audioBuffer: AudioBuffer | undefined;
      if (pregenerate) {
        try {
          audioBuffer = await this.generateAudioBuffer(vgmData, info);
          console.log(`VGMMusicManager: Pre-generated audio buffer for ${key}`);
        } catch (error) {
          console.warn(`VGMMusicManager: Failed to pre-generate buffer for ${key}:`, error);
        }
      }

      // Calculate memory usage
      const dataSize = vgmData.byteLength;
      const bufferSize = audioBuffer ? this.estimateAudioBufferSize(audioBuffer) : 0;
      const totalSize = dataSize + bufferSize;

      // Cache the music data
      const cachedMusic: CachedMusic = {
        data: vgmData,
        info,
        audioBuffer,
        lastUsed: Date.now(),
        loop
      };

      this.musicCache.set(key, cachedMusic);
      this.totalCacheMemory += totalSize;

      // Manage cache size and memory
      this.manageCacheSize();

      console.log(`VGMMusicManager: Cached ${key}: ${info.chips.join(', ')} - ${info.duration}`);
      return info;

    } catch (error) {
      console.error(`VGMMusicManager: Failed to load ${key}:`, error);
      return null;
    }
  }

  /**
   * Play music instantly from cache, or load on-demand if not cached
   */
  public async playMusic(key: string): Promise<boolean> {
    if (!this.initialized || !this.vgmPlayer) {
      console.error('VGMMusicManager: Not initialized');
      return false;
    }

    let cached = this.musicCache.get(key);

    // If not cached, try to find and load it from manifests
    if (!cached) {
      console.log(`VGMMusicManager: '${key}' not cached, attempting on-demand load...`);

      // Try to find the asset from any loaded manifest
      const asset = this.findAsset(key);
      if (asset) {
        // Use pregenerate=true for on-demand loading to avoid hangs during playback
        console.log(`VGMMusicManager: Loading '${key}' on-demand with pre-generation...`);
        const info = await this.loadMusicAsset(key, asset.path, true, asset.loop ?? true);
        if (!info) {
          console.error(`VGMMusicManager: Failed to load '${key}' on-demand`);
          return false;
        }
        cached = this.musicCache.get(key);
      } else {
        console.error(`VGMMusicManager: Music '${key}' not found in any manifest`);
        return false;
      }
    }

    if (!cached) {
      console.error(`VGMMusicManager: Failed to get cached data for '${key}'`);
      return false;
    }

    try {
      // Update last used timestamp
      cached.lastUsed = Date.now();

      // If we have a pre-generated buffer, use it directly
      if (cached.audioBuffer) {
        console.log(`VGMMusicManager: Playing pre-generated buffer for '${key}'`);
        await this.vgmPlayer.playPreGeneratedBuffer(cached.audioBuffer, cached.loop);
      } else {
        // Fall back to regular loading (still cached, but needs processing)
        await this.vgmPlayer.loadVGM(cached.data);
        await this.vgmPlayer.playMusic();
      }

      console.log(`VGMMusicManager: Playing '${key}' from cache`);
      return true;

    } catch (error) {
      console.error(`VGMMusicManager: Failed to play '${key}':`, error);
      return false;
    }
  }

  /**
   * Find asset for a given key from loaded manifests
   */
  private findAsset(key: string): MusicAsset | null {
    for (const manifest of this.loadedManifests.values()) {
      const asset = manifest.assets.find(a => a.key === key);
      if (asset) {
        return asset;
      }
    }
    return null;
  }

  /**
   * Stop music playback
   */
  public stopMusic(): void {
    if (this.vgmPlayer) {
      this.vgmPlayer.stopMusic();
    }
  }

  /**
   * Check if music is playing
   */
  public isPlaying(): boolean {
    return this.vgmPlayer ? this.vgmPlayer.isPlaying() : false;
  }

  /**
   * Generate audio buffer during preload phase
   * This performs the expensive VGM processing upfront to eliminate gameplay hangs
   */
  private async generateAudioBuffer(vgmData: Uint8Array, info: VGMInfo): Promise<AudioBuffer> {
    if (!this.vgmPlayer) {
      throw new Error('VGM Player not available');
    }

    try {
      // Load the VGM data into the player temporarily
      await this.vgmPlayer.loadVGM(vgmData);

      // Generate the audio buffer (this is the expensive operation)
      const audioBuffer = this.vgmPlayer.generateAudioBuffer();

      console.log('VGMMusicManager: Successfully pre-generated audio buffer');
      return audioBuffer;

    } catch (error) {
      console.error('VGMMusicManager: Failed to pre-generate audio buffer:', error);
      throw error;
    }
  }

  /**
   * Estimate audio buffer size in bytes
   */
  private estimateAudioBufferSize(buffer: AudioBuffer): number {
    // AudioBuffer size = sampleRate * duration * numberOfChannels * 4 bytes per float
    return buffer.sampleRate * buffer.duration * buffer.numberOfChannels * 4;
  }

  /**
   * Calculate cache memory usage for a specific entry
   */
  private getCacheEntrySize(cached: CachedMusic): number {
    const dataSize = cached.data.byteLength;
    const bufferSize = cached.audioBuffer ? this.estimateAudioBufferSize(cached.audioBuffer) : 0;
    return dataSize + bufferSize;
  }

  /**
   * Manage cache size and memory using LRU eviction
   */
  private manageCacheSize(): void {
    const memoryLimitBytes = this.maxCacheMemoryMB * 1024 * 1024;

    // Check if we need to evict due to size or memory limits
    if (this.musicCache.size <= this.maxCacheSize && this.totalCacheMemory <= memoryLimitBytes) {
      return;
    }

    // Sort by last used time (least recently used first)
    const entries = Array.from(this.musicCache.entries());
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    // Remove entries until we're under both limits
    while (
      (this.musicCache.size > this.maxCacheSize || this.totalCacheMemory > memoryLimitBytes) &&
      entries.length > 0
    ) {
      const [key, cached] = entries.shift()!;
      const entrySize = this.getCacheEntrySize(cached);

      this.musicCache.delete(key);
      this.totalCacheMemory -= entrySize;

      const memoryMB = (this.totalCacheMemory / (1024 * 1024)).toFixed(2);
      console.log(`VGMMusicManager: Evicted ${key} from cache (${this.musicCache.size} entries, ${memoryMB}MB)`);
    }
  }

  /**
   * Check if music is cached
   */
  public isCached(key: string): boolean {
    return this.musicCache.has(key);
  }

  /**
   * Get detailed cache statistics
   */
  public getCacheStats(): {
    size: number;
    maxSize: number;
    memoryMB: number;
    maxMemoryMB: number;
    keys: string[];
    memoryBreakdown: { key: string; sizeMB: number }[];
  } {
    const memoryBreakdown = Array.from(this.musicCache.entries()).map(([key, cached]) => ({
      key,
      sizeMB: this.getCacheEntrySize(cached) / (1024 * 1024)
    })).sort((a, b) => b.sizeMB - a.sizeMB);

    return {
      size: this.musicCache.size,
      maxSize: this.maxCacheSize,
      memoryMB: this.totalCacheMemory / (1024 * 1024),
      maxMemoryMB: this.maxCacheMemoryMB,
      keys: Array.from(this.musicCache.keys()),
      memoryBreakdown
    };
  }

  /**
   * Set maximum cache size
   */
  public setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    this.manageCacheSize();
  }

  /**
   * Set maximum cache memory in MB
   */
  public setMaxCacheMemory(memoryMB: number): void {
    this.maxCacheMemoryMB = memoryMB;
    this.manageCacheSize();
  }

  /**
   * Clear all cached music
   */
  public clearCache(): void {
    this.musicCache.clear();
    this.totalCacheMemory = 0;
    console.log('VGMMusicManager: Cache cleared');
  }

  /**
   * Resume audio context (call on user interaction)
   */
  public resumeAudio(): void {
    if (this.vgmPlayer) {
      this.vgmPlayer.resumeAudio();
    }
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopMusic();
    this.clearCache();
    this.loadedManifests.clear();
    if (this.vgmPlayer) {
      // VGMPlayer doesn't have cleanup method, but we can stop music
      this.vgmPlayer.stopMusic();
    }
    this.vgmPlayer = null;
    this.initialized = false;
    console.log('VGMMusicManager: Cleaned up');
  }
}