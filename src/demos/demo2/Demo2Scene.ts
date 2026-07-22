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
import { EntityDirection } from '../../domain/Entity';
import { ConfirmDialog } from '../../utils/ConfirmDialog';

export class Demo2Scene extends Phaser.Scene {
  private config!: GameConfig;
  private mainConfig!: GameConfig;
  private inputManager!: InputManager;
  private fpsDisplay!: FPSDisplay;
  private tiledMap: any = null;
  private confirmingExit: boolean = false;

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

  async init(data: { demoPath: string, config?: any }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
    this.mainConfig = data.config; // Store main config for returning to menu
  }

  async create() {
    try {
      const controlsConfig = new ControlsConfig();
      this.inputManager = new InputManager(this, controlsConfig);
      this.fpsDisplay = new FPSDisplay(this);

      // Demo2 uses b1 for tree cutting
      this.inputManager.setMobileButtons(['b1']);

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
      this.setupTreeCuttingMechanic();
    } finally {
      (window as any).hideLoading?.();
    }
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
    this.confirmingExit = true;
    ConfirmDialog.confirm(this, this.inputManager, 'Exit to main menu?').then(confirmed => {
      this.confirmingExit = false;
      if (confirmed) {
        MainEngine.cleanup();
        this.scene.start('MenuScene', { config: this.mainConfig || this.config });
      }
    });
  }

  update(_time: number, delta: number): void {
    if (this.confirmingExit) return;

    this.inputManager.updateControls();

    // Handle tree cutting with b1
    if (this.inputManager.justPressed('b1')) {
      this.cutTree();
    }

    // Back to menu
    if (this.inputManager.justPressed('menu')) {
      this.returnToMenu();
    }

    // Update engine - this handles player movement, zone detection and coordinate tracking
    MainEngine.updateEngine(this.inputManager);

    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    this.fpsDisplay.update();
  }

  /**
   * House1 teleportation event
   * Teleports player to coordinates (55, 84)
   */
   public static async house1(): Promise<void> {
    console.log("Demo2: house1 teleportation to (55, 84)");

    const player = MainEngine.getPlayer();
    const scene = MainEngine.getCurrentScene();
    if (!player) {
      console.error("Demo2: No player found for house1 teleportation");
      return;
    }
    if (!scene) {
      console.error("Demo2: No scene found for house1 teleportation");
      return;
    }

    try {
      MainEngine.setEntitiesPaused(true);

      // Fade Out → Teleport → Fade In using native Phaser camera methods
      scene.cameras.main.fadeOut(500, 0, 0, 0); // 500ms fade to black

      scene.cameras.main.once('camerafadeoutcomplete', () => {
        // Convert tile coordinates to pixel coordinates (multiply by 16)
        const pixelX = 55 * 16;
        const pixelY = 84 * 16;

        player.setxy(pixelX, pixelY);
        console.log(`Demo2: Player teleported to pixel coordinates (${pixelX}, ${pixelY})`);

        MainEngine.setupCamera();
        MainEngine.RenderEntities(); // Render entities at new position before fade-in

        // Fade back in
        scene.cameras.main.fadeIn(500, 0, 0, 0);

        scene.cameras.main.once('camerafadeincomplete', () => {
          MainEngine.setEntitiesPaused(false);
          console.log("Demo2: house1 teleportation complete");
        });
      });

    } catch (error) {
      console.error("Demo2: Error during house1 teleportation:", error);
      // Ensure entities are unpaused even if something goes wrong
      MainEngine.setEntitiesPaused(false);
    }
  }

  /**
   * House2 teleportation event
   * Teleports player to coordinates (72, 96)
   */
   public static async house2(): Promise<void> {
    console.log("Demo2: house2 teleportation to (72, 96)");

    const player = MainEngine.getPlayer();
    const scene = MainEngine.getCurrentScene();
    if (!player) {
      console.error("Demo2: No player found for house2 teleportation");
      return;
    }
    if (!scene) {
      console.error("Demo2: No scene found for house2 teleportation");
      return;
    }

    try {
      // Pause entities during teleport sequence
      MainEngine.setEntitiesPaused(true);

      // Fade Out → Teleport → Fade In using native Phaser camera methods
      scene.cameras.main.fadeOut(500, 0, 0, 0); // 500ms fade to black

      scene.cameras.main.once('camerafadeoutcomplete', () => {
        // Convert tile coordinates to pixel coordinates (multiply by 16)
        const pixelX = 72 * 16;
        const pixelY = 96 * 16;

        player.setxy(pixelX, pixelY);
        console.log(`Demo2: Player teleported to pixel coordinates (${pixelX}, ${pixelY})`);

        MainEngine.setupCamera();
        MainEngine.RenderEntities(); // Render entities at new position before fade-in

        // Fade back in
        scene.cameras.main.fadeIn(500, 0, 0, 0);

        scene.cameras.main.once('camerafadeincomplete', () => {
          MainEngine.setEntitiesPaused(false);
          console.log("Demo2: house2 teleportation complete");
        });
      });

    } catch (error) {
      console.error("Demo2: Error during house2 teleportation:", error);
      // Ensure entities are unpaused even if something goes wrong
      MainEngine.setEntitiesPaused(false);
    }
  }

  destroy(): void {
    if (this.axeSwing) {
      this.axeSwing.destroy();
    }
  }
}