/**
 * AkBaseScene - Base class for all Alex Kidd demo scenes
 * Contains common functionality like controls setup, menu navigation, etc.
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { ScriptEngine } from '../../core/ScriptEngine';
import { MapScene } from './MapScene';

export abstract class AkBaseScene extends Phaser.Scene {
  protected config!: GameConfig;
  protected inputManager!: InputManager;

  constructor(sceneKey: string) {
    super({ key: sceneKey });
  }

  /**
   * Common Alex Kidd controls setup
   * All AK scenes use b1, b2 with start and menu always included
   */
  protected setupAkControls(): void {
    const controlsConfig = new ControlsConfig();
    this.inputManager = new InputManager(this, controlsConfig);

    // Alex Kidd demo uses b1, b2 (start and menu are always included)
    this.inputManager.setMobileButtons(['b1', 'b2']);
  }

  /**
   * Handle common input that all AK scenes should respond to
   * Call this from the scene's update() method
   */
  protected handleCommonInput(): void {
    if (!this.inputManager) return;

    this.inputManager.updateControls();

    // ESC/Menu - Back to main menu (common for all AK scenes)
    if (this.inputManager.justPressed('menu')) {
      this.backToMainMenu();
    }
  }

  /**
   * Navigate back to main menu (common functionality)
   */
  protected backToMainMenu(): void {
    console.log(`${this.scene.key}: Returning to main menu...`);

    // Stop any playing music
    ScriptEngine.stopmusic();

    // Reset MapScene level to 1 when returning to menu
    MapScene.reset();
    console.log('AkBaseScene: Reset MapScene level to 1');

    // Return to main menu scene
    this.scene.start('MenuScene', { config: this.config });
  }

  /**
   * Common cleanup when scene is destroyed
   */
  destroy(): void {
    // Stop music when scene is destroyed
    ScriptEngine.stopmusic();
  }
}