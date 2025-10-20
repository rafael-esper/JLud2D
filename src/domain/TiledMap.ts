/**
 * TiledMap Class
 * TypeScript port of Java Map.java and MapTiledJSON.java
 * Handles Tiled JSON map loading, tileset management, and map rendering
 */

export interface LayerData {
  width: number;
  height: number;
  name: string;
  type: string;
  visible: boolean;
  data: number[];
  opacity?: number;
  properties?: any;
}

export interface AnimationFrame {
  duration: number;
  tileid: number;
}

export interface AnimatedTile {
  id: number;
  animation: AnimationFrame[];
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
  private static readonly META_LAYER = 1; // Meta layer offset from end
  private static readonly ZONE_OFFSET = 60; // Zone offset for tile IDs

  // Map properties
  private width: number = 30;
  private height: number = 20;
  private tilewidth: number = 16;
  private tileheight: number = 16;
  private filename: string = '';

  // Wrapping properties (from Java)
  private horizontalWrappable: boolean = false;
  private verticalWrappable: boolean = false;

  // Map data
  private mapData: MapData | null = null;

  // Phaser objects
  private scene: Phaser.Scene;
  private tilemap: Phaser.Tilemaps.Tilemap | null = null;
  private tileset: Phaser.Tilemaps.Tileset | null = null;
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
        // Already loaded via preload
        mapData = scene.cache.json.get(cacheKey);
      } else {
        // Load manually as fallback
        const response = await fetch(`${basePath}/${mapFilename}`);
        if (!response.ok) {
          throw new Error(`Failed to load map: ${mapFilename}`);
        }
        mapData = await response.json();
      }

      await tiledMap.loadFromData(mapData);

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

    // Create Phaser tilemap from JSON
    this.createTilemap();

    // Load tilesets and create tileset images
    await this.loadTilesets();

    // Create map layers
    this.createLayers();

    // Setup tile animations
    this.setupTileAnimations();

    // Set start position from map properties if available
    this.extractStartPosition();
  }

  /**
   * Create Phaser tilemap object
   */
  private createTilemap(): void {
    if (!this.mapData) return;

    // Use the correct map key based on filename
    const mapKey = this.filename.replace('.json', '').replace('.map', '');
    const cacheKey = `${mapKey}-map`;

    console.log(`Creating tilemap with key: ${cacheKey} for filename: ${this.filename}`);

    // Create the tilemap using the preloaded data
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

    // For backward compatibility, store the first tileset
    this.tileset = this.tilemap.tilesets[0] || null;
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
        const layer = this.tilemap.createLayer(layerData.name, this.tilemap.tilesets, 0, 0);

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
      } else if (layerData.type === 'objectgroup') {
        // Handle object layers (like Entities)
        console.log(`Found object layer: ${layerData.name} with ${layerData.objects?.length || 0} objects`);

        if (layerData.name === 'Entities') {
          // For now, just log the entities - full implementation would spawn them
          console.log('Entity objects found:', layerData.objects?.map(obj => ({
            name: obj.name,
            type: obj.type,
            x: obj.x,
            y: obj.y
          })));
        }
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
    return Math.floor(this.mapData?.layers.length / 2) || 1;
  }

  /**
   * Extract start position from map properties
   */
  private extractStartPosition(): void {
    if (!this.mapData) return;

    // Look for start position in map properties (Tiled format)
    if (this.mapData.properties) {
      // Tiled exports properties as an array of objects
      for (const prop of this.mapData.properties) {
        if (prop.name === 'startX') {
          this.startX = parseInt(prop.value) || this.startX;
        }
        if (prop.name === 'startY') {
          this.startY = parseInt(prop.value) || this.startY;
        }
      }
    }

    console.log(`Map start position: (${this.startX}, ${this.startY})`);
  }

  /**
   * Start map - equivalent to Java MapTiledJSON.startMap()
   * Sets up the map for gameplay
   */
  public startMap(): void {
    // Set as current map in MainEngine (will be implemented)
    // MainEngine.setCurrentMap(this);

    // Load entities from map if present
    this.loadMapEntities();

    // Call startup script if present
    this.callStartupScript();

    console.log(`TiledMap started: ${this.filename}`);
  }

  /**
   * Load entities from map data
   */
  private loadMapEntities(): void {
    if (!this.mapData) return;

    // Look for object layers containing entities
    for (const layer of this.mapData.layers) {
      if (layer.type === 'objectgroup') {
        // Process object layer for entities
        // This would spawn entities using MainEngine.entityspawn()
        console.log(`Found object layer: ${layer.name} - entity loading not yet implemented`);
      }
    }
  }

  /**
   * Call startup script if present
   */
  private callStartupScript(): void {
    if (!this.mapData) return;

    // Check for startup script in map properties
    if (this.mapData.properties && this.mapData.properties.startupscript) {
      console.log(`Startup script found: ${this.mapData.properties.startupscript} - script execution not yet implemented`);
    }
  }

  /**
   * Get tile at position for specific layer
   */
  public getTile(x: number, y: number, layerName: string): number {
    const layer = this.layers[layerName];
    if (!layer || x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return 0;
    }

    const tile = layer.getTileAt(x, y);
    return tile ? tile.index : 0;
  }

  /**
   * Set tile at position for specific layer
   */
  public setTile(x: number, y: number, layerName: string, tileIndex: number): void {
    const layer = this.layers[layerName];
    if (!layer || x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return;
    }

    layer.putTileAt(tileIndex, x, y);
  }

  /**
   * Check if position is obstructed
   * For now, simplified - could be enhanced with obstruction layers
   */
  public getObs(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return true; // Out of bounds is obstructed
    }

    // Could check specific obstruction tiles or layers
    // For now, assume no obstruction
    return false;
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
   * Get the depth at which entities should render
   * Based on renderstring position of 'E'
   */
  public getEntityDepth(): number {
    return this.getEntityLayerPosition();
  }

  /**
   * Get Phaser tilemap object
   */
  public getTilemap(): Phaser.Tilemaps.Tilemap | null {
    return this.tilemap;
  }

  /**
   * Get specific layer
   */
  public getLayer(name: string): Phaser.Tilemaps.TilemapLayer | null {
    return this.layers[name] || null;
  }

  /**
   * Get all layers
   */
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

    // Get tileset data with animations
    for (const tilesetData of this.mapData.tilesets) {
      if (!tilesetData.tiles) continue;

      // Create a map of animated tiles by their ID
      const animatedTileData: { [key: number]: AnimatedTile } = {};
      for (const animatedTile of tilesetData.tiles) {
        if (animatedTile.animation && animatedTile.animation.length > 0) {
          animatedTileData[animatedTile.id] = animatedTile;
        }
      }

      // Check each layer for animated tiles that are actually placed
      for (const layerName in this.layers) {
        const layer = this.layers[layerName];
        if (!layer) continue;

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

  }

  /**
   * Update tile animations - manually update tile indices
   */
  public updateAnimations(deltaTime: number = 16): void {
    if (this.animatedTiles.length === 0) return;

    // Update each animated tile
    for (const animatedTileData of this.animatedTiles) {
      if (!animatedTileData.tileAnimationData || animatedTileData.tileAnimationData.length === 0) continue;

      // Get the total animation duration of each tile
      const animationDuration = animatedTileData.tileAnimationData[0].duration * animatedTileData.tileAnimationData.length;

      // Update elapsed time
      animatedTileData.elapsedTime += deltaTime;
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
    if (!this.tilemap || !this.mapData) return 0;

    // Get layer by index
    const layerData = this.mapData.layers[layer];
    if (!layerData || layerData.type !== 'tilelayer') return 0;

    const phaserLayer = this.layers[layerData.name];
    if (!phaserLayer) return 0;

    const tile = phaserLayer.getTileAt(x, y);
    return tile ? tile.index : 0;
  }

  /**
   * Set tile ID at coordinates (equivalent to Java settile)
   * @param x Tile X coordinate
   * @param y Tile Y coordinate
   * @param layer Layer index (0 for first layer)
   * @param tileId New tile ID
   */
  public settile(x: number, y: number, layer: number, tileId: number): void {
    if (!this.tilemap || !this.mapData) return;

    // Get layer by index
    const layerData = this.mapData.layers[layer];
    if (!layerData || layerData.type !== 'tilelayer') return;

    const phaserLayer = this.layers[layerData.name];
    if (!phaserLayer) return;

    // Set the tile
    phaserLayer.putTileAt(tileId, x, y);
  }

  /**
   * Set obstacle at coordinates (equivalent to Java setobs)
   * @param x Tile X coordinate
   * @param y Tile Y coordinate
   * @param value Obstacle value (0 = no obstacle, non-zero = obstacle)
   */
  public setobs(x: number, y: number, value: number): void {
    if (!this.mapData) return;

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
   * Get obstacle at tile coordinates (Java getobs method)
   */
  public getobs(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.getWidth() || y >= this.getHeight()) {
      return true;
    }

    // Get tile from Meta layer (last layer minus META_LAYER offset)
    if (!this.mapData || !this.mapData.layers || this.mapData.layers.length === 0) {
      return false;
    }

    // Find the Meta layer by name instead of using offset calculation
    let metaLayerIndex = -1;
    for (let i = 0; i < this.mapData.layers.length; i++) {
      if (this.mapData.layers[i].name === 'Meta') {
        metaLayerIndex = i;
        break;
      }
    }

    if (metaLayerIndex === -1) {
      return false;
    }

    const t = this.gettile(x, y, metaLayerIndex);
    return this.isObs(t);
  }

  /**
   * Get obstacle at pixel coordinates (Java getobspixel method)
   */
  public getobspixel(x: number, y: number): boolean {
    // Handle wrapping for horizontal axis
    if (!this.getHorizontalWrappable() && (x < 0 || Math.floor(x / this.tilewidth) >= this.getWidth())) {
      return true;
    }

    // Handle wrapping for vertical axis
    if (!this.getVerticalWrappable() && (y < 0 || Math.floor(y / this.tileheight) >= this.getHeight())) {
      return true;
    }

    // Apply horizontal wrapping
    if (this.getHorizontalWrappable() && x < 0) {
      x += (this.getWidth() * this.tilewidth);
    }
    if (this.getHorizontalWrappable() && Math.floor(x / this.tilewidth) >= this.getWidth()) {
      x -= (this.getWidth() * this.tilewidth);
    }

    // Apply vertical wrapping
    if (this.getVerticalWrappable() && y < 0) {
      y += (this.getHeight() * this.tileheight);
    }
    if (this.getVerticalWrappable() && Math.floor(y / this.tileheight) >= this.getHeight()) {
      y -= (this.getHeight() * this.tileheight);
    }

    // Convert to tile coordinates
    const tileX = x >> 4; // x / 16
    const tileY = y >> 4; // y / 16

    // Get tile from Meta layer - use same approach as getobs method
    if (!this.mapData || !this.mapData.layers || this.mapData.layers.length === 0) {
      return false;
    }

    // Find the Meta layer by name (same as getobs method)
    let metaLayerIndex = -1;
    for (let i = 0; i < this.mapData.layers.length; i++) {
      if (this.mapData.layers[i].name === 'Meta') {
        metaLayerIndex = i;
        break;
      }
    }

    if (metaLayerIndex === -1) {
      return false;
    }

    const t = this.gettile(tileX, tileY, metaLayerIndex);
    if (!this.isObs(t)) {
      return false;
    }

    // For detailed pixel-level obstruction, would need Meta tileset GetObs method
    // For now, if tile is obstructed, entire tile is obstructed
    return true;
  }

  /**
   * Check if a tile ID represents an obstruction (Java isObs method)
   */
  private isObs(t: number): boolean {
    // If tile is 0 (empty), not obstructed
    if (t === 0) {
      return false;
    }

    const metaTileset = this.getMetaTileset();
    if (!metaTileset) {
      return false;
    }

    const firstGid = metaTileset.firstgid;

    // Check if tile is in Meta tileset range
    if (t >= firstGid) {
      // Tile is from Meta tileset - check if it's an obstruction tile
      const metaTileId = t - firstGid + 1; // Convert to 1-based tile ID within tileset
      const inRange = metaTileId >= 1 && metaTileId <= TiledMap.ZONE_OFFSET;
      return inRange;
    } else if (t > 0) {
      // Tile is from another tileset - assume any non-zero tile in Meta layer is an obstruction
      // This handles cases where Meta layer uses tiles from the main tileset for obstructions
      return true;
    }

    return false;
  }

  /**
   * Get the Meta tileset (equivalent to Java getMetaTileset)
   */
  private getMetaTileset(): TilesetData | null {
    if (!this.mapData || !this.mapData.tilesets) {
      return null;
    }

    // Find the Meta tileset - typically the last one or named "Meta"
    for (const tileset of this.mapData.tilesets) {
      if (tileset.name.toLowerCase().includes('meta')) {
        return tileset;
      }
    }

    // If no Meta tileset found by name, use the last tileset
    if (this.mapData.tilesets.length > 0) {
      return this.mapData.tilesets[this.mapData.tilesets.length - 1];
    }

    return null;
  }

  /**
   * Get horizontal wrapping property
   */
  public getHorizontalWrappable(): boolean {
    return this.horizontalWrappable;
  }

  /**
   * Get vertical wrapping property
   */
  public getVerticalWrappable(): boolean {
    return this.verticalWrappable;
  }

  /**
   * Set horizontal wrapping property
   */
  public setHorizontalWrappable(wrappable: boolean): void {
    this.horizontalWrappable = wrappable;
  }

  /**
   * Set vertical wrapping property
   */
  public setVerticalWrappable(wrappable: boolean): void {
    this.verticalWrappable = wrappable;
  }

  /**
   * Cleanup map resources
   */
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

    this.layers = {};
    this.mapData = null;
    this.animatedTiles = [];
    this.animatedTileCount = 0;
    this.obstructionMap.clear();
  }
}