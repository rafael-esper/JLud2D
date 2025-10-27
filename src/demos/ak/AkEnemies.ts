/**
 * AkEnemies - Alex Kidd Enemy System
 * Handles enemy AI, movement, collision detection, and interactions
 * Port of Java enemy processing system
 */

import { MainEngine } from '../../core/MainEngine';
import { Condition, Status, Action, AkMovement } from './AkMovement';

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
   * Check collision between Alex Kidd and enemy (Java akiddCollision method)
   */
  private static akiddCollision(type: number, mx: number, my: number, wx: number, wy: number): boolean {
    // ho=0;if (State=Status.DUCKING) ho+=8;
    // px = entity.get(player).x+12;
    // py = entity.get(player).y+6;
    // vx = 8
    // vy = 20
    // if (type == 1) // passive

    // When punching, make him invulnerable to collision: obs: leaf, etc, should hit
    // TODO: Implement pdelay check when punch system is ready
    // if (pdelay > 0) return false;

    // Get player collision dimensions from AkScene
    // These values are set by the showPlayer() method in AkScene
    const scene = MainEngine.getCurrentScene();
    let akidd_px = 0, akidd_py = 0, akidd_vx = 8, akidd_vy = 20;

    if (scene && typeof (scene as any).getPlayerCollisionBox === 'function') {
      // Get the actual collision dimensions from AkScene
      const collisionBox = (scene as any).getPlayerCollisionBox();
      akidd_px = collisionBox.px;
      akidd_py = collisionBox.py;
      akidd_vx = collisionBox.vx;
      akidd_vy = collisionBox.vy;
    } else {
      // Fallback: calculate default player collision box
      const player = MainEngine.getPlayer();
      if (player) {
        akidd_px = player.getx() + 12;
        akidd_py = player.gety() + 6;
        akidd_vx = 8;
        akidd_vy = 20;
      }
    }

    return this.collision(akidd_px, akidd_py, akidd_vx, akidd_vy, mx, my, wx, wy);
  }

  /**
   * Player is touched by a monster or sprite (Java collision method)
   */
  private static collision(px: number, py: number, vx: number, vy: number, mx: number, my: number, wx: number, wy: number): boolean {
    // TODO: Add debug rendering when debug mode is enabled
    // if (debug) {
    //   screen.rect(mx - xwin, my - ywin, mx + wx - xwin, my + wy - ywin, new Color(200, 100, 100));
    //   screen.rect(px - xwin, py - ywin, px + vx - xwin, py + vy - ywin, new Color(100, 100, 200));
    // }

    // This formula assumes the rectangles do not intersect
    if (mx > px + vx || mx + wx < px || my > py + vy || my + wy < py) {
      return false;
    } else {
      return true;
    }
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
   * Handle player getting hit by enemy (Java hitPlayer method)
   * @param type 1 by monster, 2 naturally, 3 fire
   */
  private static hitPlayer(type: number): void {
    // Get current scene to access player state
    const scene = MainEngine.getCurrentScene();
    if (!scene) return;

    // Get movement system to check conditions
    const movement = (scene as any).movement;
    if (!movement) return;

    // Check invincibility state
    if (AkMovement.getInvencible() > 0) {
      return; // Player is currently invincible
    }

    // Check current condition - if in STAR mode, player is invincible
    const currentCondition = movement.getCondition();
    if (currentCondition === Condition.STAR) {
      return;
    }

    // If in MOTO condition and hit by monster (type 1), ignore
    if (currentCondition === Condition.MOTO && type === 1) {
      return;
    }

    // Set invincibility frames (120 frames = 2 seconds at 60fps)
    AkMovement.setInvencible(120);

    // Reduce energy/health
    if (AkMovement.getEnergy() > 0) {
      AkMovement.decrementEnergy();
    }

    console.log(`AkEnemies: Player hit by type ${type} (1=monster, 2=natural, 3=fire). Energy: ${AkMovement.getEnergy()}, Invincible frames: ${AkMovement.getInvencible()}`);

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