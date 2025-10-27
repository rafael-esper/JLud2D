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
import { AkMovement, Condition, Status, Action } from './AkMovement';
import { AkEnemies } from './AkEnemies';
import { CHR } from '../../domain/CHR';

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

  async init(data: { demoPath: string }) {
    MainEngine.setSystemPath(data.demoPath);
    const { config } = await MainEngine.initMainEngine();
    this.config = config;
  }

  async create() {
    this.inputManager = new InputManager(this, new ControlsConfig());
    this.fpsDisplay = new FPSDisplay(this);

    this.game.loop.targetFps = 60;

    MainEngine.setCurrentScene(this, this.config);

    // Load map and initialize player
    this.tiledMap = await MainEngine.loadAndInitMap(this, 'level01.map.json', 'src/demos/ak');
    await MainEngine.mapinit(this, 'Ak.anim.json', 'src/demos/ak');

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

    // Initialize movement system
    this.movement = new AkMovement(this.tiledMap, this.inputManager);

    // Set normal condition when starting the scene
    this.movement.setNormalCondition(Condition.WALK);

    this.fpsDisplay.setVisible(this.config.showFPS);
  }
   wait = 0;
   update(delta: number): void {
    this.inputManager.updateControls();
    this.fpsDisplay.update();

    if(this.wait++ > 0) {
      this.wait = 0;
    } else {
      //return;
    }
    
    // Update tile animations
    if (this.tiledMap) {
      this.tiledMap.updateAnimations(delta);
    }

    // Safety check: ensure movement system is initialized
    if (this.movement) {
      this.movement.processControls();
      this.movement.update();
    }

    // Process enemies
    AkEnemies.processEnemies();

    const playerFrame = this.movement ? this.showPlayer() : 0;

    // Update player sprite frame (Phaser equivalent of screen.render/showpage)
    const player = MainEngine.getPlayer();
    if (player && player.getChr()) {
      player.setSpecframe(playerFrame);
      player.draw();
    }

    // Draw all entities
    const entities = MainEngine.getEntities();
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      if (entity && entity !== player && entity.getChr()) {
        entity.draw();
      }
    }

    // Debug: Draw blue rectangle around player
    if (this.debugGraphics) {
      this.debugGraphics.clear(); // Always clear first

      if (AkMovement.getDebug() && player) {
        // Draw simple rectangle around player sprite (32x32 frame size from Ak.anim.json)
        const rectX = this.akidd_px;
        const rectY = this.akidd_py;
        const rectWidth = this.akidd_vx;  // Frame width from Ak.anim.json
        const rectHeight = this.akidd_vy; // Frame height from Ak.anim.json
        this.debugGraphics.lineStyle(2, 0x0000ff, 1); // Blue outline
        this.debugGraphics.strokeRect(rectX, rectY, rectWidth, rectHeight);
      }
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

    if (this.movement.getCondition() == Condition.HELI) {
      this.setDimensions(player.getx() + 6, player.gety() + 4, 20, 26);
      return 31 + ((1 - player.getFace()) * 4) + Math.floor(this.playerframe / 3);
    }

    if (this.movement.getCondition() == Condition.SURF) {
      return 27 + ((1 - player.getFace()) * 2) + Math.floor(this.playerframe / 3);
    }

    if (this.movement.getCondition() == Condition.MOTO) {
      if (this.movement.getState() == Status.STOPPED || this.movement.getState() == Status.WALKING) {
        this.setDimensions(player.getx() + 9, player.gety() + 7, 14, 20);
        return 21 + ((1 - player.getFace()) * 3) + Math.floor(this.playerframe / 3);
      } else {
        this.setDimensions(player.getx() + 9, player.gety() + 5, 14, 26);
        return 23 + ((1 - player.getFace()) * 3);
      }
    }

    if (this.movement.getAction() == Action.PUNCHING) { // punching
      if (this.movement.getCondition() == Condition.SWIM) {
        this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
        return 17 - (player.getFace() * 3); // swimming
      } else {
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 5 - player.getFace(); // walking
      }
    }

    return 0;
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
            console.log(`AkScene: Assigned monster CHR to entity ${i} (${chrname})`);
          } else if (chrname.includes('Big') || chrname.includes('big')) {
            entity.setChr(bigChr);
            console.log(`AkScene: Assigned big CHR to entity ${i} (${chrname})`);
          } else {
            // Default to monster CHR for other .chr files
            entity.setChr(monsterChr);
            console.log(`AkScene: Assigned default monster CHR to entity ${i} (${chrname})`);
          }
        }
      }

      console.log('AkScene: Monster sprites loaded successfully');

      // Debug: Log all entities and their properties
      console.log('=== Entity Debug Info ===');
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity) {
          console.log(`Entity ${i}:`, {
            chrname: entity.getChrname(),
            position: `(${entity.getx()}, ${entity.gety()})`,
            speed: entity.getSpeed(),
            face: entity.getFace(),
            isPlayer: i === playerIndex
          });
        }
      }
    } catch (error) {
      console.error('AkScene: Error loading monster sprites:', error);
    }
  }

}