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

    // Create text objects once when menu is created (push)
    this.createTextObjects();
  }

  private createTextObjects(): void {
    // Clear any existing text objects from this instance first
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];

    // PUSH-TIME FIX: Clear all existing text objects from scene when new menu is created
    const scene = (this.menuStack as any).scene;
    const textObjectsToDestroy: any[] = [];
    scene.children.list.forEach((child: any) => {
      if (child.type === 'Text' && child.depth >= 1002) {
        textObjectsToDestroy.push(child);
      }
    });
    textObjectsToDestroy.forEach(obj => obj.destroy());


    // Create first line text object (initially empty, will be updated in draw)
    const textObj1 = (this.menuStack as any).scene.add.text(
      this.x + 1 + MenuStack.fontXSize,
      this.y + MenuStack.fontYSize + 6 - 12,
      '',
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    );
    // Dynamic depth based on menu stack position to prevent text overlap
    const stackDepth = this.menuStack.getStackDepth();
    textObj1.setDepth(1002 + stackDepth * 10); // Each menu level gets +10 depth
    textObj1.setScrollFactor(0, 0);
    textObj1.setVisible(true); // Explicitly set visible
    this.textObjects.push(textObj1);

    // Create second line text object (initially empty, will be updated in draw)
    const textObj2 = (this.menuStack as any).scene.add.text(
      this.x + 1 + MenuStack.fontXSize,
      this.y + MenuStack.fontYSize * 2 + 6 + MenuStack.BETWEEN_ROWS_SPACE - 12,
      '',
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    );
    textObj2.setDepth(1002 + stackDepth * 10); // Use same stack depth as first text object
    textObj2.setScrollFactor(0, 0);
    textObj2.setVisible(true); // Explicitly set visible
    this.textObjects.push(textObj2);
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
    } else {
      const menus = (this.menuStack as any).menus;
      const lastMenuTextBox = [...menus].reverse().find((m: any) => m instanceof MenuTextBox);

      if (lastMenuTextBox === this) {
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);
      }

      // Update text content in existing text objects
      const firstLineText = ScriptEngine.left(this.text[0], this.textDelay);
      if (this.textObjects[0]) {
        this.textObjects[0].setText(firstLineText);
        this.textObjects[0].setVisible(firstLineText.length > 0);
      }

      const secondLineText = this.textDelay > this.text[0].length
        ? ScriptEngine.left(this.text[1], this.textDelay - this.text[0].length)
        : '';
      if (this.textObjects[1]) {
        this.textObjects[1].setText(secondLineText);
        this.textObjects[1].setVisible(secondLineText.length > 0);
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

    // Clean up our own text objects
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];

    // EFFICIENT FIX: Clear all remaining text objects from scene only when menu is destroyed
    const scene = (this.menuStack as any).scene;
    const textObjectsToDestroy: any[] = [];
    scene.children.list.forEach((child: any) => {
      if (child.type === 'Text' && child.depth >= 1002) {
        textObjectsToDestroy.push(child);
      }
    });
    textObjectsToDestroy.forEach(obj => obj.destroy());

    // Clear MenuStack graphics when menu is destroyed to prevent alpha stacking
    this.menuStack.clearGraphics();
  }
}