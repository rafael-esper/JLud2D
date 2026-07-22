/**
 * Responsive Scaler Utility
 *
 * Scaling is owned by Phaser's Scale Manager and CSS — not by this class:
 *  - #game-container (index.html) is sized with position:fixed + 100dvh, so it
 *    tracks window resizes, orientation changes and mobile browser chrome.
 *  - Phaser (Scale.FIT + CENTER_BOTH + expandParent:false) re-fits the canvas
 *    inside the container immediately on every resize, with no timers.
 *  - The mobile controls toggle shrinks the container via the .controls-open
 *    class and dispatches a resize event so Phaser re-fits at once.
 *
 * This class only keeps the small API main.ts uses: applying a new base
 * resolution when the config changes, and forcing a re-fit.
 */

export class ResponsiveScaler {
  private game: Phaser.Game;
  private baseWidth: number;
  private baseHeight: number;

  constructor(game: Phaser.Game, baseWidth: number, baseHeight: number, _isDoubleMode: boolean = false) {
    this.game = game;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
  }

  /**
   * Apply the base resolution and re-fit the canvas now.
   * Called by main.ts when the config resolution changes; the initial fit
   * is done by Phaser itself at boot.
   */
  public forceUpdate(): void {
    const apply = () => {
      const scale = this.game.scale;
      if (scale.width !== this.baseWidth || scale.height !== this.baseHeight) {
        scale.setGameSize(this.baseWidth, this.baseHeight);
      }
      scale.refresh();
    };

    if (this.game.isBooted) {
      apply();
    } else {
      this.game.events.once(Phaser.Core.Events.READY, apply);
    }
  }

  public destroy(): void {
    // No listeners of our own — Phaser's Scale Manager handles resize events
  }
}
