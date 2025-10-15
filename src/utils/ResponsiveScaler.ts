/**
 * Responsive Scaler Utility
 * Handles automatic canvas scaling for different screen sizes and orientations
 * Supports mobile portrait/landscape mode switching
 */

export class ResponsiveScaler {
  private game: Phaser.Game;
  private baseWidth: number;
  private baseHeight: number;
  private isDoubleMode: boolean;
  private orientationChangeTimeout: number | null = null;

  constructor(game: Phaser.Game, baseWidth: number, baseHeight: number, isDoubleMode: boolean = false) {
    this.game = game;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.isDoubleMode = isDoubleMode;

    this.setupResponsiveScaling();
    this.setupOrientationHandling();
  }

  /**
   * Setup responsive scaling system
   */
  private setupResponsiveScaling(): void {
    // Initial scale calculation
    setTimeout(() => {
      this.updateScale();
    }, 100);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.debounceResize();
    });

    // Handle orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      // Wait for orientation change to complete
      setTimeout(() => {
        this.updateScale();
      }, 200);
    });

    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', () => {
      setTimeout(() => {
        this.updateScale();
      }, 100);
    });

    // Handle visual viewport changes (mobile keyboard, etc.)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', () => {
        this.debounceResize();
      });
    }
  }

  /**
   * Setup mobile orientation detection
   */
  private setupOrientationHandling(): void {
    // Check if device supports orientation
    if ('orientation' in window) {
      this.detectOrientation();
    }

    // Also listen for screen orientation API
    if (screen && 'orientation' in screen) {
      screen.orientation?.addEventListener('change', () => {
        setTimeout(() => {
          this.updateScale();
        }, 100);
      });
    }
  }

  /**
   * Detect current orientation and log it
   */
  private detectOrientation(): void {
    const orientation = window.orientation;
    let orientationText = 'unknown';

    switch (orientation) {
      case 0:
        orientationText = 'portrait';
        break;
      case 90:
      case -90:
        orientationText = 'landscape';
        break;
      case 180:
        orientationText = 'portrait (upside down)';
        break;
    }

    console.log(`Orientation changed to: ${orientationText} (${orientation}°)`);
  }

  /**
   * Debounce resize events to avoid excessive scaling
   */
  private debounceResize(): void {
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }

    this.orientationChangeTimeout = window.setTimeout(() => {
      this.updateScale();
    }, 150);
  }

  /**
   * Update canvas scale based on current screen size
   * IMPORTANT: Keep game resolution fixed, only scale the canvas
   */
  public updateScale(): void {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;

    // Game resolution is ALWAYS the base resolution (never changes)
    const gameWidth = this.baseWidth;
    const gameHeight = this.baseHeight;

    // Calculate scale factors to fit the screen
    const scaleX = availableWidth / gameWidth;
    const scaleY = availableHeight / gameHeight;

    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);

    // Apply double mode as a display scale multiplier, not resolution change
    const displayScale = scale * (this.isDoubleMode ? 2 : 1);

    // For pixel art, we want integer scaling, but allow it to scale up to fill the screen
    // Use floor only for very small scales, otherwise use the actual scale
    const clampedScale = displayScale < 1 ? 1 : Math.min(8, displayScale);

    // Calculate final canvas dimensions (scaled up from base resolution)
    const finalCanvasWidth = Math.floor(gameWidth * clampedScale);
    const finalCanvasHeight = Math.floor(gameHeight * clampedScale);

    console.log(`Responsive Scale Update:
      Available: ${availableWidth}x${availableHeight}
      Game Resolution: ${gameWidth}x${gameHeight} (FIXED)
      Display Scale: ${clampedScale}x
      Canvas Size: ${finalCanvasWidth}x${finalCanvasHeight}
      Orientation: ${this.getCurrentOrientation()}`);

    // Apply the scaling
    this.applyScale(gameWidth, gameHeight, finalCanvasWidth, finalCanvasHeight, clampedScale);
  }

  /**
   * Apply the calculated scale to the game
   */
  private applyScale(gameWidth: number, gameHeight: number, canvasWidth: number, canvasHeight: number, scale: number): void {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;

    // CRITICAL: Set Phaser game size to the FIXED resolution, not the scaled size
    if (this.game.scale) {
      this.game.scale.setGameSize(gameWidth, gameHeight);
      this.game.scale.setParentSize(availableWidth, availableHeight);
      this.game.scale.refresh();
    }

    // Update canvas CSS to scale up the fixed resolution
    const canvas = this.game.canvas;
    if (canvas) {
      // Canvas displays at scaled size but renders at game resolution
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';

      // Always use pixelated rendering for pixel art scaling
      canvas.style.imageRendering = 'pixelated';
      canvas.style.imageRendering = '-moz-crisp-edges';
      canvas.style.imageRendering = 'crisp-edges';

      // Center the canvas in the available space
      const offsetX = Math.floor((availableWidth - canvasWidth) / 2);
      const offsetY = Math.floor((availableHeight - canvasHeight) / 2);

      canvas.style.position = 'absolute';
      canvas.style.left = offsetX + 'px';
      canvas.style.top = offsetY + 'px';
    }

    // Update container styling
    const container = document.getElementById('game-container');
    if (container) {
      container.style.width = availableWidth + 'px';
      container.style.height = availableHeight + 'px';
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      container.style.backgroundColor = '#000';
    }

    // Update body to use full space
    document.body.style.width = availableWidth + 'px';
    document.body.style.height = availableHeight + 'px';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // Trigger a custom event for other components to respond
    window.dispatchEvent(new CustomEvent('gameScaleChanged', {
      detail: {
        gameWidth,
        gameHeight,
        canvasWidth,
        canvasHeight,
        containerWidth: availableWidth,
        containerHeight: availableHeight,
        scale
      }
    }));
  }

  /**
   * Get current orientation description
   */
  private getCurrentOrientation(): string {
    const orientation = window.orientation;
    const isLandscape = window.innerWidth > window.innerHeight;

    if (typeof orientation !== 'undefined') {
      switch (orientation) {
        case 0: return 'portrait';
        case 90: return 'landscape-left';
        case -90: return 'landscape-right';
        case 180: return 'portrait-inverted';
        default: return `orientation-${orientation}`;
      }
    }

    return isLandscape ? 'landscape' : 'portrait';
  }

  /**
   * Update double mode setting
   */
  public setDoubleMode(enabled: boolean): void {
    if (this.isDoubleMode !== enabled) {
      this.isDoubleMode = enabled;
      console.log(`Double mode ${enabled ? 'enabled' : 'disabled'}, updating scale...`);
      setTimeout(() => {
        this.updateScale();
      }, 100);
    }
  }

  /**
   * Force scale update (useful for config changes)
   */
  public forceUpdate(): void {
    this.updateScale();
  }

  /**
   * Get current scale information
   */
  public getScaleInfo(): {
    availableWidth: number;
    availableHeight: number;
    gameWidth: number;
    gameHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    scale: number;
    orientation: string;
  } {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const gameWidth = this.baseWidth;
    const gameHeight = this.baseHeight;

    const scaleX = availableWidth / gameWidth;
    const scaleY = availableHeight / gameHeight;
    const scale = Math.min(scaleX, scaleY);
    const displayScale = scale * (this.isDoubleMode ? 2 : 1);
    const clampedScale = Math.max(1, Math.min(8, Math.floor(displayScale)));

    const canvasWidth = Math.floor(gameWidth * clampedScale);
    const canvasHeight = Math.floor(gameHeight * clampedScale);

    return {
      availableWidth,
      availableHeight,
      gameWidth,
      gameHeight,
      canvasWidth,
      canvasHeight,
      scale: clampedScale,
      orientation: this.getCurrentOrientation()
    };
  }

  /**
   * Cleanup event listeners
   */
  public destroy(): void {
    if (this.orientationChangeTimeout) {
      clearTimeout(this.orientationChangeTimeout);
    }

    // Remove event listeners
    window.removeEventListener('resize', this.debounceResize);
    window.removeEventListener('orientationchange', this.updateScale);
    document.removeEventListener('fullscreenchange', this.updateScale);

    if (screen && 'orientation' in screen) {
      screen.orientation?.removeEventListener('change', this.updateScale);
    }
  }
}