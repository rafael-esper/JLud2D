/**
 * PSScene - Phantasy Star Base Scene
 * Updated to use the ported MenuStack system from Java
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { PSGame } from './PSGame';
import { ScreenSize } from './game/GameData';
import { PS1Image } from './game/PSLibImage';
import { MenuStack, PSCancellable } from './menu/MenuStack';
import { MenuPromptBox } from './menu/MenuPromptBox';
import { MenuTextBox } from './menu/MenuTextBox';
import { PSSceneType, SpecialEntity } from './PSMenu';



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

    // Set PSMenu instance to our menuStack
    const { PSMenu } = await import('./PSMenu');
    PSMenu.instance = this.menuStack;

    // Set scene reference in PSGame
    PSGame.setCurrentScene(this);

    // Initialize PS menu system (equivalent to Java initPSMenu).
    // The static PSMenu.initPSMenu computes STEXT_BOTTOM_X/Y/WX/WY — without
    // it every Stext text box is created at undefined coordinates and
    // renders nothing (GameScene already did this; PSScene didn't).
    PSMenu.initPSMenu(ScreenSize.SCREEN_320_240);
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
  protected startScene(sceneType: PSSceneType, specialEntity: SpecialEntity = SpecialEntity.NONE): void {
    console.log(`PSScene: Starting scene ${PSSceneType[sceneType]}`);

    // Clear any existing menu stack
    this.menuStack.clear();

    // Handle different scene types
    switch (sceneType) {
      case PSSceneType.TITLE:
        this.setupTitleScene();
        break;
      case PSSceneType.BLACK:
        this.setupBlackScene();
        break;
      // Add more scene types as needed
      default:
        console.warn(`PSScene: Scene type ${PSSceneType[sceneType]} not fully implemented`);
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
    // Set title background - 'ps-title' is already loaded as a texture key
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


  private backToMainMenu(): void {
    console.log('PSScene: Returning to main menu...');
    PSGame.stopMusic();
    this.scene.start('MenuScene', { config: this.config });
  }
}