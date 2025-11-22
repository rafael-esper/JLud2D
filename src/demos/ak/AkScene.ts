/**
 * Ak Scene - Alex Kidd Platformer Demo
 * Port of Java AK.java with side-scrolling platformer mechanics
 * Features: Physics-based movement, multiple player states, tile-based collision
 */

import { GameConfig } from '../../config/GameConfig';
import { FPSDisplay } from '../../utils/FPSDisplay';
import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { DemoUI } from '../../utils/DemoUI';
import { AkActions } from './AkActions';
import { AkMovement, Condition, Status, Action } from './AkMovement';
import { AkEnemies } from './AkEnemies';
import { AkCore } from './AkCore';
import { AkSprites } from './AkSprites';
import { CHR } from '../../domain/CHR';
import { Scene } from 'phaser';
import { AkBaseScene } from './AkBaseScene';
import { AK_MUSIC_MANIFEST } from './music-manifest';

export class AkScene extends AkBaseScene {
  private mapFilename: string = 'level01.map.json';
  private mapKey: string = 'level01-map';
  private levelInfo: any = null;
  private fpsDisplay: FPSDisplay;
  private tiledMap: any = null;
  private debugGraphics: Phaser.GameObjects.Graphics | null = null;
  private movement: AkMovement;

  // Slow motion logic variables
  private logicAccumulator = 0;
  private static readonly LOGIC_STEP = 16; // 16 ms per logic tick (~60 Hz)

  constructor() {
    super('AkScene');
  }

  preload() {
    // Level info should already be set in init(), but use fallback if needed
    if (!this.levelInfo) {
      console.warn('AkScene: Level info not set in init, using default level 1');
      // Default to level 1 if no level info
      this.mapFilename = 'level01.map.json';
      this.mapKey = 'level01-map';
    }

    console.log(`AkScene: Preloading ${this.mapFilename} with key ${this.mapKey}`);
    this.load.tilemapTiledJSON(this.mapKey, `src/demos/ak/${this.mapFilename}`);
    this.load.json('ak-anim', 'src/demos/ak/Ak.anim.json');

    // Load sprite images
    AkSprites.preloadSprites(this);

    // Load sound effects (matching Java snd array indices)
    this.load.audio('snd_mapa', 'src/demos/ak/res/sound/Mapa.mp3');     // snd[1] - Background music
    this.load.audio('snd_gold', 'src/demos/ak/res/sound/Gold.wav');     // snd[2] - Gold collection
    this.load.audio('snd_punch', 'src/demos/ak/res/sound/Punch.wav');   // snd[3] - Punch/attack
    this.load.audio('snd_rock', 'src/demos/ak/res/sound/Rock.wav');     // snd[4] - Rock breaking
    this.load.audio('snd_star', 'src/demos/ak/res/sound/Star.wav');     // snd[5] - Star effect
    this.load.audio('snd_death', 'src/demos/ak/res/sound/Death.wav');   // snd[6] - Death/damage
    this.load.audio('snd_hit', 'src/demos/ak/res/sound/Hit.wav');       // snd[7] - Hit effect
    this.load.audio('snd_brac', 'src/demos/ak/res/sound/Brac.wav');     // snd[8] - Bracelet
    this.load.audio('snd_item', 'src/demos/ak/res/sound/Item.wav');     // snd[9] - Item collection
    this.load.audio('snd_water', 'src/demos/ak/res/sound/Water.wav');   // snd[10] - Water/swimming

    DemoUI.createLoadingText(this, 'Loading Alex Kidd Demo...');
  }

  async init(data: { demoPath: string, config?: GameConfig, levelInfo?: any }) {
    MainEngine.setSystemPath(data.demoPath);

    // Store level info if passed
    if (data.levelInfo) {
      this.levelInfo = data.levelInfo;
      this.setMapFiles();
    }

    // If config is passed (from MapScene), use it. Otherwise initialize MainEngine
    if (data.config) {
      this.config = data.config;
    } else {
      const { config } = await MainEngine.initMainEngine();
      this.config = config;
    }

    console.log(`AkScene: Initialized with map ${this.mapFilename} and key ${this.mapKey}`);
  }

