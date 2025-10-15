/**
 * Game Configuration
 * TypeScript port of Java Config.java
 * Manages game settings like resolution, window mode, sound, etc.
 */

export interface IGameConfig {
  // Display settings
  xRes: number;
  yRes: number;
  windowMode: boolean;
  doubleWindowMode: boolean;
  fullscreen: boolean;

  // Audio settings
  noSound: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;

  // Debug settings
  logConsole: boolean;
  debug: boolean;
  showFPS: boolean;

  // Game settings
  mapName: string;
  startupDemo: string;

  // Input settings
  keyboardEnabled: boolean;
  gamepadEnabled: boolean;
  touchEnabled: boolean;

  // Performance settings
  antialias: boolean;
  pixelArt: boolean;
  roundPixels: boolean;
}

export class GameConfig implements IGameConfig {
  // Display settings
  public xRes: number = 320;
  public yRes: number = 240;
  public windowMode: boolean = true;
  public doubleWindowMode: boolean = true;
  public fullscreen: boolean = false;

  // Audio settings
  public noSound: boolean = false;
  public masterVolume: number = 1.0;
  public musicVolume: number = 0.8;
  public sfxVolume: number = 1.0;

  // Debug settings
  public logConsole: boolean = true;
  public debug: boolean = false;
  public showFPS: boolean = false;

  // Game settings
  public mapName: string = '';
  public startupDemo: string = 'demo1';

  // Input settings
  public keyboardEnabled: boolean = true;
  public gamepadEnabled: boolean = true;
  public touchEnabled: boolean = true;

  // Performance settings
  public antialias: boolean = false;
  public pixelArt: boolean = true;
  public roundPixels: boolean = true;

  constructor(configData?: Partial<IGameConfig>) {
    if (configData) {
      Object.assign(this, configData);
    }
  }

  /**
   * Load configuration from JSON file or localStorage
   */
  public static async loadConfig(): Promise<GameConfig> {
    try {
      // Try to load from localStorage first
      const savedConfig = localStorage.getItem('gameConfig');
      if (savedConfig) {
        const configData = JSON.parse(savedConfig);
        console.log('Loaded config from localStorage');
        return new GameConfig(configData);
      }

      // Try to load from config.json file
      const response = await fetch('./config.json');
      if (response.ok) {
        const configData = await response.json();
        console.log('Loaded config from config.json');
        return new GameConfig(configData);
      }
    } catch (error) {
      console.warn('Could not load config file, using defaults:', error);
    }

    console.log('Using default configuration');
    return new GameConfig();
  }

  /**
   * Save configuration to localStorage
   */
  public saveConfig(): void {
    try {
      localStorage.setItem('gameConfig', JSON.stringify(this));
      console.log('Configuration saved to localStorage');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  /**
   * Export configuration as JSON string
   */
  public exportToJson(): string {
    return JSON.stringify(this, null, 2);
  }

  /**
   * Get Phaser game configuration object
   * IMPORTANT: Always use FIXED resolution, never scale the game resolution
   */
  public getPhaserConfig(): Phaser.Types.Core.GameConfig {
    return {
      type: Phaser.AUTO,
      width: this.xRes,        // FIXED: Always use exact config resolution
      height: this.yRes,       // FIXED: Always use exact config resolution
      parent: 'game-container',
      backgroundColor: '#000000',
      pixelArt: true,
      antialias: false,
      roundPixels: true,

      scale: {
        mode: Phaser.Scale.NONE,  // CRITICAL: No scaling by Phaser
        autoCenter: Phaser.Scale.CENTER_BOTH
      },

      render: {
        antialias: false,         // Always false for pixel art
        pixelArt: true,           // Always true for pixel art
        roundPixels: true         // Always true for pixel art
      },

      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: this.debug
        }
      },

      audio: {
        disableWebAudio: false,
        context: false
      },

      input: {
        keyboard: this.keyboardEnabled,
        gamepad: this.gamepadEnabled,
        touch: this.touchEnabled
      },

      fps: {
        target: 60,
        forceSetTimeOut: true,
        deltaHistory: 10,
        panicMax: 120
      },

      scene: [] // Will be populated by main.ts
    };
  }

  /**
   * Create a default config.json file content
   */
  public static createDefaultConfigJson(): string {
    const defaultConfig = new GameConfig();
    return defaultConfig.exportToJson();
  }
}

export default GameConfig;