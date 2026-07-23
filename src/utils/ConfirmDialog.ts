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

      // Modal overlay: must sit above everything, including the PS dungeon
      // render texture (1990) and menu boxes (2000+)
      const bg = scene.add.graphics().setScrollFactor(0).setDepth(5000);
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
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(5001);

      const hint = scene.add.text(width / 2, boxY + boxHeight - 12, 'Enter/B1 = Yes   Esc = No', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ffff00'
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(5001);

      const cleanup = () => {
        bg.destroy();
        text.destroy();
        hint.destroy();
      };

      // The virtual-pad button that answers the dialog is still physically held
      // when we resolve. If "Yes" tears down this scene, the next scene builds a
      // fresh InputManager (prevStart/prevB1 = false) that would read the still
      // held button as a brand-new press on frame one (e.g. instantly selecting
      // the first menu entry). Clearing the shared touch state at answer time
      // stops that button leaking across the scene boundary.
      const clearHeldTouchButtons = () => {
        const mc = (window as any).mobileControls;
        if (mc && mc.buttonStates) {
          for (const key of Object.keys(mc.buttonStates)) {
            mc.buttonStates[key] = false;
          }
        }
      };

      const poll = () => {
        inputManager.updateControls();

        // Start (Enter) confirms. On touch the Start button is small and easy
        // to miss, so the always-visible primary action button (B1) also
        // confirms — this is what makes "Pause then confirm" reachable on the
        // virtual pad without hunting for the tiny Start key.
        if (inputManager.justPressed('start') || inputManager.justPressed('b1')) {
          cleanup();
          clearHeldTouchButtons();
          resolve(true);
          return;
        }

        if (inputManager.justPressed('menu')) {
          cleanup();
          clearHeldTouchButtons();
          resolve(false);
          return;
        }

        scene.time.delayedCall(16, poll);
      };

      poll();
    });
  }
}
