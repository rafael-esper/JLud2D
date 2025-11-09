/**
 * PSScene - Phantasy Star Base Scene
 * Updated to use the ported MenuStack system from Java
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { PSGame, ScreenSize } from './PSGame';
import { PS1Image } from './PSLibImage';
import { MenuStack, PSCancellable } from './menu/MenuStack';
import { MenuPromptBox } from './menu/MenuPromptBox';
import { MenuTextBox } from './menu/MenuTextBox';

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

    // Initialize the new ported menu stack
    this.menuStack = new MenuStack(this, this.inputManager);

    // Set scene reference in PSGame
    PSGame.setCurrentScene(this);

    // Initialize PS menu system (equivalent to Java initPSMenu)
    this.initPSMenu();
  }

  /**
   * Initialize PS Menu system - equivalent to Java PSMenu.initPSMenu()
   */
  private initPSMenu(): void {
    // Set screen dimensions based on camera
    this.menuStack.MAX_SCREEN_X = this.cameras.main.width;
    this.menuStack.MAX_SCREEN_Y = this.cameras.main.height;

    // Font settings are already set in MenuStack as static values
    console.log(`PSScene: Initialized menu system with screen ${this.menuStack.MAX_SCREEN_X}x${this.menuStack.MAX_SCREEN_Y}`);
  }

  /**
   * Main update loop - handles menu drawing
   */
  update() {
    // Draw all menus every frame
    this.menuStack.drawMenus();

    // Only handle input if no menu is currently active
    if (!this.menuStack.hasMenu()) {
      this.inputManager.updateControls();

      // Handle ESC/Menu - Back to main menu
      if (this.inputManager.justPressed('menu')) {
        this.backToMainMenu();
      }
    }
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
   * Show scrolling text (placeholder for Stext equivalent)
   */
  protected async showScrollingText(text: string): Promise<void> {
    console.log(`PSScene: Showing text: ${text}`);
    // In full implementation, this would show scrolling text
    // For now, just wait for button press
    await this.menuStack.waitAnyButton();
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

  private backToMainMenu(): void {
    console.log('PSScene: Returning to main menu...');
    PSGame.stopMusic();
    this.scene.start('MenuScene', { config: this.config });
  }
}