  private setMapFiles(): void {
    if (this.levelInfo) {
      this.mapFilename = this.levelInfo.mapFile;
      this.mapKey = this.levelInfo.mapFile.replace('.map.json', '-map');
      console.log(`AkScene: Set map files - ${this.mapFilename} with key ${this.mapKey} for ${this.levelInfo.name}`);
    }
  }

  async create() {
    // Setup common AK controls
    this.setupAkControls();
    this.fpsDisplay = new FPSDisplay(this);


    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize player
    this.tiledMap = await MainEngine.loadAndInitMap(this, this.mapFilename, 'src/demos/ak');
    await MainEngine.mapinit(this, 'Ak.anim.json', 'src/demos/ak');

    // Set player position from level data
    if (this.levelInfo && this.tiledMap) {
      const player = MainEngine.getPlayer();
      if (player) {
        // Convert tile coordinates to pixel coordinates
        const pixelX = this.levelInfo.playerX * this.tiledMap.getTileWidth();
        const pixelY = this.levelInfo.playerY * this.tiledMap.getTileHeight();
        player.setxy(pixelX, pixelY);
        console.log(`AkScene: Set player start position to (${this.levelInfo.playerX}, ${this.levelInfo.playerY}) = (${pixelX}, ${pixelY}) pixels`);
      }
    } else {
      console.error('AkScene: Cannot set player position - missing levelInfo or tiledMap');
    }

    // Load monster CHR sprites
    await this.loadMonsterSprites();

    // Set camera to follow player
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();

    // Create debug graphics for player rectangle
    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(1000); // High depth to render on top

    // Initialize AkActions sound system
    //FIXME AkActions.initSounds(this);

    // Initialize sprite system
    AkSprites.init(this);


    // Initialize movement system
    this.movement = new AkMovement(this.tiledMap, this.inputManager);

    // Set condition from level data (WALK or SWIM)
    const startCondition = this.levelInfo ? this.levelInfo.condition : Condition.WALK;
    this.movement.setNormalCondition(startCondition);
    console.log(`AkScene: Set start condition to ${startCondition === Condition.WALK ? 'WALK' : 'SWIM'}`);

    this.fpsDisplay.setVisible(this.config.showFPS);
  }

