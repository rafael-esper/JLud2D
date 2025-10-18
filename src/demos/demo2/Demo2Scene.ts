/**
 * Demo 2 Scene - Golden Axe Warrior Demo
 * Port of Java demo2 with Golden Axe Warrior features
 * Features: Screen transition camera, tree cutting mechanics, obstacle manipulation
 */

import { GameConfig } from '../../config/GameConfig';
import { InputManager, ControlsConfig } from '../../config/Controls';
import { FPSDisplay } from '../../utils/FPSDisplay';
import { MainEngine } from '../../core/MainEngine';
import { DemoUI } from '../../utils/DemoUI';
import { Entity, EntityDirection } from '../../domain/Entity';

export class Demo2Scene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;

  // Demo2 specific constants
  private static readonly TREE = 107;
  private static readonly FIELD = 39;

  // Sound effects
  private axeSwing: Phaser.Sound.BaseSound | null = null;

  // UI elements
  private menuBackground: Phaser.GameObjects.Graphics | null = null;
  private hpText: Phaser.GameObjects.Text | null = null;
  private mpText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'Demo2Scene' });
  }

  preload() {
    // Load tilemap JSON - tileset image will be auto-loaded by TiledMap
    this.load.tilemapTiledJSON('goldw-map', 'src/demos/demo2/goldw.map.json');

    // Load character animation JSON - sprite image will be auto-loaded by CHR
    this.load.json('warrior-anim', 'src/demos/demo2/warrior.anim.json');

    // Load sound effects
    this.load.audio('axe-swing', 'src/demos/demo2/axe swing.wav');

    // Create loading text
    DemoUI.createLoadingText(this, 'Loading Golden Axe Warrior...');
  }

  init(data: { config: GameConfig }) {
    this.config = data.config;
    this.inputManager = new InputManager(this, new ControlsConfig());
    this.fpsDisplay = new FPSDisplay(this);

    MainEngine.setCurrentScene(this, this.config);
  }

  async create() {
    // Load map and initialize entities
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'goldw.map.json', 'src/demos/demo2');
    await MainEngine.mapinit(this, 'warrior.anim.json', 'src/demos/demo2');

    // Load sound effects
    this.axeSwing = this.sound.add('axe-swing');

    // Setup camera bounds first
    MainEngine.setupCamera();

    // Set player step and speed
    MainEngine.setPlayerStep(4);
    const player = MainEngine.getPlayer();
    if (player) {
      player.setSpeed(170);

      // Manually center camera on player
      const playerPixelX = player.getPixelX() + (player.getHotW() / 2);
      const playerPixelY = player.getPixelY() + (player.getHotH() / 2);
      MainEngine.setCameraPosition(playerPixelX, playerPixelY);

    }

    // Set to standard following mode (mode 1) for testing
    MainEngine.setCameraTracking(1);

    // Create UI
    this.createUI();
    DemoUI.createTitle(this, 'Demo 2 - Golden Axe Warrior');
    DemoUI.createInstructions(this, 'WASD/Arrows: Move | Space: Cut Tree | ESC: Back to Menu');

    // Set up input handlers
    this.setupInputHandlers();

    // Hook button for tree cutting
    this.setupTreeCuttingMechanic();

  }

  private createUI(): void {
    // Create semi-transparent menu background
    this.menuBackground = this.add.graphics();
    this.menuBackground.fillStyle(0x0000ff, 0.6); // Blue with 60% opacity
    this.menuBackground.fillRect(5, 5, 35, 20);
    this.menuBackground.setScrollFactor(0); // Fixed to camera

    // Create HP text
    this.hpText = this.add.text(7, 12, 'HP  16', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.hpText.setScrollFactor(0); // Fixed to camera

    // Create MP text
    this.mpText = this.add.text(7, 19, 'MP   0', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.mpText.setScrollFactor(0); // Fixed to camera
  }

  private setupInputHandlers(): void {
    // Setup ESC key to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToMenu();
    });

    // Setup Space key for tree cutting
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.cutTree();
    });
  }

  private setupTreeCuttingMechanic(): void {
    // This replaces the Java hookbutton functionality
    // Tree cutting will be triggered by Space key
  }

  private cutTree(): void {
    const player = MainEngine.getPlayer();
    if (!player || !this.tiledMap) {
      return;
    }

    // Prevent movement during tree cutting
    MainEngine.setScriptActive(true);

    // Play axe swing sound
    if (this.axeSwing) {
      this.axeSwing.play();
    }

    // Get player tile position
    const xx = Math.floor(player.getPixelX() / 16);
    const yy = Math.floor(player.getPixelY() / 16);

    // Get target tile based on player facing direction
    let targetX = xx;
    let targetY = yy;
    let animSequence = '';

    switch (player.getFace()) {
      case EntityDirection.NORTH:
        targetY = yy - 1;
        animSequence = 'Z12 W3 Z13 W3 Z14 W3 Z15 W6 H';
        break;

      case EntityDirection.SOUTH:
        targetY = yy + 1;
        animSequence = 'Z20 W3 Z21 W3 Z22 W3 Z23 W6 H';
        break;

      case EntityDirection.WEST:
        targetX = xx - 1;
        animSequence = 'Z16 W3 Z17 W3 Z18 W3 Z19 W6 H';
        break;

      case EntityDirection.EAST:
        targetX = xx + 1;
        animSequence = 'Z24 W3 Z25 W3 Z26 W3 Z27 W6 H';
        break;
    }

    // Check if target tile is a tree and cut it
    if (this.tiledMap.gettile(targetX, targetY, 0) === Demo2Scene.TREE) {
      // Replace tree with field
      this.tiledMap.settile(targetX, targetY, 0, Demo2Scene.FIELD);
      // Remove obstacle
      this.tiledMap.setobs(targetX, targetY, 0);
    }

    // Play animation sequence (simplified version)
    this.playAxeAnimation(player, animSequence);
  }

  private playAxeAnimation(player: Entity, animSequence: string): void {
    // Use MainEngine's playermove function to handle animation sequence
    MainEngine.playermove(animSequence);

    // Calculate delay based on sequence (simplified)
    const waitCommands = animSequence.match(/W\d+/g) || [];
    let totalDelay = 0;
    for (const wait of waitCommands) {
      const frames = parseInt(wait.substring(1));
      totalDelay += frames * 16; // Convert to milliseconds
    }

    // Default delay if no wait commands
    if (totalDelay === 0) {
      totalDelay = 600;
    }

    // Use a timer to re-enable movement after animation
    this.time.delayedCall(totalDelay, () => {
      MainEngine.setScriptActive(false);
    });
  }

  private returnToMenu(): void {
    // Cleanup before returning to menu
    MainEngine.cleanup();
    this.scene.start('MenuScene', { config: this.config });
  }

  update(time: number, delta: number): void {
    // Update input manager first
    this.inputManager.updateControls();

    // Process input for player movement
    if (!MainEngine.isScriptActive()) {
      MainEngine.ProcessControls(this.inputManager);
    }

    // Update all entities
    MainEngine.updateEntities();

    // Handle camera tracking
    MainEngine.handleCameraTracking();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Update FPS display
    this.fpsDisplay.update();
  }

  destroy(): void {
    // Cleanup resources
    if (this.axeSwing) {
      this.axeSwing.destroy();
    }

    super.destroy();
  }
}