/**
 * VGM Player API
 * Centralized VGM audio management for MainEngine
 * Provides asset loading and playback methods similar to Phaser's audio system
 * Now uses VGMMusicManager for optimal performance and caching
 */

import { VGMPlayer, VGMPlayerOptions, VGMInfo } from './index';
import { VGMMusicManager, MusicManifest } from './VGMMusicManager';

export class VGMPlayerAPI {
  private static vgmPlayer: VGMPlayer | null = null;
  private static vgmAssets: Map<string, Uint8Array> = new Map();
  private static initialized: boolean = false;
  private static musicManager: VGMMusicManager | null = null;

  /**
   * Initialize VGM audio system with music manager
   */
  public static async initialize(): Promise<void> {
    if (VGMPlayerAPI.initialized) return;

    try {
      const options: VGMPlayerOptions = {
        sampleRate: 44100,
        enableLooping: true
      };

      // Initialize both legacy VGMPlayer and new VGMMusicManager
      VGMPlayerAPI.vgmPlayer = new VGMPlayer(options);
      await VGMPlayerAPI.vgmPlayer.initialize();

      VGMPlayerAPI.musicManager = VGMMusicManager.getInstance();
      await VGMPlayerAPI.musicManager.initialize(options);

      VGMPlayerAPI.initialized = true;

    } catch (error) {
      console.error('VGMPlayerAPI: Failed to initialize:', error);
    }
  }

  /**
   * Load VGM asset (similar to this.load.audio pattern)
   * Now uses VGMMusicManager for caching to eliminate loading hangs
   * @param key Asset key for later playback
   * @param filePath Path to VGM file
   */
  public static async loadVGM(key: string, filePath: string): Promise<VGMInfo | null> {
    if (!VGMPlayerAPI.initialized) {
      await VGMPlayerAPI.initialize();
    }

    if (!VGMPlayerAPI.musicManager) {
      console.error('VGMPlayerAPI: Music manager not initialized');
      return null;
    }

    try {
      // Use VGMMusicManager for optimized loading and caching
      const info = await VGMPlayerAPI.musicManager.loadMusicAsset(key, filePath, false);


      return info;
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to load ${key}:`, error);
      return null;
    }
  }

  /**
   * Play VGM music by key using cached music manager for instant playback
   * @param key Asset key of the VGM to play
   */
  public static playMusic(key: string): boolean {
    if (!VGMPlayerAPI.initialized) {
      VGMPlayerAPI.initialize().then(() => {
        VGMPlayerAPI.playMusic(key);
      }).catch(console.error);
      return false;
    }

    if (!VGMPlayerAPI.musicManager) {
      console.error('VGMPlayerAPI: Music manager not initialized');
      return false;
    }

    try {
      VGMPlayerAPI.musicManager.playMusic(key).then((success) => {
        if (!success) {
          console.error(`VGMPlayerAPI: Failed to play '${key}' - could not load or cache`);
        }
      }).catch((error) => {
        console.error(`VGMPlayerAPI: Failed to play '${key}':`, error);
      });

      return true;
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to play '${key}':`, error);
      return false;
    }
  }

  /**
   * Preload music manifest for instant playback
   * @param manifest Music manifest to preload
   */
  public static async preloadMusicManifest(manifest: MusicManifest): Promise<void> {
    if (!VGMPlayerAPI.initialized) {
      await VGMPlayerAPI.initialize();
    }

    if (!VGMPlayerAPI.musicManager) {
      console.error('VGMPlayerAPI: Music manager not initialized');
      return;
    }

    // Check if this manifest was already preloaded
    const preloadAssets = manifest.assets.filter(asset => asset.preload);
    const allCached = preloadAssets.every(asset => VGMPlayerAPI.musicManager!.isCached(asset.key));

    if (allCached) {
      return;
    }

    try {
      await VGMPlayerAPI.musicManager.preloadMusicManifest(manifest);
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to preload manifest:`, error);
    }
  }

  /**
   * Stop VGM music playback
   */
  public static stopMusic(): void {
    if (VGMPlayerAPI.musicManager) {
      VGMPlayerAPI.musicManager.stopMusic();
      console.log('VGMPlayerAPI: Music stopped');
    } else if (VGMPlayerAPI.vgmPlayer) {
      VGMPlayerAPI.vgmPlayer.stopMusic();
      console.log('VGMPlayerAPI: Music stopped (legacy)');
    }
  }

  /**
   * Check if VGM music is currently playing
   */
  public static isPlaying(): boolean {
    if (VGMPlayerAPI.musicManager) {
      return VGMPlayerAPI.musicManager.isPlaying();
    }
    return VGMPlayerAPI.vgmPlayer ? VGMPlayerAPI.vgmPlayer.isPlaying() : false;
  }

  /**
   * Resume audio context (call on user interaction)
   */
  public static resumeAudio(): void {
    if (VGMPlayerAPI.musicManager) {
      VGMPlayerAPI.musicManager.resumeAudio();
    } else if (VGMPlayerAPI.vgmPlayer) {
      VGMPlayerAPI.vgmPlayer.resumeAudio();
    }
  }


  /**
   * Get VGM player instance (for advanced usage)
   */
  public static getPlayer(): VGMPlayer | null {
    return VGMPlayerAPI.vgmPlayer;
  }

  /**
   * Clean up VGM system
   */
  public static cleanup(): void {
    if (VGMPlayerAPI.vgmPlayer) {
      VGMPlayerAPI.vgmPlayer.stopMusic();
    }
    VGMPlayerAPI.vgmAssets.clear();
    VGMPlayerAPI.vgmPlayer = null;
    VGMPlayerAPI.initialized = false;
    console.log('VGMPlayerAPI: Cleaned up');
  }
}