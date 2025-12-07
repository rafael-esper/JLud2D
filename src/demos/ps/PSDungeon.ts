/**
 * PSDungeon - Phantasy Star Dungeon System
 * TypeScript port of PSDungeon.java - Handles 3D dungeon navigation, rendering, and interactions
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
  // Enemy arrays for battle system
  private enemyRandomArray: Map<number, any[]> = new Map();
  private enemyFixedArray: Map<number, any[]> = new Map();

  // Dungeon rendering state
  private showDungeon: boolean = true;
  private walkingBack: boolean = false;
  private isDark: boolean = true;
  private openEffect: boolean = false;
  private trapEffect: boolean = false;
  private alreadyInside: boolean = false;
  private zoneCheck: boolean = true;

  // Image management
  private TOTAL_XSIZE: number = 0;
  private TOTAL_YSIZE: number = 0;

  // Dungeon images - simplified for TypeScript implementation
  private dungeonImages: Map<string, any> = new Map();

  public async startDungeon(): Promise<void> {
    const currentDungeon = PSGame.getCurrentDungeon();
    if (!currentDungeon) {
      console.error("PSDungeon: No current dungeon set");
      return;
    }

    // Show loading message
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, SpecialEntity.NONE);
    await PSMenu.Stext(PSGame.getString("Dungeon_Loading"));
    await PSMenu.endScene();

    console.log("PSDungeon: Initializing dungeon");

    // Initialize dungeon images
    const dungeonType = DungeonHelper.getType(currentDungeon);
    if (dungeonType) {
      this.initDungeonImages(DungeonTypeHelper.getImagePath(dungeonType));
    }

    // Spawn player at dungeon entrance
    const spawnX = PSGame.getgotox();
    const spawnY = PSGame.getgotoy();
    const dungeonDir = DungeonHelper.getDir(currentDungeon);

    await PSGame.getParty().allocate(spawnX, spawnY);
    const player = MainEngine.getPlayer();
    if (player) {
      player.setFace(dungeonDir);
    }

    // Set up camera and initial fade
    MainEngine.setCameraTracking(1);
    MainEngine.setupCamera();
    await ScriptEngine.fadein(5, false);

    // Check if entering dark dungeon
    if (this.getAlreadyInside()) {
      player?.setFace(PSGame.getDungeonFace());
      this.isDark = false;
    } else {
      const hasLightPendant = PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Inventory_Light_Pendant));
      this.isDark = DungeonHelper.isDark(currentDungeon) && !hasLightPendant;

      // Handle dark dungeon entrance
      if (this.isDark) {
        await PSMenu.startScene(PSSceneType.BLACK, SpecialEntity.NONE);
        await PSMenu.Stext(PSGame.getString("Dungeon_Black"));
        PSGame.menuOn();
        await PSMenu.endScene();
      }
    }

    // Main dungeon loop
    console.log("PSDungeon: Starting dungeon main loop");
    await this.dungeonMainLoop();
  }

  private async dungeonMainLoop(): Promise<void> {
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) return;

    let running = true;

    while (running) {
      MainEngine.setEntitiesPaused(true);

      // Render dungeon or black screen
      if (this.showDungeon && !this.isDark) {
        await this.drawDungeon(0);
      } else {
        // Paint black screen for dark dungeons
        ScriptEngine.rectfill(0, 0, 320, 240, { r: 0, g: 0, b: 0 });
      }

      // Zone checking for events and battles
      if (this.zoneCheck) {
        this.zoneCheck = false;
        const player = MainEngine.getPlayer();
        if (player) {
          this.callZone(player, 1);
          this.callZone(player, 0);

          // Check for random battles on floor tiles
          if (this.getfronttile(player, 1) === FLOOR) {
            this.enemyBattle();
          }
        }
      }

      // Handle input - simplified for TypeScript
      await this.processDungeonInput();

      // Small delay for frame timing
      await this.delay(16); // ~60fps
    }

    MainEngine.setEntitiesPaused(false);
  }

  private async processDungeonInput(): Promise<void> {
    const player = MainEngine.getPlayer();
    if (!player) return;

    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) return;

    // Check for basic input - this is simplified
    // In a full implementation, you'd integrate with the input system

    // For now, this is a placeholder that would integrate with Controls.ts
    // The actual input handling would be done through MainEngine.ProcessControls()

    // This is where movement, turning, and door opening would be handled
    // following the patterns from the Java implementation
  }

  private drawDungeon(pos: number): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    // Simplified dungeon rendering - in full implementation this would
    // render the 3D dungeon view based on player position and facing direction
    console.log(`PSDungeon: Drawing dungeon view at position ${pos}`);

    // The actual implementation would follow the complex Java drawDungeon logic
    // with proper wall, floor, door, and stair rendering
  }

  private callZone(entity: Entity, distance: number): void {
    const curTile = this.getfronttile(entity, distance);

    if (distance > 0 && curTile !== FLOOR) {
      return;
    } else if (distance === 0 && curTile === ROOM) {
      // Render room image
      console.log("PSDungeon: Player entered room");
    }

    const zone = this.getfrontzone(entity, distance);
    const currentMap = MainEngine.getCurrentMap();

    if (zone !== 0 && currentMap) {
      // Call zone script if conditions are met
      const scriptName = currentMap.getScriptZone(zone);
      if (scriptName && distance === currentMap.getMethodZone(zone)) {
        MainEngine.callScriptFunction(scriptName);
      }
    }
  }

  private enemyBattle(): void {
    // Random battle system
    const chance = Math.floor(Math.random() * 256);
    const currentFloor = PSGame.gameData.dungeonFloor;

    // Small chance of fixed battle (multiple enemies)
    if (chance < 4) {
      const fixedEnemies = this.enemyFixedArray.get(currentFloor);
      if (fixedEnemies && fixedEnemies.length > 0) {
        PSGame.fixedBattle(PSSceneType.CORRIDOR, fixedEnemies);
      }
    }
    // Greater chance of random battle (single enemy)
    else if (chance < 20) {
      const randomEnemies = this.enemyRandomArray.get(currentFloor);
      if (randomEnemies && randomEnemies.length > 0) {
        PSGame.randomBattle(PSSceneType.CORRIDOR, randomEnemies);
      }
    }
  }

  private gettile(x: number, y: number): number {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return 0;

    const tileX = Math.floor(x / 16);
    const tileY = Math.floor(y / 16);
    const tile = currentMap.gettile(tileX, tileY, 0);
    return tile === 0 ? 0 : tile - 1;
  }

  private getfronttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();
    const face = entity.getFace();

    switch (face) {
      case EntityDirection.NORTH:
        return this.gettile(x, y - 16 * pos);
      case EntityDirection.WEST:
        return this.gettile(x - 16 * pos, y);
      case EntityDirection.SOUTH:
        return this.gettile(x, y + 16 * pos);
      case EntityDirection.EAST:
        return this.gettile(x + 16 * pos, y);
      default:
        return 0;
    }
  }

  private getfrontzone(entity: Entity, pos: number): number {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return 0;

    const tileX = Math.floor(entity.getx() / 16);
    const tileY = Math.floor(entity.gety() / 16);
    const face = entity.getFace();

    switch (face) {
      case EntityDirection.NORTH:
        return currentMap.getzone(tileX, tileY - pos);
      case EntityDirection.WEST:
        return currentMap.getzone(tileX - pos, tileY);
      case EntityDirection.SOUTH:
        return currentMap.getzone(tileX, tileY + pos);
      case EntityDirection.EAST:
        return currentMap.getzone(tileX + pos, tileY);
      default:
        return 0;
    }
  }

  private initDungeonImages(dungeonPath: string): void {
    console.log(`PSDungeon: Loading dungeon images from ${dungeonPath}`);

    // In a full implementation, this would load all the dungeon tile images
    // For now, we'll just set the total size
    this.TOTAL_XSIZE = 320;
    this.TOTAL_YSIZE = 240;

    // The Java implementation loads dozens of image files for:
    // - Walls, doors, stairs
    // - Animation frames for door opening
    // - Perspective wall pieces for 3D effect
    // - Corner and curve animations for turning
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for enemy setup
  public setRandomEnemies(floor: number, enemies: any[]): void {
    this.enemyRandomArray.set(floor, enemies);
  }

  public setFixedEnemies(floor: number, enemies: any[]): void {
    this.enemyFixedArray.set(floor, enemies);
  }

  // State management
  public getAlreadyInside(): boolean {
    return this.alreadyInside;
  }

  public setAlreadyInside(value: boolean): void {
    this.alreadyInside = value;
  }

  public setZoneCheck(): void {
    this.zoneCheck = true;
  }

  public getTrapEffect(): boolean {
    return this.trapEffect;
  }

  public setTrapEffect(value: boolean): void {
    this.trapEffect = value;
  }

  public setLight(): void {
    this.isDark = false;
  }

  public setOpen(): void {
    this.openEffect = true;
  }

  public deadEnd(): boolean {
    const player = MainEngine.getPlayer();
    if (!player) return false;

    return (
      this.getfronttile(player, -1) !== FLOOR &&
      this.getlefttile(player, 0) !== FLOOR &&
      this.getrighttile(player, 0) !== FLOOR
    );
  }

  private getlefttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();
    const face = entity.getFace();

    switch (face) {
      case EntityDirection.NORTH:
        return this.gettile(x - 16, y - 16 * pos);
      case EntityDirection.WEST:
        return this.gettile(x - 16 * pos, y + 16);
      case EntityDirection.SOUTH:
        return this.gettile(x + 16, y + 16 * pos);
      case EntityDirection.EAST:
        return this.gettile(x + 16 * pos, y - 16);
      default:
        return 0;
    }
  }

  private getrighttile(entity: Entity, pos: number): number {
    const x = entity.getx();
    const y = entity.gety();
    const face = entity.getFace();

    switch (face) {
      case EntityDirection.NORTH:
        return this.gettile(x + 16, y - 16 * pos);
      case EntityDirection.WEST:
        return this.gettile(x - 16 * pos, y - 16);
      case EntityDirection.SOUTH:
        return this.gettile(x - 16, y + 16 * pos);
      case EntityDirection.EAST:
        return this.gettile(x + 16 * pos, y + 16);
      default:
        return 0;
    }
  }

  public checkTrapEffect(): boolean {
    const player = MainEngine.getPlayer();
    if (!player) return false;

    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) return false;

    const zone = this.getfrontzone(player, 1);
    this.trapEffect = true;

    const scriptName = currentMap.getScriptZone(zone);
    if (scriptName && scriptName.startsWith("trap")) {
      MainEngine.callScriptFunction(scriptName);
      return !this.trapEffect;
    }

    this.trapEffect = false;
    return false;
  }

  public static warpBack(shift: number): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    const face = player.getFace();
    const currentX = player.getx();
    const currentY = player.gety();

    switch (face) {
      case EntityDirection.NORTH:
        player.setxy(currentX, currentY + shift * 16);
        break;
      case EntityDirection.WEST:
        player.setxy(currentX + shift * 16, currentY);
        break;
      case EntityDirection.SOUTH:
        player.setxy(currentX, currentY - shift * 16);
        break;
      case EntityDirection.EAST:
        player.setxy(currentX - shift * 16, currentY);
        break;
    }
  }
}