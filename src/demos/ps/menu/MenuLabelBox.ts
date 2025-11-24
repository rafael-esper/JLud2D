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
  private textObjects: Phaser.GameObjects.Text[] = []; // Store text objects for cleanup
  private textObjectsCreated: boolean = false; // Track if text objects have been properly created

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

    // Mark for recreation on next draw
    this.textObjectsCreated = false;
  }

  /**
   * Updates full text - direct port of Java updateText(String[])
   */
  public updateTextArray(s: string[]): void {
    for (let i = 0; i < this.text.length; i++) {
      if (s[i] !== undefined) {
        if (s[i].startsWith('<RED>')) {
          this.updateColor(i, MenuLabelBox.RED);
          this.text[i] = s[i].replace(/<RED>/g, '');
        } else {
          this.text[i] = s[i];
        }
      }
    }
    // Update wx size
    this.wx = 16 + MenuStack.getMaxTextLength(this.text.filter(t => t !== null) as string[]);

    // Mark for recreation on next draw
    this.textObjectsCreated = false;
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

      // Hide text during animation
      this.textObjects.forEach(textObj => textObj.setVisible(false));
    } else {
      if (this.state !== MenuState.END) {
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);

        // Create text objects only once when delay finishes
        if (!this.textObjectsCreated) {
          this.createTextObjects();
          this.textObjectsCreated = true;
        }

        // Label boxes (like MST display) should always be visible unless explicitly ended
        this.textObjects.forEach(textObj => textObj.setVisible(true));
      } else {
        // Hide text when menu ends
        this.textObjects.forEach(textObj => textObj.setVisible(false));
      }
    }
  }

  /**
   * Create and manage text objects properly
   */
  private createTextObjects(): void {
    // Clean up existing text objects
    this.cleanupTextObjects();

    if (!this.scene) return;

    // Dynamic depth based on menu stack position
    const stackDepth = this.menuStack.getStackDepth();
    const baseDepth = 2010 + stackDepth * 10; // Above all menu graphics

    let pos = 0;
    for (let i = 0; i < this.text.length; i++) {
      if (this.text[i] !== null && this.text[i] !== '') {
        const textX = this.x + 2 + MenuStack.fontXSize;
        const textY = this.y + 6 + pos; // Removed extra MenuStack.fontYSize offset
        const colorHex = `#${this.colors[i].toString(16).padStart(6, '0')}`;

        const textObj = this.scene.add.text(textX, textY, this.text[i]!, {
            fontFamily: 'monospace',
            fontSize: `${MenuStack.fontYSize}px`,
            color: colorHex,
            resolution: 1
          }
        );

        textObj.setOrigin(0, 0);
        textObj.setDepth(baseDepth);
        textObj.setScrollFactor(0, 0); // Fixed to screen
        textObj.setVisible(true); // Explicitly set visible
        this.textObjects.push(textObj);
      }

      if (this.text[i] === null || this.text[i]!.trim() === '') {
        pos += (MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE) / 2;
      } else {
        pos += MenuStack.fontYSize;
      }
    }
  }

  /**
   * Clean up text objects
   */
  private cleanupTextObjects(): void {
    for (const textObj of this.textObjects) {
      if (textObj && textObj.destroy) {
        textObj.destroy();
      }
    }
    this.textObjects = [];
    this.textObjectsCreated = false;
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
    this.cleanupTextObjects();
  }

  /**
   * Destroy/cleanup method for proper resource cleanup
   */
  public destroy(): void {
    this.cleanupTextObjects();
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