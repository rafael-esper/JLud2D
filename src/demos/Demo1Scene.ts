/**
 * Demo 1 Scene - Island World Demo
 * Port of Java demo1 with Tiled tilemap rendering
 * Features: Beach tileset, animated water tiles, island exploration
 */

import { GameConfig } from '../config/GameConfig';
import { InputManager, ControlsConfig } from '../config/Controls';
import { FPSDisplay } from '../utils/FPSDisplay';
import { MainEngine } from '../core/MainEngine';
import { TiledMap } from '../domain/TiledMap';

export class Demo1Scene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;

  // Map object
  private tiledMap: TiledMap | null = null;

  constructor() {
    super({ key: 'Demo1Scene' });
  }

  preload() {
    // Load tilemap JSON - tileset image will be auto-loaded by TiledMap
    this.load.tilemapTiledJSON('island-map', 'src/demos/island.map.json');

    // Load character animation JSON - sprite image will be auto-loaded by CHR
    this.load.json('maxim-anim', 'src/demos/maxim.anim.json');

    // Create loading text
    const loadingText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Loading Island World...', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Remove loading text when loading is complete
    this.load.on('complete', () => {
      loadingText.destroy();
    });
  }

  init(data: { config: GameConfig }) {
    this.config = data.config;
    this.inputManager = new InputManager(this, new ControlsConfig());
    this.fpsDisplay = new FPSDisplay(this);

    // Set current scene and config in MainEngine
    MainEngine.setCurrentScene(this, this.config);
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Load the tilemap using TiledMap class
    await this.loadTiledMap();

    // Initialize entity system (mapinit equivalent)
    await MainEngine.mapinit(this);

    // Title
    this.add.text(width / 2, 20, 'Demo 1 - Island World', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // Instructions
    this.add.text(10, height - 40, 'WASD/Arrows: Move Character | ESC: Back to Menu', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1
    }).setScrollFactor(0).setDepth(100);

    // Setup camera bounds and initial position
    MainEngine.setupCamera();

    // Setup FPS display based on config
    this.fpsDisplay.setVisible(this.config.showFPS);

    console.log('Demo1Scene: Created Island World with tilemap and character');
  }

  update(time: number, delta: number) {
    this.inputManager.updateControls();

    // Update FPS display
    this.fpsDisplay.update();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Update engine (entities, movement, camera)
    MainEngine.updateEngine(this.inputManager);

    // Back to menu
    if (this.inputManager.justPressed('b4')) {
      this.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }

  /**
   * Load tilemap using TiledMap class
   */
  private async loadTiledMap(): Promise<void> {
    this.tiledMap = await TiledMap.loadMap(this, 'island.map.json');

    if (this.tiledMap) {
      // Start the map (equivalent to Java MapTiledJSON.startMap())
      this.tiledMap.startMap();

      // Set current map reference in MainEngine
      MainEngine.setCurrentMap(this.tiledMap);

      console.log('TiledMap loaded and started:', {
        size: `${this.tiledMap.getWidth()}x${this.tiledMap.getHeight()}`,
        tileSize: `${this.tiledMap.getTileWidth()}x${this.tiledMap.getTileHeight()}`,
        startPos: `${this.tiledMap.getStartX()}, ${this.tiledMap.getStartY()}`
      });
    } else {
      console.error('Failed to load TiledMap');
    }
  }







  /**
   * Cleanup scene resources
   */
  private cleanup(): void {
    // Clear entities when leaving scene
    MainEngine.clearEntities();

    // Destroy tilemap
    if (this.tiledMap) {
      this.tiledMap.destroy();
      this.tiledMap = null;
    }
  }
}