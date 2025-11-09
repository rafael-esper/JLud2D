/**
 * MenuStack - PS Menu Management System
 * Direct port of MenuStack.java - Manages stack of menus and rendering
 */

import { MenuType, MenuState } from './MenuType';
import { MenuPromptBox } from './MenuPromptBox';
import { MenuTextBox } from './MenuTextBox';
import { InputManager } from '../../../config/Controls';

export enum PSOutcome {
  NO_FADE = 'NO_FADE',
  FADE = 'FADE',
  FADE_HOUSE = 'FADE_HOUSE',
  FADE_DUNGEON = 'FADE_DUNGEON'
}

export enum PSCancellable {
  TRUE = 'TRUE',
  FALSE = 'FALSE'
}

export class MenuStack {
  private scene: Phaser.Scene;
  private inputManager: InputManager;

  // Font settings (matching Java)
  public static fontXSize: number = 7;
  public static fontYSize: number = 11;
  public static BETWEEN_ROWS_SPACE: number = 4;

  // Screen dimensions
  public MAX_SCREEN_X: number = 320;
  public MAX_SCREEN_Y: number = 240;

  // Colors (matching Java exactly)
  private static readonly LIGHT_GRAY = 0x5A5A5A; // RGB(90,90,90)
  private static readonly DARK_GRAY = 0x3C3C3C;  // RGB(60,60,60)
  private static readonly BACK_COLOR = 0x002064; // RGB(0,32,100)

  // Menu stack
  private menus: MenuType[] = [];

  // Background and entity rendering
  public back: Phaser.GameObjects.Image | null = null;
  public npc: any = null;
  public entitySprite: Phaser.GameObjects.Image | null = null;
  public entityX: number = 0;
  public entityY: number = 0;

  private waitDelay: number = 0;
  public showPlayers: boolean = false;
  public outcome: PSOutcome = PSOutcome.NO_FADE;

