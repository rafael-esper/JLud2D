/**
 * Confirm Dialog Utility
 * Generic Yes/No confirmation overlay shared by every demo scene - it only
 * depends on the shared InputManager's Enter/Esc (start/menu) buttons, so it
 * works regardless of a demo's action-button layout or menu system.
 */

import { InputManager } from '../config/Controls';

export class ConfirmDialog {
  /**
   * Show a message with "Enter = Yes / Esc = No" and resolve once the
   * player answers. Pauses on its own polling loop, independent of the
   * calling scene's update() - callers should skip their own game logic
   * while the returned promise is pending.
   */
  static async confirm(scene: Phaser.Scene, inputManager: InputManager, message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const width = scene.cameras.main.width;
      const height = scene.cameras.main.height;

      const boxWidth = Math.min(width - 20, 220);
      const boxHeight = 44;
      const boxX = (width - boxWidth) / 2;
      const boxY = (height - boxHeight) / 2;

      const bg = scene.add.graphics().setScrollFactor(0).setDepth(1000);
      bg.fillStyle(0x000000, 0.85);
      bg.fillRect(boxX, boxY, boxWidth, boxHeight);
      bg.lineStyle(1, 0xffffff, 1);
      bg.strokeRect(boxX, boxY, boxWidth, boxHeight);

      const text = scene.add.text(width / 2, boxY + 8, message, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: boxWidth - 12 }
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

      const hint = scene.add.text(width / 2, boxY + boxHeight - 12, 'Enter = Yes   Esc = No', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ffff00'
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001);

      const cleanup = () => {
        bg.destroy();
        text.destroy();
        hint.destroy();
      };

      const poll = () => {
        inputManager.updateControls();

        if (inputManager.justPressed('start')) {
          cleanup();
          resolve(true);
          return;
        }

        if (inputManager.justPressed('menu')) {
          cleanup();
          resolve(false);
          return;
        }

        scene.time.delayedCall(16, poll);
      };

      poll();
    });
  }
}
