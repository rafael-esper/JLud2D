/**
 * PSDungeon - Phantasy Star Dungeon System
 * Proper implementation with full screen image plotting and Java input logic
 */

import { MainEngine } from '../../core/MainEngine';
import { ScriptEngine } from '../../core/ScriptEngine';
import { PSGame } from './PSGame';
import { PSMenu } from './PSMenu';
import { PSSceneType, SpecialEntity } from './PSMenu';
import { Dungeon, DungeonHelper, DungeonTypeHelper } from './game/Dungeon';
import { OriginalItem } from './game/PSLibItem';
import { EntityDirection } from '../../domain/Entity';
import { Entity } from '../../domain/Entity';
import { InputManager } from '../../config/Controls';

// Tile constants
const WALL = 0;
const FLOOR = 1;
const STAIRS_UP = 2;
const STAIRS_DOWN = 3;
const OPEN_DOOR = 4;
const DOOR = 5;
const LOCKED_DOOR = 6;
const MAGIC_DOOR = 7;
const OPEN_MAGIC_DOOR = 8;
const ROOM = 10;

export class PSDungeon {
  // Core state
  private isDark: boolean = true;
  private showDungeon: boolean = true;
  private walkingBack: boolean = false;
  private alreadyInside: boolean = false;
  private zoneCheck: boolean = true;
  private isAnimating: boolean = false;

  // Input manager
  private inputManager: InputManager | null = null;

  // Rendering system
  private currentScene: any = null;
  private dungeonRenderTexture: Phaser.GameObjects.RenderTexture | null = null;
  private backBuffer: Phaser.GameObjects.Graphics | null = null;
  private hiddenTilemapLayers: any[] = [];
  private backColor: number = 0x000080;
  private TOTAL_XSIZE: number = 320;
  private TOTAL_YSIZE: number = 240;


  // Dungeon images - following Java structure
  private dungeonPath: string = '';
  private preloadedImages: Map<string, Phaser.GameObjects.Image> = new Map();

  // Core dungeon images (Java equivalent)
  private img_dungeon_door!: Phaser.GameObjects.Image;
  private img_dungeon_ldoor!: Phaser.GameObjects.Image;
  private img_dungeon_doorAnim!: Phaser.GameObjects.Image;
  private img_dungeon_odoor!: Phaser.GameObjects.Image;
  private img_dungeon_mdoor!: Phaser.GameObjects.Image;
  private img_dungeon_mdoorAnim!: Phaser.GameObjects.Image;
  private img_dungeon_modoor!: Phaser.GameObjects.Image;

  private img_dungeon_wall1!: Phaser.GameObjects.Image;
  private img_dungeon_wall2!: Phaser.GameObjects.Image;
  private img_dungeon_room!: Phaser.GameObjects.Image;
  private img_dungeon_stup!: Phaser.GameObjects.Image;
  private img_dungeon_stdn!: Phaser.GameObjects.Image;

  // Image arrays
  private img_dungeon_back: Phaser.GameObjects.Image[] = [];
  private img_dungeon_curve: Phaser.GameObjects.Image[] = [];
  private img_dungeon_corner: Phaser.GameObjects.Image[] = [];
  private img_dungeon_curl: Phaser.GameObjects.Image[] = [];

  // Flipped image cache - stores horizontally flipped versions of all images
  private flippedImageCache: Map<Phaser.GameObjects.Image, Phaser.GameObjects.Image> = new Map();
  private img_dungeon_walla: Phaser.GameObjects.Image[] = [];
  private img_dungeon_wallb: Phaser.GameObjects.Image[] = [];
  private img_dungeon_wallc: Phaser.GameObjects.Image[] = [];
  private img_dungeon_enca: Phaser.GameObjects.Image[] = [];
  private img_dungeon_encb: Phaser.GameObjects.Image[] = [];
  private img_dungeon_encc: Phaser.GameObjects.Image[] = [];
  private img_dungeon_enda: Phaser.GameObjects.Image[] = [];
  private img_dungeon_endb: Phaser.GameObjects.Image[] = [];
  private img_dungeon_endc: Phaser.GameObjects.Image[] = [];
  private img_dungeon_doora: Phaser.GameObjects.Image[] = [];
  private img_dungeon_doorb: Phaser.GameObjects.Image[] = [];
  private img_dungeon_doorc: Phaser.GameObjects.Image[] = [];
  private img_dungeon_lena: Phaser.GameObjects.Image[] = [];
  private img_dungeon_lenb: Phaser.GameObjects.Image[] = [];
  private img_dungeon_lenc: Phaser.GameObjects.Image[] = [];

