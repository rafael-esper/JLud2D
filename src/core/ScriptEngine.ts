/**
 * Script Engine
 * Utility methods for scripts including drawing, music, sound, and other non-core functions
 * Separated from MainEngine to keep core functionality focused
 */

import { VGMPlayerAPI } from './vgm2/VGMPlayerAPI';
import { MainEngine } from './MainEngine';
import { GameSpeed } from '../config/GameSpeed';

export class ScriptEngine {
  // Graphics objects for UI drawing
  private static uiGraphics: Phaser.GameObjects.Graphics | null = null;
  private static uiTexts: Phaser.GameObjects.Text[] = [];

  // True after fadeout completes, cleared by fadein — lets callers skip a redundant fadeout
  public static screenFadedOut: boolean = false;

  // ============================================================================
  // SCENE MANAGEMENT
  // ============================================================================

  /**
   * Get current scene from MainEngine
   */
  public static getCurrentScene(): Phaser.Scene | null {
    return MainEngine.getCurrentScene();
  }

  // ============================================================================
  // VGM AUDIO SYSTEM
  // ============================================================================

  /**
   * Load VGM music file
   */
  public static async loadVGM(key: string, filePath: string): Promise<any> {
    return await VGMPlayerAPI.loadVGM(key, filePath);
  }

  /**
   * Play VGM music by path (or a key previously registered via loadVGM);
   * the track is fetched on first play and streamed instantly after that.
   */
  public static playmusic(key: string, loop?: boolean): boolean {
    return VGMPlayerAPI.playMusic(key, loop);
  }

  /**
   * Stop VGM music
   */
  public static stopmusic(): void {
    VGMPlayerAPI.stopMusic();
  }

  /**
   * Set master music volume (0-100, matching Java Script.setMusicVolume)
   */
  public static setMusicVolume(volume: number): void {
    VGMPlayerAPI.setMusicVolume(Math.max(0, Math.min(100, volume)) / 100);
  }

  /**
   * Check if VGM music is currently playing
   */
  public static isVGMPlaying(): boolean {
    return VGMPlayerAPI.isPlaying();
  }

  /**
   * Resume VGM audio context (call on user interaction)
   */
  public static resumeVGMAudio(): void {
    VGMPlayerAPI.resumeAudio();
  }

  // ============================================================================
  // UI GRAPHICS SYSTEM
  // ============================================================================

  /**
   * Initialize UI graphics object for drawing rectangles
   */
  private static ensureUIGraphics(): Phaser.GameObjects.Graphics | null {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.error('ScriptEngine: No current scene for UI graphics');
      return null;
    }

    // Check if existing graphics belongs to a different scene or is destroyed
    if (ScriptEngine.uiGraphics && (!ScriptEngine.uiGraphics.scene || ScriptEngine.uiGraphics.scene !== currentScene)) {
      ScriptEngine.uiGraphics = null;
    }

