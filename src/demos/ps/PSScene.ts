/**
 * PSScene - Phantasy Star Base Scene
 * Port of PSMenu.java scene management functionality
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { PSGame, ScreenSize } from './PSGame';
import { PS1Image } from './PSLibImage';
import { MenuStack } from './menu/MenuStack';

export enum PSScene_Type {
  BLACK,
  BLUE_HOUSE,
  YELLOW_HOUSE,
  HOSPITAL,
  CHURCH,
  SHOP_CENTRAL,
  SHOP_FOOD,
  SHOP_HAND,
  SHOP_WEAPON,
  VILLAGE_HOUSE,
  SHOP_FOOD_VILLAGE,
  SHOP_HAND_VILLAGE,
  SHOP_WEAPON_VILLAGE,
  HOSPITAL_VILLAGE,
  CHURCH_VILLAGE,
  RUINED_HOUSE,
  SPACESHIP,
  PALACE,
  VILLA,
  CITY,
  BAYA,
  ALTAR,
  SCREEN,
  SCREEN_NOFADE,
  TITLE,
  ENDING,
  DUNGEON,
  CORRIDOR,
  FOREST,
  FIELDS,
  DESERT,
  ARTIC,
  PINES,
  SKY,
  BEACH,
  SEA,
  LAVA,
  GAS,
  CAVE
}

export enum PSSpecialEntity {
  NONE,
  OLDMAN,
  BEGGAR,
  ROBOTCOP,
  PRIEST,
  LUVENO,
  HASHIM,
  DEZOMAN,
  DEZO_PRIEST
}

export abstract class PSScene extends Phaser.Scene {
  protected config: GameConfig;
  protected inputManager: InputManager;
  protected menuStack: MenuStack;

  constructor(key: string) {
    super({ key });
  }

  async init(data: { config: GameConfig }) {
    this.config = data.config;

    // Initialize input manager
    const controlsConfig = new ControlsConfig();
    this.inputManager = new InputManager(this, controlsConfig);

    // PS demo uses b1 for selection (start and menu are always included)
    this.inputManager.setMobileButtons(['b1']);

    // Initialize menu stack
    this.menuStack = new MenuStack(this);

    // Set scene reference in PSGame
    PSGame.setCurrentScene(this);
  }

  /**
   * Start a scene with background (equivalent to Java startScene)
   */
  protected startScene(sceneType: PSScene_Type, specialEntity: PSSpecialEntity = PSSpecialEntity.NONE): void {
    console.log(`PSScene: Starting scene ${PSScene_Type[sceneType]}`);

    // Clear any existing menu stack
    this.menuStack.clear();

    // Handle different scene types
    switch (sceneType) {
      case PSScene_Type.TITLE:
        this.setupTitleScene();
        break;
      case PSScene_Type.BLACK:
        this.setupBlackScene();
        break;
      // Add more scene types as needed
      default:
        console.warn(`PSScene: Scene type ${PSScene_Type[sceneType]} not fully implemented`);
        break;
    }
  }

  /**
   * End current scene (equivalent to Java endScene)
   */
  protected endScene(): void {
    console.log("PSScene: Ending scene");
    this.menuStack.clear();
    this.menuStack.clearBackground();
    PSGame.stopMusic();
  }

  private setupTitleScene(): void {
    // Set title background
    this.menuStack.setBackground('ps-title');
  }

  private setupBlackScene(): void {
    // Clear background for black scene
    this.menuStack.clearBackground();

    // Create black background
    const blackBg = this.add.graphics();
    blackBg.fillStyle(0x000000);
    blackBg.fillRect(0, 0, this.menuStack.MAX_SCREEN_X, this.menuStack.MAX_SCREEN_Y);
    blackBg.setDepth(-1);
  }

  /**
   * Wait for option selection (equivalent to Java waitOpt)
   */
  protected async waitOpt(cancellable: boolean = true): Promise<number> {
    return await this.menuStack.waitOpt(cancellable);
  }

  /**
   * Create a prompt box menu
   */
  protected createPromptBox(x: number, y: number, options: string[], cancellable: boolean = true) {
    return this.menuStack.createPromptBox(x, y, options, cancellable);
  }

  /**
   * Push menu onto stack
   */
  protected pushMenu(menu: any): void {
    this.menuStack.push(menu);
  }

  /**
   * Pop menu from stack
   */
  protected popMenu(): any {
    return this.menuStack.pop();
  }

  /**
   * Wait for any button press
   */
  protected async waitAnyButton(): Promise<void> {
    return await this.menuStack.waitAnyButton();
  }

  /**
   * Show scrolling text (placeholder for Stext equivalent)
   */
  protected async showScrollingText(text: string): Promise<void> {
    console.log(`PSScene: Showing text: ${text}`);
    // In full implementation, this would show scrolling text
    // For now, just wait for button press
    await this.waitAnyButton();
  }

  /**
   * Screen fade effect (placeholder)
   */
  protected screenFade(duration: number, fadeIn: boolean): Promise<void> {
    console.log(`PSScene: Screen fade ${fadeIn ? 'in' : 'out'} over ${duration} frames`);

    return new Promise((resolve) => {
      const graphics = this.add.graphics();
      graphics.setDepth(10000);

      if (fadeIn) {
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, this.menuStack.MAX_SCREEN_X, this.menuStack.MAX_SCREEN_Y);
        graphics.setAlpha(1);

        this.tweens.add({
          targets: graphics,
          alpha: 0,
          duration: duration * 16, // Convert frames to ms (assuming 60fps)
          onComplete: () => {
            graphics.destroy();
            resolve();
          }
        });
      } else {
        graphics.fillStyle(0x000000);
        graphics.fillRect(0, 0, this.menuStack.MAX_SCREEN_X, this.menuStack.MAX_SCREEN_Y);
        graphics.setAlpha(0);

        this.tweens.add({
          targets: graphics,
          alpha: 1,
          duration: duration * 16,
          onComplete: () => {
            resolve();
          }
        });
      }
    });
  }
}