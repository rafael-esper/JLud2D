/**
 * MenuImageBox - Image Display Menu Component
 * Direct port of MenuImageBox.java - Displays images in menus with optional box border
 */

import { MenuType } from './MenuType';
import { MenuStack } from './MenuStack';
import { ScriptEngine } from '../../../core/ScriptEngine';

export interface VImage {
  width: number;
  height: number;
  texture?: Phaser.Textures.Texture;
  frame?: Phaser.Textures.Frame;
  key?: string;
}

export class MenuImageBox extends MenuType {
  private hasBox: boolean;
  private image: VImage;
  private x: number;
  private y: number;
  private wx: number;
  private wy: number;
  private menuStack: MenuStack;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, menuStack: MenuStack, x: number, y: number, image: VImage, hasDelay: boolean) {
    super();

    this.scene = scene;
    this.menuStack = menuStack;
    this.x = x;
    this.y = y;
    this.wx = image.width + 8;
    this.wy = image.height + 8;
    this.image = image;
    this.hasBox = true;

    if (hasDelay) {
      this.drawDelay = MenuType.MAX_DELAY;
    }
  }

  /**
   * Static factory method for creating boxless image menu
   * Direct port of Java MenuImage() method
   */
  public static MenuImage(scene: Phaser.Scene, menuStack: MenuStack, x: number, y: number, image: VImage): MenuImageBox {
    const menuImageBox = new MenuImageBox(scene, menuStack, x, y, image, false);
    menuImageBox.hasBox = false;
    return menuImageBox;
  }

  public draw(active: boolean): void {
    if (this.drawDelay > 0) {
      this.drawDelay--;
      const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
      const middle = (this.x + (this.x + this.wx)) / 2;
      this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);
    } else {
      if (this.hasBox) {
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);
        ScriptEngine.blit(this.x + 4, this.y + 4, this.image);
      } else {
        ScriptEngine.blit(this.x, this.y, this.image);
      }
    }
  }


  /**
   * Get the image reference
   */
  public getImage(): VImage {
    return this.image;
  }

  /**
   * Update image reference
   */
  public setImage(image: VImage): void {
    this.image = image;
    this.wx = image.width + 8;
    this.wy = image.height + 8;
  }

  /**
   * Update position
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Get box state
   */
  public getHasBox(): boolean {
    return this.hasBox;
  }

  /**
   * Set box state
   */
  public setHasBox(hasBox: boolean): void {
    this.hasBox = hasBox;
  }
}