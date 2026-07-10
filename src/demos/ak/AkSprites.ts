/**
 * AkSprites - Alex Kidd Sprite System
 * Handles temporary sprites like rock fragments, bracelets, projectiles
 * Port of Java sprite system using Phaser sprites
 */

import { MainEngine } from '../../core/MainEngine';
import { Sound } from '../../domain/Sound';
import { AkActions } from './AkActions';

interface SpriteData {
  sprite: Phaser.GameObjects.Sprite | null;
  x: number;
  y: number;
  energy: number;
  type: number;
}

export class AkSprites {
  private static scene: Phaser.Scene | null = null;
  private static sprites: SpriteData[] = [];
  private static maxSprites = 25;

  // Sprite type constants
  static readonly ROCK_COMMON = 1;
  static readonly ROCK_SEA = 2;
  static readonly ROCK_CAVE = 3;
  static readonly VEHICLE_FRAGMENT = 4;
  static readonly STAR_EFFECT = 0;
  static readonly LEAF_LEFT = 10;
  static readonly LEAF_RIGHT = 11;
  static readonly BRACELET_LEFT = 12;
  static readonly BRACELET_RIGHT = 13;
  static readonly FIRING_LEFT = 14;
  static readonly FIRING_RIGHT = 15;

  /**
   * Initialize sprite system with scene reference
   */
  public static init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.sprites = [];

