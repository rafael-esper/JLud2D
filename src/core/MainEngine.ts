/**
 * Main Engine
 * TypeScript port of Java MainEngine.java
 * Manages entities, player controls, and core game systems
 */

import { Entity, EntityDirection } from '../domain/Entity';

export class MainEngine {
  // Entity system
  protected static entities: Entity[] = [];
  protected static numentities: number = 0;
  protected static player: number = -1; // Index of player entity

  // Player movement state
  protected static myself: Entity | null = null;
  protected static playerstep: number = 4;
  protected static cameratracking: number = 0; // 0 = manual, 1 = follow player

  // Input state (for ProcessControls)
  protected static up: boolean = false;
  protected static down: boolean = false;
  protected static left: boolean = false;
  protected static right: boolean = false;
  protected static lastplayerdir: number = EntityDirection.SOUTH;

  // Game state
  protected static invc: number = 0; // Script/cutscene active flag
  protected static current_map: any = null; // TiledMap instance

  /**
   * Allocate and create a new entity
   * Equivalent to Java AllocateEntity()
   */
  public static async AllocateEntity(scene: Phaser.Scene, x: number, y: number, chr: string): Promise<number> {
    const entity = new Entity(Math.floor(x / 16), Math.floor(y / 16), chr);
    entity.setIndex(MainEngine.numentities);

    // Get entity depth from current map
    let entityDepth = 5; // Default depth
    if (MainEngine.current_map && typeof MainEngine.current_map.getEntityDepth === 'function') {
      entityDepth = MainEngine.current_map.getEntityDepth();
    }

    // Initialize the entity sprite with proper depth
    await entity.initSprite(scene, entityDepth);

    // Add to entity list
    MainEngine.entities.push(entity);
    const entityIndex = MainEngine.numentities++;

    console.log(`Entity allocated: ${chr} at (${Math.floor(x / 16)}, ${Math.floor(y / 16)}) -> index ${entityIndex}, depth: ${entityDepth}`);
    return entityIndex;
  }

  /**
   * Spawn entity at tile coordinates
   * Equivalent to Java Script.entityspawn()
   */
  public static async entityspawn(scene: Phaser.Scene, x: number, y: number, chrname: string): Promise<number> {
    return await MainEngine.AllocateEntity(scene, x * 16, y * 16, chrname);
  }

  /**
   * Set player entity
   * Equivalent to Java Script.setplayer()
   */
  public static setplayer(entityIndex: number): Entity | null {
    if (entityIndex < 0 || entityIndex >= MainEngine.numentities) {
      MainEngine.player = -1;
      MainEngine.myself = null;
      console.error(`setplayer: Invalid entity index ${entityIndex}`);
      return null;
    }

    MainEngine.player = entityIndex;
    MainEngine.myself = MainEngine.entities[entityIndex];

    console.log(`Player set to entity ${entityIndex} (${MainEngine.myself.getChrname()})`);
    return MainEngine.myself;
  }

  /**
   * Update all entities - called every frame
   */
  public static updateEntities(): void {
    for (let i = 0; i < MainEngine.numentities; i++) {
      if (MainEngine.entities[i].isActive()) {
        MainEngine.entities[i].think();
      }
    }
  }

  /**
   * Process player controls - equivalent to Java ProcessControls()
   */
  public static ProcessControls(inputManager: any): void {
    // Update input state from input manager
    MainEngine.up = inputManager.up;
    MainEngine.down = inputManager.down;
    MainEngine.left = inputManager.left;
    MainEngine.right = inputManager.right;

    // No player movement can be done if there's no ready player, or if there's a script active
    if (MainEngine.myself === null || !MainEngine.myself.ready() || MainEngine.invc !== 0) {
      return;
    }

    // Kill contradictory input
    if (MainEngine.up && MainEngine.down) {
      MainEngine.up = MainEngine.down = false;
    }
    if (MainEngine.left && MainEngine.right) {
      MainEngine.left = MainEngine.right = false;
    }

    // Determine movement direction
    let moveX = 0;
    let moveY = 0;

    if (MainEngine.left) moveX = -1;
    if (MainEngine.right) moveX = 1;
    if (MainEngine.up) moveY = -1;
    if (MainEngine.down) moveY = 1;

    // Apply movement
    if (moveX !== 0 || moveY !== 0) {
      // Set waypoint for movement
      MainEngine.myself.setWaypointRelative(moveX, moveY, true);

      // Update last player direction for diagonal handling
      if (Math.abs(moveX) > Math.abs(moveY)) {
        MainEngine.lastplayerdir = moveX > 0 ? EntityDirection.EAST : EntityDirection.WEST;
      } else if (moveY !== 0) {
        MainEngine.lastplayerdir = moveY > 0 ? EntityDirection.SOUTH : EntityDirection.NORTH;
      }
    }
  }

  /**
   * Render all entities - called during render phase
   */
  public static RenderEntities(): void {
    // Sort entities by Y position for proper depth ordering
    const sortedEntities = [...MainEngine.entities].sort((a, b) => a.gety() - b.gety());

    for (const entity of sortedEntities) {
      if (entity.isActive() && entity.isVisible()) {
        entity.draw();
      }
    }
  }

  /**
   * Get player entity
   */
  public static getPlayer(): Entity | null {
    return MainEngine.myself;
  }

  /**
   * Get player entity index
   */
  public static getPlayerIndex(): number {
    return MainEngine.player;
  }

  /**
   * Get entity by index
   */
  public static getEntity(index: number): Entity | null {
    if (index < 0 || index >= MainEngine.numentities) {
      return null;
    }
    return MainEngine.entities[index];
  }

  /**
   * Get all entities
   */
  public static getEntities(): Entity[] {
    return MainEngine.entities;
  }

  /**
   * Get number of entities
   */
  public static getNumEntities(): number {
    return MainEngine.numentities;
  }

  /**
   * Set camera tracking mode
   */
  public static setCameraTracking(mode: number): void {
    MainEngine.cameratracking = mode;
  }

  /**
   * Get camera tracking mode
   */
  public static getCameraTracking(): number {
    return MainEngine.cameratracking;
  }

  /**
   * Set current map reference
   */
  public static setCurrentMap(map: any): void {
    MainEngine.current_map = map;
  }

  /**
   * Clear all entities (for scene changes)
   */
  public static clearEntities(): void {
    // Destroy all entity sprites
    for (const entity of MainEngine.entities) {
      entity.destroy();
    }

    MainEngine.entities = [];
    MainEngine.numentities = 0;
    MainEngine.player = -1;
    MainEngine.myself = null;
  }

  /**
   * Set script/cutscene active state
   */
  public static setScriptActive(active: boolean): void {
    MainEngine.invc = active ? 1 : 0;
  }

  /**
   * Check if script/cutscene is active
   */
  public static isScriptActive(): boolean {
    return MainEngine.invc !== 0;
  }

  /**
   * Set player step size
   */
  public static setPlayerStep(step: number): void {
    MainEngine.playerstep = step;
  }

  /**
   * Get player step size
   */
  public static getPlayerStep(): number {
    return MainEngine.playerstep;
  }
}