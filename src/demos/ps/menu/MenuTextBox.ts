/**
 * MenuTextBox - PS Text Box Component
 * Simplified implementation based on MenuPromptBox (which works correctly)
 */

import { MenuType, MenuState } from './MenuType';
import { MenuStack } from './MenuStack';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class MenuTextBox extends MenuType {
  private menuStack: MenuStack;
  private text: string[];
  private x: number;
  private y: number;
  private wx: number;
  private wy: number;
  private hasMore: boolean;
  private textDelay: number;

  // Text objects only - no private graphics
  private textObjects: Phaser.GameObjects.Text[] = [];
  private isDestroyed: boolean = false;
  private textObjectsCreated: boolean = false;

  constructor(
    menuStack: MenuStack,
    x: number,
    y: number,
    wx: number,
    wy: number,
    r1: string,
    r2: string,
    hasDelay: boolean,
    hasMore: boolean
  ) {
    super();

    this.menuStack = menuStack;
    this.x = x;
    this.y = y;
    this.wx = wx;
    this.wy = wy;
    this.text = [r1, r2];
    this.textDelay = 0; // (r1.length + r2.length) * 1 in Java, but set to 0 for immediate display
    this.hasMore = hasMore;

    if (hasDelay) {
      this.drawDelay = MenuType.MAX_DELAY;
    }
  }

  private createTextObjects(): void {
    // Clean up existing text objects
    this.cleanupTextObjects();

    const scene = (this.menuStack as any).scene;
    if (!scene) return;

    // Dynamic depth based on menu stack position to prevent text overlap
    const stackDepth = this.menuStack.getStackDepth();
    const baseDepth = 2010 + stackDepth * 10; // Above all menu graphics

    // Create first line text object (initially empty, will be updated in draw)
    const textObj1 = scene.add.text(
      this.x + 1 + MenuStack.fontXSize,
      this.y + MenuStack.fontYSize + 6 - 12,
      '',
      {
        fontSize: `${MenuStack.fontYSize}px`,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    );
    textObj1.setOrigin(0, 0);
    textObj1.setDepth(baseDepth);
    textObj1.setScrollFactor(0, 0);
    textObj1.setVisible(false); // Initially hidden, shown during draw
    this.textObjects.push(textObj1);

    // Create second line text object (initially empty, will be updated in draw)
    const textObj2 = scene.add.text(
      this.x + 1 + MenuStack.fontXSize,
      this.y + MenuStack.fontYSize * 2 + 6 + MenuStack.BETWEEN_ROWS_SPACE - 12,
      '',
      {
        fontSize: `${MenuStack.fontYSize}px`,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    );
    textObj2.setOrigin(0, 0);
    textObj2.setDepth(baseDepth);
    textObj2.setScrollFactor(0, 0);
    textObj2.setVisible(false); // Initially hidden, shown during draw
    this.textObjects.push(textObj2);
  }

  private cleanupTextObjects(): void {
    for (const textObj of this.textObjects) {
      if (textObj && textObj.destroy) {
        textObj.destroy();
      }
    }
    this.textObjects = [];
    this.textObjectsCreated = false;
  }


  public endTextDelay(): boolean {
    if (this.textDelay < (this.text[0].length + this.text[1].length)) {
      this.textDelay = this.text[0].length + this.text[1].length;
      return true;
    }
    return false;
  }

  public draw(active: boolean): void {
    // Don't draw if this menu has been destroyed/popped
    if (this.isDestroyed) {
      return;
    }
    if (this.drawDelay > 0) {
      // Opening animation - box grows from center (like MenuPromptBox)
      this.drawDelay--;
      const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
      const middle = (this.x + (this.x + this.wx)) / 2;
      this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);

      // Hide text during animation or if not active
      this.textObjects.forEach(textObj => textObj.setVisible(false));
    } else {
      const menus = (this.menuStack as any).menus;
      const lastMenuTextBox = [...menus].reverse().find((m: any) => m instanceof MenuTextBox);

      if (lastMenuTextBox === this) {
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);
      }

      // Create text objects only once when delay finishes
      if (!this.textObjectsCreated) {
        this.createTextObjects();
        this.textObjectsCreated = true;
      }

      // Check if this is the most recent text box (to avoid overlapping old text)
      const thisIndex = menus.indexOf(this);
      const isLatestTextBox = thisIndex === menus.length - 1 ||
                              !menus.slice(thisIndex + 1).some(m => m.constructor.name === 'MenuTextBox');

      // Always update text content and animation
      const firstLineText = ScriptEngine.left(this.text[0], this.textDelay);
      if (this.textObjects[0]) {
        this.textObjects[0].setText(firstLineText);
        this.textObjects[0].setVisible(isLatestTextBox && firstLineText.length > 0);
      }

      const secondLineText = this.textDelay > this.text[0].length
        ? ScriptEngine.left(this.text[1], this.textDelay - this.text[0].length)
        : '';
      if (this.textObjects[1]) {
        this.textObjects[1].setText(secondLineText);
        this.textObjects[1].setVisible(isLatestTextBox && secondLineText.length > 0);
      }

      // Update text animation and state
      if (this.textDelay < (this.text[0].length + this.text[1].length)) {
        this.textDelay++;
      } else {
        this.state = MenuState.READY;
      }

      // Handle "more" icon (for simplicity, using existing text objects for now)
      if (this.state !== MenuState.TEXT && this.hasMore && active) {
        // More icon logic can be added here if needed
      }
    }
  }


  public destroy(): void {
    // Mark as destroyed to prevent further drawing
    this.isDestroyed = true;

    // Clean up text objects using the standard method
    this.cleanupTextObjects();
  }
}