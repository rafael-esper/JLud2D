/**
 * Demo UI Utility
 * Helper functions for creating common UI elements in demo scenes
 */

export class DemoUI {
  /**
   * Create a demo title text
   */
  static createTitle(scene: Phaser.Scene, title: string): Phaser.GameObjects.Text {
    const width = scene.cameras.main.width;
    return scene.add.text(width / 2, 20, title, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
  }

  /**
   * Create demo instructions text
   */
  static createInstructions(scene: Phaser.Scene, text: string): Phaser.GameObjects.Text {
    const height = scene.cameras.main.height;
    return scene.add.text(10, height - 40, text, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1
    }).setScrollFactor(0).setDepth(100);
  }

  /**
   * Create loading text that auto-destroys when complete
   */
  static createLoadingText(scene: Phaser.Scene, text: string = 'Loading...'): Phaser.GameObjects.Text {
    const loadingText = scene.add.text(
      scene.cameras.main.centerX,
      scene.cameras.main.centerY,
      text, {
        fontSize: '16px',
        fontFamily: 'monospace',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Auto-destroy when loading complete
    scene.load.on('complete', () => {
      loadingText.destroy();
    });

    return loadingText;
  }
}