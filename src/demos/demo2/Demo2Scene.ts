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
    this.load.tilemapTiledJSON('goldw-map', 'src/demos/demo2/goldw.map.json');
    this.load.json('warrior-anim', 'src/demos/demo2/warrior.anim.json');
    this.load.audio('axe-swing', 'src/demos/demo2/axe swing.wav');
    DemoUI.createLoadingText(this, 'Loading Golden Axe Warrior...');
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

    this.tiledMap = await MainEngine.loadAndInitMap(this, 'goldw.map.json', 'src/demos/demo2');
    await MainEngine.mapinit(this, 'warrior.anim.json', 'src/demos/demo2');

    this.axeSwing = this.sound.add('axe-swing');
    MainEngine.setupCamera();

    const player = MainEngine.getPlayer();
    if (player) player.setSpeed(170);

    MainEngine.setCameraTracking(3);

    this.createUI();
    DemoUI.createTitle(this, 'Demo 2 - Golden Axe Warrior');
    DemoUI.createInstructions(this, 'WASD/Arrows: Move | Space: Cut Tree | ESC: Back to Menu');

    this.setupInputHandlers();
    this.setupTreeCuttingMechanic();
  }

  private createUI(): void {
    this.menuBackground = this.add.graphics();
    this.menuBackground.fillStyle(0x0000ff, 0.6);
    this.menuBackground.fillRect(5, 5, 35, 20);
    this.menuBackground.setScrollFactor(0);

    this.hpText = this.add.text(7, 12, 'HP  16', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.hpText.setScrollFactor(0);

    this.mpText = this.add.text(7, 19, 'MP   0', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffffff'
    });
    this.mpText.setScrollFactor(0);
  }

  private setupInputHandlers(): void {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToMenu();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.cutTree();
    });
  }

  private setupTreeCuttingMechanic(): void {
  }

  private cutTree(): void {
    const player = MainEngine.getPlayer();
    if (!player || !this.tiledMap) return;

    MainEngine.setScriptActive(true);
    if (this.axeSwing) this.axeSwing.play();

    const xx = Math.floor(player.getx() / 16);
    const yy = Math.floor(player.gety() / 16);
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

    if (this.tiledMap.gettile(targetX, targetY, 0) === Demo2Scene.TREE) {
      this.tiledMap.settile(targetX, targetY, 0, Demo2Scene.FIELD);
      this.tiledMap.setobs(targetX, targetY, 0);
    }

    MainEngine.playermove(animSequence);

    const waitCommands = animSequence.match(/W\d+/g) || [];
    let totalDelay = 0;
    for (const wait of waitCommands) {
      totalDelay += parseInt(wait.substring(1)) * 16;
    }
    if (totalDelay === 0) totalDelay = 600;

    this.time.delayedCall(totalDelay, () => {
      MainEngine.setScriptActive(false);
    });
  }

  private returnToMenu(): void {
    MainEngine.cleanup();
    this.scene.start('MenuScene', { config: this.config });
  }

  update(time: number, delta: number): void {
    this.inputManager.updateControls();

    if (!MainEngine.isScriptActive()) {
      MainEngine.ProcessControls(this.inputManager);
    }

    MainEngine.updateEntities();
    MainEngine.handleCameraTracking();

    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    this.fpsDisplay.update();
  }

  destroy(): void {
    if (this.axeSwing) {
      this.axeSwing.destroy();
    }
    super.destroy();
  }
}