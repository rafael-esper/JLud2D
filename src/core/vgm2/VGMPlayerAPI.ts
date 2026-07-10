// VGM Player API (vgm2).
//
// Thin static wrapper over the vgm2 VGMMusicManager, preserving the surface the
// app already calls through ScriptEngine.

import { VGMMusicManager, VGMInfo } from './VGMMusicManager';

export class VGMPlayerAPI {
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (VGMPlayerAPI.initialized) return;
    try {
      await VGMMusicManager.getInstance().initialize({ sampleRate: 44100 });
      VGMPlayerAPI.initialized = true;
    } catch (error) {
      console.error('VGMPlayerAPI: Failed to initialize:', error);
    }
  }

  static async loadVGM(key: string, filePath: string): Promise<VGMInfo | null> {
    if (!VGMPlayerAPI.initialized) await VGMPlayerAPI.initialize();
    try {
      return await VGMMusicManager.getInstance().loadMusicAsset(key, filePath, false);
    } catch (error) {
      console.error(`VGMPlayerAPI: Failed to load ${key}:`, error);
      return null;
    }
  }

  static playMusic(key: string, loop?: boolean): boolean {
    if (!VGMPlayerAPI.initialized) {
      VGMPlayerAPI.initialize()
        .then(() => VGMPlayerAPI.playMusic(key, loop))
        .catch(console.error);
      return false;
    }
    VGMMusicManager.getInstance()
      .playMusic(key, loop)
      .then((ok) => {
        if (!ok) console.error(`VGMPlayerAPI: Failed to play '${key}'`);
      })
      .catch((error) => console.error(`VGMPlayerAPI: Failed to play '${key}':`, error));
    return true;
  }

  static stopMusic(): void {
    VGMMusicManager.getInstance().stopMusic();
  }

  static isPlaying(): boolean {
    return VGMMusicManager.getInstance().isPlaying();
  }

  static resumeAudio(): void {
    VGMMusicManager.getInstance().resumeAudio();
  }

  static setMusicVolume(volume: number): void {
    VGMMusicManager.getInstance().setMusicVolume(volume);
  }
}
