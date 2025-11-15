/**
 * MenuTextBox - PS Text Box Component
 * Direct port of MenuTextBox.java - Creates text dialogs with animations
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

  // Graphics and text objects
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
    // Destroy previous text objects
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];

    switch (this.state) {
      case MenuState.OPEN:
        // Opening animation - box grows from center
        const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
        const middle = (this.x + (this.x + this.wx)) / 2;
        this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);

        if (this.drawDelay-- <= 0) {
          this.state = MenuState.TEXT;
        }
        break;

      case MenuState.TEXT:
      case MenuState.READY:
      case MenuState.CLOSE:
        // Draw the text box
        this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);

        // Draw first line of text
        const firstLineText = ScriptEngine.left(this.text[0], this.textDelay);
        if (firstLineText) {
          const textObj1 = (this.menuStack as any).scene.add.text(
            this.x + 1 + MenuStack.fontXSize,
            this.y + MenuStack.fontYSize + 6,
            firstLineText,
            {
              fontSize: '12px',
              fontFamily: 'monospace',
              fontStyle: 'bold',
              color: '#ffffff'
            }
          );
          textObj1.setDepth(1002);
          this.textObjects.push(textObj1);
        }

        // Draw second line of text
        const secondLineText = this.textDelay > this.text[0].length
          ? ScriptEngine.left(this.text[1], this.textDelay - this.text[0].length)
          : '';
        if (secondLineText) {
          const textObj2 = (this.menuStack as any).scene.add.text(
            this.x + 1 + MenuStack.fontXSize,
            this.y + MenuStack.fontYSize * 2 + 6 + MenuStack.BETWEEN_ROWS_SPACE,
            secondLineText,
            {
              fontSize: '12px',
              fontFamily: 'monospace',
              fontStyle: 'bold',
              color: '#ffffff'
            }
          );
          textObj2.setDepth(1002);
          this.textObjects.push(textObj2);
        }

        // Update text animation
        if (this.state !== MenuState.CLOSE && this.textDelay++ > (this.text[0].length + this.text[1].length)) {
          this.state = MenuState.READY;

          // Auto-close after timeout (for timeout textboxes)
          if (this.textDelay++ > 3 * (this.text[0].length + this.text[1].length) + MenuType.MAX_DELAY * 3) {
            this.state = MenuState.CLOSE;
          }
        }

        // Draw "more" icon if needed (simplified - would need actual icon in full implementation)
        if (this.state !== MenuState.TEXT && this.hasMore && active) {
          const moreX = this.wx + this.wy - 40;
          const moreY = this.y + this.wy - 8 + Math.cos((this.menuStack as any).scene.time.now / 133) * 3;

          // Simple ">" character as more indicator for now
          const moreText = (this.menuStack as any).scene.add.text(moreX, moreY, '>', {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: '#ffff00'
          });
          moreText.setDepth(1002);
          this.textObjects.push(moreText);
        }
        break;

      default:
        break;
    }
  }


  public destroy(): void {
    // Clean up text objects
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];
  }
}