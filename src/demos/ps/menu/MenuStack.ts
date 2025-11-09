/**
 * MenuStack - PS Menu Management System
 * Port of MenuStack.java - Manages stack of menus and UI state
 */

import { MenuPromptBox } from './MenuPromptBox';

export class MenuStack {
  private scene: Phaser.Scene;
  private menuStack: MenuPromptBox[] = [];

  // Screen dimensions (matching Java PSMenu initialization)
  public MAX_SCREEN_X: number = 320;
  public MAX_SCREEN_Y: number = 240;

  // Font settings (matching Java)
  public static fontXSize: number = 7;
  public static fontYSize: number = 11;

  // Background and entity rendering
  public background: Phaser.GameObjects.Image | null = null;
  public backgroundMusic: string | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Push a menu onto the stack
   */
  public push(menu: MenuPromptBox): void {
    this.menuStack.push(menu);
  }

  /**
   * Pop the top menu from the stack
   */
  public pop(): MenuPromptBox | undefined {
    const menu = this.menuStack.pop();
    if (menu) {
      menu.hide();
    }
    return menu;
  }

  /**
   * Get the current (top) menu
   */
  public current(): MenuPromptBox | null {
    return this.menuStack.length > 0 ? this.menuStack[this.menuStack.length - 1] : null;
  }

  /**
   * Clear all menus from the stack
   */
  public clear(): void {
    while (this.menuStack.length > 0) {
      this.pop();
    }
  }

  /**
   * Check if the stack is empty
   */
  public isEmpty(): boolean {
    return this.menuStack.length === 0;
  }

  /**
   * Create a prompt box (equivalent to Java createPromptBox)
   */
  public createPromptBox(x: number, y: number, options: string[], cancellable: boolean = true): MenuPromptBox {
    return new MenuPromptBox(this.scene, x, y, options, cancellable);
  }

  /**
   * Wait for option selection (equivalent to Java waitOpt)
   */
  public async waitOpt(cancellable: boolean = true): Promise<number> {
    const currentMenu = this.current();
    if (!currentMenu) {
      throw new Error("No menu to wait for");
    }

    const result = await currentMenu.show();
    return result.cancelled ? -1 : result.selectedIndex;
  }

  /**
   * Set background image
   */
  public setBackground(textureKey: string): void {
    // Clean up existing background
    if (this.background) {
      this.background.destroy();
    }

    // Get actual screen dimensions
    const actualWidth = this.scene.cameras.main.width;
    const actualHeight = this.scene.cameras.main.height;

    // Create new background
    this.background = this.scene.add.image(actualWidth / 2, actualHeight / 2, textureKey);
    this.background.setDepth(-1); // Behind everything else

    // Scale to fit screen
    const scaleX = actualWidth / this.background.width;
    const scaleY = actualHeight / this.background.height;
    this.background.setScale(scaleX, scaleY);

    console.log(`MenuStack: Set background ${textureKey} with scale (${scaleX}, ${scaleY})`);
  }

  /**
   * Clear background
   */
  public clearBackground(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }
  }

  /**
   * Set background music
   */
  public setBackgroundMusic(musicKey: string): void {
    this.backgroundMusic = musicKey;
  }

  /**
   * Wait for any button press (equivalent to Java waitAnyButton)
   */
  public async waitAnyButton(): Promise<void> {
    return new Promise((resolve) => {
      const handleInput = () => {
        const inputManager = (this.scene as any).inputManager;
        if (!inputManager) {
          this.scene.time.delayedCall(50, handleInput);
          return;
        }

        if (inputManager.justPressed('b1') ||
            inputManager.justPressed('start') ||
            inputManager.justPressed('menu')) {
          resolve();
          return;
        }

        this.scene.time.delayedCall(50, handleInput);
      };

      this.scene.time.delayedCall(100, handleInput);
    });
  }
}