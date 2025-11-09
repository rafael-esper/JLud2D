/**
 * MenuImageBox - Image Display Menu Component
 * Direct port of MenuImageBox.java - Displays images in menus with optional box border
 */

import { MenuType } from './MenuType';
import { MenuStack } from './MenuStack';

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
        this.blit(this.x + 4, this.y + 4, this.image);
      } else {
        this.blit(this.x, this.y, this.image);
      }
    }
  }

  /**
   * Blit image to screen - port of screen.blit() functionality
   * In the original Java version, this would call screen.blit()
   * In TypeScript/Phaser, we render using the scene's display system
   */
  private blit(x: number, y: number, image: VImage): void {
    try {
      if (this.scene && image) {
        // In the original Java version, this would directly blit to the screen buffer
        // In Phaser, we need to create a temporary game object or use the graphics API

        if (image.key) {
          // If the image has a Phaser texture key, use that
          const imageObj = this.scene.add.image(x, y, image.key);
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
    } catch (error) {
      console.error('Error blitting VImage:', error);
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