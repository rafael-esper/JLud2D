/**
 * Main Engine
 * TypeScript port of Java MainEngine.java
 * Manages entities, player controls, and core game systems
 */

import { Entity, EntityDirection } from '../domain/Entity';
import { VGMPlayerAPI } from './vgm/VGMPlayerAPI';

export class MainEngine {
  // Entity system
  protected static entities: Entity[] = [];
  protected static numentities: number = 0;
  protected static player: number = -1; // Index of player entity

  // Player movement state
  protected static myself: Entity | null = null;
  protected static playerstep: number = 4;
  protected static cameratracking: number = 0; // 0 = manual, 1 = follow player
  protected static playerdiagonals: boolean = true;
  protected static smoothdiagonals: boolean = true;

  // Input state (for ProcessControls)
  protected static up: boolean = false;
  protected static down: boolean = false;
  protected static left: boolean = false;
  protected static right: boolean = false;
  protected static lastplayerdir: number = EntityDirection.SOUTH;

  // Game state
  protected static invc: number = 0; // Script/cutscene active flag
  protected static current_map: any = null; // TiledMap instance
  protected static entitiespaused: boolean = false; // For screen transitions

  // Camera system
  protected static current_scene: Phaser.Scene | null = null;
  protected static current_config: any = null;
  protected static cameraSpeed: number = 4;
  protected static screenTransitioning: boolean = false;

  // System path for resource loading (like Java systemclass)
  protected static systemPath: string = '';


  /**
   * Set system path for resource loading (like Java setSystemPath)
   */
  public static setSystemPath(path: string): void {
    MainEngine.systemPath = path;
    console.log(`System path set to: ${path}`);
  }

  /**
   * Get current system path
   */
  public static getSystemPath(): string {
    return MainEngine.systemPath;
  }


  /**
   * Update ResponsiveScaler to use demo's resolution for proper scaling
   */
  public static updateResponsiveScaler(config: any): void {
    try {
      // Get global game instance
      const globalGame = (window as any).game;
      if (globalGame && globalGame.updateScaling) {
        console.log(`MainEngine: Updating ResponsiveScaler base resolution to ${config.xRes}x${config.yRes}`);
        globalGame.updateScaling(config);
      } else {
        console.warn('MainEngine: Cannot update ResponsiveScaler - global game instance not available');
      }
    } catch (error) {
      console.error('MainEngine: Error updating ResponsiveScaler:', error);
    }
  }