    // Initialize sprite array
    for (let i = 0; i < this.maxSprites; i++) {
      this.sprites[i] = {
        sprite: null,
        x: 0,
        y: 0,
        energy: 0,
        type: 0
      };
    }
  }

  /**
   * Load sprite images (called from scene preload)
   */
  public static preloadSprites(scene: Phaser.Scene): void {
    // Load sprite images from existing res/image folder
    scene.load.image('rock_t', 'src/demos/ak/res/image/Rock_t.png');      // rock_common
    scene.load.image('rock_g', 'src/demos/ak/res/image/Rock_g.png');      // rock_sea
    scene.load.image('rock_c', 'src/demos/ak/res/image/Rock_c.png');      // rock_cave
    scene.load.image('leaf', 'src/demos/ak/res/image/leaf.gif');
    scene.load.image('brac0', 'src/demos/ak/res/image/brac0.png');        // bracelet_left
    scene.load.image('brac1', 'src/demos/ak/res/image/brac1.png');        // bracelet_right
    scene.load.image('firing', 'src/demos/ak/res/image/firing.png');
    // For star effect, we can use rock_t as placeholder or create a simple effect
    scene.load.image('star_effect', 'src/demos/ak/res/image/Rock_t.png');
  }

  /**
   * Add a new sprite (Java addSprite method)
   */
  public static addSprite(x: number, y: number, type: number): void {
    if (!this.scene) {
      console.warn('AkSprites: Scene not initialized');
      return;
    }

    if (type <= 9) { // rock fragments and effects - create 4 fragments
      this.createRockFragments(x, y, type);
    } else if (type === this.LEAF_LEFT || type === this.LEAF_RIGHT) { // leaf from monkey
      this.createSingleSprite(x, y, type, 60, 'leaf');
    } else if (type === this.BRACELET_LEFT || type === this.BRACELET_RIGHT) { // bracelet
      const textureKey = type === this.BRACELET_LEFT ? 'brac0' : 'brac1';
      this.createSingleSprite(x, y, type, 30, textureKey);
      Sound.playSound('snd_brac'); // Play bracelet sound
    } else if (type === this.FIRING_LEFT || type === this.FIRING_RIGHT) { // firing
      this.createSingleSprite(x, y, type, 12, 'firing');
    }
  }

  /**
   * Create 4 rock fragments in a square pattern
   */
  private static createRockFragments(x: number, y: number, type: number): void {
    let textureKey = '';
    const energy = 30;

    switch (type) {
      case this.STAR_EFFECT:
        textureKey = 'star_effect';
        break;
      case this.ROCK_COMMON:
        textureKey = 'rock_t';
        break;
      case this.ROCK_SEA:
        textureKey = 'rock_g';
        break;
      case this.ROCK_CAVE:
        textureKey = 'rock_c';
        break;
      case this.VEHICLE_FRAGMENT:
        textureKey = 'firing'; // Use firing texture for vehicle fragments
        break;
      default:
        textureKey = 'rock_t';
        break;
    }

    // Create 4 fragments in square pattern: (0,0), (0,14), (14,0), (14,14)
    const fragmentOffsets = [
      { x: 0, y: 0 },
      { x: 0, y: 14 },
      { x: 14, y: 0 },
      { x: 14, y: 14 }
    ];

    for (const offset of fragmentOffsets) {
      this.createSingleSprite(x + offset.x, y + offset.y, type, energy, textureKey);
    }

    console.log(`AkSprites: Added 4 rock fragments of type ${type} at (${x}, ${y})`);
  }

  /**
   * Create a single sprite
   */
  private static createSingleSprite(x: number, y: number, type: number, energy: number, textureKey: string): void {
    if (!this.scene) return;

    // Find empty sprite slot
    let i = 0;
    while (this.sprites[i].energy > 0 && i < this.maxSprites - 1) {
      i++;
    }

    // Clear any existing sprite at this slot
    const existingSprite = this.sprites[i].sprite;
    if (existingSprite) {
      existingSprite.destroy();
      this.sprites[i].sprite = null;
    }

    // Set position and energy
    this.sprites[i].x = x;
    this.sprites[i].y = y;
    this.sprites[i].type = type;
    this.sprites[i].energy = energy;

    // Create Phaser sprite
    try {
      const newSprite = this.scene.add.sprite(x, y, textureKey);
      newSprite.setDepth(500); // High depth to render on top
      newSprite.setOrigin(0, 0); // Set origin to top-left like original
      this.sprites[i].sprite = newSprite;
    } catch (error) {
      console.warn(`AkSprites: Failed to create sprite with texture '${textureKey}':`, error);
      // Create a placeholder rectangle if texture is missing
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xff0000); // Red placeholder
      graphics.fillRect(0, 0, 8, 8);
      graphics.x = x;
      graphics.y = y;
      graphics.setDepth(500);
      this.sprites[i].sprite = graphics as any;
    }
  }

  /**
   * Process all sprites (Java processSprites method)
   */
  public static processSprites(): void {
    if (!this.scene) return;

    const currentMap = MainEngine.getCurrentMap();

    for (let i = 0; i < this.maxSprites; i++) {
      const spriteData = this.sprites[i];

      if (spriteData.energy > 0 && spriteData.sprite) {
        spriteData.energy--;

        if (spriteData.type <= 9) { // rock fragments and effects
          // All fragments (including star effects) use physics
          const offsetX = 35 - spriteData.energy;

          // Update sprite position
          spriteData.sprite.x = spriteData.x - offsetX;
          spriteData.sprite.y = spriteData.y;

          // Apply physics to all fragments
          spriteData.x++;
          spriteData.y += 6;
        } else if (spriteData.type === this.LEAF_LEFT || spriteData.type === this.LEAF_RIGHT) { // leaf
          // Leaf physics with collision detection
          const leafOffsetX = 120 - (spriteData.energy * 2);

          spriteData.sprite.x = spriteData.x - leafOffsetX;
          spriteData.sprite.y = spriteData.y;

          // Check collision with player (simplified)
          // TODO: Implement proper collision detection with AkCore collision box

          spriteData.x += spriteData.type - 9; // LEAF_LEFT=10 moves +1, LEAF_RIGHT=11 moves +2
          spriteData.y += 4;
        } else if (spriteData.type === this.BRACELET_LEFT) { // bracelet to the left
          spriteData.sprite.x = spriteData.x;
          spriteData.sprite.y = spriteData.y;

          // Check for hits and obstacles
          const hit = this.processFireAt(spriteData.x, spriteData.y) ||
                     this.processFireAt(spriteData.x, spriteData.y + 8);

          // If not hit and there is obstacle, interrupt
          if (!hit && currentMap && (
            currentMap.getobspixel(spriteData.x, spriteData.y) ||
            currentMap.getobspixel(spriteData.x, spriteData.y + 8)
          )) {
            spriteData.energy = 0;
          }

          spriteData.x -= 8;
        } else if (spriteData.type === this.BRACELET_RIGHT) { // bracelet to the right
          spriteData.sprite.x = spriteData.x;
          spriteData.sprite.y = spriteData.y;

          // Check for hits and obstacles
          const hit = this.processFireAt(spriteData.x, spriteData.y) ||
                     this.processFireAt(spriteData.x, spriteData.y + 8);

          // If not hit and there is obstacle, interrupt
          if (!hit && currentMap && (
            currentMap.getobspixel(spriteData.x, spriteData.y) ||
            currentMap.getobspixel(spriteData.x, spriteData.y + 8)
          )) {
            spriteData.energy = 0;
          }

          spriteData.x += 8;
        } else if (spriteData.type === this.FIRING_LEFT || spriteData.type === this.FIRING_RIGHT) { // firing
          spriteData.sprite.x = spriteData.x;
          spriteData.sprite.y = spriteData.y;

          // Check for hits
          if (!this.processFireAt(spriteData.x, spriteData.y)) {
            this.processFireAt(spriteData.x, spriteData.y + 8);
          }

          // Check for obstacles
          if (currentMap && (
            currentMap.getobspixel(spriteData.x, spriteData.y) ||
            currentMap.getobspixel(spriteData.x, spriteData.y + 7)
          )) {
            spriteData.energy = 0;
          }

          if (spriteData.type === this.FIRING_LEFT) {
            spriteData.x -= 8;
          } else {
            spriteData.x += 8;
          }
        }

        // Remove sprite when energy is depleted
        if (spriteData.energy <= 0) {
          spriteData.sprite.destroy();
          spriteData.sprite = null;
        }
      }
    }
  }

  /**
   * Process fire/projectile at specific position (Java processFireAt method)
   * Returns true if hit a zone (rock, star, item, skull)
   */
  private static processFireAt(x: number, y: number): boolean {
    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) {
      return false;
    }

    // Convert pixel coordinates to tile coordinates
    const zx = x >> 4; // Equivalent to x / 16
    const zy = y >> 4; // Equivalent to y / 16

    // Get zone at this position
    const zone = currentMap.getzone(zx, zy);

    // Check if it's a zone that can be hit by fire (Rock=3, Star=4, Item=7, Skull=8)
    if (zone === AkActions.ZONE_ROCK || zone === AkActions.ZONE_STAR ||
        zone === AkActions.ZONE_ITEM || zone === AkActions.ZONE_SKULL) {

      // Call the event to handle the zone interaction
      AkActions.callEvent(zone, zx, zy);
      return true;
    }

    return false;
  }

  /**
   * Clean up all sprites
   */
  public static cleanup(): void {
    for (let i = 0; i < this.maxSprites; i++) {
      const sprite = this.sprites[i].sprite;
      if (sprite) {
        sprite.destroy();
        this.sprites[i].sprite = null;
        this.sprites[i].energy = 0;
      }
    }
  }

  /**
   * Reset sprite system
   */
  public static reset(): void {
    this.cleanup();
  }

  /**
   * Get active sprite count (for debugging)
   */
  public static getActiveSpriteCount(): number {
    return this.sprites.filter(s => s.energy > 0).length;
  }

  /**
   * Get active sprites for collision detection
   */
  public static getActiveSprites(): SpriteData[] {
    return this.sprites;
  }

  /**
   * Destroy a sprite by index
   */
  public static destroySprite(index: number): void {
    if (index >= 0 && index < this.sprites.length) {
      if (this.sprites[index].sprite) {
        this.sprites[index].sprite.destroy();
        this.sprites[index].sprite = null;
      }
      this.sprites[index].energy = 0;
    }
  }
}