  public async startDungeon(): Promise<void> {
    const currentDungeon = PSGame.getCurrentDungeon();
    if (!currentDungeon) {
      console.error("PSDungeon: No current dungeon set");
      return;
    }

    this.currentScene = MainEngine.getCurrentScene();

    // Get input manager from current scene
    this.inputManager = (this.currentScene as any).inputManager;
    if (!this.inputManager) {
      console.error("PSDungeon: No input manager found in current scene");
      return;
    }

    // Initialize dungeon images
    const dungeonType = DungeonHelper.getType(currentDungeon);
    if (dungeonType) {
      this.dungeonPath = DungeonTypeHelper.getImagePath(dungeonType);
      await this.preloadDungeonImages();
    }

    // Spawn player
    const spawnX = PSGame.getgotox();
    const spawnY = PSGame.getgotoy();
    const dungeonDir = DungeonHelper.getDir(currentDungeon);

    await PSGame.getParty().allocate(spawnX, spawnY);
    const player = MainEngine.getPlayer();
    player?.setFace(dungeonDir);

    // Set up camera and fade
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();
    await ScriptEngine.fadein(5, false);

    // Check dark dungeon
    if (this.getAlreadyInside()) {
      player?.setFace(PSGame.getDungeonFace());
      this.isDark = false;
    } else {
      const hasLightPendant = PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Inventory_Light_Pendant));
      this.isDark = DungeonHelper.isDark(currentDungeon) && !hasLightPendant;

