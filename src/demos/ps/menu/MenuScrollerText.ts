/**
 * MenuScrollerText - Scrolling Text Display Menu Component
 * Direct port of MenuScrollerText.java - Displays text with typewriter/scrolling effect
 */

import { MenuType, MenuState } from './MenuType';
import { MenuStack } from './MenuStack';

export class MenuScrollerText extends MenuType {
  private text: string[];
  private x: number;
  private y: number;
  private textPos: number; // current text position
  private textDelay: number; // max text delay
  private scene: Phaser.Scene;
  private textObjects: Phaser.GameObjects.Text[] = [];

  // Color constants
  private static readonly WHITE = 0xFFFFFF;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string[]) {
    super();

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;

    this.textDelay = 0;
    for (const s of text) {
      this.textDelay += s.length;
    }

    this.state = MenuState.TEXT;
    this.textPos = 0;
  }

  public draw(active: boolean): void {
    // Clear previous text objects
    this.clearTextObjects();

    let nextTextPos = this.textPos;
    for (let i = 0; i < this.text.length; i++) {
      const str = nextTextPos > 0 ? this.left(this.text[i], nextTextPos) : '';
      this.drawText(this.x, this.y + (MenuStack.fontYSize + 5) * i, str);
      nextTextPos -= this.text[i].length;
    }

    if (this.textPos++ > this.textDelay) {
      this.state = MenuState.READY;
    }
  }

  /**
   * Draw text at specified position
   * Port of screen.g.drawString() functionality for Phaser
   */
  private drawText(x: number, y: number, text: string): void {
    if (!text || text.length === 0) {
      return;
    }

    try {
      const textObj = this.scene.add.text(x, y, text, {
        fontFamily: 'monospace',
        fontSize: `${MenuStack.fontYSize}px`,
        color: `#${MenuScrollerText.WHITE.toString(16).padStart(6, '0')}`,
        resolution: 1
      });

      textObj.setOrigin(0, 0);
      textObj.setDepth(1002); // Above menu graphics and images
      this.textObjects.push(textObj);
    } catch (error) {
      console.error('Error drawing scrolling text:', error);
    }
  }

  /**
   * Get left substring - equivalent to Java left() function
   * Direct port from MenuTextBox.ts
   */
  private left(str: string, length: number): string {
    if (length <= 0) return '';
    if (length >= str.length) return str;
    return str.substring(0, length);
  }

  /**
   * Clear all text objects from the scene
   */
  private clearTextObjects(): void {
    for (const textObj of this.textObjects) {
      if (textObj && textObj.scene) {
        textObj.destroy();
      }
    }
    this.textObjects = [];
  }

  /**
   * Get current text position
   */
  public getTextPos(): number {
    return this.textPos;
  }

  /**
   * Get total text delay
   */
  public getTextDelay(): number {
    return this.textDelay;
  }

  /**
   * Get text array
   */
  public getText(): string[] {
    return this.text;
  }

  /**
   * Get position
   */
  public getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Check if scrolling is complete
   */
  public isComplete(): boolean {
    return this.state === MenuState.READY;
  }

  /**
   * Reset scrolling animation
   */
  public reset(): void {
    this.textPos = 0;
    this.state = MenuState.TEXT;
    this.clearTextObjects();
  }

  /**
   * Skip to end of scrolling animation
   */
  public skipToEnd(): void {
    this.textPos = this.textDelay + 1;
    this.state = MenuState.READY;
  }

  /**
   * Destroy this menu and clean up resources
   */
  public destroy(): void {
    this.clearTextObjects();
  }
}