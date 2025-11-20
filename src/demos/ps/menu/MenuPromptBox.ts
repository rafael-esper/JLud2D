/**
 * MenuPromptBox - PS Menu Prompt Component
 * Direct port of MenuPromptBox.java - Creates selectable menu with grey circles and red cursor
 */

import { MenuType, MenuState } from './MenuType';
import { MenuStack } from './MenuStack';

export class MenuPromptBox extends MenuType {
  private menuStack: MenuStack;
  private options: string[];
  public enabled: boolean[];
  private x: number;
  private y: number;
  public selected: number = 0;
  private wx: number;
  private wy: number;

  // Graphics objects for drawing
  private graphics: Phaser.GameObjects.Graphics;
  private textObjects: Phaser.GameObjects.Text[] = [];

  constructor(menuStack: MenuStack, x: number, y: number, options: string[], hasDelay: boolean) {
    super();

    this.menuStack = menuStack;
    this.x = x;
    this.y = y;
    this.options = options;

    // Initialize enabled array
    this.enabled = new Array(options.length).fill(true);

    // Calculate dimensions (matching Java calculations)
    this.wx = 25 + MenuStack.getMaxTextLength(options);
    this.wy = 12 + options.length * (MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE);

    if (hasDelay) {
      this.drawDelay = MenuType.MAX_DELAY / 2;
    } else {
      this.drawDelay = 0;
    }

    // Create graphics object for drawing circles and cursor
    this.graphics = (menuStack as any).scene.add.graphics();
    this.graphics.setDepth(1001);
    this.graphics.setScrollFactor(0, 0); // Fixed to screen like other UI elements
  }

  public setDisabled(option: number): void {
    if (option >= 0 && option < this.enabled.length) {
      this.enabled[option] = false;
    }
  }

  public previousOption(): void {
    this.selected--;
    if (this.selected < 0) {
      this.selected = this.options.length - 1;
    }
    // Skip disabled options
    while (!this.enabled[this.selected] && this.enabled.some(e => e)) {
      this.selected--;
      if (this.selected < 0) {
        this.selected = this.options.length - 1;
      }
    }
  }

  public nextOption(): void {
    this.selected++;
    if (this.selected >= this.options.length) {
      this.selected = 0;
    }
    // Skip disabled options
    while (!this.enabled[this.selected] && this.enabled.some(e => e)) {
      this.selected++;
      if (this.selected >= this.options.length) {
        this.selected = 0;
      }
    }
  }

  public draw(active: boolean): void {
    // Clear our own graphics only (don't clear menuStack graphics to preserve previous menus)
    this.graphics.clear();

    // Destroy previous text objects
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];

    if (this.drawDelay > 0) {
      // Opening animation - box grows from center
      this.drawDelay--;
      const specwx = ((MenuType.MAX_DELAY - this.drawDelay) / MenuType.MAX_DELAY) * this.wx;
      const middle = (this.x + (this.x + this.wx)) / 2;
      this.menuStack.drawBox(Math.floor(middle - specwx / 2), this.y, Math.floor(specwx), this.wy);
    } else {
      // Draw the main menu box
      this.menuStack.drawBox(this.x, this.y, this.wx, this.wy);

      // Draw each option with circles and text
      for (let i = 0; i < this.options.length; i++) {
        const textY = this.y + 2 + ((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE) * (i + 1)) - MenuStack.fontYSize;
        const textX = this.x + 12 + MenuStack.fontXSize;
        const circleY = this.y - 6 + ((MenuStack.fontYSize + MenuStack.BETWEEN_ROWS_SPACE) * (i + 1));

        // Draw text
        const textColor = this.enabled[i] ? '#ffffff' : '#808080'; // White or gray
        const textObj = (this.menuStack as any).scene.add.text(
          textX,
          textY,
          this.options[i],
          {
            fontSize: '12px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            color: textColor
          }
        );
        textObj.setDepth(1002);
        textObj.setScrollFactor(0, 0); // Fixed to screen like other UI elements
        this.textObjects.push(textObj);

        // Draw gray circle border (equivalent to Java drawRoundRect)
        this.graphics.lineStyle(1, 0x808080); // Gray color
        this.graphics.strokeRoundedRect(this.x + 7, circleY, 8, 8, 3);

        // Draw red cursor if this is the selected option
        // Java: if(selected == i && ((timer/25)%2==1 || !active))
        const timer = (this.menuStack as any).scene.time.now;
        const shouldShowCursor = this.selected === i && (Math.floor(timer / 416) % 2 === 1 || !active);

        if (shouldShowCursor) {
          // Draw red square background (fillRect)
          this.graphics.fillStyle(0xC82828); // RGB(200, 40, 40)
          this.graphics.fillRect(this.x + 8, circleY + 1, 7, 7);

          // Draw red oval on top (fillOval)
          this.graphics.fillStyle(0xEB1414); // RGB(235, 20, 20)
          this.graphics.fillEllipse(this.x + 8 + 2.5, circleY + 1 + 2.5, 5, 5);
        }
      }
    }
  }

  public destroy(): void {
    // Clean up graphics and text objects
    this.graphics.destroy();
    this.textObjects.forEach(text => text.destroy());
    this.textObjects = [];
  }
}