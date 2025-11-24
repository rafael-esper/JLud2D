/**
 * MenuStack - PS Menu Management System
 * Direct port of MenuStack.java - Manages stack of menus and rendering
 */

import { MenuType, MenuState } from './MenuType';
import { MenuPromptBox } from './MenuPromptBox';
import { MenuTextBox } from './MenuTextBox';
import { MenuLabelBox } from './MenuLabelBox';
import { MenuImageBox } from './MenuImageBox';
import { InputManager } from '../../../config/Controls';
import { PSGame } from '../PSGame';
import { PS1Sound } from '../game/PSLibSound';
import { ScriptEngine } from '../../../core/ScriptEngine';

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

  private delayTimer: number = 0;
  public showPlayers: boolean = false;
  public outcome: PSOutcome = PSOutcome.NO_FADE;

  // Graphics context for drawing
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, inputManager: InputManager) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(2000); // Well above entities (which max around 1000 + map_height)
    this.graphics.setScrollFactor(0, 0); // Fixed to screen like background
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
   * Get current stack depth for proper layering
   */
  public getStackDepth(): number {
    return this.menus.length;
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
   * Set background image for the scene
   */
  public setBackground(imagePath: string): void {
    // Clear existing background
    if (this.back) {
      this.back.destroy();
      this.back = null;
    }

    if (imagePath && imagePath.trim() !== '') {
      // Check if this is already a texture key (no file path separators)
      const isTextureKey = !imagePath.includes('/') && !imagePath.includes('.');
      const imageKey = isTextureKey ? imagePath : (imagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'scene_bg');

      // Check if image/texture is already loaded
      if (this.scene.textures.exists(imageKey)) {
        // Create image from existing texture at screen (0,0) with no scaling
        this.back = this.scene.add.image(0, 0, imageKey);
        this.back.setOrigin(0, 0);
        this.back.setDepth(1950); // Above entities, below menu boxes and text
        this.back.setScrollFactor(0, 0); // Fixed to screen, not affected by camera
      } else if (!isTextureKey) {
        // Load the image first, then create (only if it's a file path, not a texture key)
        this.scene.load.once('complete', () => {
          this.back = this.scene.add.image(0, 0, imageKey);
          this.back.setOrigin(0, 0);
          this.back.setDepth(1950); // Above entities, below menu boxes and text
          this.back.setScrollFactor(0, 0); // Fixed to screen, not affected by camera
        });
        this.scene.load.image(imageKey, imagePath);
        this.scene.load.start();
      }
    }
  }

  /**
   * Create one line label box - direct port of Java createOneLabelBox()
   */
  public createOneLabelBox(xpos: number, ypos: number, text: string, delay: boolean): MenuLabelBox {
    return new MenuLabelBox(this.scene, this, xpos, ypos, [text], delay, false);
  }

  /**
   * Create centered label box - direct port of Java createCenteredLabelBox()
   */
  public createCenteredLabelBox(xpos: number, ypos: number, text: string, delay: boolean): MenuLabelBox {
    return new MenuLabelBox(this.scene, this, xpos, ypos, [text], delay, true);
  }

  /**
   * Create multi-line label box - direct port of Java createLabelBox()
   */
  public createLabelBox(xpos: number, ypos: number, text: string[], delay: boolean): MenuLabelBox {
    return new MenuLabelBox(this.scene, this, xpos, ypos, text, delay, false);
  }

  /**
   * Create image box - direct port of Java createImageBox()
   */
  public createImageBox(xpos: number, ypos: number, image: any, delay: boolean): MenuImageBox {
    return new MenuImageBox(this.scene, this, xpos, ypos, image, delay);
  }

  /**
   * Get maximum text size - direct port of Java getMaxSize()
   */
  public static getMaxSize(options: string[]): number {
    let max = 0;
    for (const s of options) {
      if (s && s.length > max) {
        max = s.length;
      }
    }
    return max;
  }

  /**
   * Get text length - direct port of Java getTextLength()
   */
  public static getTextLength(s: string): number {
    // In Java this uses FontMetrics, here we approximate
    return s.length * MenuStack.fontXSize;
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
    this.graphics.fillStyle(MenuStack.BACK_COLOR, 0.85);
    this.graphics.fillRect(x, y, wx, wy); // Fill the entire box area, not offset

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
          PSGame.playSound(PS1Sound.MENU);
          box!.previousOption();
        }

        if (this.inputManager.justPressed('down')) {
          PSGame.playSound(PS1Sound.MENU);
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
   * Clear graphics only (for PSMenu.endScene)
   */
  public clearGraphics(): void {
    this.graphics.clear();
    // Note: Do NOT clear entity sprite here - it should persist until scene ends
  }

  /**
   * Clear entity sprite (called when scene actually ends)
   */
  public clearEntity(): void {
    if (this.entitySprite) {
      this.entitySprite.destroy();
      this.entitySprite = null;
    }
    this.entityX = 0;
    this.entityY = 0;
  }

  /**
   * Set delay before showing menus
   */
  public setDelay(delay: number): void {
    this.delayTimer = delay;
  }

  /**
   * Set delay (Java alias) - direct port of Java setdelay()
   */
  public setdelay(delay: number): void {
    this.setDelay(delay);
  }

  // PS1 Player order matrix - direct port from Java
  private static readonly playerOrder: number[][] = [
    [0],
    [0, 1],
    [1, 0, 2],
    [1, 2, 0, 3],
    [2, 1, 3, 0, 4]
  ];

  // Background animation support
  public backAnim: any = null; // MenuCHR reference
  public static moreIcon: any = null; // VImage reference

  /**
   * Wait for button 1 press - direct port of Java waitB1()
   */
  public async waitB1(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.checkPreMenu();

      const handleInput = () => {
        this.inputManager.updateControls();

        if (this.inputManager.justPressed('b1') || this.inputManager.justPressed('start')) {
          resolve();
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleInput);
      };

      handleInput();
    }).then(() => {
      this.checkPosMenu();
    });
  }

  /**
   * Wait for menu to reach READY state - direct port of Java waitReady()
   */
  public async waitReady(menu: MenuType): Promise<void> {
    return new Promise<void>((resolve) => {
      this.checkPreMenu();

      const handleWait = () => {
        if (menu.state === MenuState.READY) {
          resolve();
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleWait);
      };

      handleWait();
    }).then(() => {
      this.checkPosMenu();
    });
  }

  /**
   * Wait for animation to end - direct port of Java waitAnimationEnd()
   */
  public async waitAnimationEnd(menu: MenuType): Promise<void> {
    return new Promise<void>((resolve) => {
      this.checkPreMenu();

      const handleWait = () => {
        if (menu.state === MenuState.CLOSE) {
          resolve();
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleWait);
      };

      handleWait();
    }).then(() => {
      this.checkPosMenu();
    });
  }

  /**
   * Wait for specific time delay - direct port of Java waitDelay()
   */
  public async waitDelay(delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.checkPreMenu();

      let timer = 0;
      const handleWait = () => {
        if (timer >= delay) {
          resolve();
          return;
        }

        timer++;
        this.drawMenus();
        this.scene.time.delayedCall(16, handleWait);
      };

      handleWait();
    }).then(() => {
      this.checkPosMenu();
    });
  }

  /**
   * Wait for button 1 or timeout - direct port of Java waitB1OrTimeout()
   */
  public async waitB1OrTimeout(menu: MenuType): Promise<void> {
    return new Promise<void>((resolve) => {
      this.checkPreMenu();

      const handleInput = () => {
        this.inputManager.updateControls();

        if ((this.inputManager.justPressed('b1') || this.inputManager.justPressed('start')) ||
            menu.state === MenuState.CLOSE) {
          resolve();
          return;
        }

        this.drawMenus();
        this.scene.time.delayedCall(16, handleInput);
      };

      handleInput();
    });
  }

  /**
   * Pre-menu processing - direct port of Java checkPreMenu()
   */
  public checkPreMenu(): void {
    // Pause entity processing during menu display
    ScriptEngine.setEntitiesPaused(true);
  }

  /**
   * Post-menu processing - direct port of Java checkPosMenu()
   */
  public checkPosMenu(): void {
    // Resume entity processing after menu
    ScriptEngine.setEntitiesPaused(false);
  }

  /**
   * Enhanced drawMenus with background animation support - enhanced from Java original
   */
  public drawMenus(): void {
    // Clear previous graphics - redraw all menus each frame
    this.graphics.clear();

    // Draw background or render scene
    if (this.back === null && this.backAnim === null) {
      // Render scene background if no specific background set
      // In original this would call screen.render()
      // console.log('MenuStack: drawMenus() - No background set');
    } else if (this.back !== null) {
      // Background image is already positioned by setBackground()
    } else if (this.backAnim !== null) {
      // Draw background animation
      if (this.backAnim && typeof this.backAnim.draw === 'function') {
        this.backAnim.draw(true);
      }
    }

    // Draw entity sprite if present - direct port of Java entity rendering
    if (this.entitySprite) {
      // Center horizontally if entityX not set
      if (this.entityX === undefined || this.entityX === 0) {
        this.entityX = 320 / 2; // Center of 320px screen
      }

      this.entitySprite.setPosition(this.entityX, this.entityY);
      this.entitySprite.setVisible(true);
      this.entitySprite.setDepth(1960); // Above background but below menu boxes
    }

    // Draw NPC sprite if present
    if (this.npc) {
      // Draw NPC CHR at specified position
      // This would need CHR rendering integration
    }

    // Player party rendering would be handled by game-specific code
    // if needed, not in generic menu stack

    // Draw all menus in stack order
    for (let i = 0; i < this.menus.length; i++) {
      const menu = this.menus[i];
      const isActive = (i === this.menus.length - 1); // Last menu is active
      menu.draw(isActive);
    }
  }

}