    if (!ScriptEngine.uiGraphics) {
      ScriptEngine.uiGraphics = currentScene.add.graphics();
      ScriptEngine.uiGraphics.setScrollFactor(0); // UI elements don't scroll with camera
      ScriptEngine.uiGraphics.setDepth(1000); // High depth to render on top
    }
    return ScriptEngine.uiGraphics;
  }

  /**
   * Clear all UI graphics (but keep text)
   */
  public static clearUIGraphics(): void {
    const graphics = ScriptEngine.ensureUIGraphics();
    if (graphics) {
      graphics.clear();
    }
  }

  /**
   * Clear all UI text objects
   */
  public static clearUITexts(): void {
    ScriptEngine.uiTexts.forEach(text => {
      if (text && text.scene) {
        text.destroy();
      }
    });
    ScriptEngine.uiTexts = [];
  }

  /**
   * Draw filled rectangle (Java screen.rectfill equivalent)
   * @param x1 Left coordinate
   * @param y1 Top coordinate
   * @param x2 Right coordinate
   * @param y2 Bottom coordinate
   * @param color RGB color object {r, g, b}
   */
  public static rectfill(x1: number, y1: number, x2: number, y2: number, color: {r: number, g: number, b: number}): void {
    const graphics = ScriptEngine.ensureUIGraphics();
    if (!graphics) return;

    const hexColor = (color.r << 16) | (color.g << 8) | color.b;
    graphics.fillStyle(hexColor, 1);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    graphics.fillRect(left, top, width, height);
  }

  /**
   * Draw rectangle outline (Java screen.rect equivalent)
   * @param x1 Left coordinate
   * @param y1 Top coordinate
   * @param x2 Right coordinate
   * @param y2 Bottom coordinate
   * @param color RGB color object {r, g, b}
   */
  public static rect(x1: number, y1: number, x2: number, y2: number, color: {r: number, g: number, b: number}): void {
    const graphics = ScriptEngine.ensureUIGraphics();
    if (!graphics) return;

    const hexColor = (color.r << 16) | (color.g << 8) | color.b;
    graphics.lineStyle(1, hexColor, 1);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    graphics.strokeRect(left, top, width, height);
  }

  /**
   * Print text string (Java screen.printString equivalent)
   * @param x X coordinate
   * @param y Y coordinate
   * @param fontStyle Font style (ignored for now, uses default)
   * @param text Text to display
   * @param color Optional color (default: white)
   */
  public static printString(x: number, y: number, fontStyle: any, text: string, color?: {r: number, g: number, b: number}): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) return;

    const hexColor = color ? ((color.r << 16) | (color.g << 8) | color.b) : 0xffffff;

    const textObj = currentScene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: `#${hexColor.toString(16).padStart(6, '0')}`
    });

    textObj.setScrollFactor(0); // UI text doesn't scroll with camera
    textObj.setDepth(1001); // Higher than UI graphics

    // Track text objects for cleanup
    ScriptEngine.uiTexts.push(textObj);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Render CHR frame at specified position (port of screen.blitentityframe)
   */
  public static blitEntityFrame(x: number, y: number, chr: any, frameIndex: number): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      return;
    }

    // Validate frameIndex
    if (frameIndex === undefined || frameIndex === null || isNaN(frameIndex)) {
      frameIndex = 0; // Default to frame 0
    }

    // Create a temporary sprite if needed for CHR rendering
    if (!chr._tempSprite) {
      // Use the correct texture key based on CHR image name
      const textureKey = `chr-${chr.getImageName().replace('.png', '')}`;
      chr._tempSprite = currentScene.add.sprite(0, 0, textureKey);
      chr._tempSprite.setDepth(10000); // Above everything, including background
    }

    chr.render(chr._tempSprite, x, y, frameIndex);
  }

  /**
   * Blit image to screen (port of screen.blit)
   */
  public static blit(x: number, y: number, image: any): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) return;

    if (image.key) {
      // If the image has a Phaser texture key, use that
      const imageObj = currentScene.add.image(x, y, image.key);
      imageObj.setOrigin(0, 0);
      imageObj.setDepth(1001); // Above menu graphics
    } else if (image.texture) {
      // If we have a texture reference, create an image from it
      console.log(`Rendering VImage at position (${x}, ${y})`);
      // This would need proper integration with the rendering system
    } else {
      // Placeholder for actual rendering
      console.log(`Rendering VImage at position (${x}, ${y}) - size: ${image.width}x${image.height}`);
    }
  }

  /**
   * Draw text string at specified position (port of screen.g.drawString)
   * @param x X coordinate
   * @param y Y coordinate
   * @param text Text to display
   * @param fontSize Font size in pixels
   * @param color Optional color (default: white)
   */
  public static drawText(x: number, y: number, text: string, fontSize: number, color?: {r: number, g: number, b: number}): Phaser.GameObjects.Text | null {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) return null;
    if (!text || text.length === 0) return null;

    const hexColor = color ? ((color.r << 16) | (color.g << 8) | color.b) : 0xffffff;

    try {
      const textObj = currentScene.add.text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`,
        color: `#${hexColor.toString(16).padStart(6, '0')}`,
        resolution: 1
      });

      textObj.setOrigin(0, 0);
      textObj.setDepth(1002); // Above menu graphics and images
      return textObj;
    } catch (error) {
      console.error('Error drawing text:', error);
      return null;
    }
  }

  /**
   * Get left substring utility function
   * @param str Source string
   * @param length Number of characters from the left
   */
  public static left(str: string, length: number): string {
    if (length <= 0) return '';
    if (length >= str.length) return str;
    return str.substring(0, length);
  }

  /**
   * Generate random integer between min and max (inclusive)
   * Port of Java Script.random() method
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   */
  public static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clear all input states to prevent unwanted player movement
   * Attempts to access the current scene's InputManager to call clearInputs
   */
  public static clearInputs(): void {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.warn("ScriptEngine: No current scene available for clearing inputs");
      return;
    }

    // Try to access the inputManager from the current scene
    // Cast to any to access the inputManager property
    const sceneWithInput = currentScene as any;
    if (sceneWithInput.inputManager && typeof sceneWithInput.inputManager.clearInputs === 'function') {
      sceneWithInput.inputManager.clearInputs();
      console.log("ScriptEngine: Input states cleared to prevent unwanted movement");
    } else {
      console.warn("ScriptEngine: Could not access inputManager.clearInputs() on current scene");
    }
  }

  // ============================================================================
  // ENTITY SYSTEM
  // ============================================================================

  /**
   * Set entities paused state (port of Java setentitiespaused)
   * When resuming from pause, resets entity think timing to prevent time jumps
   * @param paused Whether to pause entities
   */
  public static setEntitiesPaused(paused: boolean): void {
    MainEngine.setEntitiesPausedWithTiming(paused);
  }

  /**
   * Map switching - use MainEngine's startEngine method
   * Direct port of Java map() method
   */
  public static async map(mapname: string): Promise<void> {
    await MainEngine.startEngine(mapname);
  }

  /**
   * Fade in screen using native Phaser camera fade
   */
  public static async fadein(duration: number, renderMap: boolean): Promise<void> {
    console.log(`ScriptEngine: Fading in over ${duration} frames, renderMap: ${renderMap}`);

    // Block controls during fade to prevent double-triggering events
    MainEngine.setScriptActive(true);
    ScriptEngine.clearInputs();

    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.error("ScriptEngine: No current scene for fade in");
      return;
    }

    // Convert frame duration to milliseconds (16ms per frame at 60fps),
    // shortened/lengthened by the global game speed
    const durationMs = GameSpeed.scaleDelay(duration * 16);

    // Render entities at their current positions before fade-in
    MainEngine.RenderEntities();

    return new Promise<void>((resolve) => {
      // Restore camera alpha to 1 and then use fadeIn
      currentScene.cameras.main.setAlpha(1);
      currentScene.cameras.main.fadeIn(durationMs, 0, 0, 0);

      currentScene.cameras.main.once('camerafadeincomplete', () => {
        console.log("ScriptEngine: Fade in complete");

        ScriptEngine.screenFadedOut = false;

        // Unpause entities after fade in completes (critical for movement)
        MainEngine.setEntitiesPaused(false);
        console.log("ScriptEngine: Entities unpaused after fade in");

        // Clear inputs at end of fade to prevent unwanted movement
        ScriptEngine.clearInputs();

        resolve();
      });
    });
  }

  /**
   * Fade out screen using native Phaser camera fade
   */
  public static async fadeout(duration: number, renderMap: boolean): Promise<void> {
    console.log(`ScriptEngine: Fading out over ${duration} frames, renderMap: ${renderMap}`);

    // Block controls during fade to prevent double-triggering events
    MainEngine.setScriptActive(true);

    // Clear inputs at start of fade to prevent unwanted movement
    ScriptEngine.clearInputs();

    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.error("ScriptEngine: No current scene for fade out");
      return;
    }

    MainEngine.setEntitiesPaused(true);

    // Convert frame duration to milliseconds (16ms per frame at 60fps),
    // shortened/lengthened by the global game speed
    const durationMs = GameSpeed.scaleDelay(duration * 16);

    return new Promise<void>((resolve) => {
      // Use native Phaser camera fade
      currentScene.cameras.main.fadeOut(durationMs, 0, 0, 0);

      currentScene.cameras.main.once('camerafadeoutcomplete', () => {
        console.log("ScriptEngine: Fade out complete");

        ScriptEngine.screenFadedOut = true;

        // Clear inputs at end of fade to prevent unwanted movement
        ScriptEngine.clearInputs();

        // Re-enable controls after fade completes
        MainEngine.setScriptActive(false);

        resolve();
      });
    });
  }

  /**
   * Clean up all script engine resources
   */
  public static cleanup(): void {
    if (ScriptEngine.uiGraphics) {
      ScriptEngine.uiGraphics.destroy();
      ScriptEngine.uiGraphics = null;
    }

    ScriptEngine.clearUITexts();
  }
}