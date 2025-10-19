/**
 * Ak Scene - Alex Kidd Platformer Demo
 * Port of Java AK.java with side-scrolling platformer mechanics
 * Features: Physics-based movement, multiple player states, tile-based collision
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { FPSDisplay } from '../../utils/FPSDisplay';
import { MainEngine } from '../../core/MainEngine';
import { DemoUI } from '../../utils/DemoUI';

export class AkScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;

  constructor() {
    super({ key: 'AkScene' });
  }

  preload() {
    this.load.tilemapTiledJSON('level01-map', 'src/demos/ak/level01.map.json');
    this.load.json('ak-anim', 'src/demos/ak/Ak.anim.json');

    DemoUI.createLoadingText(this, 'Loading Alex Kidd Demo...');
  }

  async init(data: { demoPath: string }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
  }

  async create() {
    this.inputManager = new InputManager(this, new ControlsConfig());
    this.fpsDisplay = new FPSDisplay(this);

    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize player
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'level01.map.json', 'src/demos/ak');
    await MainEngine.mapinit(this, 'Ak.anim.json', 'src/demos/ak');

    // Set camera to follow player
    //MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();

    this.fpsDisplay.setVisible(this.config.showFPS);
  }

   update(delta: number): void {
    this.inputManager.updateControls();
    this.fpsDisplay.update();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Update engine
    MainEngine.updateEngine(this.inputManager);

    // Back to menu
    if (this.inputManager.justPressed('b4')) {
      MainEngine.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }

}