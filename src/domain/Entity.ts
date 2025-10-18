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
  face?: number;
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

  constructor(x: number, y: number, chrname: string = '') {
    this.setxy(x, y);
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

    // Handle movement
    if (!this.ready()) {
      this.moveTick();
    }

    // Update animation frame
    this.framect++;
    this.updateFrame();
  }

  /**
   * Move towards waypoint
   */
  private moveTick(): void {
    if (this.ready()) return;

    // Speed is in pixels per second, convert to pixels per frame (assuming 60 FPS)
    const speed = this.properties.speed || 100;
    const pixelsPerFrame = speed / 60; // Much slower movement

    // Calculate direction to waypoint
    const dx = this.waypointx - this.x;
    const dy = this.waypointy - this.y;

    if (Math.abs(dx) <= pixelsPerFrame && Math.abs(dy) <= pixelsPerFrame) {
      // Close enough, snap to waypoint
      this.x = this.waypointx;
      this.y = this.waypointy;
      this.delay = 0;
    } else {
      // Move towards waypoint pixel by pixel
      if (dx !== 0) {
        this.x += dx > 0 ? pixelsPerFrame : -pixelsPerFrame;
      }
      if (dy !== 0) {
        this.y += dy > 0 ? pixelsPerFrame : -pixelsPerFrame;
      }

      // Update facing direction if autoface is enabled
      if (this.properties.autoface) {
        this.updateFacing(dx, dy);
      }
    }

    // Update sprite position
    if (this.sprite && this.chr) {
      this.chr.render(this.sprite, this.x, this.y, this.frame);
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
      this.frame = this.chr.getFrame(direction, this.framect);
    }

    // Update sprite frame
    if (this.sprite && this.chr) {
      this.chr.render(this.sprite, this.x, this.y, this.frame);
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
    this.setWaypoint(this.getx() + x, this.gety() + y);

    if (changeface && this.properties.autoface) {
      this.updateFacing(x * 16, y * 16);
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
    this.chr.render(this.sprite, this.x, this.y, this.frame);
  }

  // Position getters/setters (tile coordinates)
  public getx(): number { return Math.floor(this.x / 16); }
  public gety(): number { return Math.floor(this.y / 16); }

  public setx(x: number): void {
    this.x = x * 16;
    this.clearWaypoints();
  }

  public sety(y: number): void {
    this.y = y * 16;
    this.clearWaypoints();
  }

  public setxy(x: number, y: number): void {
    this.x = x * 16;
    this.y = y * 16;
    this.clearWaypoints();
  }

  public incx(amount: number = 1): void {
    this.x += amount * 16;
  }

  public incy(amount: number = 1): void {
    this.y += amount * 16;
  }

  // Pixel coordinates (for precise positioning)
  public getPixelX(): number { return this.x; }
  public getPixelY(): number { return this.y; }

  // Waypoint getters
  public getWaypointx(): number { return Math.floor(this.waypointx / 16); }
  public getWaypointy(): number { return Math.floor(this.waypointy / 16); }

  // CHR and rendering
  public getChr(): CHR | null { return this.chr; }
  public setChr(chr: CHR): void { this.chr = chr; }
  public getChrname(): string { return this.chrname; }
  public setChrname(chrname: string): void { this.chrname = chrname; }

  // Properties
  public getFace(): number { return this.properties.face || EntityDirection.SOUTH; }
  public setFace(direction: number): void { this.properties.face = direction; }

  public getSpeed(): number { return this.properties.speed || 100; }
  public setSpeed(speed: number): void { this.properties.speed = speed; }

  public isAutoface(): boolean { return this.properties.autoface || false; }
  public setAutoface(autoface: boolean): void { this.properties.autoface = autoface; }

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

  // Destroy entity and cleanup
  public destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.active = false;
  }
}