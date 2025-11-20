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


  public endTextDelay(): boolean {
    if (this.textDelay < (this.text[0].length + this.text[1].length)) {
      this.textDelay = this.text[0].length + this.text[1].length;
      return true;
    }
    return false;
  }

  public draw(active: boolean): void {
    // Destroy previous text objects at start of each frame
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];

    // SIMPLE FIX: Clear all existing text objects from scene
    const scene = (this.menuStack as any).scene;
    const textObjectsToDestroy: any[] = [];
    scene.children.list.forEach((child: any) => {
      if (child.type === 'Text' && child.depth >= 1002) {
        textObjectsToDestroy.push(child);
      }
    });
    textObjectsToDestroy.forEach(obj => obj.destroy());

    if (this.drawDelay > 0) {
      // Opening animation - box grows from center (like MenuPromptBox)
      this.drawDelay--;
      const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
      const middle = (this.x + (this.x + this.wx)) / 2;
      this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);
    } else {
      // Draw the main text box (like MenuPromptBox draws main menu box)
      this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);

      // Draw text lines (simplified from MenuPromptBox text drawing)
      const firstLineText = ScriptEngine.left(this.text[0], this.textDelay);
      if (firstLineText) {
        const textObj1 = (this.menuStack as any).scene.add.text(
          this.x + 1 + MenuStack.fontXSize,
          this.y + MenuStack.fontYSize + 6 - 12,
          firstLineText,
          {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#ffffff'
          }
        );
        textObj1.setDepth(1002);
        textObj1.setScrollFactor(0, 0); // Fixed to screen like other UI elements
        this.textObjects.push(textObj1);
      }

      const secondLineText = this.textDelay > this.text[0].length
        ? ScriptEngine.left(this.text[1], this.textDelay - this.text[0].length)
        : '';
      if (secondLineText) {
        const textObj2 = (this.menuStack as any).scene.add.text(
          this.x + 1 + MenuStack.fontXSize,
          this.y + MenuStack.fontYSize * 2 + 6 + MenuStack.BETWEEN_ROWS_SPACE - 12,
          secondLineText,
          {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#ffffff'
          }
        );
        textObj2.setDepth(1002);
        textObj2.setScrollFactor(0, 0); // Fixed to screen like other UI elements
        this.textObjects.push(textObj2);
      }

      // Update text animation and state
      if (this.textDelay < (this.text[0].length + this.text[1].length)) {
        this.textDelay++;
      } else {
        this.state = MenuState.READY;
      }

      // Draw "more" icon if needed
      if (this.state !== MenuState.TEXT && this.hasMore && active) {
        const moreX = this.wx + this.wy - 40;
        const moreY = this.y + this.wy - 8 + Math.cos((this.menuStack as any).scene.time.now / 133) * 3;

        const moreText = (this.menuStack as any).scene.add.text(moreX, moreY, '>', {
          fontSize: '12px',
          fontFamily: 'monospace',
          fontStyle: 'bold',
          color: '#ffff00'
        });
        moreText.setDepth(1002);
        moreText.setScrollFactor(0, 0);
        this.textObjects.push(moreText);
      }
    }
  }


  public destroy(): void {
    // Clean up text objects only
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];
  }
}