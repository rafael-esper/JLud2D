/**
 * Main Engine
 * TypeScript port of Java MainEngine.java
 * Manages entities, player controls, and core game systems
 */

import { Entity, EntityDirection } from '../domain/Entity';
import { VGMPlayerAPI } from './vgm/VGMPlayerAPI';
import { ScriptEngine } from './ScriptEngine';

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

  // Zone and event system (for PS demo)
  protected static px: number = 0; // Player tile X position
  protected static py: number = 0; // Player tile Y position
  protected static event_tx: number = 0; // Event trigger tile X
  protected static event_ty: number = 0; // Event trigger tile Y
  protected static event_zone: number = 0; // Current event zone
  protected static timer: number = 0; // System timer
  protected static lastentitythink: number = 0; // Last entity think time
  protected static systemtime: number = 0; // Current system time
  protected static done: boolean = false; // Game done flag

  // System path for resource loading (like Java systemclass)
  protected static systemPath: string = '';


  /**
   * Set system path for resource loading (like Java setSystemPath)
   */
  public static setSystemPath(path: string): void {
    MainEngine.systemPath = path;
    console.log(`System path set to: ${path}`);
  }

  public static getSystemPath(): string {
    return MainEngine.systemPath;
  }

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

  public static async entityspawn(scene: Phaser.Scene, x: number, y: number, chrname: string, basePath: string): Promise<number> {
    return await MainEngine.AllocateEntity(scene, x, y, chrname, basePath);
  }

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

  public static setEntitiesPaused(paused: boolean): void {
    MainEngine.entitiespaused = paused;
  }

  /**
   * Set entities paused state with timing reset (port of Java setentitiespaused)
   * When resuming from pause, resets entity think timing to prevent time jumps
   * @param paused Whether to pause entities
   */
  public static setEntitiesPausedWithTiming(paused: boolean): void {
    MainEngine.entitiespaused = paused;
    if (!MainEngine.entitiespaused) {
      MainEngine.lastentitythink = MainEngine.systemtime;
    }
  }

  public static ProcessControls(inputManager: any): void {
    // Update input state from input manager
    MainEngine.up = inputManager.up;
    MainEngine.down = inputManager.down;
    MainEngine.left = inputManager.left;
    MainEngine.right = inputManager.right;

    // Debug movement blocking
    if (MainEngine.myself === null) {
      return;
    }
    if (!MainEngine.myself.ready()) {
      return;
    }
    if (MainEngine.invc !== 0) {
      return;
    }

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

  public static RenderEntities(): void {
    // Sort entities by Y position for proper depth ordering
    const sortedEntities = [...MainEngine.entities].sort((a, b) => a.gety() - b.gety());

    for (const entity of sortedEntities) {
      if (entity.isActive() && entity.isVisible()) {
        entity.draw();
      }
    }
  }

  public static getPlayer(): Entity | null {
    return MainEngine.myself;
  }

  public static getCurrentMap(): any {
    return MainEngine.current_map;
  }

  public static getPlayerIndex(): number {
    return MainEngine.player;
  }

  public static getEntity(index: number): Entity | null {
    if (index < 0 || index >= MainEngine.numentities) {
      return null;
    }
    return MainEngine.entities[index];
  }

  public static getEntities(): Entity[] {
    return MainEngine.entities;
  }

  public static getEntityByIndex(index: number): Entity | null {
    if (index < 0 || index >= MainEngine.entities.length) {
      return null;
    }
    return MainEngine.entities[index];
  }

  public static getNumEntities(): number {
    return MainEngine.numentities;
  }

  public static getCameraTracking(): number {
    return MainEngine.cameratracking;
  }

  public static setCameraTracking(mode: number): void {
    MainEngine.cameratracking = mode;
  }

  public static setCurrentMap(map: any): void {
    MainEngine.current_map = map;
  }

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

  public static cleanup(): void {
    // Clear entities
    MainEngine.clearEntities();

    // Destroy map if it exists
    if (MainEngine.current_map && typeof MainEngine.current_map.destroy === 'function') {
      MainEngine.current_map.destroy();
    }
    MainEngine.current_map = null;

    // Reset other state
    MainEngine.current_scene = null;
    MainEngine.current_config = null;
    MainEngine.cameratracking = 0;
    MainEngine.entitiespaused = false;
    MainEngine.screenTransitioning = false;
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

  public static setCurrentScene(scene: Phaser.Scene, config: any): void {
    MainEngine.current_scene = scene;
    MainEngine.current_config = config;
  }

  public static getCurrentScene(): Phaser.Scene | null {
    return MainEngine.current_scene;
  }

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

      // Load script context for this map
      await MainEngine.loadScriptContextForMap(mapFilename, basePath);
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
    // Process timed entity updates and zone checking (for PS demo)
    MainEngine.TimedProcessEntities();

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

  public static setCameraSpeed(speed: number): void {
    MainEngine.cameraSpeed = speed;
  }

  public static getCameraSpeed(): number {
    return MainEngine.cameraSpeed;
  }



  public static CheckZone(): void {
    if (!MainEngine.current_map) return;

    const cur_timer = MainEngine.timer;
    const cz = MainEngine.current_map.getzone(MainEngine.px, MainEngine.py);

    if (cz > 0) {
      const percent = MainEngine.current_map.getPercentZone(cz);
      const script = MainEngine.current_map.getScriptZone(cz);

      // In the original system, 0 means 100% chance (always trigger)
      let actualPercent = percent;
      if (percent === 0) {
        actualPercent = 255; // 100% chance
      }

      const rnd = Math.floor(255 * Math.random());

      if (rnd < actualPercent) {
        MainEngine.event_zone = cz;
        MainEngine.callScriptFunction(script);
      }
    }
    MainEngine.timer = cur_timer;
  }

  /**
   * Timed entity processing with zone checking
   * Called from update loop
   */
  public static TimedProcessEntities(): void {
    if (MainEngine.entitiespaused) {
      console.log('TimedProcessEntities: Entities are paused');
      return;
    }

    // Update system time (in real implementation, this would be actual time)
    MainEngine.systemtime++;

    while (MainEngine.lastentitythink < MainEngine.systemtime) {
      if (MainEngine.done) break;

      if (MainEngine.myself !== null) {
        // Update player tile position from pixel position
        const hw = MainEngine.myself.getChr()?.getHw() || 16;
        const hh = MainEngine.myself.getChr()?.getHh() || 16;
        MainEngine.px = Math.floor((MainEngine.myself.getx() + (hw / 2)) / 16);
        MainEngine.py = Math.floor((MainEngine.myself.gety() + (hh / 2)) / 16);
      }

      MainEngine.updateEntities();

      if (MainEngine.invc === 0) {
        // Note: ProcessControls needs inputManager, will be called separately in updateEngine
        // MainEngine.ProcessControls();
      }

      if (MainEngine.myself !== null && MainEngine.invc === 0) {
        // Check if player has moved to a new tile
        const hw = MainEngine.myself.getChr()?.getHw() || 16;
        const hh = MainEngine.myself.getChr()?.getHh() || 16;
        const new_px = Math.floor((MainEngine.myself.getx() + (hw / 2)) / 16);
        const new_py = Math.floor((MainEngine.myself.gety() + (hh / 2)) / 16);

        if ((MainEngine.px !== new_px) || (MainEngine.py !== new_py)) {
          MainEngine.px = new_px;
          MainEngine.py = new_py;

          MainEngine.event_tx = MainEngine.px;
          MainEngine.event_ty = MainEngine.py;

          MainEngine.onStep();
          MainEngine.CheckZone();
          MainEngine.afterStep();
        }
      }
      MainEngine.lastentitythink++;
    }
  }

  public static onStep(): void {
    // Default implementation - override in city-specific scripts
  }

  public static afterStep(): void {
    // Default implementation - override in city-specific scripts
  }

  public static getPx(): number {
    return MainEngine.px;
  }

  public static getPy(): number {
    return MainEngine.py;
  }

  public static getEventZone(): number {
    return MainEngine.event_zone;
  }

  // Current script context (set by the current map/scene)
  protected static currentScriptContext: any = null;

  public static setScriptContext(context: any): void {
    MainEngine.currentScriptContext = context;
  }

  public static async loadScriptContextForMap(mapName: string, basePath: string): Promise<void> {
    try {
      // Extract map name without extension (e.g., "Camineet.map.json" -> "Camineet")
      const scriptName = mapName.replace('.map.json', '');

      // Construct the script path - same folder as the map
      const scriptPath = `${basePath}/${scriptName}`;

      console.log(`Loading script context from: ${scriptPath}`);

      // Dynamically import the script module
      const scriptModule = await import(scriptPath);

      // Look for a class with the same name as the script
      if (scriptModule[scriptName]) {
        MainEngine.setScriptContext(scriptModule[scriptName]);
        console.log(`Script context loaded: ${scriptName}`);
      } else {
        console.warn(`Script class ${scriptName} not found in module ${scriptPath}`);
      }
    } catch (error) {
      console.warn(`Could not load script context for map ${mapName}:`, error);
      // Clear script context if loading fails
      MainEngine.setScriptContext(null);
    }
  }

  /**
   * Call script function by name - generic script calling system
   */
  public static callScriptFunction(functionName: string): void {
    if (!functionName || functionName === "") {
      return;
    }

    console.log(`Calling script function: ${functionName}`);

    if (!MainEngine.currentScriptContext) {
      console.warn(`No script context set for function ${functionName}`);
      return;
    }

    try {
      // Check if the function exists in the current script context
      if (typeof MainEngine.currentScriptContext[functionName] === 'function') {
        console.log(`Executing ${functionName}()`);
        MainEngine.currentScriptContext[functionName]();
      } else {
        console.warn(`Function ${functionName} not found in current script context`);
      }
    } catch (error) {
      console.error(`Error calling script function ${functionName}:`, error);
    }
  }

  /**
   * Engine restart with new map - port of Java engine_start()
   */
  public static async startEngine(mapname: string): Promise<void> {
    // Clear entities (equivalent to numentities = 0; entities.clear();)
    MainEngine.clearEntities();

    // Reset player references (equivalent to player = -1; myself = null;)
    // Already handled by clearEntities()

    // Reset window position (equivalent to xwin = ywin = 0;)
    // TODO: Implement when window/camera system is ready

    // Reset done flag (equivalent to done = false;)
    MainEngine.done = false;

    // Fix .map to .json (same logic as Java)
    if (mapname.toLowerCase().endsWith('.map')) {
      console.warn(`Warning: .map file instead of expected JSON: ${mapname}`);
      mapname = mapname
        .replace('.map', '.map.json')
        .replace('.Map', '.map.json')
        .replace('.MAP', '.map.json');
    }

    // Load and start the new map
    try {
      console.log(`MainEngine: Loading map ${mapname}`);

      // Import TiledMap here to avoid circular dependencies
      const { TiledMap } = await import('../domain/TiledMap');

      // Load the map (equivalent to MapTiledJSON.loadMap(mapname))
      const current_map = await TiledMap.loadMap(MainEngine.current_scene!, mapname, 'src/demos/ps/maps');

      if (current_map) {
        // Start the map (equivalent to current_map.startMap())
        await current_map.startMap();

        // Set current map reference
        MainEngine.setCurrentMap(current_map);

        // Load script context for this map
        await MainEngine.loadScriptContextForMap(mapname, 'src/demos/ps/maps');

        // Note: For PS demo, entities are unpaused after fadeIn completes in PSGame.fadeIn()
      }

    } catch (error) {
      console.error(`MainEngine: Failed to load map ${mapname}:`, error);
    }

    // Reset timer (equivalent to timer = 0;)
    MainEngine.timer = 0;

    // Reset entity timing (equivalent to lastentitythink = systemtime;)
    MainEngine.lastentitythink = MainEngine.systemtime;

    // Note: setEntitiesPaused(false) is called after map loads and entities are spawned

    // Debug: Log player state after map load
    console.log('MainEngine: After map load - player index:', MainEngine.player);
    console.log('MainEngine: After map load - myself:', MainEngine.myself);
    console.log('MainEngine: After map load - entities count:', MainEngine.entities.length);
    console.log('MainEngine: After map load - entitiespaused:', MainEngine.entitiespaused);
    console.log('MainEngine: After map load - done flag:', MainEngine.done);
    console.log('MainEngine: After map load - invc:', MainEngine.invc);
    if (MainEngine.myself) {
      console.log('MainEngine: After map load - player ready:', MainEngine.myself.ready());
    }
  }
}