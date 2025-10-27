/**
 * AkEnemies - Alex Kidd Enemy System
 * Handles enemy AI, movement, collision detection, and interactions
 * Port of Java enemy processing system
 */

import { MainEngine } from '../../core/MainEngine';
import { Condition, Status, Action } from './AkMovement';

export class AkEnemies {
  private static monsterframe: number = 0;

  // Constants for enemy types and effects
  private static readonly DUST = 0;

  /**
   * Main enemy processing method (Java processEnemies)
   * Called every frame to update all enemies
   */
  public static processEnemies(): void {
    this.monsterframe++;
    if (this.monsterframe >= 12)
      this.monsterframe = 0;

    const player = MainEngine.getPlayer();
    if (!player) return;

    const entities = MainEngine.getEntities();
    const playerIndex = MainEngine.getPlayerIndex();

    for (let aa = 0; aa < entities.length; aa++) {
      const entity = entities[aa];
      if (!entity || aa === playerIndex) continue;

      // Screen limit - only process enemies within 300 pixels of player
      if (entity.getx() > player.getx() - 300 && entity.getx() < player.getx() + 300) {

        // Process enemies based on their name
        const enemyName = entity.getName();
        if (enemyName === 'Bird') {
          this.processEagle(aa, entity);
        }
      }
    }
  }

  /**
   * Process Eagle enemy behavior
   */
  private static processEagle(entityIndex: number, entity: any): void {
    // Limit face direction to 0 or 1 (left/right)
    if (entity.getFace() > 1)
      entity.setFace(1);

    // Movement based on facing direction
    if (entity.getFace() === 0)
      entity.incx(-2);
    if (entity.getFace() === 1)
      entity.incx(2);

    // Collision detection with obstructions
    if (this.obstruct(entityIndex, 1, 24, 16)) // Check right direction
      entity.setFace(0); // Turn left
    if (this.obstruct(entityIndex, 0, 24, 16)) // Check left direction
      entity.setFace(1); // Turn right

    // Set animation frame
    entity.setSpecframe((2 - (entity.getFace() * 2)) + Math.floor(this.monsterframe / 6));

    // Check if player punches the eagle
    if (this.punch(entityIndex, 28, 16))
      this.killEnemy(entityIndex, this.DUST);

    // Check collision with player
    if (this.akiddCollision(1, entity.getx() + 1, entity.gety(), 22, 14))
      this.hitPlayer(1);
  }

  /**
   * Check if entity obstructs in a given direction (Java obstruct method)
   */
  private static obstruct(entityIndex: number, face: number, wx: number, wy: number): boolean {
    const entities = MainEngine.getEntities();
    const entity = entities[entityIndex];
    const currentMap = MainEngine.getCurrentMap();

    if (!entity || !currentMap) return false;

    let a: number;

    // Face 0 (West) or Face 4 (West + floor check)
    if (face === 0 || face === 4) {
      for (a = 0; a < wy; a += 2) {
        if (currentMap.getobspixel(entity.getx(), entity.gety() + a)) {
          return true;
        }
      }
    }

    // Face 1 (East) or Face 5 (East + floor check)
    if (face === 1 || face === 5) {
      for (a = 0; a < wy; a += 2) {
        if (currentMap.getobspixel(entity.getx() + wx, entity.gety() + a)) {
          return true;
        }
      }
    }

    // Face 2 (North)
    if (face === 2) {
      for (a = 0; a < wx; a += 2) {
        if (currentMap.getobspixel(entity.getx() + a, entity.gety())) {
          return true;
        }
      }
    }

    // Face 3 (South)
    if (face === 3) {
      for (a = 0; a < wx; a += 2) {
        if (currentMap.getobspixel(entity.getx() + a, entity.gety() + wy)) {
          return true;
        }
      }
    }

    // Face 4 (West + lack of floor check)
    if (face === 4) {
      for (a = 0; a < wx; a += 2) {
        if (!currentMap.getobspixel(entity.getx() + a - 4, entity.gety() + wy + 12)) {
          return true; // Return true if there's no floor (lack of obstruction)
        }
      }
    }

    // Face 5 (East + lack of floor check)
    if (face === 5) {
      for (a = 0; a < wx; a += 2) {
        if (!currentMap.getobspixel(entity.getx() + a + 6, entity.gety() + wy + 12)) {
          return true; // Return true if there's no floor (lack of obstruction)
        }
      }
    }

    return false;
  }

  /**
   * Check if player is punching this enemy
   */
  private static punch(entityIndex: number, width: number, height: number): boolean {
    // TODO: Implement punch collision detection
    // This should check if the player's punch area intersects with the enemy
    //console.log(`AkEnemies: punch check for entity ${entityIndex}, size ${width}x${height}`);
    return false;
  }

  /**
   * Check collision between Alex Kidd and enemy
   */
  private static akiddCollision(damage: number, x: number, y: number, width: number, height: number): boolean {
    const player = MainEngine.getPlayer();
    if (!player) return false;

    // Simple rectangle collision detection
    const playerX = player.getx();
    const playerY = player.gety();
    const playerWidth = 32; // Assuming 32x32 player size
    const playerHeight = 32;

    // Check if rectangles overlap
    if (playerX < x + width &&
        playerX + playerWidth > x &&
        playerY < y + height &&
        playerY + playerHeight > y) {
      return true;
    }

    return false;
  }

  /**
   * Kill enemy and create death effect
   */
  private static killEnemy(entityIndex: number, effectType: number): void {
    // TODO: Implement enemy death logic
    // This should remove the enemy and create a death effect sprite
    console.log(`AkEnemies: killEnemy ${entityIndex}, effect type ${effectType}`);

    const entities = MainEngine.getEntities();
    if (entities[entityIndex]) {
      // TODO: Create death effect sprite at enemy position
      // TODO: Remove enemy from entities list or mark as dead
      console.log(`Enemy ${entityIndex} killed`);
    }
  }

  /**
   * Handle player getting hit by enemy
   */
  private static hitPlayer(damage: number): void {
    // TODO: Implement player damage logic
    // This should reduce player health, play hit sound, etc.
    console.log(`AkEnemies: Player hit for ${damage} damage`);

    // TODO: Check if player has invincibility frames
    // TODO: Reduce player health
    // TODO: Play hit sound effect
    // TODO: Apply knockback or other effects
  }

  /**
   * Reset enemy processing state
   */
  public static reset(): void {
    this.monsterframe = 0;
  }

  /**
   * Get current monster frame for external access
   */
  public static getMonsterFrame(): number {
    return this.monsterframe;
  }
}