  /**
   * Initialize main engine with demo-specific config (like Java initMainEngine)
   */
  public static async initMainEngine(mapname?: string): Promise<any> {
    try {
      // Load config from system path (like Java Config.loadConfig)
      const configPath = `${MainEngine.systemPath}/config.json`;
      console.log(`Loading config from: ${configPath}`);

      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load config from ${configPath}`);
      }

      const configData = await response.json();
      const { GameConfig } = await import('../config/GameConfig');
      const config = new GameConfig(configData);

      console.log('Config loaded:', config);

      // Use mapname from parameter or fallback to config (like Java)
      if (!mapname || mapname === '') {
        mapname = config.mapName;
        console.log(`Mapname from config file: ${mapname}`);
      }

      // Store config
      MainEngine.current_config = config;

      // Update ResponsiveScaler to use demo's resolution for scaling
      MainEngine.updateResponsiveScaler(config);

      return { config, mapname };
    } catch (error) {
      console.error('Error in initMainEngine:', error);
      // Fallback to default config
      const { GameConfig } = await import('../config/GameConfig');
      const config = new GameConfig();
      MainEngine.current_config = config;

      return { config, mapname: mapname || '' };
    }
  }

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
   * Make one entity stalk another
   * Equivalent to Java Script.entitystalk()
   */
  public static entitystalk(stalkerIndex: number, stalkeeIndex: number): void {
    if (stalkerIndex < 0 || stalkerIndex >= MainEngine.numentities) {
      return;
    }
    if (stalkeeIndex < 0 || stalkeeIndex >= MainEngine.numentities) {
      MainEngine.entities[stalkerIndex].clear_stalk();
      return;
    }

    const stalker = MainEngine.entities[stalkerIndex];
    const stalkee = MainEngine.entities[stalkeeIndex];

    // Position stalker at stalkee's position
    stalker.setx(stalkee.getx());
    stalker.sety(stalkee.gety());

    // Set up stalking behavior
    stalker.stalk(stalkee);
  }

  /**
   * Update all entities - called every frame
   */
  public static updateEntities(): void {
    // Skip entity updates when entities are paused (during screen transitions)
    if (MainEngine.entitiespaused) {
      return;
    }

    for (let i = 0; i < MainEngine.numentities; i++) {
      if (MainEngine.entities[i].isActive()) {
        MainEngine.entities[i].think();
      }
    }
  }

  /**
   * Pause/unpause entities (for screen transitions)
   */
  public static setEntitiesPaused(paused: boolean): void {
    MainEngine.entitiespaused = paused;
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

    // Apply movement with Java-style facing and obstruction checking
    if (moveX !== 0 || moveY !== 0) {
      // ALWAYS set facing direction FIRST (like Java setFace)
      let newDirection = EntityDirection.SOUTH;
      if (moveX !== 0) {
        // Prioritize horizontal movement for facing direction (like Java diagonal handling)
        newDirection = moveX > 0 ? EntityDirection.EAST : EntityDirection.WEST;
      } else if (moveY !== 0) {
        newDirection = moveY > 0 ? EntityDirection.SOUTH : EntityDirection.NORTH;
      }

      // Set face immediately, regardless of obstruction
      MainEngine.myself.setFace(newDirection);

      // Calculate target position for obstruction check
      const currentX = MainEngine.myself.getx();
      const currentY = MainEngine.myself.gety();
      const targetX = currentX + (moveX * 16); // Convert tile movement to pixels
      const targetY = currentY + (moveY * 16); // Convert tile movement to pixels

      // Check for obstructions at target position using pixel coordinates
      let canMove = true;
      if (MainEngine.current_map) {
        canMove = !MainEngine.current_map.getobspixel(targetX, targetY);

        // For diagonal movement, also check that we can't squeeze between diagonal obstacles
        if (canMove && moveX !== 0 && moveY !== 0) {
          // Check the two adjacent cells for diagonal movement
          const horizontalX = currentX + (moveX * 16);
          const horizontalY = currentY;
          const verticalX = currentX;
          const verticalY = currentY + (moveY * 16);

          const horizontalBlocked = MainEngine.current_map.getobspixel(horizontalX, horizontalY);
          const verticalBlocked = MainEngine.current_map.getobspixel(verticalX, verticalY);

          // If both adjacent cells are blocked, don't allow diagonal movement through the corner
          if (horizontalBlocked && verticalBlocked) {
            canMove = false;
          }
        }
      }

      // If diagonal movement is blocked, try fallback to single direction
      if (!canMove && moveX !== 0 && moveY !== 0) {
        // Try horizontal movement first
        const horizontalTargetX = currentX + (moveX * 16);
        const horizontalTargetY = currentY;

        if (MainEngine.current_map && !MainEngine.current_map.getobspixel(horizontalTargetX, horizontalTargetY)) {
          // Horizontal movement is possible
          MainEngine.myself.setWaypointRelative(moveX * 16, 0, false);
          canMove = true; // Mark as handled
        } else {
          // Try vertical movement
          const verticalTargetX = currentX;
          const verticalTargetY = currentY + (moveY * 16);

          if (MainEngine.current_map && !MainEngine.current_map.getobspixel(verticalTargetX, verticalTargetY)) {
            // Vertical movement is possible
            MainEngine.myself.setWaypointRelative(0, moveY * 16, false);
            canMove = true; // Mark as handled
          }
        }
      } else if (canMove) {
        // Original diagonal or straight movement is possible
        MainEngine.myself.setWaypointRelative(moveX * 16, moveY * 16, false);
      }
      // If still blocked after fallback attempts, no movement occurs

      // Update last player direction for diagonal handling
      MainEngine.lastplayerdir = newDirection;
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
   * Get current map
   */
  public static getCurrentMap(): any {
    return MainEngine.current_map;
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
   * Get entity by index
   */
  public static getEntityByIndex(index: number): Entity | null {
    if (index < 0 || index >= MainEngine.entities.length) {
      return null;
    }
    return MainEngine.entities[index];
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

  public static setCameraTracking(mode: number): void {
    MainEngine.cameratracking = mode;
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
   * Get player diagonal movement setting
   */
  public static getPlayerDiagonals(): boolean {
    return MainEngine.playerdiagonals;
  }

  /**
   * Set player diagonal movement setting
   */
  public static setPlayerDiagonals(enabled: boolean): void {
    MainEngine.playerdiagonals = enabled;
  }

  /**
   * Get smooth diagonal movement setting
   */
  public static getSmoothDiagonals(): boolean {
    return MainEngine.smoothdiagonals;
  }

  /**
   * Set smooth diagonal movement setting
   */
  public static setSmoothDiagonals(enabled: boolean): void {
    MainEngine.smoothdiagonals = enabled;
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
   * Get current scene reference
   */
  public static getCurrentScene(): Phaser.Scene | null {
    return MainEngine.current_scene;
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

    // Set camera bounds to the map size (this constrains scrolling)
    scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    // Set initial camera position using map's start position
    const startX = MainEngine.current_map.getStartX() * MainEngine.current_map.getTileWidth();
    const startY = MainEngine.current_map.getStartY() * MainEngine.current_map.getTileHeight();

    // Center camera on start position with proper clamping
    MainEngine.setCameraPosition(startX, startY);

    console.log(`Camera setup: demo resolution ${config.xRes}x${config.yRes}, map bounds ${mapWidth}x${mapHeight}, camera at ${startX},${startY}`);
  }

  /**
   * Set camera position with proper clamping
   * Equivalent to Demo1Scene.setCameraPosition()
   */
  public static setCameraPosition(x: number, y: number): void {
    if (!MainEngine.current_map || !MainEngine.current_scene) return;

    const camera = MainEngine.current_scene.cameras.main;
    if (!camera || camera.width === undefined || camera.height === undefined) return;

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
   * Handle screen transition mode (mode 3) like Java implementation
   */
  private static handleScreenTransition(): void {
    if (!MainEngine.current_scene || !MainEngine.current_config) return;
    if (MainEngine.screenTransitioning) return; // Already in transition

    const player = MainEngine.getPlayer();
    if (!player) return;

    const camera = MainEngine.current_scene.cameras.main;
    const screenWidth = MainEngine.current_config.xRes;
    const screenHeight = MainEngine.current_config.yRes;

    // Initialize camera to player's screen if not properly aligned
    const playerPixelX = player.getx();
    const playerPixelY = player.gety();

    // Calculate which screen the player is on
    const playerScreenX = Math.floor(playerPixelX / screenWidth);
    const playerScreenY = Math.floor(playerPixelY / screenHeight);

    // Calculate the center of the player's current screen
    const expectedCameraX = (playerScreenX * screenWidth) + (screenWidth / 2);
    const expectedCameraY = (playerScreenY * screenHeight) + (screenHeight / 2);

    // If camera is not aligned to a screen boundary, align it first
    const currentCameraX = camera.centerX;
    const currentCameraY = camera.centerY;

    const cameraOffsetX = Math.abs(currentCameraX - expectedCameraX);
    const cameraOffsetY = Math.abs(currentCameraY - expectedCameraY);

    // If camera is not properly aligned (tolerance of 4 pixels), snap it to player's screen
    if (cameraOffsetX > 4 || cameraOffsetY > 4) {
      MainEngine.setCameraPosition(expectedCameraX, expectedCameraY);
      return; // Wait one frame before checking transitions
    }

    // Now check for screen transitions
    // Get current camera screen position (top-left corner equivalent to Java xwin, ywin)
    const xwin = camera.centerX - screenWidth / 2;
    const ywin = camera.centerY - screenHeight / 2;

    // Calculate player position relative to current screen boundaries
    const relativeX = playerPixelX - xwin;
    const relativeY = playerPixelY - ywin;

    let scrollDirection = '';
    let scrollX = 0;
    let scrollY = 0;

    // Check boundaries like Java (with -8 pixel threshold)
    if (relativeX <= -8) {
      scrollDirection = 'left';
      scrollX = -screenWidth;
    } else if (relativeX >= screenWidth) {
      scrollDirection = 'right';
      scrollX = screenWidth;
    } else if (relativeY <= -8) {
      scrollDirection = 'up';
      scrollY = -screenHeight;
    } else if (relativeY >= screenHeight) {
      scrollDirection = 'down';
      scrollY = screenHeight;
    }

    // If transition needed, perform animated scroll
    if (scrollDirection) {
      MainEngine.performScreenTransition(scrollX, scrollY, scrollDirection);
    }
  }

  /**
   * Perform animated screen transition like Java implementation
   */
  private static performScreenTransition(scrollX: number, scrollY: number, direction: string): void {
    if (!MainEngine.current_scene) return;

    const player = MainEngine.getPlayer();
    if (!player) return;

    MainEngine.screenTransitioning = true;

    // Pause entities during transition (like Java setentitiespaused(true))
    MainEngine.setEntitiesPaused(true);

    const camera = MainEngine.current_scene.cameras.main;
    const startX = camera.centerX;
    const startY = camera.centerY;
    const targetX = startX + scrollX;
    const targetY = startY + scrollY;

    // Calculate transition duration based on Java's 4-pixel increments
    // At 60fps, move 4 pixels per frame = 240 pixels per second
    const distance = Math.sqrt(scrollX * scrollX + scrollY * scrollY);
    const duration = (distance / 4) * (1000 / 60); // Convert to milliseconds

    // Create smooth camera transition using Phaser tween
    MainEngine.current_scene.tweens.add({
      targets: { x: startX, y: startY },
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Linear',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const value = tween.getValue();
        const currentX = (value as any).x;
        const currentY = (value as any).y;

        // Update camera position
        camera.setScroll(currentX - camera.width / 2, currentY - camera.height / 2);
      },
      onComplete: () => {
        // Ensure final position is exact
        camera.setScroll(targetX - camera.width / 2, targetY - camera.height / 2);

        // Resume entities (like Java setentitiespaused(false))
        MainEngine.setEntitiesPaused(false);
        MainEngine.screenTransitioning = false;
      }
    });
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
          const playerX = player.getx() + (player.getHotW() / 2);
          const playerY = player.gety() + (player.getHotH() / 2);

          // Set camera to follow player (with same clamping as manual movement)
          MainEngine.setCameraPosition(playerX, playerY);
        }
        break;

      case 3: // Screen Transition mode (Golden Axe Warrior style)
        {
          MainEngine.handleScreenTransition();
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
      await tiledMap.startMap();

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
      player.setSpeed(100); // Reduced speed for better animation timing

      // Center camera on player initially
      const playerPixelX = player.getx();
      const playerPixelY = player.gety();

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

  // ============================================================================
  // VGM AUDIO SYSTEM (delegated to VGMPlayerAPI)
  // ============================================================================

  /**
   * Load VGM asset (similar to this.load.audio pattern)
   * @param key Asset key for later playback
   * @param filePath Path to VGM file
   */
  public static async loadVGM(key: string, filePath: string): Promise<any> {
    return await VGMPlayerAPI.loadVGM(key, filePath);
  }

  /**
   * Play VGM music by key (MainEngine.playmusic pattern)
   * @param key Asset key of the VGM to play
   */
  public static playmusic(key: string): boolean {
    return VGMPlayerAPI.playMusic(key);
  }

  /**
   * Stop VGM music playback
   */
  public static stopmusic(): void {
    VGMPlayerAPI.stopMusic();
  }

  /**
   * Check if VGM music is currently playing
   */
  public static isVGMPlaying(): boolean {
    return VGMPlayerAPI.isPlaying();
  }

  /**
   * Resume VGM audio context (call on user interaction)
   */
  public static resumeVGMAudio(): void {
    VGMPlayerAPI.resumeAudio();
  }

  // Graphics methods for UI drawing (like Java screen.rect/rectfill)
  private static uiGraphics: Phaser.GameObjects.Graphics | null = null;
  private static uiTexts: Phaser.GameObjects.Text[] = [];

  /**
   * Initialize UI graphics object for drawing rectangles
   */
  private static ensureUIGraphics(): Phaser.GameObjects.Graphics | null {
    if (!MainEngine.current_scene) {
      console.error('MainEngine: No current scene for UI graphics');
      return null;
    }

    // Check if existing graphics belongs to a different scene or is destroyed
    if (MainEngine.uiGraphics && (!MainEngine.uiGraphics.scene || MainEngine.uiGraphics.scene !== MainEngine.current_scene)) {
      MainEngine.uiGraphics = null;
    }

    if (!MainEngine.uiGraphics) {
      MainEngine.uiGraphics = MainEngine.current_scene.add.graphics();
      MainEngine.uiGraphics.setScrollFactor(0); // UI elements don't scroll with camera
      MainEngine.uiGraphics.setDepth(1000); // High depth to render on top
    }
    return MainEngine.uiGraphics;
  }

  /**
   * Clear all UI graphics (but keep text)
   */
  public static clearUIGraphics(): void {
    const graphics = MainEngine.ensureUIGraphics();
    if (graphics) {
      graphics.clear();
    }
  }

  /**
   * Clear all UI text objects
   */
  public static clearUITexts(): void {
    MainEngine.uiTexts.forEach(text => {
      if (text && text.scene) {
        text.destroy();
      }
    });
    MainEngine.uiTexts = [];
  }

  /**
   * Draw filled rectangle (Java screen.rectfill equivalent)
   * @param x1 Left coordinate
   * @param y1 Top coordinate
   * @param x2 Right coordinate
   * @param y2 Bottom coordinate
   * @param color RGB color object {r, g, b}
   */
  public static rectfill(x1: number, y1: number, x2: number, y2: number, color: {r: number, g: number, b: number}): void {
    const graphics = MainEngine.ensureUIGraphics();
    if (!graphics) return;

    const hexColor = (color.r << 16) | (color.g << 8) | color.b;
    graphics.fillStyle(hexColor, 1);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    graphics.fillRect(left, top, width, height);
  }

  /**
   * Draw rectangle outline (Java screen.rect equivalent)
   * @param x1 Left coordinate
   * @param y1 Top coordinate
   * @param x2 Right coordinate
   * @param y2 Bottom coordinate
   * @param color RGB color object {r, g, b}
   */
  public static rect(x1: number, y1: number, x2: number, y2: number, color: {r: number, g: number, b: number}): void {
    const graphics = MainEngine.ensureUIGraphics();
    if (!graphics) return;

    const hexColor = (color.r << 16) | (color.g << 8) | color.b;
    graphics.lineStyle(1, hexColor, 1);

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1) + 1;
    const height = Math.abs(y2 - y1) + 1;

    graphics.strokeRect(left, top, width, height);
  }

  /**
   * Print text string (Java screen.printString equivalent)
   * @param x X coordinate
   * @param y Y coordinate
   * @param fontStyle Font style (ignored for now, uses default)
   * @param text Text to display
   * @param color Optional color (default: white)
   */
  public static printString(x: number, y: number, fontStyle: any, text: string, color?: {r: number, g: number, b: number}): void {
    if (!MainEngine.current_scene) return;

    const hexColor = color ? ((color.r << 16) | (color.g << 8) | color.b) : 0xffffff;

    const textObj = MainEngine.current_scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: `#${hexColor.toString(16).padStart(6, '0')}`
    });

    textObj.setScrollFactor(0); // UI text doesn't scroll with camera
    textObj.setDepth(1001); // Higher than UI graphics

    // Track text objects for cleanup
    MainEngine.uiTexts.push(textObj);
  }

  /**
   * Clean up UI graphics when scene changes
   */
  public static cleanup(): void {
    if (MainEngine.uiGraphics) {
      MainEngine.uiGraphics.destroy();
      MainEngine.uiGraphics = null;
    }

    MainEngine.clearUITexts();

    MainEngine.entities = [];
    MainEngine.numentities = 0;
    MainEngine.player = -1;
    MainEngine.myself = null;
    MainEngine.current_map = null;
    MainEngine.current_scene = null;
    MainEngine.current_config = null;
    MainEngine.cameratracking = 0;
    MainEngine.entitiespaused = false;
    MainEngine.screenTransitioning = false;
  }
}