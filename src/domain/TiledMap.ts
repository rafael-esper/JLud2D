/**
 * TiledMap Class
 * TypeScript port of Java Map.java and MapTiledJSON.java
 * Handles Tiled JSON map loading, tileset management, and map rendering
 */

import { GameSpeed } from '../config/GameSpeed';

export interface LayerData {
  width: number;
  height: number;
  name: string;
  type: string;
  visible: boolean;
  data: number[];
  opacity?: number;
  properties?: any;
  objects?: any[];
}

export interface AnimationFrame {
  duration: number;
  tileid: number;
}

export interface AnimatedTile {
  id: number;
  animation: AnimationFrame[];
  properties?: any;
}

export interface TilesetData {
  name: string;
  image: string;
  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  columns: number;
  margin?: number;
  spacing?: number;
  firstgid: number;
  tiles?: AnimatedTile[];
  // Java port: pixel-level obstruction data
  obsPixels?: Uint8Array;
}

export interface MapData {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  orientation: string;
  renderorder: string;
  layers: LayerData[];
  tilesets: TilesetData[];
  version: number;
  properties?: any;
}

export class TiledMap {
  // Java constants ported from MapTiledJSON.java
  private static readonly META_LAYER = 2; // Meta layer offset from end
  private static readonly ZONE_OFFSET = 19; // Obs offset for tile IDs
  private static readonly NUMOBS = 20; // Java Tileset.NUMOBS — meta tiles with per-pixel obs art

  // Per-pixel obstruction masks (Java Tileset.obsPixels), built once per meta tileset
  // image and shared across every map that references it (e.g. default.meta.png).
  private static obsPixelsCache: Map<string, Uint8Array> = new Map();

  // Map properties
  private width: number = 30;
  private height: number = 20;
  private tilewidth: number = 16;
  private tileheight: number = 16;
  private filename: string = '';

  // Wrapping properties (from Java)
  private horizontalWrappable: boolean = false;
  private verticalWrappable: boolean = false;

  // Wrap-around layer copies. Java's MapAbstract.blitLayer plots tiles with
  // mod arithmetic — past the end of a wrappable map it plots the beginning
  // again. The Phaser equivalent: duplicate the visual layers offset by one
  // full map width/height, so the camera (whose scroll stays within
  // [0, mapSize) — see MainEngine.setCameraPosition) never shows a boundary.
  private cacheKey: string = '';
  private wrapTilemaps: Phaser.Tilemaps.Tilemap[] = [];
  private wrapCopies: { [key: string]: Phaser.Tilemaps.TilemapLayer[] } = {};
  private wrapOffsetsCreated: Set<string> = new Set();

  // Map data
  private mapData: MapData | null = null;

  // Phaser objects
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private layers: { [key: string]: Phaser.Tilemaps.TilemapLayer | null } = {};

  // Map properties
  private startX: number = 22; // Default start position
  private startY: number = 13;
  private renderstring: string = "1,2,E,3,R"; // Default render order: Ground, Fringe, Entities, Over, Render

  // Animation system
  private animatedTiles: any[] = [];
  private animatedTileCount: number = 0;

  constructor(scene: Phaser.Scene, filename: string = '', private basePath: string) {
    this.scene = scene;
    this.filename = filename;
  }

  /**
   * Load map from Tiled JSON file
   * Equivalent to Java MapTiledJSON.loadMap()
   */
  public static async loadMap(scene: Phaser.Scene, mapFilename: string, basePath: string): Promise<TiledMap> {
    const tiledMap = new TiledMap(scene, mapFilename, basePath);

    try {
      // Use the preloaded map data - derive cache key from filename
      const mapKey = mapFilename.replace('.json', '').replace('.map', '');
      const cacheKey = `${mapKey}-map`;


      let mapData: MapData;

      if (scene.cache.json.exists(cacheKey)) {
        // Already loaded via preload (e.g. PSAssets warms the JSON cache).
        mapData = scene.cache.json.get(cacheKey);

        // loadFromData builds the map with scene.make.tilemap({ key }), which
        // reads Phaser's TILEMAP cache — a JSON-cache-only preload doesn't touch
        // it, so mirror the data across before it's needed.
        if (!scene.cache.tilemap.exists(cacheKey)) {
          scene.cache.tilemap.add(cacheKey, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData });
        }
      } else {
        // Load manually as fallback - need to properly register with Phaser
        const response = await fetch(`${basePath}/${mapFilename}`);
        if (!response.ok) {
          throw new Error(`Failed to load map: ${mapFilename}`);
        }
        mapData = await response.json();

        // Add to tilemap cache the way Phaser expects
        scene.cache.tilemap.add(cacheKey, { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData });

        // Also add to JSON cache for our debug info
        scene.cache.json.add(cacheKey, mapData);
      }

      // Work on a private copy: settile/setzone/setobs mutate the layer data at
      // runtime (opened dungeon doors etc.), and the cached object is shared by
      // every future load of this map — a door opened before a save would stay
      // open after loading. Java re-reads the map file on every mapswitch, so
      // per-instance state must start pristine.
      await tiledMap.loadFromData(structuredClone(mapData));

      console.log(`TiledMap loaded: ${mapFilename}`, {
        size: `${tiledMap.width}x${tiledMap.height}`,
        tileSize: `${tiledMap.tilewidth}x${tiledMap.tileheight}`,
        layers: Object.keys(tiledMap.layers).length,
        renderOrder: tiledMap.renderstring
      });

    } catch (error) {
      console.error('Error loading TiledMap:', error);
    }

