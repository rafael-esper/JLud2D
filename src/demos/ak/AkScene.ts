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
import { AkActions } from './AkActions';
import { AkMovement, Condition, Status } from './AkMovement';

export class AkScene extends Phaser.Scene {
  private config: GameConfig;
  private inputManager: InputManager;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private movement: AkMovement;

  // Player animation and collision dimensions
  private playerframe: number = 0;
  private akidd_px: number = 0;
  private akidd_py: number = 0;
  private akidd_vx: number = 0;
  private akidd_vy: number = 0;

  constructor() {
    super({ key: 'AkScene' });
  }

  preload() {
    this.load.tilemapTiledJSON('level01-map', 'src/demos/ak/level01.map.json');
    this.load.json('ak-anim', 'src/demos/ak/Ak.anim.json');

    // Load sound effects for events
    this.load.audio('star-sound', 'src/demos/ak/res/sound/Star.wav');
    this.load.audio('collect-sound', 'src/demos/ak/res/sound/Item.wav');
    this.load.audio('gold-sound', 'src/demos/ak/res/sound/Gold.wav');
    this.load.audio('punch-sound', 'src/demos/ak/res/sound/Punch.wav');
    this.load.audio('rock-sound', 'src/demos/ak/res/sound/Rock.wav');

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

    // Set FPS to 30 for Alex Kidd demo (matching original)
    this.game.loop.targetFps = 30;

    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize player
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'level01.map.json', 'src/demos/ak');
    await MainEngine.mapinit(this, 'Ak.anim.json', 'src/demos/ak');

    // Set camera to follow player
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();

    // Create debug graphics for player rectangle
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(1000); // High depth to render on top

    // Initialize AkActions sound system
    //FIXME AkActions.initSounds(this);

    // Initialize movement system
    this.movement = new AkMovement(this.tiledMap, this.inputManager);

    this.fpsDisplay.setVisible(this.config.showFPS);
  }

   update(delta: number): void {
    this.inputManager.updateControls();
    this.fpsDisplay.update();

    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Safety check: ensure movement system is initialized
    if (this.movement) {
      this.movement.processControls();
      this.movement.update();
    }

    const playerFrame = this.movement ? this.showPlayer() : 0;

    // Update player sprite frame (Phaser equivalent of screen.render/showpage)
    const player = MainEngine.getPlayer();
    if (player && player.getChr()) {
      player.setSpecframe(playerFrame);
      player.draw();
    }

    // Debug: Draw blue rectangle around player
    if (this.config.debug && player && this.debugGraphics) {
      this.debugGraphics.clear();

      // Draw simple rectangle around player sprite (32x32 frame size from Ak.anim.json)
      const rectX = this.akidd_px;
      const rectY = this.akidd_py;
      const rectWidth = this.akidd_vx;  // Frame width from Ak.anim.json
      const rectHeight = this.akidd_vy; // Frame height from Ak.anim.json
      this.debugGraphics.lineStyle(2, 0x0000ff, 1); // Blue outline
      this.debugGraphics.strokeRect(rectX, rectY, rectWidth, rectHeight);
    }

    MainEngine.handleCameraTracking();

    // Back to menu
    if (this.inputManager.justPressed('b4')) {
      MainEngine.cleanup();
      this.scene.start('MenuScene', { config: this.config });
    }
  }


  // Set player collision dimensions
  private setDimensions(px: number, py: number, vx: number, vy: number): void {
    this.akidd_px = px;
    this.akidd_py = py;
    this.akidd_vx = vx;
    this.akidd_vy = vy;
  }


  // Show player animation and set collision dimensions
  private showPlayer(): number {
    this.playerframe++;
    if (this.playerframe >= 6)
      this.playerframe = 0;

    const player = MainEngine.getPlayer();
    if (!player) return 0;

    // Check for punch action frame
    const punchFrame = AkActions.getPlayerFrame(this.movement.getAction(), this.movement.getCondition());
    if (punchFrame !== null) {
      return punchFrame;
    }

    if (this.movement.getState() == Status.STOPPED) {
      if (this.movement.getCondition() == Condition.WALK || this.movement.getCondition() == Condition.FLY) { // idle
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 1 - player.getFace();
      }
    }

    if (this.movement.getState() == Status.DUCKING || this.movement.getCondition() == Condition.STAR) { // ducking
      this.setDimensions(player.getx() + 12, player.gety() + 12, 8, 16);
      return 40 - player.getFace();
    }

    if (this.movement.getCondition() == Condition.WALK && this.movement.getState() == Status.WALKING) { // running
      this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
      return 9 - (3 * player.getFace()) + (this.playerframe >> 1);
    }

    if (this.movement.getCondition() == Condition.SWIM) { // swimming
      this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
      return 15 - (3 * player.getFace()) + Math.floor(this.playerframe / 3);
    }

    if (this.movement.getCondition() == Condition.WALK && (this.movement.getState() == Status.JUMPING || this.movement.getState() == Status.FALLING)) {
      this.setDimensions(player.getx() + 10, player.gety() + 8, 12, 20);
      return 3 - player.getFace();
    }

    return 0;
  }

}