/**
 * Entity System
 * TypeScript port of Java Entity.java and EntityImpl.java
 * Manages characters, NPCs, and moving objects in the game world
 */

import { CHR } from './CHR';

// Direction constants (matching Java Entity interface)
export const EntityDirection = {
  NORTH: 1,
  SOUTH: 2,
  WEST: 3,
  EAST: 4,
  NW: 5,
  NE: 6,
  SW: 7,
  SE: 8
} as const;

export type Direction = typeof EntityDirection[keyof typeof EntityDirection];

export interface EntityProperties {
  autoface?: boolean;
  face: number;
  activationEvent?: string;
  chrname?: string;
  obstruction?: boolean;
  obstructable?: boolean;
  speed?: number;
  movecode?: number;
  wanderDelay?: number;
  wx1?: number;
  wy1?: number;
  wx2?: number;
  wy2?: number;
}

export class Entity {
  // Position (in pixels, but getters return tile coordinates)
  private x: number = 0;
  private y: number = 0;

  // Entity properties
  private id: number = 0;
  private name: string = '';
  private index: number = 0;
  private visible: boolean = true;
  private active: boolean = true;

  // Movement properties
  private waypointx: number = 0;
  private waypointy: number = 0;
  private speedct: number = 0;
  private delay: number = 0;
  private framect: number = 0;
  private specframe: number = -1;
  private frame: number = 0;
  private idleTimer: number = 0;

  // Character rendering
  private chr: CHR | null = null;
  private chrname: string = '';
  private sprite: Phaser.GameObjects.Sprite | null = null;

  // Entity properties
  private properties: EntityProperties = {
    autoface: true,
    obstruction: true,
    obstructable: true,
    speed: 100,
    movecode: 0,
    face: EntityDirection.SOUTH
  };

  // Movement and following
  private follower: Entity | null = null;
  private follow: Entity | null = null;

  // Wander movement state
  private wanderDelayCount: number = 0;

  constructor(x: number, y: number, chrname: string = '') {
    this.setxy(x*16, y*16);
    this.chrname = chrname;
    this.properties.chrname = chrname;
  }

  /**
   * Initialize entity sprite in Phaser scene
   */
  public async initSprite(scene: Phaser.Scene, depth?: number, basePath?: string): Promise<void> {
    if (this.chrname && !this.chr && basePath) {
      this.chr = await CHR.loadChr(scene, this.chrname, basePath);

      // Create sprite
      if (this.chr && this.chr.getImageName()) {
        const imageKey = `chr-${this.chr.getImageName().replace('.png', '')}`;

        try {
          this.sprite = scene.add.sprite(this.x, this.y, imageKey);
          this.sprite.setOrigin(0, 0);

          // Set depth based on map's entity depth or use default
          const entityDepth = depth !== undefined ? depth : 5; // Default entity depth
          this.sprite.setDepth(entityDepth);

          // Set blend mode to handle transparency better
          this.sprite.setBlendMode(Phaser.BlendModes.NORMAL);

          // Set initial frame
          this.updateFrame();

          console.log(`Entity sprite created: ${this.chrname} at (${this.getx()}, ${this.gety()}) with depth ${entityDepth}`);
        } catch (error) {
          console.error(`Failed to create sprite for ${this.chrname}:`, error);
        }
      }
    }
  }

  /**
   * Update entity logic (called every frame)
   */
  public think(): void {
    if (!this.active) return;

    // Java-style speed accumulation system
    this.speedct += this.getSpeed();
    const numTicks = Math.floor(this.speedct / 100);
    this.speedct %= 100;

    // Execute movement ticks based on speed (but keep smooth pixel movement)
    for (let i = 0; i < numTicks; i++) {
      if (!this.ready()) {
        this.moveTick();
      } else {
        // Handle movement code when entity is ready (not currently moving)
        this.handleMovementCode();
      }
    }

    this.updateFrame();
  }

  /**
   * Handle movement code behavior when entity is ready
   */
  private handleMovementCode(): void {
    const movecode = this.properties.movecode || 0;

    switch (movecode) {
      case 2: // ENT_WANDERBOX - Wander within defined boundaries
        this.do_wanderbox();
        break;
      // Add other movement codes as needed
    }
  }