    return tiledMap;
  }

  /**
   * Load map from JSON data
   */
  private async loadFromData(mapData: MapData): Promise<void> {
    this.mapData = mapData;
    this.width = mapData.width;
    this.height = mapData.height;
    this.tilewidth = mapData.tilewidth;
    this.tileheight = mapData.tileheight;

    // Set start position and renderString from map properties FIRST
    this.extractStartPosition();

    // Create Phaser tilemap from JSON
    this.createTilemap();

    // Load tilesets and create tileset images
    await this.loadTilesets();

    // Create map layers (now with correct renderString)
    this.createLayers();

    // Setup tile animations
    this.setupTileAnimations();
  }

  /**
   * Create Phaser tilemap object
   */
  private createTilemap(): void {
    if (!this.mapData) return;

    // Clear any existing tilemap to prevent layer contamination
    if (this.tilemap) {
      this.tilemap.destroy();
      this.tilemap = null;
    }

    // Reset animation system for new map
    this.animatedTiles = [];
    this.animatedTileCount = 0;

    // Use the correct map key based on filename
    const mapKey = this.filename.replace('.json', '').replace('.map', '');
    const cacheKey = `${mapKey}-map`;
    this.cacheKey = cacheKey; // kept for wrap-copy tilemaps (see ensureWrapCopies)

    console.log(`Creating tilemap with key: ${cacheKey} for filename: ${this.filename}`);

    // Debug: Check what's in the cache
    const cacheExists = this.scene.cache.json.exists(cacheKey);
    console.log(`Cache exists for ${cacheKey}: ${cacheExists}`);

    if (cacheExists) {
      const cachedData = this.scene.cache.json.get(cacheKey);
      console.log('Cached tilemap data:', {
        hasLayers: !!cachedData?.layers,
        layerCount: cachedData?.layers?.length || 0,
        layerNames: cachedData?.layers?.map((l: any) => l.name) || []
      });
    }

    // Create the tilemap - use key method for preloaded, data method for manually loaded
    this.tilemap = this.scene.make.tilemap({ key: cacheKey });

    if (!this.tilemap) {
      console.error(`Failed to create tilemap from preloaded data with key: ${cacheKey}`);
      return;
    }

    console.log('Tilemap created from preloaded data:', {
      key: cacheKey,
      width: this.tilemap.width,
      height: this.tilemap.height,
      layers: this.tilemap.layers?.length || 0,
      layerNames: this.tilemap.layers.map(l => l.name)
    });
  }

  /**
   * Load tilesets and automatically load tileset images from JSON
   */
  private async loadTilesets(): Promise<void> {
    if (!this.mapData || !this.tilemap) return;

    console.log(`Loading ${this.mapData.tilesets.length} tilesets:`, this.mapData.tilesets.map(t => ({ name: t.name, image: t.image, firstgid: t.firstgid })));

    for (const tilesetData of this.mapData.tilesets) {
      // Automatically determine image key from tileset image property
      const imageKey = `tileset-${tilesetData.image.replace('.png', '')}`;

      // Load the tileset image if not already loaded
      if (!this.scene.textures.exists(imageKey)) {
        console.log(`Loading tileset image: ${imageKey} from ${this.basePath}/${tilesetData.image}`);
        this.scene.load.image(imageKey, `${this.basePath}/${tilesetData.image}`);

        // Wait for the image to load
        await new Promise<void>((resolve, reject) => {
          const onComplete = () => {
            this.scene.load.off('complete', onComplete);
            this.scene.load.off('loaderror', onError);
            if (this.scene.textures.exists(imageKey)) {
              console.log(`Successfully loaded image: ${imageKey}`);
              resolve();
            } else {
              console.error(`Image loading completed but texture not found: ${imageKey}`);
              reject(new Error(`Failed to load ${imageKey}`));
            }
          };

          const onError = (event: any) => {
            console.error(`Failed to load image: ${imageKey}`, event);
            this.scene.load.off('complete', onComplete);
            this.scene.load.off('loaderror', onError);
            reject(new Error(`Failed to load ${imageKey}`));
          };

          this.scene.load.on('complete', onComplete);
          this.scene.load.on('loaderror', onError);
          this.scene.load.start();
        }).catch(error => {
          console.error(`Image loading failed for ${imageKey}:`, error);
          // Continue anyway to avoid blocking other tilesets
        });
      } else {
        console.log(`Image already exists: ${imageKey}`);
      }

      // Add tileset to the tilemap - Phaser automatically handles firstgid for combining tilesets
      console.log(`Adding tileset: name=${tilesetData.name}, imageKey=${imageKey}, firstgid=${tilesetData.firstgid}`);
      console.log(`Available textures:`, this.scene.textures.getTextureKeys().filter(k => k.includes('tileset')));

      const tileset = this.tilemap.addTilesetImage(
        tilesetData.name,
        imageKey,
        tilesetData.tilewidth,
        tilesetData.tileheight,
        tilesetData.margin,
        tilesetData.spacing
      );

      if (!tileset) {
        console.error(`Failed to load tileset: ${tilesetData.name} with image: ${imageKey}`);
        console.error(`Tilemap info:`, {
          width: this.tilemap.width,
          height: this.tilemap.height,
          tilesets: this.tilemap.tilesets.length,
          format: this.tilemap.format
        });
      } else {
        console.log(`Tileset loaded: ${tilesetData.name} -> ${imageKey} (firstgid: ${tilesetData.firstgid})`);
      }
    }

  }

  /**
   * Create map layers in the correct render order
   * Uses layer order from JSON and renderstring to determine entity placement
   */
  private createLayers(): void {
    if (!this.mapData || !this.tilemap) return;

    // Parse renderstring to find entity position
    const entityLayerPosition = this.getEntityLayerPosition();

    // Create layers based on JSON order (which defines render order)
    let layerIndex = 0;
    for (const layerData of this.mapData.layers) {
      if (layerData.type === 'tilelayer' && layerData.visible) {
        // Use all tilesets - Phaser automatically handles multiple tilesets based on firstgid
        // Phaser 4 createLayer returns TilemapLayer | TilemapGPULayer; this project
        // uses standard (non-GPU) layers, so narrow back to TilemapLayer.
        const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, 0, 0) as Phaser.Tilemaps.TilemapLayer | null;

        if (layer) {
          // Set layer properties
          layer.setScale(1, 1); // Pixel perfect rendering
          if (layerData.opacity !== undefined && layerData.opacity < 1) {
            layer.setAlpha(layerData.opacity);
          }

          // Hide Meta layer - it's for data access only, not rendering
          if (layerData.name === 'Meta') {
            layer.setVisible(false);
            console.log(`Meta layer created but hidden from rendering: ${layerData.name}`);
          }

          // Set depth based on layer position and entity layer position
          // Layers before entities get depth 0, 1, 2...
          // Entities get depth at entityLayerPosition
          // Layers after entities get depth entityLayerPosition + 1, entityLayerPosition + 2...
          let depth;
          if (layerIndex < entityLayerPosition) {
            depth = layerIndex;
          } else {
            depth = layerIndex + 1; // Skip entity depth
          }

          layer.setDepth(depth);

          // Store layer reference
          this.layers[layerData.name] = layer;

          console.log(`Created layer: ${layerData.name} (index: ${layerIndex}, depth: ${depth})`);
        } else {
          console.error(`Failed to create layer: ${layerData.name}`);
          this.layers[layerData.name] = null;
        }

        layerIndex++;
      }
    }

    console.log(`Layer rendering order: ${this.renderstring}`);
    console.log('Entity depth:', entityLayerPosition);
  }

  /**
   * Parse renderstring to find where entities should render
   * Examples: "1,2,E,3,R" -> entities at position 2 (after layers 1,2)
   */
  private getEntityLayerPosition(): number {
    const renderOrder = this.renderstring.split(',');
    let layerCount = 0;

    for (const item of renderOrder) {
      const trimmed = item.trim();
      if (trimmed === 'E') {
        return layerCount; // Entities render at this depth
      } else if (trimmed !== 'R' && !isNaN(parseInt(trimmed))) {
        layerCount++; // Count numeric layers before entities
      }
    }

    // If no 'E' found, default to middle of layers
    return Math.floor((this.mapData ? this.mapData.layers.length : 0) / 2) || 1;
  }

  /**
   * Extract start position from map properties
   */
  private extractStartPosition(): void {
    if (!this.mapData) return;

    // Look for start position and render order in map properties (Tiled format)
    if (this.mapData.properties) {
      // Tiled exports properties as an array of objects
      for (const prop of this.mapData.properties) {
        if (prop.name === 'startX') {
          this.startX = parseInt(prop.value) || this.startX;
        }
        if (prop.name === 'startY') {
          this.startY = parseInt(prop.value) || this.startY;
        }
        if (prop.name === 'renderString') {
          this.renderstring = prop.value || this.renderstring;
          console.log(`Map renderString found: ${this.renderstring}`);
        }
      }
    }

    console.log(`Map start position: (${this.startX}, ${this.startY})`);
  }

  /**
   * Sets up the map for gameplay
   */
  public async startMap(): Promise<void> {
    await this.loadMapEntities();
    this.callStartupScript();
    console.log(`TiledMap started: ${this.filename}`);
  }

  private async loadMapEntities(): Promise<void> {
    if (!this.mapData) return;

    // Import MainEngine here to avoid circular dependencies
    const { MainEngine } = await import('../core/MainEngine');

    // Look for object layers containing entities
    if (!this.mapData || !this.mapData.layers) return;

    for (const layer of this.mapData.layers) {
      if (layer.type === 'objectgroup' && layer.objects) {
        console.log(`Processing object layer: ${layer.name} with ${layer.objects.length} objects`);

        for (const obj of layer.objects) {
          // Extract entity properties
          const properties: any = {};
          if (obj.properties) {
            for (const prop of obj.properties) {
              properties[prop.name] = prop.value;
            }
          }

          // Check if this object has a chrname (making it an entity)
          if (properties.chrname) {
            // Convert pixel coordinates to tile coordinates (matching Java logic)
            const tileX = Math.floor(obj.x / this.tilewidth);
            const tileY = Math.floor(obj.y / this.tileheight);

            console.log(`Creating entity: ${obj.name} at (${tileX}, ${tileY}) with chr: ${properties.chrname}`);

            try {
              // Spawn entity using MainEngine (no CHR loading yet)
              const entityIndex = await MainEngine.AllocateEntity(
                this.scene,
                tileX,
                tileY,
                '', // Empty chrname to avoid CHR loading
                this.basePath
              );

              const entity = MainEngine.getEntityByIndex(entityIndex);
              if (entity) {
                // Set the name from Tiled map object
                if (obj.name) entity.setName(obj.name);

                // Set the chrname for later CHR assignment
                entity.setChrname(properties.chrname);

                // Set entity properties from map data
                if (properties.face !== undefined) entity.setFace(properties.face);
                if (properties.speed !== undefined) entity.setSpeed(properties.speed);
                if (properties.autoface !== undefined) entity.setAutoface(properties.autoface);
                if (properties.activationEvent !== undefined) entity.setActivationScript(properties.activationEvent);
                if (properties.obstruction !== undefined) entity.setObstruction(properties.obstruction);
                if (properties.obstructable !== undefined) entity.setObstructable(properties.obstructable);
                if (properties.movecode !== undefined) entity.setMovecode(properties.movecode);
                if (properties.wanderDelay !== undefined) entity.setWanderDelay(properties.wanderDelay);
                if (properties.wx1 !== undefined) entity.setWx1(properties.wx1);
                if (properties.wy1 !== undefined) entity.setWy1(properties.wy1);
                if (properties.wx2 !== undefined) entity.setWx2(properties.wx2);
                if (properties.wy2 !== undefined) entity.setWy2(properties.wy2);

                // Convert back to pixel coordinates (matching Java: e.setx(e.getx()*tilewidth))
                entity.setxy(tileX * this.tilewidth, tileY * this.tileheight);

                // Load CHR sprite for the entity using the map's basePath (includes /maps folder)
                await entity.initSprite(this.scene, this.getEntityDepth(), this.basePath);

                console.log(`Entity ${entityIndex} created successfully:`, {
                  chrname: properties.chrname,
                  position: `(${entity.getx()}, ${entity.gety()})`,
                  face: entity.getFace(),
                  speed: entity.getSpeed()
                });
              }
            } catch (error) {
              console.error(`Failed to create entity ${obj.name}:`, error);
            }
          }
        }
      }
    }
  }

  private callStartupScript(): void {
    if (!this.mapData) return;

    // Check for startup script in map properties
    if (this.mapData.properties && this.mapData.properties.startupscript) {
      console.log(`Startup script found: ${this.mapData.properties.startupscript} - script execution not yet implemented`);
    }
  }

  public getTile(x: number, y: number, layerName: string): number {
    const layer = this.layers[layerName];
    if (!layer || x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return 0;
    }

    const tile = layer.getTileAt(x, y);
    return tile ? tile.index : 0;
  }

  // Getters
  public getWidth(): number { return this.width; }
  public getHeight(): number { return this.height; }
  public getTileWidth(): number { return this.tilewidth; }
  public getTileHeight(): number { return this.tileheight; }
  public getStartX(): number { return this.startX; }
  public getStartY(): number { return this.startY; }
  public getFilename(): string { return this.filename; }
  public getRenderstring(): string { return this.renderstring; }

  /**
   * Change the layer/entity render order at runtime — Java Map.setRenderstring.
   * Scripts use it to move an overhead layer below the player, e.g. the
   * spaceship launch: "1,E,2,R" → "1,2,E,R" so the rising ship draws over the
   * spaceport. Re-stacks the created tile layers (and their wrap copies) with
   * the same depth rule as createLayers; entities pick up the new base depth
   * on the next RenderEntities pass (it re-reads getEntityDepth every frame).
   */
  public setRenderstring(renderstring: string): void {
    this.renderstring = renderstring;
    if (!this.mapData) return;

    const entityLayerPosition = this.getEntityLayerPosition();
    let layerIndex = 0;
    for (const layerData of this.mapData.layers) {
      if (layerData.type !== 'tilelayer' || !layerData.visible) continue;

      const depth = layerIndex < entityLayerPosition ? layerIndex : layerIndex + 1;
      this.layers[layerData.name]?.setDepth(depth);
      for (const copy of this.wrapCopies[layerData.name] ?? []) {
        copy.setDepth(depth);
      }
      layerIndex++;
    }
  }

  // Setters for wrapping properties
  public isHorizontalWrappable(): boolean {
    return this.horizontalWrappable;
  }

  public isVerticalWrappable(): boolean {
    return this.verticalWrappable;
  }

  public setHorizontalWrappable(wrappable: boolean): void {
    this.horizontalWrappable = wrappable;
    if (wrappable) {
      this.ensureWrapCopies();
    }
  }

  public setVerticalWrappable(wrappable: boolean): void {
    this.verticalWrappable = wrappable;
    if (wrappable) {
      this.ensureWrapCopies();
    }
  }

  /**
   * Create the wrap-around layer copies needed by the current wrappable flags:
   * one copy shifted a full map width to the right (horizontal), one a full
   * map height down (vertical), and one diagonal copy when both wrap. Called
   * from the wrappable setters (map scripts set them in startmap); idempotent.
   */
  private ensureWrapCopies(): void {
    if (!this.mapData || !this.tilemap || !this.cacheKey) return;

    const pixelWidth = this.width * this.tilewidth;
    const pixelHeight = this.height * this.tileheight;

    const offsets: Array<[number, number]> = [];
    if (this.horizontalWrappable) offsets.push([pixelWidth, 0]);
    if (this.verticalWrappable) offsets.push([0, pixelHeight]);
    if (this.horizontalWrappable && this.verticalWrappable) offsets.push([pixelWidth, pixelHeight]);

    for (const [offsetX, offsetY] of offsets) {
      const offsetKey = `${offsetX},${offsetY}`;
      if (this.wrapOffsetsCreated.has(offsetKey)) continue;
      this.wrapOffsetsCreated.add(offsetKey);
      this.createWrapCopy(offsetX, offsetY);
    }
  }

  private createWrapCopy(offsetX: number, offsetY: number): void {
    if (!this.mapData) return;

    // A separate tilemap parses its own copy of the cached map data, so its
    // layers can be positioned independently of the originals.
    const tilemap = this.scene.make.tilemap({ key: this.cacheKey });
    if (!tilemap) {
      console.error(`TiledMap: Failed to create wrap-copy tilemap for ${this.cacheKey}`);
      return;
    }
    this.wrapTilemaps.push(tilemap);

    // Tileset images were already loaded for the original layers
    for (const tilesetData of this.mapData.tilesets) {
      const imageKey = `tileset-${tilesetData.image.replace('.png', '')}`;
      tilemap.addTilesetImage(
        tilesetData.name,
        imageKey,
        tilesetData.tilewidth,
        tilesetData.tileheight,
        tilesetData.margin,
        tilesetData.spacing
      );
    }

    for (const layerData of this.mapData.layers) {
      // Meta is data-only (hidden) — obstruction/zone lookups wrap by mod
      // arithmetic instead, so it needs no visual copy.
      if (layerData.type !== 'tilelayer' || !layerData.visible || layerData.name === 'Meta') {
        continue;
      }

      const original = this.layers[layerData.name];
      if (!original) continue;

      const copy = tilemap.createLayer(layerData.name, tilemap.tilesets, offsetX, offsetY) as Phaser.Tilemaps.TilemapLayer | null;
      if (!copy) {
        console.error(`TiledMap: Failed to create wrap copy of layer ${layerData.name}`);
        continue;
      }

      copy.setScale(1, 1);
      copy.setDepth(original.depth);
      copy.setAlpha(original.alpha);

      if (!this.wrapCopies[layerData.name]) {
        this.wrapCopies[layerData.name] = [];
      }
      this.wrapCopies[layerData.name].push(copy);

      // The copy has its own Tile objects: track its animated tiles so
      // updateAnimations() keeps both sides of the seam in sync.
      this.registerAnimatedTiles(copy);
    }

    console.log(`TiledMap: Wrap copy created at offset (${offsetX}, ${offsetY})`);
  }

  /**
   * Show or hide all tilemap layers
   * Used for dungeon maps where layers should never be visible
   */
  public setLayersVisible(visible: boolean): void {
    console.log(`TiledMap: Setting all layers visible=${visible}`);

    // Hide layers stored in the layers object
    for (const layerName in this.layers) {
      const layer = this.layers[layerName];
      if (layer) {
        console.log(`TiledMap: Setting layer "${layerName}" visible=${visible}`);
        layer.setVisible(visible);
      }
    }
  }

  /**
   * Get the depth at which entities should render
   * Based on renderstring position of 'E'
   */
  public getEntityDepth(): number {
    return this.getEntityLayerPosition();
  }

  public getTilemap(): Phaser.Tilemaps.Tilemap | null {
    return this.tilemap;
  }

  public getLayer(name: string): Phaser.Tilemaps.TilemapLayer | null {
    return this.layers[name] || null;
  }

  public getLayers(): { [key: string]: Phaser.Tilemaps.TilemapLayer | null } {
    return this.layers;
  }

  /**
   * Setup tile animations from tileset data
   * Find all animated tiles that are actually placed in the map
   */
  private setupTileAnimations(): void {
    if (!this.mapData || !this.tilemap) return;

    // Initialize animated tiles array
    this.animatedTiles = [];

    // Check each layer for animated tiles that are actually placed
    for (const layerName in this.layers) {
      const layer = this.layers[layerName];
      if (!layer) continue;
      this.registerAnimatedTiles(layer);
    }
  }

  /**
   * Scan a layer for tiles whose tileset defines an animation and add them to
   * the animated-tiles list. Used for the original layers and for the
   * wrap-around copies of wrappable maps.
   */
  private registerAnimatedTiles(layer: Phaser.Tilemaps.TilemapLayer): void {
    if (!this.mapData) return;

    for (const tilesetData of this.mapData.tilesets) {
      if (!tilesetData.tiles) continue;

      // Create a map of animated tiles by their ID
      const animatedTileData: { [key: number]: AnimatedTile } = {};
      for (const animatedTile of tilesetData.tiles) {
        if (animatedTile.animation && animatedTile.animation.length > 0) {
          animatedTileData[animatedTile.id] = animatedTile;
        }
      }

      // Check every tile in the layer
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          const tile = layer.getTileAt(x, y);
          if (!tile || tile.index === 0) continue;

          // Convert tile index to local tileset ID
          const localTileId = tile.index - tilesetData.firstgid;

          // Check if this tile has animation data
          if (animatedTileData[localTileId]) {
            const animatedTile = animatedTileData[localTileId];

            // Add to animated tiles array
            this.animatedTiles.push({
              tile: tile,
              tileAnimationData: animatedTile.animation,
              firstgid: tilesetData.firstgid,
              elapsedTime: 0
            });
          }
        }
      }
    }
  }

  /**
   * Update tile animations - manually update tile indices
   */
  public updateAnimations(deltaTime: number = 16): void {
    if (this.animatedTiles.length === 0) return;

    // Advance by real elapsed time scaled by the tile-animation factor, which
    // is deliberately slower than the entity/movement scale (tiles otherwise
    // run too fast). Normal ≈ the old Slow feel; see GameSpeed.MAP_ANIM_FACTOR.
    const scaledDelta = deltaTime * GameSpeed.mapAnimFactor();

    // Update each animated tile
    for (const animatedTileData of this.animatedTiles) {
      if (!animatedTileData.tileAnimationData || animatedTileData.tileAnimationData.length === 0) continue;

      // Get the total animation duration of each tile
      const animationDuration = animatedTileData.tileAnimationData[0].duration * animatedTileData.tileAnimationData.length;

      // Update elapsed time
      animatedTileData.elapsedTime += scaledDelta;
      animatedTileData.elapsedTime %= animationDuration;

      // Calculate current animation frame index
      const animationFrameIndex = Math.floor(animatedTileData.elapsedTime / animatedTileData.tileAnimationData[0].duration);

      // Ensure frame index is within bounds
      const frameIndex = Math.min(animationFrameIndex, animatedTileData.tileAnimationData.length - 1);

      // Update the tile index to the new frame
      const newTileId = animatedTileData.tileAnimationData[frameIndex].tileid + animatedTileData.firstgid;
      animatedTileData.tile.index = newTileId;
    }
  }

  /**
   * Start animations - setup animated tiles for manual updating
   */
  public startAnimations(): void {
    if (this.animatedTileCount > 0) {
      console.log(`Tile animations started: ${this.animatedTileCount} animated tiles found`);
    } else {
      console.log('No animated tiles found');
    }
  }

  /**
   * Stop animations - Phaser handles this automatically
   */
  public stopAnimations(): void {
    console.log('Tile animations will stop automatically when tilemap is destroyed');
  }

  /**
   * Get tile ID at coordinates (equivalent to Java gettile)
   * @param x Tile X coordinate
   * @param y Tile Y coordinate
   * @param layer Layer index (0 for first layer)
   * @returns Tile ID or 0 if no tile
   */
  public gettile(x: number, y: number, layer: number = 0): number {
    if (!this.tilemap || !this.mapData || !this.mapData.layers) return 0;

    // Get layer by index
    const layerData = this.mapData.layers[layer];
    if (!layerData || layerData.type !== 'tilelayer') return 0;

    const phaserLayer = this.layers[layerData.name];
    if (!phaserLayer) return 0;

    const tile = phaserLayer.getTileAt(x, y);
    return tile ? tile.index : 0;
  }

  /**
   * Set tile ID at coordinates 
   * @param x Tile X coordinate
   * @param y Tile Y coordinate
   * @param layer Layer index (0 for first layer)
   * @param index New tile index
   */
  public settile(x: number, y: number, layer: number, index: number): void {
    if (!this.mapData || !this.mapData.layers || layer >= this.mapData.layers.length) {
      return;
    }
    // Get layer by index
    const layerData = this.mapData.layers[layer];
    if (!layerData || layerData.type !== 'tilelayer' || !layerData.data) {
      return;
    }

    // Bounds check
    if (x < 0 || y < 0 || x >= layerData.width || y >= layerData.height) {
      return;
    }

    // Calculate array index
    const arrayIndex = y * layerData.width + x;

    // Apply Java logic: index == 0 ? 0: index+1
    const tileId = index === 0 ? 0 : index + 1;

    // Set directly in the data array (like setobs method)
    layerData.data[arrayIndex] = tileId;

    // Also update the Phaser layer if it exists (Meta layer is hidden anyway)
    const phaserLayer = this.layers[layerData.name];
    if (phaserLayer) {
      try {
        phaserLayer.putTileAt(tileId, x, y);
      } catch (error) {
        // Ignore Phaser layer update errors for Meta layer - raw data update is sufficient
      }
    }

    // Keep the wrap-around copies of wrappable maps in sync
    const copies = this.wrapCopies[layerData.name];
    if (copies) {
      for (const copy of copies) {
        try {
          copy.putTileAt(tileId, x, y);
        } catch (error) {
          // Same as above - raw data update is sufficient
        }
      }
    }
  }

  /**
   * Set obstacle at coordinates (equivalent to Java setobs)
   * @param x Tile X coordinate
   * @param y Tile Y coordinate
   * @param value Obstacle value (0 = no obstacle, non-zero = obstacle)
   */
  public setobs(x: number, y: number, value: number): void {
    if (!this.mapData || !this.mapData.layers) return;

    // Find the Meta layer by name
    let metaLayerData = null;
    for (const layer of this.mapData.layers) {
      if (layer.name === 'Meta') {
        metaLayerData = layer;
        break;
      }
    }

    if (!metaLayerData || metaLayerData.type !== 'tilelayer' || !metaLayerData.data) {
      return; // No Meta layer found
    }

    // Bounds check
    if (x < 0 || y < 0 || x >= metaLayerData.width || y >= metaLayerData.height) {
      return;
    }

    // Calculate array index (row-major order) and update the raw data
    const index = y * metaLayerData.width + x;
    metaLayerData.data[index] = value;

    // Also update the Phaser layer if it exists (Meta layer is hidden anyway)
    const phaserLayer = this.layers['Meta'];
    if (phaserLayer) {
      try {
        phaserLayer.putTileAt(value, x, y);
      } catch (error) {
        // Ignore Phaser layer update errors for Meta layer - raw data update is sufficient
      }
    }
  }

  // Add obstruction map for manual obstacle tracking
  private obstructionMap: Map<string, number> = new Map();


  /**
   * Resolve the Meta layer tile at (x, y), applying the same wrap-around
   * mod arithmetic as Java's MapTiledJSON.getobspixel. Returns null when the
   * coordinate is off an unwrappable edge (caller should treat that as blocked).
   */
  private resolveMetaTile(x: number, y: number): number | null {
    if (this.horizontalWrappable) {
      x = ((x % this.width) + this.width) % this.width;
    }
    if (this.verticalWrappable) {
      y = ((y % this.height) + this.height) % this.height;
    }
    if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) {
      return null;
    }

    if (!this.mapData || !this.mapData.layers || this.mapData.layers.length === 0) {
      return 0;
    }

    const metaLayerIndex = this.mapData.layers.length - TiledMap.META_LAYER;
    return this.gettile(x, y, metaLayerIndex);
  }

  /**
   * Get obstacle at tile coordinates (Java getobs method)
   */
  public getobs(x: number, y: number): boolean {
    const metaTile = this.resolveMetaTile(x, y);
    if (metaTile === null) {
      return true;
    }
    return this.isObs(metaTile);
  }

  /**
   * Get obstacle at pixel coordinates (Java getobspixel method)
   */
  public getobspixel(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.tilewidth);
    const tileY = Math.floor(y / this.tileheight);
    return this.getobs(tileX, tileY);
  }

  /**
   * For a diagonal step, checks whether the two tiles flanking the move
   * (reached by moving only X, or only Y — see MainEngine.ProcessControls)
   * actually cover the exact corner the player is cutting through. A meta
   * tile that's obstruction-flagged but only partially drawn (e.g. a "\" or
   * "/" diagonal wall, meta index 3/4) leaves two of its four corners open;
   * this samples the tileset artwork at that specific corner instead of
   * treating the whole tile as solid, so a diagonal step through the open
   * corner of such tiles isn't blocked the way a fully-solid tile would be.
   */
  public getDiagonalFlankObstruction(
    currentTileX: number,
    currentTileY: number,
    moveX: number,
    moveY: number
  ): { horizontalBlocked: boolean; verticalBlocked: boolean } {
    const targetTileX = currentTileX + moveX;
    const targetTileY = currentTileY + moveY;
    const tw = this.tilewidth;
    const th = this.tileheight;

    // The shared corner point sits on the "far" edge of each flanking tile
    // in the axis it moved along, and the "near" edge in the axis it didn't.
    const horizontalBlocked = this.isTileCornerObstructed(
      targetTileX, currentTileY,
      moveX > 0 ? 0 : tw - 1,
      moveY > 0 ? th - 1 : 0
    );
    const verticalBlocked = this.isTileCornerObstructed(
      currentTileX, targetTileY,
      moveX > 0 ? tw - 1 : 0,
      moveY > 0 ? 0 : th - 1
    );

    return { horizontalBlocked, verticalBlocked };
  }

  private isTileCornerObstructed(tileX: number, tileY: number, px: number, py: number): boolean {
    const metaTile = this.resolveMetaTile(tileX, tileY);
    if (metaTile === null) {
      return true;
    }
    if (!this.isObs(metaTile)) {
      return false;
    }

    const obsPixels = this.getMetaObsPixels();
    const firstGid = this.getMetaTileset().getFirstGid();
    const localTile = metaTile - firstGid;
    if (localTile <= 0) {
      return false;
    }
    if (!obsPixels || localTile >= TiledMap.NUMOBS) {
      return true; // no art data, or a zone-encoded obstruction — fail safe to full block
    }

    return obsPixels[localTile * this.tilewidth * this.tileheight + py * this.tilewidth + px] !== 0;
  }

  /**
   * Build (once per meta tileset image, cached across maps) a per-pixel
   * obstruction mask from the tileset artwork itself — Java's Tileset.loadTiles
   * treats any non-transparent pixel in the first NUMOBS tiles as obstructed.
   * Returns null until the tileset's texture has finished loading.
   */
  private getMetaObsPixels(): Uint8Array | null {
    const tilesetData = this.mapData ? this.mapData.tilesets[this.mapData.tilesets.length - 1] : null;
    if (!tilesetData) return null;

    const imageKey = `tileset-${tilesetData.image.replace('.png', '')}`;
    const cached = TiledMap.obsPixelsCache.get(imageKey);
    if (cached) return cached;

    if (!this.scene.textures.exists(imageKey)) return null;
    const source = this.scene.textures.get(imageKey).getSourceImage();
    if (!(source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)) return null;

    const canvas = document.createElement('canvas');
    canvas.width = tilesetData.imagewidth;
    canvas.height = tilesetData.imageheight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0);

    const { tilewidth, tileheight, columns, margin = 0, spacing = 0 } = tilesetData;
    const obsPixels = new Uint8Array(TiledMap.NUMOBS * tilewidth * tileheight);

    for (let t = 0; t < TiledMap.NUMOBS; t++) {
      const tileX = margin + (t % columns) * (tilewidth + spacing);
      const tileY = margin + Math.floor(t / columns) * (tileheight + spacing);
      const imageData = ctx.getImageData(tileX, tileY, tilewidth, tileheight).data;
      for (let py = 0; py < tileheight; py++) {
        for (let px = 0; px < tilewidth; px++) {
          const alpha = imageData[(py * tilewidth + px) * 4 + 3];
          obsPixels[t * tilewidth * tileheight + py * tilewidth + px] = alpha === 0 ? 0 : 1;
        }
      }
    }

    TiledMap.obsPixelsCache.set(imageKey, obsPixels);
    return obsPixels;
  }

  public isObs(t: number): boolean {
       const firstGid = this.getMetaTileset().getFirstGid();
       // Check if tile is in obstruction range (firstGid + 1 to firstGid + ZONE_OFFSET)
       if (t >= firstGid + 1 && t <= firstGid + TiledMap.ZONE_OFFSET) {
        return true;
       }

       // Check if it's a zone tile with method 1 (obstruction method)
       if (this.isZone(t) && this.isObstructionZone(this.tileToZone(t))) {
        return true;
       }

       return false;
  }

  private isZone(t: number): boolean {
    const tZone = this.tileToZone(t);
    if (tZone > 0) {
      return true;
    }
    return false;
  }

  private tileToZone(t: number): number {
    const firstGid = this.getMetaTileset().getFirstGid();
    return (t - firstGid - TiledMap.ZONE_OFFSET);
  }

  private zoneToTile(zone: number): number {
    if (zone === 0) {
      return 0;
    }
    const firstGid = this.getMetaTileset().getFirstGid();
    return (zone + firstGid + TiledMap.ZONE_OFFSET);
  }

  private isObstructionZone(zone: number): boolean {
    const tileId = this.zoneToTile(zone);
    return this.getTileProperty(tileId, "isObstruction") === true;
  }

  private getTileProperty(tileId: number, propertyName: string): any {
    if (!this.mapData || !this.mapData.tilesets) {
      return 0;
    }

    // Find which tileset contains this tile ID
    for (const tileset of this.mapData.tilesets) {
      if (tileId >= tileset.firstgid && tileId < tileset.firstgid + tileset.tilecount) {
        // Get local tile ID within this tileset
        const localTileId = tileId - tileset.firstgid;

        // Check if tileset has tile properties
        if (tileset.tiles) {
          for (const tile of tileset.tiles) {
            if (tile.id === localTileId && tile.properties) {
              // Find the property
              for (const prop of tile.properties) {
                if (prop.name === propertyName) {
                  return prop.value;
                }
              }
            }
          }
        }
        break; // Found the tileset, no need to continue
      }
    }

    return 0;
  }

  private getMetaTileset(): { getFirstGid(): number } {
    // The meta tileset should be the last tileset
    const lastTileset = this.mapData ? this.mapData.tilesets[this.mapData.tilesets.length - 1] : null;

    return {
      getFirstGid: () => lastTileset ? lastTileset.firstgid : 1
    };
  }

  public getzone(x: number, y: number): number {
    // Same wrap-around as getobs: past the edge means the opposite side
    if (this.horizontalWrappable) {
      x = ((x % this.width) + this.width) % this.width;
    }
    if (this.verticalWrappable) {
      y = ((y % this.height) + this.height) % this.height;
    }
    if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) {
      return 0;
    }

    if (!this.mapData || !this.mapData.layers) return 0;

    const metaLayerIndex = this.mapData.layers.length - TiledMap.META_LAYER;
    if (metaLayerIndex < 0 || metaLayerIndex >= this.mapData.layers.length) {
      return 0;
    }

    const t = this.gettile(x, y, metaLayerIndex);

    // If it's a zone tile, return the zone number
    if (this.isZone(t)) {
      return this.tileToZone(t);
    }

    return 0; // No zone
  }

  public setzone(x: number, y: number, z: number): void {
    if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) {
      return;
    }
    if (!this.mapData || !this.mapData.layers) return;

    const metaLayerIndex = this.mapData.layers.length - TiledMap.META_LAYER;
    const layerData = this.mapData.layers[metaLayerIndex];
    if (!layerData || layerData.type !== 'tilelayer' || !layerData.data) return;

    // Write the raw tile id directly (bypassing settile's generic "+1" tile-index
    // adjustment) — Java's setzone likewise writes straight to the layer instead of
    // going through the generic settile wrapper, since zoneToTile() already yields
    // the exact tile id.
    const arrayIndex = y * layerData.width + x;
    const tileId = z === 0 ? 0 : this.zoneToTile(z);
    layerData.data[arrayIndex] = tileId;

    const phaserLayer = this.layers[layerData.name];
    if (phaserLayer) {
      try {
        phaserLayer.putTileAt(tileId, x, y);
      } catch (error) {
        // Ignore Phaser layer update errors for Meta layer - raw data update is sufficient
      }
    }
  }

  public getScriptZone(zone: number): string {
    const tileId = this.zoneToTile(zone);
    return this.getTileProperty(tileId, "activationEvent") || "";
  }

  public getPercentZone(zone: number): number {
    const tileId = this.zoneToTile(zone);
    return this.getTileProperty(tileId, "activationChance") || 0;
  }

  public getMethodZone(zone: number): number {
    const tileId = this.zoneToTile(zone);
    return this.getTileProperty(tileId, "isObstruction") ? 1 : 0;
  }

  /**
   * Enable/disable a zone's stand-on trigger (equivalent to Java setMethodZone,
   * which flipped the zone's isObstruction property)
   */
  public setMethodZone(zone: number, value: boolean): void {
    const tileId = this.zoneToTile(zone);
    this.setTileProperty(tileId, "isObstruction", value);
  }

  private setTileProperty(tileId: number, propertyName: string, value: any): void {
    if (!this.mapData || !this.mapData.tilesets) {
      return;
    }

    for (const tileset of this.mapData.tilesets as any[]) {
      if (tileId >= tileset.firstgid && tileId < tileset.firstgid + tileset.tilecount) {
        const localTileId = tileId - tileset.firstgid;

        if (!tileset.tiles) {
          tileset.tiles = [];
        }
        let tile: any = tileset.tiles.find((t: any) => t.id === localTileId);
        if (!tile) {
          tile = { id: localTileId, properties: [] };
          tileset.tiles.push(tile);
        }
        if (!tile.properties) {
          tile.properties = [];
        }
        const prop = tile.properties.find((p: any) => p.name === propertyName);
        if (prop) {
          prop.value = value;
        } else {
          tile.properties.push({ name: propertyName, type: "bool", value });
        }
        return;
      }
    }
  }


  public destroy(): void {
    if (this.tilemap) {
      this.tilemap.destroy();
      this.tilemap = null;
    }

    for (const layerName in this.layers) {
      const layer = this.layers[layerName];
      if (layer) {
        layer.destroy();
      }
    }

    // Destroy wrap-around copies of wrappable maps
    for (const wrapTilemap of this.wrapTilemaps) {
      wrapTilemap.destroy();
    }
    this.wrapTilemaps = [];
    for (const layerName in this.wrapCopies) {
      for (const copy of this.wrapCopies[layerName]) {
        copy.destroy();
      }
    }
    this.wrapCopies = {};
    this.wrapOffsetsCreated.clear();

    this.layers = {};
    this.mapData = null;
    this.animatedTiles = [];
    this.animatedTileCount = 0;
    this.obstructionMap.clear();
  }
}