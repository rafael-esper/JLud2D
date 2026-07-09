/**
 * MenuCHR - CHR Animation Menu Component
 * Direct port of MenuCHR.java - Handles animated sprites in menus
 */

import { CHR } from '../../../domain/CHR';
import { MenuType, MenuState, MenuStateHelper } from './MenuType';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class MenuCHR extends MenuType {
  public static readonly DONE: number = 2;

  private chr: CHR;
  private x: number;
  private y: number;
  private framect: number;
  private beginDelay: number;
  private loopable: boolean = false;
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private visible: boolean = true;
  private _depth: number = 1960;

  constructor(scene: Phaser.Scene, x: number, y: number, chr: CHR);
  constructor(scene: Phaser.Scene, x: number, y: number, loopable: boolean, chr: CHR);
  constructor(scene: Phaser.Scene, x: number, y: number, chrOrLoopable: CHR | boolean, chr?: CHR) {
    super();

    this.scene = scene;
    this.x = x;
    this.y = y;

    if (typeof chrOrLoopable === 'boolean') {
      // Second constructor variant with loopable parameter
      this.loopable = chrOrLoopable;
      this.chr = chr!;
    } else {
      // First constructor variant
      this.chr = chrOrLoopable;
    }

    this.state = MenuState.READY;
    this.framect = 0;
    this.beginDelay = Math.floor(MenuType.MAX_DELAY / 2);

    // Don't create sprite in constructor - wait for first draw when CHR is loaded
  }

  private createSprite(): void {
    if (!this.sprite && this.chr && this.chr.getImageName) {
      const textureKey = `chr-${this.chr.getImageName().replace('.png', '')}`;

      // Check if texture exists
      if (!this.scene.textures.exists(textureKey)) {
        console.error(`MenuCHR.createSprite: Texture ${textureKey} does not exist!`);
        return;
      }

      this.sprite = this.scene.add.sprite(this.x, this.y, textureKey);
      this.sprite.setDepth(this._depth);
      this.sprite.setOrigin(0, 0);
      this.sprite.setVisible(this.visible); // Respect the visibility state
    }
  }

  public draw(active: boolean): void {
    if (this.beginDelay-- > 0) {
      return;
    }

    // Safety check for undefined CHR
    if (!this.chr || !this.chr.getFrame) {
      return;
    }

    // Force create sprite if needed
    if (!this.sprite) {
      this.createSprite();
    }

    if (!this.sprite) {
      return;
    }

    // Ensure sprite is visible and positioned correctly on every frame (like entity sprite)
    // Position relative to camera since camera may be offset.
    // Subtract the CHR hotspot like Java CHR.render() does — weapon
    // animations carry a hotspot (e.g. hy=20) that anchors them on the
    // enemy contact point.
    const camera = this.sprite.scene.cameras.main;
    const worldX = camera.scrollX + this.x - this.chr.getHx();
    const worldY = camera.scrollY + this.y - this.chr.getHy();

    this.sprite.setPosition(worldX, worldY);
    this.sprite.setVisible(this.visible);
    this.sprite.setDepth(this._depth);

    switch (this.state) {
      case MenuState.READY:
        const frameIndex = this.chr.getFrame(MenuStateHelper.getAnimIndex(this.state), this.framect);
        if (frameIndex !== undefined && frameIndex !== null) {
          const frameKey = `chr-${this.chr.getImageName().replace('.png', '')}_frame_${frameIndex}`;
          try {
            this.sprite.setFrame(frameKey);
          } catch (error) {
            console.warn(`MenuCHR: Could not set frame ${frameKey}`, error);
          }
        }
        break;

      case MenuState.ANIM1:
      case MenuState.ANIM2:
      case MenuState.ANIM3:
        const animFrameIndex = this.chr.getFrame(MenuStateHelper.getAnimIndex(this.state), this.framect);
        if (animFrameIndex !== undefined && animFrameIndex !== null) {
          const animFrameKey = `chr-${this.chr.getImageName().replace('.png', '')}_frame_${animFrameIndex}`;
          try {
            this.sprite.setFrame(animFrameKey);
          } catch (error) {
            console.warn(`MenuCHR: Could not set frame ${animFrameKey}`);
          }
        }
        if (this.framect + 1 >= this.chr.getAnimSize(MenuStateHelper.getAnimIndex(this.state))) {
          if (!this.loopable) {
            this.state = MenuState.CLOSE;
          } else {
            this.framect = 0;
          }
        }
        break;

      case MenuState.CLOSE:
        const idleFrameIndex = this.chr.getIdle()[MenuCHR.DONE];
        if (idleFrameIndex !== undefined && idleFrameIndex !== null) {
          const idleFrameKey = `chr-${this.chr.getImageName().replace('.png', '')}_frame_${idleFrameIndex}`;
          try {
            this.sprite.setFrame(idleFrameKey);
          } catch (error) {
            console.warn(`MenuCHR: Could not set frame ${idleFrameKey}`);
          }
        }
        break;
    }

    this.framect++;
  }

  public animate(anim: MenuState): void {
    this.framect = 0;
    this.state = anim;
  }

  public changePosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Set sprite visibility
   */
  public setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.sprite) {
      this.sprite.setVisible(visible);
    }
  }

  public setDepth(depth: number): void {
    this._depth = depth;
    if (this.sprite) this.sprite.setDepth(depth);
  }

  /**
   * Clean up sprite when MenuCHR is destroyed
   */
  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }

}