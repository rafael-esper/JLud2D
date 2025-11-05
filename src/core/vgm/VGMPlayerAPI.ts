/**
 * VGM Player API
 * Centralized VGM audio management for MainEngine
 * Provides asset loading and playback methods similar to Phaser's audio system
 */

import { VGMPlayer, VGMPlayerOptions, VGMInfo } from './index';

export class VGMPlayerAPI {
  private static vgmPlayer: VGMPlayer | null = null;
  private static vgmAssets: Map<string, Uint8Array> = new Map();
  private static initialized: boolean = false;

  /**
   * Initialize VGM audio system
   */
  public static async initialize(): Promise<void> {
    if (VGMPlayerAPI.initialized) return;

    try {
      const options: VGMPlayerOptions = {
        sampleRate: 44100,
        enableLooping: true
      };

      VGMPlayerAPI.vgmPlayer = new VGMPlayer(options);
      await VGMPlayerAPI.vgmPlayer.initialize();
      VGMPlayerAPI.initialized = true;

      console.log('VGMPlayerAPI: Initialized successfully');
    } catch (error) {
      console.error('VGMPlayerAPI: Failed to initialize:', error);
    }
  }

  /**
   * Load VGM asset (similar to this.load.audio pattern)
   * @param key Asset key for later playback
   * @param filePath Path to VGM file
   */
  public static async loadVGM(key: string, filePath: string): Promise<VGMInfo | null> {
    if (!VGMPlayerAPI.initialized) {
      await VGMPlayerAPI.initialize();
    }

    if (!VGMPlayerAPI.vgmPlayer) {
      console.error('VGMPlayerAPI: Player not initialized');
      return null;
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load VGM file: ${filePath}`);
      }

      const vgmData = new Uint8Array(await response.arrayBuffer());
      const info = await VGMPlayerAPI.vgmPlayer.loadVGM(vgmData);

      // Store VGM data for later playback
      VGMPlayerAPI.vgmAssets.set(key, vgmData);

      console.log(`VGMPlayerAPI: Loaded ${key}: ${info.chips.join(', ')} - ${info.duration}`);
      return info;
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to load ${key}:`, error);
      return null;
    }
  }

  /**
   * Play VGM music by key
   * @param key Asset key of the VGM to play
   */
  public static async playMusic(key: string): Promise<boolean> {
    if (!VGMPlayerAPI.initialized || !VGMPlayerAPI.vgmPlayer) {
      console.error('VGMPlayerAPI: Not initialized');
      return false;
    }

    const vgmData = VGMPlayerAPI.vgmAssets.get(key);
    if (!vgmData) {
      console.error(`VGMPlayerAPI: Asset '${key}' not found. Use loadVGM() first.`);
      return false;
    }

    try {
      // Load the VGM data into the player
      await VGMPlayerAPI.vgmPlayer.loadVGM(vgmData);

      // Start playback
      await VGMPlayerAPI.vgmPlayer.playMusic();

      console.log(`VGMPlayerAPI: Playing '${key}'`);
      return true;
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to play '${key}':`, error);
      return false;
    }
  }

  /**
   * Stop VGM music playback
   */
  public static stopMusic(): void {
    if (VGMPlayerAPI.vgmPlayer) {
      VGMPlayerAPI.vgmPlayer.stopMusic();
      console.log('VGMPlayerAPI: Music stopped');
    }
  }

  /**
   * Check if VGM music is currently playing
   */
  public static isPlaying(): boolean {
    return VGMPlayerAPI.vgmPlayer ? VGMPlayerAPI.vgmPlayer.isPlaying() : false;
  }

  /**
   * Resume audio context (call on user interaction)
   */
  public static resumeAudio(): void {
    if (VGMPlayerAPI.vgmPlayer) {
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