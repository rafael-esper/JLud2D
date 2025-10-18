/**
 * Main Entry Point
 * Loads configuration and initializes Phaser game
 */

import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { SettingsScene } from './scenes/SettingsScene';
import { Demo1Scene } from './demos/demo1/Demo1Scene';
import { Demo2Scene } from './demos/demo2/Demo2Scene';
import { ResponsiveScaler } from './utils/ResponsiveScaler';

class Game {
  private game: Phaser.Game | null = null;
  private config: GameConfig | null = null;
  private responsiveScaler: ResponsiveScaler | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('JLud2D Phaser 4 Port - Initializing...');

    try {
      // Load configuration
      this.config = await GameConfig.loadConfig();
      console.log('Configuration loaded:', this.config);

      // Log configuration details
      console.log(`Resolution: ${this.config.xRes}x${this.config.yRes}`);
      console.log(`Window Mode: ${this.config.windowMode ? 'ON' : 'OFF'}`);
      console.log(`Double Window: ${this.config.doubleWindowMode ? 'ON' : 'OFF'}`);
      console.log(`Sound: ${this.config.noSound ? 'OFF' : 'ON'}`);
      console.log(`Debug: ${this.config.debug ? 'ON' : 'OFF'}`);

      // Create Phaser game
      this.createGame();

    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError('Failed to load game configuration. Using defaults.');

      // Fallback to default config
      this.config = new GameConfig();
      this.createGame();
    }
  }

  private createGame() {
    if (!this.config) {
      console.error('No configuration available');
      return;
    }

    // Get Phaser configuration from our config
    const phaserConfig = this.config.getPhaserConfig();

    // Add scenes to the configuration
    phaserConfig.scene = [
      BootScene,
      MenuScene,
      SettingsScene,
      Demo1Scene,
      Demo2Scene
    ];

    // Create the game
    this.game = new Phaser.Game(phaserConfig);

    // Setup responsive scaling
    this.responsiveScaler = new ResponsiveScaler(
      this.game,
      this.config.xRes,
      this.config.yRes,
      this.config.doubleWindowMode
    );

    // Start with boot scene and pass config
    this.game.scene.start('BootScene', { config: this.config });

    // Handle window events
    this.setupWindowEvents();

    console.log('Phaser game created successfully');
  }

  private setupWindowEvents() {
    if (!this.config) return;

    // Handle fullscreen key (F11 only, F6 is handled in settings)
    document.addEventListener('keydown', (event) => {
      if (event.key === 'F11') {
        event.preventDefault();
        this.toggleFullscreen();
      }
    });

    // Listen for config changes to update responsive scaler
    window.addEventListener('gameScaleChanged', (event) => {
      const detail = (event as CustomEvent).detail;
      console.log(`Game scale changed: Canvas ${detail.canvasWidth}x${detail.canvasHeight}, Container ${detail.containerWidth}x${detail.containerHeight} (scale: ${detail.scale})`);
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (this.game) {
        if (document.hidden) {
          this.game.sound.pauseAll();
        } else {
          this.game.sound.resumeAll();
        }
      }
    });
  }

  private toggleFullscreen() {
    if (!this.game) return;

    if (this.game.scale.isFullscreen) {
      this.game.scale.stopFullscreen();
    } else {
      this.game.scale.startFullscreen();
    }
  }

  private showError(message: string) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff4444;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      font-family: monospace;
      z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  // Public methods for external control
  public getConfig(): GameConfig | null {
    return this.config;
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  public destroy() {
    if (this.responsiveScaler) {
      this.responsiveScaler.destroy();
      this.responsiveScaler = null;
    }
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  // Public method to update scaling when config changes
  public updateScaling() {
    if (this.responsiveScaler && this.config) {
      this.responsiveScaler.setDoubleMode(this.config.doubleWindowMode);
    }
  }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting game...');
  const game = new Game();

  // Make game accessible globally for debugging
  (window as any).game = game;
});

// Export for potential module usage
export default Game;