  /**
   * Wander movement within defined boundaries (movecode=2)
   * Port of Java EntityImpl.do_wanderbox()
   */
  private do_wanderbox(): void {
    const wanderDelay = this.getWanderDelay();

    // Increment delay counter
    this.wanderDelayCount++;

    // Only move when delay counter reaches wanderDelay
    if (this.wanderDelayCount >= wanderDelay) {
      this.wanderDelayCount = 0; // Reset counter

      // Get wander boundaries (default to small area around spawn if not set)
      const wx1 = this.getWx1() !== undefined ? this.getWx1()! : Math.floor(this.x / 16) - 1;
      const wy1 = this.getWy1() !== undefined ? this.getWy1()! : Math.floor(this.y / 16) - 1;
      const wx2 = this.getWx2() !== undefined ? this.getWx2()! : Math.floor(this.x / 16) + 1;
      const wy2 = this.getWy2() !== undefined ? this.getWy2()! : Math.floor(this.y / 16) + 1;

      // Choose random direction (0=north, 1=south, 2=west, 3=east)
      const direction = Math.floor(Math.random() * 4);
      let newX = Math.floor(this.x / 16);
      let newY = Math.floor(this.y / 16);

      switch (direction) {
        case 0: // North
          newY = Math.max(wy1, newY - 1);
          break;
        case 1: // South
          newY = Math.min(wy2, newY + 1);
          break;
        case 2: // West
          newX = Math.max(wx1, newX - 1);
          break;
        case 3: // East
          newX = Math.min(wx2, newX + 1);
          break;
      }

      // Only move if the new position is different and within bounds
      if ((newX !== Math.floor(this.x / 16) || newY !== Math.floor(this.y / 16)) &&
          newX >= wx1 && newX <= wx2 && newY >= wy1 && newY <= wy2) {
        this.setWaypoint(newX, newY);
      }
    }
  }

  /**
   * Move towards waypoint
   */
  private moveTick(): void {
    if (this.ready()) return;

    // Java-style tile-based movement: move 1 pixel per tick toward waypoint
    const dx = this.waypointx - this.x;
    const dy = this.waypointy - this.y;

    if (dx === 0 && dy === 0) {
      // Already at waypoint
      return;
    }

    // Move 1 pixel toward waypoint in each direction
    if (dx !== 0) {
      this.x += dx > 0 ? 1 : -1;
    }
    if (dy !== 0) {
      this.y += dy > 0 ? 1 : -1;
    }

    // Update facing direction if autoface is enabled
    if (this.properties.autoface) {
      this.updateFacing(dx, dy);
    }

    // Increment animation frame when moving (like Java move_tick)
    this.framect++;

    // Update sprite position - only render if entity is visible
    if (this.visible && this.sprite && this.chr) {
      const frameToUse = this.specframe >= 0 ? this.specframe : this.frame;
      // Only render if we have a valid frame number
      if (frameToUse !== undefined && frameToUse !== null && !isNaN(frameToUse)) {
        this.chr.render(this.sprite, this.x, this.y, frameToUse);
      }
    }
  }

  /**
   * Update facing direction based on movement
   */
  private updateFacing(dx: number, dy: number): void {
    // Always prioritize horizontal movement for diagonal directions
    if (dx !== 0) {
      // Any horizontal movement uses left/right animation
      this.properties.face = dx > 0 ? EntityDirection.EAST : EntityDirection.WEST;
    } else if (dy !== 0) {
      // Pure vertical movement only
      this.properties.face = dy > 0 ? EntityDirection.SOUTH : EntityDirection.NORTH;
    }
  }

  /**
   * Update animation frame based on direction and movement
   */
  private updateFrame(): void {
    if (!this.chr) return;

    if (this.specframe >= 0) {
      this.frame = this.specframe;
    } else {
      const direction = this.properties.face || EntityDirection.SOUTH;

      // Use Java logic: idle frame when ready, walking frame when moving
      if (this.ready()) {
        // Always show idle frame when not moving
        const idleFrames = this.chr.getIdle();
        this.frame = idleFrames[direction] || 0;
      } else {
        // Use walking animation frame when moving
        this.frame = this.chr.getFrame(direction, this.framect);
      }
    }


    // Update sprite frame - only render if entity is visible
    if (this.visible && this.sprite && this.chr) {
      const frameToUse = this.specframe >= 0 ? this.specframe : this.frame;
      // Only render if we have a valid frame number
      if (frameToUse !== undefined && frameToUse !== null && !isNaN(frameToUse)) {
        this.chr.render(this.sprite, this.x, this.y, frameToUse);
      }
    }
  }