   update(time: number, delta: number): void {
    // Get current game speed from movement system and accumulate time
    const currentGameSpeed = this.movement ? this.movement.getGameSpeed() : 1.0;
    this.logicAccumulator += delta * currentGameSpeed;

    // Only update game logic every LOGIC_STEP ms of "slow time"
    while (this.logicAccumulator >= AkScene.LOGIC_STEP) {
      this.logicAccumulator -= AkScene.LOGIC_STEP;

      // START GAME LOGIC
      this.inputManager.updateControls();
      if (this.movement) {
        this.movement.processControls();
        this.movement.update();
      }
      AkCore.updatePlayerFrame();
      AkEnemies.processEnemies();
      AkSprites.processSprites();
      AkActions.updateDeathSequence(); // Handle death animation
      // END GAME LOGIC
    }

    // Always update tile animations at normal speed
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Always render at normal speed
    const playerFrame = this.movement ? AkCore.showPlayer() : 0;

    // Update player sprite frame (Phaser equivalent of screen.render/showpage)
    const player = MainEngine.getPlayer();
    if (player && player.getChr()) {
      // Flicker when invincible
      const finalFrame = (AkCore.getInvincible() > 0 && AkCore.getInvincible() % 2 === 0) ? 44 : playerFrame;
      player.setSpecframe(finalFrame);
      player.draw();
    }

    // Draw all entities
    const entities = MainEngine.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity && entity !== player && entity.getChr() && entity.isActive()) {
        entity.draw();
      }
    }

    // Debug: Draw blue rectangle around player
    if (this.debugGraphics) {
      this.debugGraphics.clear(); // Always clear first

      if (AkCore.getDebug() && player) {
        // Draw simple rectangle around player sprite using AkCore collision box
        const collisionBox = AkCore.getPlayerCollisionBox();
        this.debugGraphics.lineStyle(2, 0x0000ff, 1); // Blue outline
        this.debugGraphics.strokeRect(collisionBox.px, collisionBox.py, collisionBox.vx, collisionBox.vy);
      }
    }

    // Draw energy display (equivalent to Java energy display code)
    this.drawEnergyDisplay();

    MainEngine.handleCameraTracking();
    this.fpsDisplay.update();

    // Handle common input (includes menu/ESC handling)
    if (this.inputManager.justPressed('menu')) {
      this.backToMainMenu();
    }
  }

  /**
   * Load monster CHR sprites and assign to entities
   */
  private async loadMonsterSprites(): Promise<void> {
    try {
      // Load monster CHR (56 frames, 32x32 each, 7 columns, 1 row per frame)
      const monsterChr = await CHR.loadChrFromImage(this, 'src/demos/ak/monster.png', 56, 32, 32, 7, 1);

      // Load big monster CHR (6 frames, 48x64 each, 6 columns, 1 row per frame)
      const bigChr = await CHR.loadChrFromImage(this, 'src/demos/ak/Big.png', 6, 48, 64, 6, 1);

      // Assign CHR to entities based on chrname (skip the player)
      const entities = MainEngine.getEntities();
      const playerIndex = MainEngine.getPlayerIndex();

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];

        // Skip the player entity - Alex should keep his original CHR
        if (i === playerIndex || !entity || !entity.getChrname()) {
          continue;
        }

        // Only assign monster CHR to entities with .chr files (enemies)
        const chrname = entity.getChrname();
        if (chrname.includes('monster') || chrname.endsWith('.chr')) {
          if (chrname.includes('monster')) {
            entity.setChr(monsterChr);
          } else if (chrname.includes('Big') || chrname.includes('big')) {
            entity.setChr(bigChr);
          } else {
            // Default to monster CHR for other .chr files
            entity.setChr(monsterChr);
          }
        }
      }

      console.log('AkScene: Monster sprites loaded successfully');

    } catch (error) {
      console.error('AkScene: Error loading monster sprites:', error);
    }
  }

  /**
   * Draw energy display using MainEngine rect/rectfill methods
   * Port of Java energy display code:
   * for (int i = 0; i < Energy; i++) {
   *   screen.rectfill(316 - (i * 12), 4, 307 - (i * 12), 9, new Color(0, 0, 0));
   *   screen.rectfill(315 - (i * 12), 5, 308 - (i * 12), 8, new Color(30, 250, 50));
   *   screen.rect(316 - (i * 12), 4, 307 - (i * 12), 9, new Color(50, 250, 50));
   * }
   */
  private drawEnergyDisplay(): void {
    // Clear previous UI elements
    ScriptEngine.clearUIGraphics();
    ScriptEngine.clearUITexts();

    const energy = AkCore.getEnergy();
    const gold = AkCore.getGold();

    // Draw energy bars
    for (let i = 0; i < energy; i++) {
      const x1 = 316 - (i * 12);
      const y1 = 4;
      const x2 = 307 - (i * 12);
      const y2 = 9;

      // Black background
      ScriptEngine.rectfill(x1, y1, x2, y2, {r: 0, g: 0, b: 0});

      // Green fill (bright green)
      ScriptEngine.rectfill(x1 - 1, y1 + 1, x2 + 1, y2 - 1, {r: 30, g: 250, b: 50});

      // Green border (lighter green)
      ScriptEngine.rect(x1, y1, x2, y2, {r: 50, g: 250, b: 50});
    }

    // Display gold amount
    ScriptEngine.printString(10, 4, null, `Gold: $${gold}`, {r: 255, g: 255, b: 0});
  }

  destroy() {
    // Stop music when scene is destroyed
    ScriptEngine.stopmusic();
    super.destroy();
  }
}