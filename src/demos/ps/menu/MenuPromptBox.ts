/**
 * MenuPromptBox - PS Menu Prompt Component
 * Port of MenuPromptBox.java - Creates selectable menu with options
 */

import { InputManager } from '../../../config/Controls';
import { MenuStack } from './MenuStack';

export interface MenuPromptResult {
  selectedIndex: number;
  cancelled: boolean;
}

export class MenuPromptBox {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private options: string[];
  private selectedIndex: number = 0;
  private visible: boolean = false;
  private cancellable: boolean;
  private disabledOptions: Set<number> = new Set();

  // UI elements
  private background: Phaser.GameObjects.Graphics | null = null;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private selector: Phaser.GameObjects.Text | null = null;

  // Menu styling (matching Java PSMenu font settings)
  private static readonly FONT_SIZE = 12;
  private static readonly FONT_FAMILY = 'monospace';
  private static readonly FONT_WEIGHT = 'bold';
  private static readonly LINE_HEIGHT = 16;
  private static readonly PADDING = 10;

  constructor(scene: Phaser.Scene, x: number, y: number, options: string[], cancellable: boolean = true) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.options = options;
    this.cancellable = cancellable;
  }

  /**
   * Set an option as disabled (equivalent to Java setDisabled)
   */
  public setDisabled(index: number): void {
    if (index >= 0 && index < this.options.length) {
      this.disabledOptions.add(index);
    }
  }

  /**
   * Show the menu and return a promise that resolves when an option is selected
   */
  public show(): Promise<MenuPromptResult> {
    // Initialize to first non-disabled option
    this.initializeSelection();
    this.createUI();
    this.visible = true;

    return new Promise((resolve) => {
      const handleInput = () => {
        const inputManager = (this.scene as any).inputManager as InputManager;
        if (!inputManager) {
          this.scene.time.delayedCall(50, handleInput);
          return;
        }

        // Update controls for this frame
        inputManager.updateControls();

        // Handle navigation
        if (inputManager.justPressed('up')) {
          this.navigateUp();
          this.updateUI();
        } else if (inputManager.justPressed('down')) {
          this.navigateDown();
          this.updateUI();
        } else if (inputManager.justPressed('b1') || inputManager.justPressed('start')) {
          // Select current option (if not disabled)
          if (!this.disabledOptions.has(this.selectedIndex)) {
            this.hide();
            resolve({ selectedIndex: this.selectedIndex, cancelled: false });
            return;
          }
        } else if (inputManager.justPressed('menu') && this.cancellable) {
          // Cancel
          this.hide();
          resolve({ selectedIndex: -1, cancelled: true });
          return;
        }

        this.scene.time.delayedCall(50, handleInput);
      };

      // Start input handling
      this.scene.time.delayedCall(100, handleInput);
    });
  }

  /**
   * Hide and destroy the menu
   */
  public hide(): void {
    this.visible = false;
    this.destroyUI();
  }

  private navigateUp(): void {
    do {
      this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
    } while (this.disabledOptions.has(this.selectedIndex) && this.disabledOptions.size < this.options.length);
  }

  private navigateDown(): void {
    do {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
    } while (this.disabledOptions.has(this.selectedIndex) && this.disabledOptions.size < this.options.length);
  }

  /**
   * Initialize selection to first non-disabled option
   */
  private initializeSelection(): void {
    this.selectedIndex = 0;
    // If first option is disabled, navigate to first enabled option
    if (this.disabledOptions.has(this.selectedIndex) && this.disabledOptions.size < this.options.length) {
      this.navigateDown();
    }
  }

  private createUI(): void {
    // Calculate menu dimensions - make box larger
    const maxTextLength = Math.max(...this.options.map(opt => opt.length));
    const menuWidth = maxTextLength * 8 + MenuPromptBox.PADDING * 3; // Larger width
    const menuHeight = this.options.length * MenuPromptBox.LINE_HEIGHT + MenuPromptBox.PADDING * 3; // Larger height

    // Create background
    this.background = this.scene.add.graphics();
    this.background.setDepth(1000);

    // Recreate original PSMenu.java drawBox() with 3D effect and translucent background
    const BACK_COLOR = 0x000040;  // Dark blue background color
    const DARK_GRAY = 0x404040;   // Dark grey
    const LIGHT_GRAY = 0xC0C0C0;  // Light grey

    // Main translucent background (setlucent(15) equivalent - about 60% opacity)
    // rectfill(x+5,y+5,wx+x,wy+y,BACK_COLOR)
    this.background.fillStyle(BACK_COLOR, 0.6);
    this.background.fillRect(this.x + 5, this.y + 5, menuWidth - 5, menuHeight - 5);

    // Create the 3D border effect following exact Java order and calculations
    // rect(x+4,y+4,wx+x-4,wy+y-4,DARK_GRAY)
    this.background.lineStyle(1, DARK_GRAY);
    this.background.strokeRect(this.x + 4, this.y + 4, menuWidth - 8, menuHeight - 8);

    // rect(x+3,y+3,wx+x-3,wy+y-3,LIGHT_GRAY)
    this.background.lineStyle(1, LIGHT_GRAY);
    this.background.strokeRect(this.x + 3, this.y + 3, menuWidth - 6, menuHeight - 6);

    // rect(x+2,y+2,wx+x-2,wy+y-2,LIGHT_GRAY)
    this.background.lineStyle(1, LIGHT_GRAY);
    this.background.strokeRect(this.x + 2, this.y + 2, menuWidth - 4, menuHeight - 4);

    // rect(x+1,y+1,wx+x-1,wy+y-1,DARK_GRAY)
    this.background.lineStyle(1, DARK_GRAY);
    this.background.strokeRect(this.x + 1, this.y + 1, menuWidth - 2, menuHeight - 2);

    // rect(x,y,wx+x,wy+y,BACK_COLOR)
    this.background.lineStyle(1, BACK_COLOR);
    this.background.strokeRect(this.x, this.y, menuWidth, menuHeight);

    // Create option texts
    this.optionTexts = [];
    for (let i = 0; i < this.options.length; i++) {
      const textX = this.x + 15; // More space from selector
      const textY = this.y + 12 + i * MenuPromptBox.LINE_HEIGHT; // Better vertical spacing

      const textColor = this.disabledOptions.has(i) ? '#666666' : '#ffffff';
      const optionText = this.scene.add.text(textX, textY, this.options[i], {
        fontSize: `${MenuPromptBox.FONT_SIZE}px`,
        fontFamily: MenuPromptBox.FONT_FAMILY,
        fontStyle: MenuPromptBox.FONT_WEIGHT,
        color: textColor
      });
      optionText.setDepth(1001);
      this.optionTexts.push(optionText);
    }

    // Create selector (arrow) with proper initial position
    const initialSelectorX = this.x + 8; // Better distance from border
    const initialSelectorY = this.y + 12 + this.selectedIndex * MenuPromptBox.LINE_HEIGHT;

    this.selector = this.scene.add.text(initialSelectorX, initialSelectorY, '>', {
      fontSize: `${MenuPromptBox.FONT_SIZE}px`,
      fontFamily: MenuPromptBox.FONT_FAMILY,
      fontStyle: MenuPromptBox.FONT_WEIGHT,
      color: '#ffff00' // Yellow selector
    });
    this.selector.setDepth(1001);

    this.updateUI();
  }

  private updateUI(): void {
    if (!this.visible || !this.selector) return;

    // Update selector position
    const selectorX = this.x + 8; // Better distance from border
    const selectorY = this.y + 12 + this.selectedIndex * MenuPromptBox.LINE_HEIGHT;
    this.selector.setPosition(selectorX, selectorY);
  }

  private destroyUI(): void {
    if (this.background) {
      this.background.destroy();
      this.background = null;
    }

    this.optionTexts.forEach(text => text.destroy());
    this.optionTexts = [];

    if (this.selector) {
      this.selector.destroy();
      this.selector = null;
    }
  }
}