  /**
   * Set waypoint for movement
   */
  public setWaypoint(x: number, y: number): void {
    this.waypointx = x * 16; // Convert tile to pixel coordinates
    this.waypointy = y * 16;
  }

  /**
   * Set waypoint relative to current position
   */
  public setWaypointRelative(x: number, y: number, changeface: boolean = true): void {
    // Convert pixel coordinates to tile coordinates for setWaypoint
    this.setWaypoint((this.getx() + x) / 16, (this.gety() + y) / 16);

    if (changeface && this.properties.autoface) {
      this.updateFacing(x, y);
    }
  }

  /**
   * Clear waypoints (stop movement)
   */
  public clearWaypoints(): void {
    this.waypointx = this.x;
    this.waypointy = this.y;
    this.delay = 0;
  }

  /**
   * Check if entity is ready (not moving)
   */
  public ready(): boolean {
    return this.x === this.waypointx && this.y === this.waypointy;
  }

  /**
   * Draw entity (called during render phase)
   */
  public draw(): void {
    if (!this.visible || !this.sprite || !this.chr) return;

    // Sprite is automatically rendered by Phaser
    // Just ensure it's positioned correctly
    const frameToUse = this.specframe >= 0 ? this.specframe : this.frame;
    // Only render if we have a valid frame number
    if (frameToUse !== undefined && frameToUse !== null && !isNaN(frameToUse)) {
      this.chr.render(this.sprite, this.x, this.y, frameToUse);
    }
  }

  // Position getters/setters return pixel coordinates
  public getx(): number { 
    return this.x; 
  }

  public gety(): number { 
    return this.y; 
  }

  public setx(x: number): void {
    this.x = x;
    this.clearWaypoints();
  }

  public sety(y: number): void {
    this.y = y;
    this.clearWaypoints();
  }

  public setxy(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.clearWaypoints();
  }

  public incx(amount: number = 1): void {
    this.x += amount;
  }

  public incy(amount: number = 1): void {
    this.y += amount;
  }


  // Waypoint getters
  public getWaypointx(): number { return Math.floor(this.waypointx / 16); }
  public getWaypointy(): number { return Math.floor(this.waypointy / 16); }

  // CHR and rendering
  public getChr(): CHR | null { return this.chr; }
  public getSprite(): Phaser.GameObjects.Sprite | null { return this.sprite; }
  public setChr(chr: CHR): void {
    this.chr = chr;
    // If sprite exists, recreate it with new CHR texture
    if (this.sprite && this.chr) {
      this.recreateSprite();
    } else if (!this.sprite && this.chr) {
      // Create sprite if it doesn't exist yet (async call, but don't await)
      this.createSpriteFromCHR().catch(error => {
        console.error('Entity: Failed to create sprite from CHR:', error);
      });
    }
  }

  /**
   * Create sprite from current CHR
   */
  private async createSpriteFromCHR(): Promise<void> {
    if (!this.chr) return;

    // Find the scene - we need to get the current scene
    const { MainEngine } = await import('../core/MainEngine');
    const currentScene = MainEngine.getCurrentScene();
    if (!currentScene) {
      console.error('Entity: No current scene to create sprite');
      return;
    }

    // Create sprite with CHR texture
    const textureKey = `chr-${this.chr.getImageName().replace('.png', '')}`;

    try {
      this.sprite = currentScene.add.sprite(this.x, this.y, textureKey);
      this.sprite.setOrigin(0, 0);
      this.sprite.setDepth(5); // Default entity depth

      console.log(`Entity: Created sprite with texture key: ${textureKey}`);
    } catch (error) {
      console.error(`Entity: Failed to create sprite with texture ${textureKey}:`, error);
    }
  }

  /**
   * Recreate sprite with current CHR texture
   */
  private recreateSprite(): void {
    if (!this.chr || !this.sprite) return;

    const scene = this.sprite.scene;

    // Guard against destroyed scene
    if (!scene || !scene.add) {
      console.log('Entity: Scene destroyed, skipping sprite recreation');
      this.sprite = null;
      return;
    }

    const currentX = this.sprite.x;
    const currentY = this.sprite.y;
    const currentDepth = this.sprite.depth;

    // Destroy old sprite
    this.sprite.destroy();

    // Create new sprite with CHR texture
    const textureKey = `chr-${this.chr.getImageName().replace('.png', '')}`;

    this.sprite = scene.add.sprite(currentX, currentY, textureKey);
    this.sprite.setDepth(currentDepth);
    this.sprite.setOrigin(0, 0);

    console.log(`Entity: Recreated sprite with texture key: ${textureKey}`);
  }
  public getChrname(): string { return this.chrname; }
  public setChrname(chrname: string): void { this.chrname = chrname; }

