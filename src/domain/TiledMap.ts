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
  // Map properties
  private width: number = 30;
  private height: number = 20;
  private tilewidth: number = 16;
  private tileheight: number = 16;
  private filename: string = '';

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

  constructor(scene: Phaser.Scene, filename: string = '') {
    this.scene = scene;
    this.filename = filename;
  }

  /**
   * Load map from Tiled JSON file
   * Equivalent to Java MapTiledJSON.loadMap()
   */
  public static async loadMap(scene: Phaser.Scene, mapFilename: string): Promise<TiledMap> {
    const tiledMap = new TiledMap(scene, mapFilename);

    try {
      // Use the preloaded map data (loaded in preload() with key 'island-map')
      const mapKey = mapFilename.replace('.json', '').replace('.map', '');
      const cacheKey = mapKey === 'island' ? 'island-map' : mapKey;

      let mapData: MapData;

      if (scene.cache.json.exists(cacheKey)) {
        // Already loaded via preload
        mapData = scene.cache.json.get(cacheKey);
        console.log(`Using preloaded map data: ${cacheKey}`);
      } else {
        // Load manually as fallback
        const response = await fetch(`src/demos/${mapFilename}`);
        if (!response.ok) {
          throw new Error(`Failed to load map: ${mapFilename}`);
        }
        mapData = await response.json();
        console.log(`Loaded map data manually: ${mapFilename}`);
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

    // Set start position from map properties if available
    this.extractStartPosition();
  }

  /**
   * Create Phaser tilemap object
   */
  private createTilemap(): void {
    if (!this.mapData) return;

    // Use the preloaded map key from Demo1Scene
    const mapKey = 'island-map'; // This matches what Demo1Scene preloads

    // Create the tilemap using the preloaded data
    this.tilemap = this.scene.make.tilemap({ key: mapKey });

    if (!this.tilemap) {
      console.error('Failed to create tilemap from preloaded data');
      return;
    }

    console.log('Tilemap created from preloaded data:', {
      key: mapKey,
      width: this.tilemap.width,
      height: this.tilemap.height,
      layers: this.tilemap.layers?.length || 0,
      layerNames: this.tilemap.layers.map(l => l.name)
    });
  }

  /**
   * Load tilesets and create tileset images
   */
  private async loadTilesets(): Promise<void> {
    if (!this.mapData || !this.tilemap) return;

    // Use the preloaded tileset image from Demo1Scene
    const imageKey = 'beach-tileset'; // This matches what Demo1Scene preloads

    for (const tilesetData of this.mapData.tilesets) {
      // Add tileset to the tilemap using preloaded image
      this.tileset = this.tilemap.addTilesetImage(
        tilesetData.name,
        imageKey
      );

      if (!this.tileset) {
        console.error(`Failed to load tileset: ${tilesetData.name} with image: ${imageKey}`);
        // Try with the exact tileset name match
        this.tileset = this.tilemap.addTilesetImage(tilesetData.name, tilesetData.name);
      }

      if (this.tileset) {
        console.log(`Tileset loaded: ${tilesetData.name} -> ${imageKey}`);
        break; // Only need the first tileset for now
      }
    }
  }

  /**
   * Create map layers in the correct render order
   * Uses layer order from JSON and renderstring to determine entity placement
   */
  private createLayers(): void {
    if (!this.mapData || !this.tilemap || !this.tileset) return;

    // Parse renderstring to find entity position
    const entityLayerPosition = this.getEntityLayerPosition();

    // Create layers based on JSON order (which defines render order)
    let layerIndex = 0;
    for (const layerData of this.mapData.layers) {
      if (layerData.type === 'tilelayer' && layerData.visible) {
        const layer = this.tilemap.createLayer(layerData.name, this.tileset, 0, 0);

        if (layer) {
          // Set layer properties
          layer.setScale(1, 1); // Pixel perfect rendering
          if (layerData.opacity !== undefined && layerData.opacity < 1) {
            layer.setAlpha(layerData.opacity);
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

  /**
   * Get obstruction at pixel coordinates
   */
  public getObsPixel(x: number, y: number): boolean {
    const tileX = Math.floor(x / this.tilewidth);
    const tileY = Math.floor(y / this.tileheight);
    return this.getObs(tileX, tileY);
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
  }
}