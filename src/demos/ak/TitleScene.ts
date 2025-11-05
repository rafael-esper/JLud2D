/**
 * TitleScene - Alex Kidd Title Screen
 * Port of Java title screen with progressive image reveal
 * Shows title image with rectangles that disappear over time
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { MainEngine } from '../../core/MainEngine';

export class TitleScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;

  // Title screen elements
  private titleImage: Phaser.GameObjects.Image;
  private graphics: Phaser.GameObjects.Graphics;
  private timer: number = 0;

  // Background color RGB (255, 255, 170)
  private backgroundColor: number = 0xffffaa;

  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    // Load title screen image
    this.load.image('title', 'src/demos/ak/res/image/Title.PNG');
  }

  async init(data: { demoPath: string }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
  }

  async create() {
    this.inputManager = new InputManager(this, new ControlsConfig());

    MainEngine.setCurrentScene(this, this.config);

    // Create title background image
    this.titleImage = this.add.image(0, 0, 'title');
    this.titleImage.setOrigin(0, 0);

    // Create graphics object for drawing rectangles
    this.graphics = this.add.graphics();
    this.graphics.setDepth(1000); // High depth to render on top

    // Load and play intro music
    await MainEngine.loadVGM('intro', 'src/demos/ak/res/music/intro.vgz');
    MainEngine.playmusic('intro');

    console.log('TitleScene: Title screen initialized');
  }

  update(delta: number): void {
    this.inputManager.updateControls();

    // Increment timer
    this.timer++;

    // Clear previous rectangles
    this.graphics.clear();
    this.graphics.fillStyle(this.backgroundColor);

    // Progressive rectangle removal (ported from Java)
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

    // Handle input
    if (this.inputManager.justPressed('b1')) {
      this.startGame();
    }

    if (this.inputManager.justPressed('b3')) {
      this.exitGame();
    }
  }

  private startGame(): void {
    console.log('TitleScene: Starting game...');

    // Stop intro music
    MainEngine.stopmusic();

    // Start with MapScene to show the first level
    this.scene.start('MapScene', {
      config: this.config
    });
  }

  private exitGame(): void {
    console.log('TitleScene: Thanks for playing Alex Kidd remake!');

    // In a browser environment, we can't truly "exit", but we can go back to menu
    // TODO: Implement proper exit or return to main menu
    window.close(); // This may not work in all browsers due to security restrictions
  }

  destroy() {
    // Stop music when scene is destroyed
    MainEngine.stopmusic();
    super.destroy();
  }
}