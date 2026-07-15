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
import { ConfirmDialog } from '../../utils/ConfirmDialog';

export class Demo1Scene extends Phaser.Scene {
  private config!: GameConfig;
  private mainConfig!: GameConfig;
  private inputManager!: InputManager;
  private fpsDisplay!: FPSDisplay;
  private tiledMap: any = null;
  private confirmingExit: boolean = false;

  constructor() {
    super({ key: 'Demo1Scene' });
  }

  preload() {
    this.load.tilemapTiledJSON('island-map', 'src/demos/demo1/island.map.json');
    this.load.json('maxim-anim', 'src/demos/demo1/maxim.anim.json');

    DemoUI.createLoadingText(this, 'Loading Island World...');
  }

  async init(data: { demoPath: string, config?: any }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
    this.mainConfig = data.config; // Store main config for returning to menu
  }

  async create() {
    const controlsConfig = new ControlsConfig();
    this.inputManager = new InputManager(this, controlsConfig);
    this.fpsDisplay = new FPSDisplay(this);

    // Demo1 only needs movement, no action buttons
    this.inputManager.setMobileButtons([]);

    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize entities
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'island.map.json', 'src/demos/demo1');
    await MainEngine.mapinit(this, 'maxim.anim.json', 'src/demos/demo1');

    const player = MainEngine.getPlayer();
    if (player) player.setSpeed(150); // 1.5x speed

    // Create UI
    DemoUI.createTitle(this, 'Demo 1 - Island World');

    // Setup camera and FPS display
    MainEngine.setupCamera();
    this.fpsDisplay.setVisible(this.config.showFPS);
  }

  update(delta: number) {
    if (this.confirmingExit) return;

    this.inputManager.updateControls();
    this.fpsDisplay.update();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Update engine
    MainEngine.updateEngine(this.inputManager);

    // Back to menu
    if (this.inputManager.justPressed('menu')) {
      this.confirmExit();
    }
  }

  private confirmExit(): void {
    this.confirmingExit = true;
    ConfirmDialog.confirm(this, this.inputManager, 'Exit to main menu?').then(confirmed => {
      this.confirmingExit = false;
      if (confirmed) {
        MainEngine.cleanup();
        this.scene.start('MenuScene', { config: this.mainConfig || this.config });
      }
    });
  }
}