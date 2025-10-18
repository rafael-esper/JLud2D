/**
 * Demo 1 Scene - Island World Demo
 * Port of Java demo1 with Tiled tilemap rendering
 * Features: Beach tileset, animated water tiles, island exploration
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { FPSDisplay } from '../../utils/FPSDisplay';
import { MainEngine } from '../../core/MainEngine';
import { DemoUI } from '../../utils/DemoUI';

export class Demo1Scene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;

  constructor() {
    super({ key: 'Demo1Scene' });
  }

  preload() {
    // Load tilemap JSON - tileset image will be auto-loaded by TiledMap
    this.load.tilemapTiledJSON('island-map', 'src/demos/demo1/island.map.json');

    // Load character animation JSON - sprite image will be auto-loaded by CHR
    this.load.json('maxim-anim', 'src/demos/demo1/maxim.anim.json');

    // Create loading text
    DemoUI.createLoadingText(this, 'Loading Island World...');
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

    // Load map and initialize entities
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'island.map.json', 'src/demos/demo1');
    await MainEngine.mapinit(this, 'maxim.anim.json', 'src/demos/demo1');

    const player = MainEngine.getPlayer();
    if (player) player.setSpeed(150); // 1.5x speed

    // Create UI
    DemoUI.createTitle(this, 'Demo 1 - Island World');
    DemoUI.createInstructions(this, 'WASD/Arrows: Move Character | ESC: Back to Menu');

    // Setup camera and FPS display
    MainEngine.setupCamera();
    this.fpsDisplay.setVisible(this.config.showFPS);
  }

  update(delta: number) {
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