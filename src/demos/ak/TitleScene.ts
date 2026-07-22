/**
 * TitleScene - Alex Kidd Title Screen
 * Port of Java title screen with progressive image reveal
 * Shows title image with rectangles that disappear over time
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { AkBaseScene } from './AkBaseScene';
import { AkMusic } from './music';

export class TitleScene extends AkBaseScene {

  // Title screen elements
  private titleImage!: Phaser.GameObjects.Image;
  private graphics!: Phaser.GameObjects.Graphics;
  mainConfig: any; // Main config for returning to menu
  private timer: number = 0;

  // Background color RGB (255, 255, 170)
  private backgroundColor: number = 0xffffaa;

  constructor() {
    super('TitleScene');
  }

  preload() {
    // Load title screen image
    this.load.image('title', 'src/demos/ak/res/image/Title.PNG');
  }

  async init(data: { demoPath: string, config?: any }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
    this.mainConfig = data.config; // Store main config for returning to menu
  }

  async create() {
    try {
      // Setup common AK controls
      this.setupAkControls();

      MainEngine.setCurrentScene(this, this.config);

      // Create title background image
      this.titleImage = this.add.image(0, 0, 'title');
      this.titleImage.setOrigin(0, 0);

      // Create graphics object for drawing rectangles
      this.graphics = this.add.graphics();
      this.graphics.setDepth(1000); // High depth to render on top

      // Play intro music (non-looping jingle)
      ScriptEngine.playmusic(AkMusic.INTRO, false);

      console.log('TitleScene: Title screen initialized');
    } finally {
      (window as any).hideLoading?.();
    }
  }

  update(_delta: number): void {
    // Handle common input (includes menu/ESC handling)
    this.handleCommonInput();

    // Increment timer
    this.timer++;

    // Clear previous rectangles (only if graphics is initialized)
    if (this.graphics) {
      this.graphics.clear();
      this.graphics.fillStyle(this.backgroundColor);
    }

    // Progressive rectangle removal (only if graphics is initialized)
    if (this.graphics) {
      // Each rectangle disappears when timer reaches specified value

      if (this.timer < 75) {
        this.graphics.fillRect(210, 4, 295 - 210, 50 - 4); // width = 85, height = 46
      }

      if (this.timer < 150) {
        this.graphics.fillRect(134, 134, 233 - 134, 169 - 134); // width = 99, height = 35
      }

      if (this.timer < 225) {
        this.graphics.fillRect(32, 7, 76 - 32, 60 - 7); // width = 44, height = 53
      }

      if (this.timer < 300) {
        this.graphics.fillRect(265, 72, 301 - 265, 156 - 72); // width = 36, height = 84
      }

      if (this.timer < 375) {
        this.graphics.fillRect(25, 78, 108 - 25, 194 - 78); // width = 83, height = 116
      }

      // Blinking text area (shows/hides every 25 frames when timer >= 400)
      if (this.timer < 400 || this.timer % 50 < 25) {
        this.graphics.fillRect(88, 207, 228 - 88, 218 - 207); // width = 140, height = 11
      }
    }

    // Handle title-specific input (only if inputManager is initialized)
    if (!this.confirmingExit && this.inputManager &&
        (this.inputManager.justPressed('b1') || this.inputManager.justPressed('start'))) {
      this.startGame();
    }
  }

  private startGame(): void {
    console.log('TitleScene: Starting game...');

    // Stop intro music
    ScriptEngine.stopmusic();

    // Start with MapScene to show the first level
    this.scene.start('MapScene', {
      config: this.config
    });
  }

  exitGame(): void {
    console.log('TitleScene: Exiting Alex Kidd demo...');
    this.backToMainMenu();
  }
}