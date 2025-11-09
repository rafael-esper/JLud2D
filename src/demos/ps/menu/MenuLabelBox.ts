/**
 * MenuLabelBox - Multi-line Text Label Menu Component
 * Direct port of MenuLabelBox.java - Displays multiple lines of text with color support
 */

import { MenuType, MenuState } from './MenuType';
import { MenuStack } from './MenuStack';

export class MenuLabelBox extends MenuType {
  private text: (string | null)[];
  private colors: number[]; // Using hex color values for Phaser compatibility
  private x: number;
  private y: number;
  private wx: number;
  private wy: number;
  private menuStack: MenuStack;
  private scene: Phaser.Scene;

  // Color constants matching Java Color values
  private static readonly WHITE = 0xFFFFFF;
  private static readonly RED = 0xFF0000;

  constructor(
    scene: Phaser.Scene,
    menuStack: MenuStack,
    x: number,
    y: number,
    labels: string[],
    hasDelay: boolean,
    isCentered: boolean
  ) {
    super();

    this.scene = scene;
    this.menuStack = menuStack;

    // Pre-processing: attribute colors to text, default is WHITE
    this.text = new Array(labels.length);
    this.colors = new Array(labels.length);
    for (let i = 0; i < labels.length; i++) {
      this.colors[i] = MenuLabelBox.WHITE;
      this.updateText(i, labels[i]);
    }

    if (isCentered) {
      this.x = x - 8 - MenuStack.getMaxTextLength(this.text.filter(t => t !== null) as string[]) / 2;
    } else {
      this.x = x;
    }
    this.y = y;

    this.wy = 14 + (labels.length * MenuStack.fontYSize) - this.countSpaces(this.text) * (MenuStack.fontYSize + 1 - MenuStack.BETWEEN_ROWS_SPACE) / 2;

    if (hasDelay) {
      this.drawDelay = MenuType.MAX_DELAY;
    }
  }

  private countSpaces(labels: (string | null)[]): number {
    let spaces = 0;
    for (const s of labels) {
      if (s === null || s.trim() === '') {
        spaces++;
      }
    }
    return spaces;
  }

  /**
   * Update specific row - direct port of Java updateText(int, String)
   */
  public updateText(rowNumber: number, newText: string): void {
    if (rowNumber >= this.text.length) {
      return;
    }

    if (newText.startsWith('<RED>')) {
      this.updateColor(rowNumber, MenuLabelBox.RED);
      this.text[rowNumber] = newText.replace(/<RED>/g, '');
    } else {
      this.text[rowNumber] = newText;
    }

    // Update wx size
    this.wx = 16 + MenuStack.getMaxTextLength(this.text.filter(t => t !== null) as string[]);
  }

  /**
   * Updates full text - direct port of Java updateText(String[])
   */
  public updateTextArray(s: string[]): void {
    for (let i = 0; i < this.text.length; i++) {
      this.updateText(i, s[i]);
    }
  }

  /**
   * Change the color of a text row - direct port of Java updateColor(int, Color)
   */
  public updateColor(rowNumber: number, color: number): void {
    this.colors[rowNumber] = color;
  }

  /**
   * Change the color of the whole text - direct port of Java updateColor(Color)
   */
  public updateColorAll(color: number): void {
    for (let i = 0; i < this.text.length; i++) {
      this.updateColor(i, color);
    }
  }

  public draw(active: boolean): void {
    if (this.drawDelay > 0) {
      this.drawDelay--;
      const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
      const middle = (this.x + (this.x + this.wx)) / 2;
      this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);
    } else {
      if (this.state !== MenuState.END) {
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);

        let pos = 0;
        for (let i = 0; i < this.text.length; i++) {
          if (this.text[i] !== null) {
            this.drawText(
              this.x + 2 + MenuStack.fontXSize,
              this.y + MenuStack.fontYSize + 6 + pos,
              this.text[i]!,
              this.colors[i]
            );
          }

          if (this.text[i] === null || this.text[i]!.trim() === '') {
            pos += (MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE) / 2;
          } else {
            pos += MenuStack.fontYSize;
          }
        }
      }
    }
  }

  /**
   * Draw text at specified position with color
   * Port of screen.g.drawString() functionality for Phaser
   */
  private drawText(x: number, y: number, text: string, color: number): void {
    try {
      if (this.scene && text) {
        // Create temporary text object for drawing
        // In practice this would be optimized to reuse text objects or use a text pool
        const textObj = this.scene.add.text(x, y, text, {
          fontFamily: 'monospace',
          fontSize: `${MenuStack.fontYSize}px`,
          color: `#${color.toString(16).padStart(6, '0')}`,
          resolution: 1
        });

        textObj.setOrigin(0, 0);
        textObj.setDepth(1002); // Above menu graphics and images

        // In the original Java version, text would persist until the menu is redrawn
        // In Phaser, we might want to manage text objects differently for performance
      }
    } catch (error) {
      console.error('Error drawing text:', error);
    }
  }

  /**
   * Set menu to ready state - direct port of Java setOn()
   */
  public setOn(): void {
    this.state = MenuState.READY;
  }

  /**
   * Set menu to end state - direct port of Java setOff()
   */
  public setOff(): void {
    this.state = MenuState.END;
  }

  /**
   * Get text array
   */
  public getText(): (string | null)[] {
    return this.text;
  }

  /**
   * Get colors array
   */
  public getColors(): number[] {
    return this.colors;
  }

  /**
   * Get position
   */
  public getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get size
   */
  public getSize(): { wx: number, wy: number } {
    return { wx: this.wx, wy: this.wy };
  }
}