      if (this.isDark) {
        await PSMenu.startScene(PSSceneType.BLACK, SpecialEntity.NONE);
        await PSMenu.Stext(PSGame.getString("Dungeon_Black"));
        PSGame.menuOn();
        await PSMenu.endScene();
      }
    }

    // Prevent MainEngine from processing input AFTER fade (ScriptEngine.fadein resets this)
    MainEngine.setScriptActive(true);

    // Start main loop
    await this.dungeonMainLoop(player);
  }

  /**
   * Main dungeon loop - Java translation
   */
  private async dungeonMainLoop(player: Entity | null): Promise<void> {
    // Initialize rendering system
    this.initBackBuffer();
    this.hideTilemapLayers();

    const initialMap = MainEngine.getCurrentMap();
    let die = false;

    if (!player || !initialMap) {
      console.error("PSDungeon: No player or map");
      return;
    }
    const currentMap = MainEngine.getCurrentMap();
    // Java main loop (lines 146-262)
    while (!die) {

      MainEngine.setEntitiesPaused(true);

      // Update input state
      if (this.inputManager) {
        this.inputManager.updateControls();
      }

      // Zone checking
      if (this.zoneCheck) {
        this.zoneCheck = false;
        this.callZone(player, 1);
        this.callZone(player, 0);

        if (this.getfronttile(player, 1) === FLOOR) {
          this.enemyBattle();
        }
      }

      // Dungeon Controls - dark dungeon exit
      if (this.isDark && (this.inputManager!.up || this.inputManager!.left || this.inputManager!.right || this.inputManager!.down)) {
        const zone = this.getfrontzone(player, -1);
        const scriptName = currentMap.getScriptZone(zone);
        if (scriptName) {
          MainEngine.callScriptFunction(scriptName);
        }
        die = true;
      }

      // First entry
      if (!this.isDark && !this.getAlreadyInside()) {
        this.setAlreadyInside(true);
      }

      // B2 toggle (K or X key)
      if (this.inputManager!.b2) {
        this.showDungeon = !this.showDungeon;
      }

      // B1 action
      if (this.inputManager!.b1) {
        this.handleOpenAction(player);
      }

      // Turn left/right (use justPressed to prevent continuous turning)
      if (this.inputManager!.left || this.inputManager!.right) {
        await this.turnRoutine(player, this.inputManager!.right); // right = counter-clockwise = true (inverted from expected)
        this.zoneCheck = true;
      }

      // UP movement (forward) - use justPressed to prevent continuous movement
      if (this.inputManager!.up) {
        const tile = this.getfronttile(player, 1);

        // Java logic: animate first if FLOOR and showDungeon
        if (this.showDungeon && tile === FLOOR) {
          // Forward animation (0 to 5)
          for (let i = 0; i <= 5; i++) {
            this.drawDungeon(player, i);
            this.drawImageToScreen();
            await this.delayScreen();
          }
        }

        // Always do the movement (Java doesn't validate before walkup)
        await this.walkup(player, 1);
        this.walkingBack = false;

        // Handle stairs AFTER movement
        switch (tile) {
          case STAIRS_DOWN:
            PSGame.gameData.dungeonFloor--;
            this.callZone(player, 0);
            break;
          case STAIRS_UP:
            PSGame.gameData.dungeonFloor++;
            this.callZone(player, 0);
            break;
        }
        this.zoneCheck = true;
      }

      // DOWN movement (backward) - use justPressed to prevent continuous movement
      if (this.inputManager!.down) {
        let tile = this.getfronttile(player, -1);

        if (tile === FLOOR) {
          await this.walkup(player, -1);
        } else if (tile === WALL && this.getlefttile(player, 0) === FLOOR) {
          this.turnRoutine(player, true);
          tile = FLOOR;
          await this.walkup(player, -1);
        } else if (tile === WALL && this.getrighttile(player, 0) === FLOOR) {
          this.turnRoutine(player, false);
          tile = FLOOR;
          await this.walkup(player, -1);
        } else {
          await this.delayScreen();
          // Don't return here - Java continues to set walkingBack = true
        }

        // Always set walkingBack = true (Java logic)
        this.walkingBack = true;

        if (this.showDungeon && tile === FLOOR) {
          // Backward animation (5 to 0)
          for (let i = 5; i >= 0; i--) {
            this.drawDungeon(player, i);
            this.drawImageToScreen();
            await this.delayScreen();
          }
        }
        this.zoneCheck = true;
      }

      // Render based on current mode (skip if animating)
      if (!this.isAnimating) {
        if (this.showDungeon) {
          if (!this.isDark) {
            this.drawDungeon(player, 0);
            this.drawImageToScreen();
          } else {
            this.paintBlack();
          }
          this.hideTilemapLayers();
        } else {
          // Show map view
          this.showTilemapLayers();
          // Hide dungeon graphics when showing tilemap
          if (this.dungeonRenderTexture) {
            this.dungeonRenderTexture.setVisible(false);
          }
        }
      }

      // Frame delay
      await this.delay(50);

      // ESC to exit
      if (this.inputManager!.justPressed('b3')) {
        die = true;
      }
    }

    // Cleanup
    this.restoreTilemapLayers();
    this.cleanupFlippedImages();
    MainEngine.setEntitiesPaused(false);

    // Re-enable MainEngine input processing
    MainEngine.setScriptActive(false);
  }



  /**
   * Draw dungeon - Java drawDungeon equivalent with pos parameter
   */
  private drawDungeon(entity: Entity, pos: number): void {
    if (!entity || !this.dungeonRenderTexture) {
      return;
    }

    // Clear render texture with background color
    this.dungeonRenderTexture.clear();
    this.dungeonRenderTexture.fill(this.backColor);

    // JUST IN FRONT (Java switch statement)
    switch (this.getfronttile(entity, 1)) {
      case WALL:
        this.putwallimage(this.img_dungeon_wall2);
        break;
      case DOOR:
        this.putwallimage(this.img_dungeon_door);
        break;
      case OPEN_DOOR:
        this.putwallimage(this.img_dungeon_odoor);
        break;
      case STAIRS_UP:
        this.putwallimage(this.img_dungeon_stup);
        break;
      case STAIRS_DOWN:
        this.putwallimage(this.img_dungeon_stdn);
        break;
      case MAGIC_DOOR:
        this.putwallimage(this.img_dungeon_mdoor);
        break;
      case OPEN_MAGIC_DOOR:
        this.putwallimage(this.img_dungeon_modoor);
        break;
      case LOCKED_DOOR:
        this.putwallimage(this.img_dungeon_ldoor);
        break;
      case FLOOR:
        // Finds floor front depth to nearest wall
        let depth = 0;
        while (depth < 5 && this.getfronttile(entity, 2 + depth++) === FLOOR);

        for (let flipped = 0; flipped <= 1; flipped++) { // one time for each side

          if (depth === 1) {
            let offset = pos < 3 ? this.putimage(this.img_dungeon_wallc[pos], 0, flipped) : 0;
            if (this.getfronttile(entity, 2) === WALL) {
              this.putimage(this.getsidetile(entity, 1, flipped) === FLOOR ? this.img_dungeon_encc[pos] : this.img_dungeon_endc[pos], offset, flipped);
            } else {
              // TODO: For the future: scaled images of doors/stairs
              this.putimage(this.img_dungeon_doorc[pos], offset, flipped);
            }
          } else if (depth === 2) {
            let offset = 0;
            if (this.getsidetile(entity, 1, flipped) === FLOOR) {
              offset = pos < 3 ? this.putimage(this.img_dungeon_wallc[pos], 0, flipped) : 0;
              offset = this.putimage(this.img_dungeon_lenc[pos], offset, flipped);
            } else {
              offset = this.putimage(this.img_dungeon_wallb[pos], 0, flipped);
            }
            if (this.getsidetile(entity, 2, flipped) === FLOOR) {
              this.putimage(this.img_dungeon_encb[pos], offset, flipped);
            } else {
              this.putimage(this.getfronttile(entity, 3) === WALL ? this.img_dungeon_endb[pos] : this.img_dungeon_doorb[pos], offset, flipped);
            }
          } else {
            // depth > 2
            let offset = 0;
            if (this.getsidetile(entity, 1, flipped) === FLOOR) {
              offset = this.putimage(this.img_dungeon_walla[pos], 0, flipped);
              this.putimage(this.img_dungeon_lenc[pos], pos < 3 ? this.putimage(this.img_dungeon_wallc[pos], 0, flipped) : 0, flipped);
            } else if (this.getsidetile(entity, 2, flipped) === FLOOR) {
              offset = this.putimage(this.img_dungeon_wallb[pos], 0, flipped);
              offset = this.putimage(this.img_dungeon_lenb[pos], offset, flipped);
            } else {
              offset = this.putimage(this.img_dungeon_walla[pos], 0, flipped);
            }

            if (depth === 3) {
              if (this.getsidetile(entity, 3, flipped) === FLOOR) {
                this.putimage(this.img_dungeon_enca[pos], offset, flipped);
              } else {
                this.putimage(this.getfronttile(entity, 4) === WALL ? this.img_dungeon_enda[pos] : this.img_dungeon_doora[pos], offset, flipped);
              }
            } else {
              // depth > 3
              if (this.getsidetile(entity, 3, flipped) === FLOOR) {
                this.putimage(this.img_dungeon_lena[pos], offset, flipped);
              } else {
                this.putimage(this.img_dungeon_back[pos], offset, flipped);
              }
            }
          }
        }
        break;
    }
  }


  /**
   * Put wall image - Java putwallimage equivalent
   */
  private putwallimage(img: Phaser.GameObjects.Image): void {
    let offset = this.putimage(this.img_dungeon_wall1, 0, 0);
    offset = this.putimage(img, offset, 0);
    this.putimage(img, this.img_dungeon_wall1.displayWidth, 1);
    this.putimage(this.img_dungeon_wall1, 0, 1);
  }

  /**
   * Put image to render texture - Java putimage equivalent
   */
  private putimage(img: Phaser.GameObjects.Image, offset: number, flipped: number): number {
    if (!img || !this.dungeonRenderTexture) {
      return offset + 64; // Default width
    }

    const imageWidth = img.displayWidth;

    if (flipped === 0) {
      // Normal blit (Java: backDungeon.blit(offset, 0, img))
      this.dungeonRenderTexture.draw(img, offset, 0);
    } else {
      // Use cached flipped image
      let flippedImg = this.flippedImageCache.get(img);

      if (!flippedImg) {
        // Create and cache the flipped image if it doesn't exist
        flippedImg = this.createFlippedImage(img);
        this.flippedImageCache.set(img, flippedImg);
      }

      // Flipped blit (Java: backDungeon.flipBlit(TOTAL_XSIZE - offset - img.width, 0, FlipType.FLIP_HORIZONTALLY, img))
      const flippedX = this.TOTAL_XSIZE - offset - imageWidth;
      this.dungeonRenderTexture.draw(flippedImg, flippedX, 0);
    }

    return offset + imageWidth;
  }

  /**
   * Create a flipped version of an image
   */
  private createFlippedImage(originalImg: Phaser.GameObjects.Image): Phaser.GameObjects.Image {
    const scene = originalImg.scene;
    const flippedImg = scene.add.image(-1000, -1000, originalImg.texture.key, originalImg.frame.name);
    flippedImg.setOrigin(0, 0);
    flippedImg.setScale(originalImg.scaleX, originalImg.scaleY);
    flippedImg.setFlipX(true);
    flippedImg.setVisible(false);

    return flippedImg;
  }

  private getsidetile(entity: Entity, distance: number, flipped: number): number {
    if (flipped === 1) {
      return this.getrighttile(entity, distance);
    }
    return this.getlefttile(entity, distance);
  }

  /**
   * Initialize back buffer system
   */
  private initBackBuffer(): void {
    if (!this.currentScene) return;

    this.backBuffer = this.currentScene.add.graphics();
    this.backBuffer.setDepth(2000);
    this.backBuffer.setScrollFactor(0);

    this.dungeonRenderTexture = this.currentScene.add.renderTexture(0, 0, this.TOTAL_XSIZE, this.TOTAL_YSIZE);
    this.dungeonRenderTexture.setDepth(5000); // Very high depth to ensure visibility above everything
    this.dungeonRenderTexture.setScrollFactor(0);
    this.dungeonRenderTexture.setOrigin(0, 0); // Important: set origin to top-left

  }

  /**
   * Draw image to screen - Java equivalent
   */
  private drawImageToScreen(): void {
    if (!this.backBuffer || !this.dungeonRenderTexture) {
      return;
    }

    if (this.showDungeon) {
      // Clear back buffer with dungeon background
      this.backBuffer.clear();
      this.backBuffer.fillStyle(this.backColor, 1);
      this.backBuffer.fillRect(0, 0, 320, 240);

      // Show dungeon view - make sure it's positioned correctly and visible
      this.dungeonRenderTexture.setPosition(0, 0);
      this.dungeonRenderTexture.setVisible(true);
      this.dungeonRenderTexture.setDepth(5000); // Very high depth to ensure visibility

    } else {
      // Hide dungeon graphics for map view
      this.dungeonRenderTexture.setVisible(false);
      this.backBuffer.clear();
    }
  }

  private paintBlack(): void {
    if (this.backBuffer) {
      this.backBuffer.clear();
      this.backBuffer.fillStyle(0x000000, 1);
      this.backBuffer.fillRect(0, 0, 320, 240);
    }
  }

  /**
   * Initialize dungeon images - Java initDungeonImages equivalent
   */
  private async preloadDungeonImages(): Promise<void> {
    const scene = PSGame.getCurrentScene();
    if (!scene) return;

    // Complete list of all 121 images (Java equivalent)
    const imageNames = [
      // 7 door types
      'DOOR1.PNG', 'DOOR2.PNG', 'DOOR3.PNG', 'DOOR4.PNG', 'DOOR5.PNG', 'DOOR6.PNG', 'DOOR7.PNG',

      // Walls and special
      'WALL1.PNG', 'WALL2.PNG', 'ROOM.PNG', 'STAIRSUP.PNG', 'STAIRSDN.PNG',

      // Curves (4)
      'CURVE1.PNG', 'CURVE2.PNG', 'CURVE3.PNG', 'CURVE4.PNG',

      // Corners (4)
      'CORNER1.PNG', 'CORNER2.PNG', 'CORNER3.PNG', 'CORNER4.PNG',

      // Curls (7)
      'CURL1.PNG', 'CURL2.PNG', 'CURL3.PNG', 'CURL4.PNG', 'CURL5.PNG', 'CURL6.PNG', 'CURL7.PNG',

      // Arrays of 6
      'BACK1.PNG', 'BACK2.PNG', 'BACK3.PNG', 'BACK4.PNG', 'BACK5.PNG', 'BACK6.PNG',
      'WALLA1.PNG', 'WALLA2.PNG', 'WALLA3.PNG', 'WALLA4.PNG', 'WALLA5.PNG', 'WALLA6.PNG',
      'WALLB1.PNG', 'WALLB2.PNG', 'WALLB3.PNG', 'WALLB4.PNG', 'WALLB5.PNG', 'WALLB6.PNG',
      'ENCA1.PNG', 'ENCA2.PNG', 'ENCA3.PNG', 'ENCA4.PNG', 'ENCA5.PNG', 'ENCA6.PNG',
      'ENCB1.PNG', 'ENCB2.PNG', 'ENCB3.PNG', 'ENCB4.PNG', 'ENCB5.PNG', 'ENCB6.PNG',
      'ENCC1.PNG', 'ENCC2.PNG', 'ENCC3.PNG', 'ENCC4.PNG', 'ENCC5.PNG', 'ENCC6.PNG',
      'ENDA1.PNG', 'ENDA2.PNG', 'ENDA3.PNG', 'ENDA4.PNG', 'ENDA5.PNG', 'ENDA6.PNG',
      'ENDB1.PNG', 'ENDB2.PNG', 'ENDB3.PNG', 'ENDB4.PNG', 'ENDB5.PNG', 'ENDB6.PNG',
      'ENDC1.PNG', 'ENDC2.PNG', 'ENDC3.PNG', 'ENDC4.PNG', 'ENDC5.PNG', 'ENDC6.PNG',
      'DOORA1.PNG', 'DOORA2.PNG', 'DOORA3.PNG', 'DOORA4.PNG', 'DOORA5.PNG', 'DOORA6.PNG',
      'DOORB1.PNG', 'DOORB2.PNG', 'DOORB3.PNG', 'DOORB4.PNG', 'DOORB5.PNG', 'DOORB6.PNG',
      'DOORC1.PNG', 'DOORC2.PNG', 'DOORC3.PNG', 'DOORC4.PNG', 'DOORC5.PNG', 'DOORC6.PNG',
      'LENA1.PNG', 'LENA2.PNG', 'LENA3.PNG', 'LENA4.PNG', 'LENA5.PNG', 'LENA6.PNG',
      'LENB1.PNG', 'LENB2.PNG', 'LENB3.PNG', 'LENB4.PNG', 'LENB5.PNG', 'LENB6.PNG',
      'LENC1.PNG', 'LENC2.PNG', 'LENC3.PNG', 'LENC4.PNG', 'LENC5.PNG', 'LENC6.PNG',

      // WALLC (3)
      'WALLC1.PNG', 'WALLC2.PNG', 'WALLC3.PNG'
    ];

    // Check which images need to be loaded
    const imagesToLoad: string[] = [];
    for (const imageName of imageNames) {
      const imagePath = `${this.dungeonPath}${imageName}`;
      const imageKey = imagePath.replace(/[^\w]/g, '_');

      if (!(scene as any).textures.exists(imageKey)) {
        (scene as any).load.image(imageKey, imagePath);
        imagesToLoad.push(imageName);
      }
    }

    return new Promise((resolve) => {
      const createImageObjects = () => {
        // Create individual image objects (Java equivalent assignments)
        this.img_dungeon_door = this.createImageObject('DOOR1.PNG');
        this.img_dungeon_ldoor = this.createImageObject('DOOR2.PNG');
        this.img_dungeon_doorAnim = this.createImageObject('DOOR3.PNG');
        this.img_dungeon_odoor = this.createImageObject('DOOR4.PNG');
        this.img_dungeon_mdoor = this.createImageObject('DOOR5.PNG');
        this.img_dungeon_mdoorAnim = this.createImageObject('DOOR6.PNG');
        this.img_dungeon_modoor = this.createImageObject('DOOR7.PNG');

        this.img_dungeon_wall1 = this.createImageObject('WALL1.PNG');
        this.img_dungeon_wall2 = this.createImageObject('WALL2.PNG');
        this.img_dungeon_room = this.createImageObject('ROOM.PNG');
        this.img_dungeon_stup = this.createImageObject('STAIRSUP.PNG');
        this.img_dungeon_stdn = this.createImageObject('STAIRSDN.PNG');

        // Create arrays (Java equivalent loops)
        for (let i = 0; i < 4; i++) {
          this.img_dungeon_curve[i] = this.createImageObject(`CURVE${i + 1}.PNG`);
          this.img_dungeon_corner[i] = this.createImageObject(`CORNER${i + 1}.PNG`);
        }

        for (let i = 0; i < 7; i++) {
          this.img_dungeon_curl[i] = this.createImageObject(`CURL${i + 1}.PNG`);
        }

        for (let i = 0; i < 6; i++) {
          this.img_dungeon_back[i] = this.createImageObject(`BACK${i + 1}.PNG`);
          this.img_dungeon_walla[i] = this.createImageObject(`WALLA${i + 1}.PNG`);
          this.img_dungeon_wallb[i] = this.createImageObject(`WALLB${i + 1}.PNG`);

          if (i < 3) {
            this.img_dungeon_wallc[i] = this.createImageObject(`WALLC${i + 1}.PNG`);
          }

          this.img_dungeon_enca[i] = this.createImageObject(`ENCA${i + 1}.PNG`);
          this.img_dungeon_encb[i] = this.createImageObject(`ENCB${i + 1}.PNG`);
          this.img_dungeon_encc[i] = this.createImageObject(`ENCC${i + 1}.PNG`);

          this.img_dungeon_enda[i] = this.createImageObject(`ENDA${i + 1}.PNG`);
          this.img_dungeon_endb[i] = this.createImageObject(`ENDB${i + 1}.PNG`);
          this.img_dungeon_endc[i] = this.createImageObject(`ENDC${i + 1}.PNG`);

          this.img_dungeon_doora[i] = this.createImageObject(`DOORA${i + 1}.PNG`);
          this.img_dungeon_doorb[i] = this.createImageObject(`DOORB${i + 1}.PNG`);
          this.img_dungeon_doorc[i] = this.createImageObject(`DOORC${i + 1}.PNG`);

          this.img_dungeon_lena[i] = this.createImageObject(`LENA${i + 1}.PNG`);
          this.img_dungeon_lenb[i] = this.createImageObject(`LENB${i + 1}.PNG`);
          this.img_dungeon_lenc[i] = this.createImageObject(`LENC${i + 1}.PNG`);
        }

        // Set total size from room image (Java equivalent)
        if (this.img_dungeon_room) {
          this.TOTAL_XSIZE = this.img_dungeon_room.displayWidth;
          this.TOTAL_YSIZE = this.img_dungeon_room.displayHeight;
        }

        resolve();
      };

      if (imagesToLoad.length > 0) {
        // Need to load new images
        (scene as any).load.once('complete', createImageObjects);
        (scene as any).load.start();
      } else {
        // All images already loaded
        createImageObjects();
      }
    });
  }

  private createImageObject(imageName: string): Phaser.GameObjects.Image {
    const scene = PSGame.getCurrentScene();
    if (!scene) throw new Error("No scene available");

    const imagePath = `${this.dungeonPath}${imageName}`;
    const imageKey = imagePath.replace(/[^\w]/g, '_');

    const image = (scene as any).add.image(-1000, -1000, imageKey);
    image.setVisible(false);
    image.setOrigin(0, 0);

    // Scale for 240px viewport
    const texture = (scene as any).textures.get(imageKey);
    if (texture && texture.source && texture.source[0]) {
      const imageHeight = texture.source[0].height;
      const scaleY = 240 / imageHeight;
      image.setScale(scaleY, scaleY);
    }

    // Add to preloaded images map for legacy putimage method
    this.preloadedImages.set(imagePath, image);

    return image;
  }

  // Tilemap management
  private hideTilemapLayers(): void {
    if (!this.currentScene) return;

    this.currentScene.children.list.forEach((child: any) => {
      if (child.type === 'TilemapLayer' && child.visible) {
        child.setVisible(false);
        if (!this.hiddenTilemapLayers.includes(child)) {
          this.hiddenTilemapLayers.push(child);
        }
      }
    });
  }

  private showTilemapLayers(): void {
    this.hiddenTilemapLayers.forEach(layer => {
      layer.setVisible(true);
    });
  }

  private restoreTilemapLayers(): void {
    this.hiddenTilemapLayers.forEach(layer => {
      layer.setVisible(true);
    });
    this.hiddenTilemapLayers = [];
  }

  /**
   * Clean up all cached flipped images
   */
  private cleanupFlippedImages(): void {
    this.flippedImageCache.forEach((flippedImg) => {
      if (flippedImg && !flippedImg.scene?.scene?.isDestroyed) {
        flippedImg.destroy();
      }
    });
    this.flippedImageCache.clear();
  }

  // Movement and utility methods
  private async turnRoutine(entity: Entity, counter: boolean): Promise<void> {
    // Prevent concurrent turn animations
    if (this.isAnimating) {
      console.log("Turn routine: Already animating, skipping");
      return;
    }

    this.isAnimating = true;

    const fromTile = this.getfronttile(entity, 1);
    entity.setFace(this.nextDirection(entity.getFace(), counter));
    const destTile = this.getfronttile(entity, 1);

    console.log(`=== TURN ROUTINE ${counter ? 'LEFT' : 'RIGHT'} ===`);
    console.log(`fromTile: ${fromTile}, destTile: ${destTile}, FLOOR=${FLOOR}`);

    if (this.showDungeon) {
      if (fromTile !== FLOOR && destTile !== FLOOR) {
        console.log(`Animation choice: img_dungeon_curve (${this.img_dungeon_curve.length} images), goBack=true, flipped=${counter}`);
        await this.doAnimation(this.img_dungeon_curve, true, counter);
      }
      else if (fromTile === FLOOR && destTile !== FLOOR) {
        console.log(`Animation choice: img_dungeon_curl (${this.img_dungeon_curl.length} images), goBack=false, flipped=${counter}`);
        await this.doAnimation(this.img_dungeon_curl, false, counter);
      }
      else if (fromTile !== FLOOR && destTile === FLOOR) {
        console.log(`Animation choice: img_dungeon_curl reverse (${this.img_dungeon_curl.length} images), flipped=${!counter}`);
        await this.doReverseAnimation(this.img_dungeon_curl, !counter);
      }
      else if (fromTile === FLOOR && destTile === FLOOR) {
        console.log(`Animation choice: img_dungeon_corner (${this.img_dungeon_corner.length} images), goBack=true, flipped=${counter}`);
        await this.doAnimation(this.img_dungeon_corner, true, counter);
      }
    } else {
      console.log("Turn routine: showDungeon is false, no animation");
    }

    this.isAnimating = false;
    console.log("=== TURN ROUTINE COMPLETED ===");
  }

  /**
   * Calculate next direction based on current direction and counter flag
   * Java equivalent: nextDirection method
   */
  private nextDirection(currentDirection: number, counter: boolean): number {
    const directions = [EntityDirection.NORTH, EntityDirection.EAST, EntityDirection.SOUTH, EntityDirection.WEST];
    let pos = directions.indexOf(currentDirection);
    if (pos === -1) pos = 0;

    if (counter) {
      pos = (pos + 3) % 4; // Turn left (counter-clockwise)
    } else {
      pos = (pos + 1) % 4; // Turn right (clockwise)
    }

    return directions[pos];
  }

  private async walkup(entity: Entity, distance: number): Promise<void> {
    const inc = 16 * distance;
    const currentX = entity.getx();
    const currentY = entity.gety();

    let newX = currentX;
    let newY = currentY;

    switch (entity.getFace()) {
      case EntityDirection.NORTH: newY = currentY - inc; break;
      case EntityDirection.WEST: newX = currentX - inc; break;
      case EntityDirection.SOUTH: newY = currentY + inc; break;
      case EntityDirection.EAST: newX = currentX + inc; break;
    }

    // Java doesn't do boundary checking - just move like Java walkTo
    await this.walkTo(entity, newX, newY, distance < 0);
  }

  private async walkTo(entity: Entity, xpos: number, ypos: number, walkbackwards: boolean): Promise<void> {
    const tile = this.gettile(xpos, ypos);

    if (tile !== WALL) {
      // Can't traverse stairs or doors when walking backwards (Java logic)
      if (walkbackwards && tile !== FLOOR) {
        return;
      }
      // Can't traverse a locked door (Java: tile > 4 && tile < 8)
      if (tile > 4 && tile < 8) {
        return;
      }

      entity.setxy(xpos, ypos);

      // If it's over an open door, advance one tile (Java logic)
      if (tile === OPEN_DOOR || tile === OPEN_MAGIC_DOOR) {
        if (this.showDungeon) {
          // TODO: Add fadeOut equivalent
        }
        await this.walkup(entity, 1);

        // And after if the current tile is a stairs up/down, call its zone (EXIT) or room
        const currentTile = this.gettile(entity.getx(), entity.gety());
        if (currentTile === STAIRS_UP || currentTile === STAIRS_DOWN || currentTile === ROOM) {
          this.callZone(entity, 0);
        }
      }
    }
  }

  private handleOpenAction(player: Entity): void {
    // TODO: Implement door opening logic
  }

  private gettile(x: number, y: number): number {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return WALL;

    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);
    const tile = currentMap.gettile(tileX, tileY, 0);
    return tile === 0 ? WALL : tile - 1;
  }

  private getfronttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();

    switch (entity.getFace()) {
      case EntityDirection.NORTH: return this.gettile(x, y - 16 * pos);
      case EntityDirection.WEST: return this.gettile(x - 16 * pos, y);
      case EntityDirection.SOUTH: return this.gettile(x, y + 16 * pos);
      case EntityDirection.EAST: return this.gettile(x + 16 * pos, y);
      default: return WALL;
    }
  }

  private getlefttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();

    switch (entity.getFace()) {
      case EntityDirection.NORTH: return this.gettile(x - 16, y - 16 * pos);
      case EntityDirection.WEST: return this.gettile(x - 16 * pos, y + 16);
      case EntityDirection.SOUTH: return this.gettile(x + 16, y + 16 * pos);
      case EntityDirection.EAST: return this.gettile(x + 16 * pos, y - 16);
      default: return WALL;
    }
  }

  private getrighttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();

    switch (entity.getFace()) {
      case EntityDirection.NORTH: return this.gettile(x + 16, y - 16 * pos);
      case EntityDirection.WEST: return this.gettile(x - 16 * pos, y - 16);
      case EntityDirection.SOUTH: return this.gettile(x - 16, y + 16 * pos);
      case EntityDirection.EAST: return this.gettile(x + 16 * pos, y + 16);
      default: return WALL;
    }
  }

  private getfrontzone(entity: Entity, pos: number): number {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return 0;

    const tileX = Math.floor(entity.getx() / 16);
    const tileY = Math.floor(entity.gety() / 16);

    switch (entity.getFace()) {
      case EntityDirection.NORTH: return currentMap.getzone(tileX, tileY - pos);
      case EntityDirection.WEST: return currentMap.getzone(tileX - pos, tileY);
      case EntityDirection.SOUTH: return currentMap.getzone(tileX, tileY + pos);
      case EntityDirection.EAST: return currentMap.getzone(tileX + pos, tileY);
      default: return 0;
    }
  }

  private callZone(entity: Entity, distance: number): void {
    const curTile = this.getfronttile(entity, distance);

    if (distance > 0 && curTile !== FLOOR) return;
    if (distance === 0 && curTile === ROOM) {
    }

    const zone = this.getfrontzone(entity, distance);
    const currentMap = MainEngine.getCurrentMap();

    if (zone !== 0 && currentMap) {
      const scriptName = currentMap.getScriptZone(zone);
      if (scriptName && distance === currentMap.getMethodZone(zone)) {
        MainEngine.callScriptFunction(scriptName);
      }
    }
  }

  private enemyBattle(): void {
    // TODO: Implement enemy battle logic
  }

  private getFacingName(direction: EntityDirection): string {
    switch (direction) {
      case EntityDirection.NORTH: return "NORTH";
      case EntityDirection.SOUTH: return "SOUTH";
      case EntityDirection.EAST: return "EAST";
      case EntityDirection.WEST: return "WEST";
      default: return `UNKNOWN(${direction})`;
    }
  }

  private async delayScreen(): Promise<void> {
    await this.delay(100);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Animation method ported from Java PSDungeon.doAnimation
   * Handles both normal animation and "flip back" animation
   */
  private async doAnimation(images: Phaser.GameObjects.Image[], goBack: boolean, flipped: boolean): Promise<void> {
    if (!images || images.length === 0) {
      console.log("doAnimation: No images provided");
      return;
    }

    console.log(`doAnimation: Starting animation with ${images.length} images, goBack=${goBack}, flipped=${flipped}`);

    // Normal animation
    if (!goBack) {
      for (let i = 0; i < images.length; i++) {
        console.log(`doAnimation frame ${i}: image at index ${i}, flipped=${flipped ? 1 : 0}`);
        this.putimage(images[i], 0, flipped ? 1 : 0);
        this.drawImageToScreen();
        await this.delayScreen();
      }
    }
    // Flip back algorithm
    else {
      console.log("doAnimation: Starting flip back algorithm");

      // Forward sequence (all but last)
      for (let i = 0; i < images.length - 1; i++) {
        console.log(`doAnimation forward ${i}: image at index ${i}, flipped=${flipped ? 1 : 0}`);
        this.putimage(images[i], 0, flipped ? 1 : 0);
        this.drawImageToScreen();
        await this.delayScreen();
      }

      // Show last image on both sides
      const lastImage = images[images.length - 1];
      console.log(`doAnimation center: [image at index ${images.length - 1} normal, image at index ${images.length - 1} flipped]`);
      this.putimage(lastImage, 0, 0);
      this.putimage(lastImage, lastImage.displayWidth, 1);
      this.drawImageToScreen();
      await this.delayScreen();

      // Reverse sequence with opposite flip
      for (let i = images.length - 2; i >= 0; i--) {
        console.log(`doAnimation reverse ${i}: image at index ${i}, flipped=${!flipped ? 1 : 0}`);
        this.putimage(images[i], 0, !flipped ? 1 : 0);
        this.drawImageToScreen();
        await this.delayScreen();
      }
    }

    console.log("doAnimation: Animation completed");
  }

  /**
   * Reverse animation method - plays animation sequence in reverse
   */
  private async doReverseAnimation(images: Phaser.GameObjects.Image[], flipped: boolean): Promise<void> {
    if (!images || images.length === 0) {
      console.log("doReverseAnimation: No images provided");
      return;
    }

    console.log(`doReverseAnimation: Starting reverse animation with ${images.length} images, flipped=${flipped}`);

    for (let i = images.length - 1; i >= 0; i--) {
      console.log(`doReverseAnimation frame ${images.length - 1 - i}: image at index ${i}, flipped=${flipped ? 1 : 0}`);
      this.putimage(images[i], 0, flipped ? 1 : 0);
      this.drawImageToScreen();
      await this.delayScreen();
    }

    console.log("doReverseAnimation: Animation completed");
  }

  // State management
  public getAlreadyInside(): boolean {
    return this.alreadyInside;
  }

  public setAlreadyInside(value: boolean): void {
    this.alreadyInside = value;
  }
}