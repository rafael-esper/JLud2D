/**
 * FPS Display Utility
 * Replicates the Java GUI.java FPS display functionality
 */

export class FPSDisplay {
  private scene: Phaser.Scene;
  private fpsText?: Phaser.GameObjects.Text;
  private isVisible: boolean = false;

  // FPS calculation variables (matching Java implementation)
  private nextSecond: number = Date.now() + 1000;
  private frameInLastSecond: number = 0;
  private framesInCurrentSecond: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show or hide the FPS display
   */
  public setVisible(visible: boolean): void {
    this.isVisible = visible;

    if (visible && !this.fpsText) {
      // Create FPS text (matching Java font style)
      this.fpsText = this.scene.add.text(10, 20, 'FPS: --', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1
      });
      this.fpsText.setDepth(1000); // Always on top
    } else if (!visible && this.fpsText) {
      this.fpsText.destroy();
      this.fpsText = undefined;
    }
  }

  /**
   * Update FPS calculation and display
   * Call this every frame (matching Java updateFPS method)
   */
  public update(): void {
    if (!this.isVisible || !this.fpsText) return;

    const currentTime = Date.now();

    // Update FPS calculation (exactly like Java version)
    if (currentTime > this.nextSecond) {
      this.nextSecond += 1000;
      this.frameInLastSecond = this.framesInCurrentSecond;
      this.framesInCurrentSecond = 0;
    }
    this.framesInCurrentSecond++;

    // Update display text (matching Java format)
    this.fpsText.setText(`FPS: ${this.frameInLastSecond}`);
  }

  /**
   * Get current FPS value
   */
  public getCurrentFPS(): number {
    return this.frameInLastSecond;
  }

  /**
   * Destroy the FPS display
   */
  public destroy(): void {
    if (this.fpsText) {
      this.fpsText.destroy();
      this.fpsText = undefined;
    }
  }
}