  // Graphics context for drawing
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1000);
  }

  public hasMenu(): boolean {
    return this.menus.length > 0;
  }

  public push(menu: MenuType): void {
    this.menus.push(menu);
  }

  public pop(): MenuType | undefined {
    const menu = this.menus.pop();
    if (menu && typeof (menu as any).destroy === 'function') {
      (menu as any).destroy();
    }
    return menu;
  }

  /**
   * Draw all menus - direct port of Java drawMenus()
   */
  public drawMenus(): void {
    // Clear previous graphics
    this.graphics.clear();

    // Draw background
    if (this.back === null) {
      // Render scene background if no specific background set
    } else {
      // Draw background image
      if (this.back && this.back.texture) {
        // Background is already positioned
      }
    }

    // Draw entity sprite if present
    if (this.entitySprite) {
      this.entitySprite.setPosition(this.entityX, this.entityY);
    }

    // If there is a waiting delay, don't draw menus, just the scene
    if (this.waitDelay > 0) {
      this.waitDelay--;
      return;
    }

    // Draw each menu - only draw the top menu (last one on stack)
    if (this.menus.length > 0) {
      const topMenu = this.menus[this.menus.length - 1];

      if (topMenu.drawDelay > 0) {
        // Draw just the opening menu
        topMenu.draw(true);
      } else {
        // Draw the active top menu
        topMenu.draw(true);
      }
    }
  }

  /**
   * Create prompt box - direct port of Java createPromptBox()
   */
  public createPromptBox(x: number, y: number, options: string[], hasDelay: boolean): MenuPromptBox {
    return new MenuPromptBox(this, x, y, options, hasDelay);
  }

  /**
   * Create text box - direct port of Java createTextBox()
   */
  public createTextBox(x: number, y: number, wx: number, wy: number, r1: string, r2: string, hasDelay: boolean, hasMore: boolean): MenuTextBox {
    return new MenuTextBox(this, x, y, wx, wy, r1, r2, hasDelay, hasMore);
  }

  /**
   * Get maximum text length - direct port of Java getMaxTextLength()
   */
  public static getMaxTextLength(options: string[]): number {
    let max = 0;
    for (const s of options) {
      if (s && s.length > max) {
        max = s.length;
      }
    }
    return max * MenuStack.fontXSize; // Approximate pixel width
  }

  /**
   * Draw text box - direct port of Java drawTextBox()
   */
  public drawTextBox(x: number, y: number, text: string): void {
    this.drawBox(x, y, 10 + text.length * MenuStack.fontXSize, MenuStack.fontYSize + 6);

    // Create temporary text object for drawing
    const textObj = this.scene.add.text(x + 4 + MenuStack.fontXSize, y + 7, text, {
      fontSize: '12px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    textObj.setDepth(1001);

    // Clean up after one frame
    this.scene.time.delayedCall(16, () => {
      textObj.destroy();
    });
  }

  /**
   * Draw box - direct port of Java drawBox() with exact 3D border effect
   */
  public drawBox(x: number, y: number, wx: number, wy: number): void {
    // setlucent(15) equivalent - translucent background
    this.graphics.fillStyle(MenuStack.BACK_COLOR, 0.6);
    this.graphics.fillRect(x + 5, y + 5, wx - 5, wy - 5);

    // Draw the 3D border effect following exact Java order
    // rect(x+4,y+4,wx+x-4,wy+y-4,DARK_GRAY)
    this.graphics.lineStyle(1, MenuStack.DARK_GRAY);
    this.graphics.strokeRect(x + 4, y + 4, wx - 8, wy - 8);

    // rect(x+3,y+3,wx+x-3,wy+y-3,LIGHT_GRAY)
    this.graphics.lineStyle(1, MenuStack.LIGHT_GRAY);
    this.graphics.strokeRect(x + 3, y + 3, wx - 6, wy - 6);

    // rect(x+2,y+2,wx+x-2,wy+y-2,LIGHT_GRAY)
    this.graphics.lineStyle(1, MenuStack.LIGHT_GRAY);
    this.graphics.strokeRect(x + 2, y + 2, wx - 4, wy - 4);

    // rect(x+1,y+1,wx+x-1,wy+y-1,DARK_GRAY)
    this.graphics.lineStyle(1, MenuStack.DARK_GRAY);
    this.graphics.strokeRect(x + 1, y + 1, wx - 2, wy - 2);

    // rect(x,y,wx+x,wy+y,BACK_COLOR)
    this.graphics.lineStyle(1, MenuStack.BACK_COLOR);
    this.graphics.strokeRect(x, y, wx, wy);
  }

  /**
   * Wait for option selection - direct port of Java waitOpt()
   */
  public async waitOpt(cancellable: PSCancellable): Promise<number> {
    return new Promise((resolve) => {
      // Find last MenuPromptBox
      let box: MenuPromptBox | null = null;
      for (const menu of this.menus) {
        if (menu instanceof MenuPromptBox) {
          box = menu;
        }
      }

      if (!box) {
        resolve(-1);
        return;
      }

      const handleInput = () => {
        this.inputManager.updateControls();

        if (this.inputManager.justPressed('b1') || this.inputManager.justPressed('start')) {
          if (!box!.enabled[box!.selected]) {
            // TODO: Sound for disabled option
          } else {
            resolve(box!.selected);
            return;
          }
        }

        if (this.inputManager.justPressed('up')) {
          // TODO: Play menu sound
          box!.previousOption();
        }

        if (this.inputManager.justPressed('down')) {
          // TODO: Play menu sound
          box!.nextOption();
        }

        if (this.inputManager.justPressed('menu') && cancellable === PSCancellable.TRUE) {
          resolve(-1);
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleInput);
      };

      handleInput();
    });
  }

  /**
   * Wait for any button press
   */
  public async waitAnyButton(): Promise<boolean> {
    return new Promise((resolve) => {
      const handleInput = () => {
        this.inputManager.updateControls();

        if (this.inputManager.justPressed('b1') ||
            this.inputManager.justPressed('start') ||
            this.inputManager.justPressed('b2') ||
            this.inputManager.justPressed('b3')) {
          resolve(this.inputManager.justPressed('b1') || this.inputManager.justPressed('start'));
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleInput);
      };

      handleInput();
    });
  }

  /**
   * Set background image
   */
  public setBackground(textureKey: string): void {
    if (this.back) {
      this.back.destroy();
    }

    const actualWidth = this.scene.cameras.main.width;
    const actualHeight = this.scene.cameras.main.height;

    this.back = this.scene.add.image(actualWidth / 2, actualHeight / 2, textureKey);
    this.back.setDepth(-1);

    const scaleX = actualWidth / this.back.width;
    const scaleY = actualHeight / this.back.height;
    this.back.setScale(scaleX, scaleY);
  }

  /**
   * Clear background
   */
  public clearBackground(): void {
    if (this.back) {
      this.back.destroy();
      this.back = null;
    }
  }

  /**
   * Clear all menus
   */
  public clear(): void {
    // Clean up all menus
    for (const menu of this.menus) {
      if (typeof (menu as any).destroy === 'function') {
        (menu as any).destroy();
      }
    }
    this.menus = [];
    this.graphics.clear();
  }

  /**
   * Set delay before showing menus
   */
  public setDelay(delay: number): void {
    this.waitDelay = delay;
  }
}