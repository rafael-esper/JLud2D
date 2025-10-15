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

  // Camera variables
  private cameraSpeed: number = 4;

  constructor() {
    super({ key: 'Demo1Scene' });
  }

  preload() {
    // Load tilemap and tileset assets from demo folder
    this.load.tilemapTiledJSON('island-map', 'src/demos/island.map.json');
    this.load.image('beach-tileset', 'src/demos/beach_tileset.png');

    // Load character assets
    this.load.json('maxim-anim', 'src/demos/maxim.anim.json');
    this.load.image('maxim-sprite', 'src/demos/maxim.png');

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
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Load the tilemap using TiledMap class
    await this.loadTiledMap();

    // Initialize entity system (mapinit equivalent)
    await this.mapinit();

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
    this.setupCamera();

    // Setup FPS display based on config
    this.fpsDisplay.setVisible(this.config.showFPS);

    console.log('Demo1Scene: Created Island World with tilemap and character');
  }

  update() {
    this.inputManager.updateControls();

    // Update FPS display
    this.fpsDisplay.update();

    // Update entities through MainEngine
    MainEngine.updateEntities();

    // Handle player movement or camera movement
    const player = MainEngine.getPlayer();
    if (player) {
      // Process player controls through MainEngine
      MainEngine.ProcessControls(this.inputManager);

      // Handle camera tracking if enabled
      if (MainEngine.getCameraTracking() === 1) {
        this.handleCameraTracking();
      }
    } else {
      // Fallback to manual camera movement
      this.handleCameraMovement();
    }

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

      console.log('TiledMap loaded and started:', {
        size: `${this.tiledMap.getWidth()}x${this.tiledMap.getHeight()}`,
        tileSize: `${this.tiledMap.getTileWidth()}x${this.tiledMap.getTileHeight()}`,
        startPos: `${this.tiledMap.getStartX()}, ${this.tiledMap.getStartY()}`
      });
    } else {
      console.error('Failed to load TiledMap');
    }
  }

  private setupCamera(): void {
    if (!this.tiledMap) return;

    // Calculate map bounds in pixels
    const mapWidth = this.tiledMap.getWidth() * this.tiledMap.getTileWidth();
    const mapHeight = this.tiledMap.getHeight() * this.tiledMap.getTileHeight();

    // CRITICAL: Camera viewport is ALWAYS the config resolution
    const cameraWidth = this.config.xRes;
    const cameraHeight = this.config.yRes;

    // Set camera bounds to the map size (this constrains scrolling)
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Set camera viewport to exact config resolution
    this.cameras.main.setViewport(0, 0, cameraWidth, cameraHeight);

    // Set initial camera position using map's start position
    const startX = this.tiledMap.getStartX() * this.tiledMap.getTileWidth();
    const startY = this.tiledMap.getStartY() * this.tiledMap.getTileHeight();

    // Center camera on start position with proper clamping
    this.setCameraPosition(startX, startY);

    console.log('Camera setup:', {
      mapSize: `${mapWidth}x${mapHeight}`,
      cameraViewport: `${cameraWidth}x${cameraHeight}`,
      startPosition: `${startX}, ${startY}`,
      tilesVisible: `${Math.floor(cameraWidth / this.tiledMap.getTileWidth())}x${Math.floor(cameraHeight / this.tiledMap.getTileHeight())}`
    });
  }

  private setCameraPosition(x: number, y: number): void {
    if (!this.tiledMap) return;

    const camera = this.cameras.main;
    const mapWidth = this.tiledMap.getWidth() * this.tiledMap.getTileWidth();
    const mapHeight = this.tiledMap.getHeight() * this.tiledMap.getTileHeight();

    // Camera viewport dimensions (like Java camera.viewportWidth/2)
    const camViewportHalfX = camera.width / 2;
    const camViewportHalfY = camera.height / 2;

    // Clamp camera position to map bounds (like Java MathUtils.clamp)
    const clampedX = Math.max(camViewportHalfX, Math.min(x, mapWidth - camViewportHalfX));
    const clampedY = Math.max(camViewportHalfY, Math.min(y, mapHeight - camViewportHalfY));

    // Set camera position (Phaser uses centerOn which is like setting camera.position in Java)
    camera.centerOn(clampedX, clampedY);
  }


  private handleCameraMovement(): void {
    let moveX = 0;
    let moveY = 0;

    if (this.inputManager.left) {
      moveX = -this.cameraSpeed;
    }
    if (this.inputManager.right) {
      moveX = this.cameraSpeed;
    }
    if (this.inputManager.up) {
      moveY = -this.cameraSpeed;
    }
    if (this.inputManager.down) {
      moveY = this.cameraSpeed;
    }

    // Apply camera movement with proper clamping
    if (moveX !== 0 || moveY !== 0) {
      const camera = this.cameras.main;
      const newX = camera.centerX + moveX;
      const newY = camera.centerY + moveY;

      // Use the same clamping logic as setCameraPosition
      this.setCameraPosition(newX, newY);
    }
  }

  /**
   * Map initialization - equivalent to Java Demo1.mapinit()
   * Spawns the player character and sets up camera tracking
   */
  private async mapinit(): Promise<void> {
    if (!this.tiledMap) {
      console.error('mapinit: TiledMap not loaded');
      return;
    }

    // Set current map reference in MainEngine
    MainEngine.setCurrentMap(this.tiledMap);

    // Get start position from map (matching Java demo logic)
    let gotox = 0;
    let gotoy = 0;

    if (gotox === 0 && gotoy === 0) {
      // Use map start position
      gotox = this.tiledMap.getStartX(); // current_map.getStartX() equivalent
      gotoy = this.tiledMap.getStartY(); // current_map.getStartY() equivalent
    }

    // Spawn player entity (equivalent to entityspawn + setplayer)
    const playerIndex = await MainEngine.entityspawn(this, gotox, gotoy, 'maxim.anim.json');
    MainEngine.setplayer(playerIndex);

    // Enable camera tracking (equivalent to cameratracking = 1)
    MainEngine.setCameraTracking(1);

    // Set player properties (matching Java demo)
    MainEngine.setPlayerStep(4);
    const player = MainEngine.getPlayer();
    if (player) {
      player.setSpeed(64); // Pixels per second - much slower, more reasonable

      // Center camera on player initially
      const playerPixelX = player.getPixelX();
      const playerPixelY = player.getPixelY();
      this.setCameraPosition(playerPixelX, playerPixelY);
    }

    console.log('Demo1Scene: mapinit completed - player spawned and camera tracking enabled');
  }

  /**
   * Handle camera tracking - follow the player
   * Equivalent to Java camera tracking when cameratracking = 1
   */
  private handleCameraTracking(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    // Get player center position
    const playerX = player.getPixelX() + (player.getHotW() / 2);
    const playerY = player.getPixelY() + (player.getHotH() / 2);

    // Set camera to follow player (with same clamping as manual movement)
    this.setCameraPosition(playerX, playerY);
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