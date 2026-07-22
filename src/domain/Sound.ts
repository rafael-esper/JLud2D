/**
 * Sound - Generic sound playback system
 * Handles audio playback using Phaser's sound system
 */

import { MainEngine } from '../core/MainEngine';

export class Sound {
  /**
   * Play a sound by its key
   * @param soundKey - The Phaser sound key to play
   */
  public static playSound(soundKey: string): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.log('Sound: No current scene for sound playback');
      return;
    }

    if (!currentScene.sound) {
      console.log('Sound: Scene does not have sound manager');
      return;
    }

    try {
      currentScene.sound.play(soundKey);
    } catch (error) {
      console.log(`Sound: Error playing sound ${soundKey}:`, error);
    }
  }

  /**
   * Play a sound with volume control
   * @param soundKey - The Phaser sound key to play
   * @param volume - Volume level (0.0 to 1.0)
   */
  public static playSoundWithVolume(soundKey: string, volume: number): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.log('Sound: No current scene for sound playback');
      return;
    }

    if (!currentScene.sound) {
      console.log('Sound: Scene does not have sound manager');
      return;
    }

    try {
      currentScene.sound.play(soundKey, { volume: Math.max(0, Math.min(1, volume)) });
    } catch (error) {
      console.log(`Sound: Error playing sound ${soundKey} with volume ${volume}:`, error);
    }
  }

  /**
   * Stop a sound if it's playing
   * @param soundKey - The Phaser sound key to stop
   */
  public static stopSound(soundKey: string): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.log('Sound: No current scene for sound stopping');
      return;
    }

    if (!currentScene.sound) {
      console.log('Sound: Scene does not have sound manager');
      return;
    }

    try {
      const sound = currentScene.sound.get(soundKey);
      if (sound && sound.isPlaying) {
        sound.stop();
      }
    } catch (error) {
      console.log(`Sound: Error stopping sound ${soundKey}:`, error);
    }
  }

  /**
   * Stop all currently playing music/sounds
   */
  public static stopMusic(): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.log('Sound: No current scene for music stopping');
      return;
    }

    if (!currentScene.sound) {
      console.log('Sound: Scene does not have sound manager');
      return;
    }

    try {
      currentScene.sound.stopAll();
    } catch (error) {
      console.log('Sound: Error stopping music:', error);
    }
  }

  /**
   * Play music with looping
   * @param musicKey - The Phaser sound key to play as music
   */
  public static playMusic(musicKey: string): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.log('Sound: No current scene for music playback');
      return;
    }

    if (!currentScene.sound) {
      console.log('Sound: Scene does not have sound manager');
      return;
    }

    try {
      // Stop any currently playing music first
      this.stopMusic();
      // Play new music with loop
      currentScene.sound.play(musicKey, { loop: true });
    } catch (error) {
      console.log(`Sound: Error playing music ${musicKey}:`, error);
    }
  }
}