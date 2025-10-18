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

  // Camera system
  protected static current_scene: Phaser.Scene | null = null;
  protected static current_config: any = null;
  protected static cameraSpeed: number = 4;

  /**
   * Allocate and create a new entity
   * Equivalent to Java AllocateEntity()
   */
  public static async AllocateEntity(scene: Phaser.Scene, x: number, y: number, chr: string, basePath: string): Promise<number> {
    const entity = new Entity(x, y, chr);
    entity.setIndex(MainEngine.numentities);

    // Get entity depth from current map
    let entityDepth = 5; // Default depth
    if (MainEngine.current_map && typeof MainEngine.current_map.getEntityDepth === 'function') {
      entityDepth = MainEngine.current_map.getEntityDepth();
    }

    // Initialize the entity sprite with proper depth
    await entity.initSprite(scene, entityDepth, basePath);

    // Add to entity list
    MainEngine.entities.push(entity);
    const entityIndex = MainEngine.numentities++;

    return entityIndex;
  }

  /**
   * Spawn entity at tile coordinates
   * Equivalent to Java Script.entityspawn()
   */
  public static async entityspawn(scene: Phaser.Scene, x: number, y: number, chrname: string, basePath: string): Promise<number> {
    return await MainEngine.AllocateEntity(scene, x, y, chrname, basePath);
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
   * Complete cleanup - clears entities and map
   */
  public static cleanup(): void {
    // Clear entities
    MainEngine.clearEntities();

    // Destroy map if it exists
    if (MainEngine.current_map && typeof MainEngine.current_map.destroy === 'function') {
      MainEngine.current_map.destroy();
    }
    MainEngine.current_map = null;

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

  /**
   * Execute player movement sequence (simplified version of Java playermove)
   * @param sequence Animation sequence string (e.g., "Z12 W3 Z13 W3 H")
   */
  public static playermove(sequence: string): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    // Parse and execute animation sequence with proper timing
    // Commands: Z## = set frame ##, W## = wait ## frames, H = halt/stop
    const commands = sequence.split(' ');
    let currentDelay = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];

      if (command.startsWith('Z')) {
        const frameNum = parseInt(command.substring(1));
        if (!isNaN(frameNum)) {
          // Schedule frame change at current delay
          setTimeout(() => {
            player.setSpecframe(frameNum);
          }, currentDelay);
        }
      } else if (command.startsWith('W')) {
        const waitFrames = parseInt(command.substring(1));
        if (!isNaN(waitFrames)) {
          currentDelay += waitFrames * 16; // Convert frames to milliseconds (assuming 60fps)
        }
      } else if (command === 'H') {
        // Reset to normal animation after total sequence
        setTimeout(() => {
          player.setSpecframe(-1); // -1 means use normal animation
        }, currentDelay);
        break;
      }
    }
  }

  /**
   * Set current scene and config references for camera system
   */
  public static setCurrentScene(scene: Phaser.Scene, config: any): void {
    MainEngine.current_scene = scene;
    MainEngine.current_config = config;
  }

  /**
   * Setup camera for current map
   * Equivalent to Demo1Scene.setupCamera()
   */
  public static setupCamera(): void {
    if (!MainEngine.current_map || !MainEngine.current_scene || !MainEngine.current_config) return;

    const scene = MainEngine.current_scene;
    const config = MainEngine.current_config;

    // Calculate map bounds in pixels
    const mapWidth = MainEngine.current_map.getWidth() * MainEngine.current_map.getTileWidth();
    const mapHeight = MainEngine.current_map.getHeight() * MainEngine.current_map.getTileHeight();

    // CRITICAL: Camera viewport is ALWAYS the config resolution
    const cameraWidth = config.xRes;
    const cameraHeight = config.yRes;

    // Set camera bounds to the map size (this constrains scrolling)
    scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Set camera viewport to exact config resolution
    scene.cameras.main.setViewport(0, 0, cameraWidth, cameraHeight);

    // Set initial camera position using map's start position
    const startX = MainEngine.current_map.getStartX() * MainEngine.current_map.getTileWidth();
    const startY = MainEngine.current_map.getStartY() * MainEngine.current_map.getTileHeight();


    // Center camera on start position with proper clamping
    MainEngine.setCameraPosition(startX, startY);
  }

  /**
   * Set camera position with proper clamping
   * Equivalent to Demo1Scene.setCameraPosition()
   */
  public static setCameraPosition(x: number, y: number): void {
    if (!MainEngine.current_map || !MainEngine.current_scene) return;

    const camera = MainEngine.current_scene.cameras.main;
    const mapWidth = MainEngine.current_map.getWidth() * MainEngine.current_map.getTileWidth();
    const mapHeight = MainEngine.current_map.getHeight() * MainEngine.current_map.getTileHeight();

    // Camera viewport dimensions (like Java camera.viewportWidth/2)
    const camViewportHalfX = camera.width / 2;
    const camViewportHalfY = camera.height / 2;

    // Clamp camera position to map bounds (like Java MathUtils.clamp)
    const clampedX = Math.max(camViewportHalfX, Math.min(x, mapWidth - camViewportHalfX));
    const clampedY = Math.max(camViewportHalfY, Math.min(y, mapHeight - camViewportHalfY));

    // Set camera position (Phaser uses centerOn which is like setting camera.position in Java)
    camera.centerOn(clampedX, clampedY);
  }

  /**
   * Handle manual camera movement
   * Equivalent to Demo1Scene.handleCameraMovement()
   */
  public static handleCameraMovement(inputManager: any): void {
    if (!MainEngine.current_scene) return;

    let moveX = 0;
    let moveY = 0;

    if (inputManager.left) {
      moveX = -MainEngine.cameraSpeed;
    }
    if (inputManager.right) {
      moveX = MainEngine.cameraSpeed;
    }
    if (inputManager.up) {
      moveY = -MainEngine.cameraSpeed;
    }
    if (inputManager.down) {
      moveY = MainEngine.cameraSpeed;
    }

    // Apply camera movement with proper clamping
    if (moveX !== 0 || moveY !== 0) {
      const camera = MainEngine.current_scene.cameras.main;
      const newX = camera.centerX + moveX;
      const newY = camera.centerY + moveY;

      // Use the same clamping logic as setCameraPosition
      MainEngine.setCameraPosition(newX, newY);
    }
  }

  /**
   * Handle camera tracking - follow the player
   * Equivalent to Demo1Scene.handleCameraTracking()
   */
  public static handleCameraTracking(): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    // Handle different camera tracking modes
    switch (MainEngine.cameratracking) {
      case 1: // Standard following mode
        {
          // Get player center position
          const playerX = player.getPixelX() + (player.getHotW() / 2);
          const playerY = player.getPixelY() + (player.getHotH() / 2);

          // Set camera to follow player (with same clamping as manual movement)
          MainEngine.setCameraPosition(playerX, playerY);
        }
        break;

      case 3: // Screen Transition mode (Golden Axe Warrior style)
        {
          if (!MainEngine.current_scene || !MainEngine.current_config) return;

          const camera = MainEngine.current_scene.cameras.main;
          const screenWidth = MainEngine.current_config.xRes;
          const screenHeight = MainEngine.current_config.yRes;

          // Get player center position
          const playerX = player.getPixelX() + (player.getHotW() / 2);
          const playerY = player.getPixelY() + (player.getHotH() / 2);

          // Get current camera center
          const currentCameraX = camera.centerX;
          const currentCameraY = camera.centerY;

          // Debug screen transition mode (only log occasionally to avoid spam)
          if (Math.random() < 0.01) { // 1% chance to log
          }

          // Calculate screen boundaries for current camera position
          const leftBound = currentCameraX - screenWidth / 2;
          const rightBound = currentCameraX + screenWidth / 2;
          const topBound = currentCameraY - screenHeight / 2;
          const bottomBound = currentCameraY + screenHeight / 2;

          // Check if player has moved outside current screen boundaries
          let newCameraX = currentCameraX;
          let newCameraY = currentCameraY;

          // Horizontal screen transitions
          if (playerX < leftBound) {
            // Move camera one screen to the left
            newCameraX = currentCameraX - screenWidth;
          } else if (playerX > rightBound) {
            // Move camera one screen to the right
            newCameraX = currentCameraX + screenWidth;
          }

          // Vertical screen transitions
          if (playerY < topBound) {
            // Move camera one screen up
            newCameraY = currentCameraY - screenHeight;
          } else if (playerY > bottomBound) {
            // Move camera one screen down
            newCameraY = currentCameraY + screenHeight;
          }

          // Apply screen transition if needed
          if (newCameraX !== currentCameraX || newCameraY !== currentCameraY) {
            MainEngine.setCameraPosition(newCameraX, newCameraY);
          }
        }
        break;

      default:
        // No camera tracking
        break;
    }
  }

  /**
   * Load map and initialize - combines map loading with initialization
   */
  public static async loadAndInitMap(scene: Phaser.Scene, mapFilename: string, basePath: string): Promise<any> {
    // Import TiledMap here to avoid circular dependencies
    const { TiledMap } = await import('../domain/TiledMap');

    // Load the tilemap
    const tiledMap = await TiledMap.loadMap(scene, mapFilename, basePath);

    if (tiledMap) {
      // Start the map
      tiledMap.startMap();

      // Set current map reference
      MainEngine.setCurrentMap(tiledMap);
    } else {
      console.error('MainEngine: Failed to load TiledMap');
    }

    return tiledMap;
  }

  /**
   * Map initialization - equivalent to Demo1.mapinit()
   * Spawns the player character and sets up camera tracking
   */
  public static async mapinit(scene: Phaser.Scene, chrname: string, basePath: string): Promise<void> {
    if (!MainEngine.current_map) {
      console.error('MainEngine.mapinit: current_map not set');
      return;
    }

    // Get start position from map (matching Java demo logic)
    let gotox = 0;
    let gotoy = 0;

    if (gotox === 0 && gotoy === 0) {
      // Use map start position
      gotox = MainEngine.current_map.getStartX(); // current_map.getStartX() equivalent
      gotoy = MainEngine.current_map.getStartY(); // current_map.getStartY() equivalent
    }

    // Spawn player entity (equivalent to entityspawn + setplayer)
    const playerIndex = await MainEngine.entityspawn(scene, gotox, gotoy, chrname, basePath);
    MainEngine.setplayer(playerIndex);

    // Enable camera tracking (equivalent to cameratracking = 1)
    MainEngine.setCameraTracking(1);

    // Set player properties (matching Java demo)
    MainEngine.setPlayerStep(4);
    const player = MainEngine.getPlayer();
    if (player) {
      player.setSpeed(200); // Pixels per second - much slower, more reasonable

      // Center camera on player initially
      const playerPixelX = player.getPixelX();
      const playerPixelY = player.getPixelY();

      MainEngine.setCameraPosition(playerPixelX, playerPixelY);
    }

  }

  /**
   * Generic update method for handling camera and movement
   * Should be called from scene update() method
   */
  public static updateEngine(inputManager: any): void {
    // Update all entities
    MainEngine.updateEntities();

    // Handle player movement or camera movement
    const player = MainEngine.getPlayer();
    if (player) {
      // Process player controls
      MainEngine.ProcessControls(inputManager);

      // Handle camera tracking if enabled
      if (MainEngine.getCameraTracking() === 1) {
        MainEngine.handleCameraTracking();
      }
    } else {
      // Fallback to manual camera movement
      MainEngine.handleCameraMovement(inputManager);
    }
  }

  /**
   * Set camera speed
   */
  public static setCameraSpeed(speed: number): void {
    MainEngine.cameraSpeed = speed;
  }

  /**
   * Get camera speed
   */
  public static getCameraSpeed(): number {
    return MainEngine.cameraSpeed;
  }
}