  // Properties
  public getFace(): number { return this.properties.face; }
  public setFace(direction: number): void {
    this.properties.face = direction;
    // Update frame to idle frame for new facing direction
    if (this.chr) {
      const idleFrames = this.chr.getIdle();
      this.frame = idleFrames[direction] || 0;
    }
  }

  public getSpeed(): number { return this.properties.speed || 100; }
  public setSpeed(speed: number): void { this.properties.speed = speed; }

  public isAutoface(): boolean { return this.properties.autoface || false; }
  public setAutoface(autoface: boolean): void { this.properties.autoface = autoface; }

  public getActivationScript(): string | undefined { return this.properties.activationEvent; }
  public setActivationScript(script: string): void { this.properties.activationEvent = script; }

  // Animation frame control
  public getFrame(): number { return this.frame; }
  public setFrame(frame: number): void { this.frame = frame; }
  public setSpecframe(frame: number): void { this.specframe = frame; }

  public isObstruction(): boolean { return this.properties.obstruction || false; }
  public setObstruction(obstruction: boolean): void { this.properties.obstruction = obstruction; }

  public isObstructable(): boolean { return this.properties.obstructable || false; }
  public setObstructable(obstructable: boolean): void { this.properties.obstructable = obstructable; }

  public getMovecode(): number { return this.properties.movecode || 0; }
  public setMovecode(movecode: number): void { this.properties.movecode = movecode; }

  // Wander properties
  public getWanderDelay(): number { return this.properties.wanderDelay || 60; }
  public setWanderDelay(delay: number): void { this.properties.wanderDelay = delay; }

  public getWx1(): number | undefined { return this.properties.wx1; }
  public setWx1(wx1: number): void { this.properties.wx1 = wx1; }

  public getWy1(): number | undefined { return this.properties.wy1; }
  public setWy1(wy1: number): void { this.properties.wy1 = wy1; }

  public getWx2(): number | undefined { return this.properties.wx2; }
  public setWx2(wx2: number): void { this.properties.wx2 = wx2; }

  public getWy2(): number | undefined { return this.properties.wy2; }
  public setWy2(wy2: number): void { this.properties.wy2 = wy2; }

  // Entity management
  public getIndex(): number { return this.index; }
  public setIndex(index: number): void { this.index = index; }

  public isActive(): boolean { return this.active; }
  public setActive(active: boolean): void { this.active = active; }

  public isVisible(): boolean { return this.visible; }
  public setVisible(visible: boolean): void { this.visible = visible; }

  public getId(): number { return this.id; }
  public setId(id: number): void { this.id = id; }

  public getName(): string { return this.name; }
  public setName(name: string): void { this.name = name; }

  // Hotspot (collision detection)
  public getHotX(): number { return this.chr ? this.chr.getHx() : 0; }
  public getHotY(): number { return this.chr ? this.chr.getHy() : 0; }
  public getHotW(): number { return this.chr ? this.chr.getHw() : 16; }
  public getHotH(): number { return this.chr ? this.chr.getHh() : 16; }

  // Following system
  public getFollower(): Entity | null { return this.follower; }
  public setFollower(follower: Entity | null): void { this.follower = follower; }

  /**
   * Make this entity stalk (follow) another entity
   * Direct port from Java EntityImpl.stalk()
   */
  public stalk(entity: Entity): void {
    this.follow = entity;
    entity.setFollower(this);

    // Set waypoint to current position
    this.setWaypoint(Math.floor(this.getx() / 16), Math.floor(this.gety() / 16));

    // Configure following behavior
    this.setMovecode(0);
    this.setObstruction(false);
    this.setObstructable(false);
    this.delay = 0;
  }

  /**
   * Clear stalking behavior
   * Direct port from Java EntityImpl.clear_stalk()
   */
  public clear_stalk(): void {
    if (this.follow !== null) {
      this.follow.setFollower(null);
      this.follow = null;
    }
  }

  /**
   * Stop all movement and clear stalking
   * Direct port from Java EntityImpl.setMotionless()
   */
  public setMotionless(): void {
    this.clear_stalk();
    this.clearWaypoints();
  }

  // Destroy entity and cleanup
  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.active = false;
  }
}