/**
 * AkEnemies - Alex Kidd Enemy System
 * Handles enemy AI, movement, collision detection, and interactions
 * Port of Java enemy processing system
 */

import { MainEngine } from '../../core/MainEngine';
import { Condition, Status, Action, AkMovement } from './AkMovement';
import { AkActions } from './AkActions';
import { AkCore } from './AkCore';
import { AkSprites } from './AkSprites';

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
      if (!entity || aa === playerIndex || !entity.isActive()) continue;

      // Screen limit - only process enemies within 300 pixels of player
      if (entity.getx() > player.getx() - 300 && entity.getx() < player.getx() + 300) {

        // Process enemies based on their name
        const enemyName = entity.getName();
        if (enemyName === 'Bird') {
          this.processEagle(aa, entity);
        } else if (enemyName === 'Fish') {
          this.processFish(aa, entity);
        } else if (enemyName === 'Scorpion') {
          this.processScorpion(aa, entity);
        } else if (enemyName === 'Frog') {
          this.processFrog(aa, entity);
        } else if (enemyName === 'SeaHorse') {
          this.processSeaHorse(aa, entity);
        } else if (enemyName === 'BigFish') {
          this.processBigFish(aa, entity);
        } else if (enemyName === 'Bat') {
          this.processBat(aa, entity);
        } else if (enemyName === 'Owl') {
          this.processOwl(aa, entity);
        } else if (enemyName === 'Dust') {
          this.processDust(aa, entity);
        } else if (enemyName === 'BigDust') {
          this.processBigDust(aa, entity);
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
    if (entity.getFace() == 0)
      entity.incx(-2);
    if (entity.getFace() == 1)
      entity.incx(2);

    // Collision detection with obstructions
    if (this.obstruct(entityIndex, 1, 24, 16)) // Check right direction
      entity.setFace(0); // Turn left
    if (this.obstruct(entityIndex, 0, 24, 16)) // Check left direction
      entity.setFace(1); // Turn right

    // Set animation frame
    entity.setSpecframe((2 - (entity.getFace() * 2)) + Math.floor(this.monsterframe / 6));

    // Check if player attacks the eagle
    if (this.attackEnemy(entityIndex, 28, 16))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx() + 1, entity.gety(), 22, 14))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Fish enemy behavior
   */
  private static processFish(entityIndex: number, entity: any): void {
    // Limit face direction to 0 or 1 (left/right)
    if (entity.getFace() > 1)
      entity.setFace(1);

    // Movement based on facing direction
    if (entity.getFace() == 0)
      entity.incx(-2);
    if (entity.getFace() == 1)
      entity.incx(2);

    // Collision detection with obstructions (use separate if statements like original)
    if (this.obstruct(entityIndex, 1, 16, 14)) // Check right direction
      entity.setFace(0); // Turn left
    if (this.obstruct(entityIndex, 0, 16, 14)) // Check left direction
      entity.setFace(1); // Turn right

    // Set animation frame
    entity.setSpecframe((6 - (entity.getFace() * 2)) + Math.floor(this.monsterframe / 6));

    // Check if player attacks the fish
    if (this.attackEnemy(entityIndex, 16, 16))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx() + 1, entity.gety(), 14, 14))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Scorpion enemy behavior
   */
  private static processScorpion(entityIndex: number, entity: any): void {
    // Limit face direction to 0 or 1 (left/right)
    if (entity.getFace() > 1)
      entity.setFace(1);

    // Movement based on facing direction
    if (entity.getFace() == 0) {
      entity.incx(-2);
    }
    if (entity.getFace() == 1) {
      entity.incx(2);
    }

    // Gravity - fall if no ground beneath
    if (!this.obstruct(entityIndex, 3, 14, 16)) {
      entity.incy(2); // falling
      if (this.monsterframe === 0) console.log(`Scorpion ${entityIndex}: falling`);
    }

    // Collision detection with edges (face 4/5 check for lack of floor)
    if (this.obstruct(entityIndex, 5, 14, 10)) { // East + lack of floor check
      entity.setFace(0); // Turn left
      if (this.monsterframe === 0) console.log(`Scorpion ${entityIndex}: right edge detected, turning left`);
    }
    if (this.obstruct(entityIndex, 4, 14, 10)) { // West + lack of floor check
      entity.setFace(1); // Turn right
      if (this.monsterframe === 0) console.log(`Scorpion ${entityIndex}: left edge detected, turning right`);
    }

    // Set animation frame
    entity.setSpecframe((10 - (entity.getFace() * 2)) + Math.floor(this.monsterframe / 6));

    // Check if player attacks the scorpion
    if (this.attackEnemy(entityIndex, 14, 16))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx(), entity.gety(), 14, 16))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Frog enemy behavior
   */
  private static processFrog(entityIndex: number, entity: any): void {
    const player = MainEngine.getPlayer();
    if (!player) return;

    let frogDirection = 1;
    if (player.getx() > entity.getx())
      frogDirection = 0;

    if (entity.getFace() <= 3) { // stopped
      entity.setSpecframe(12 + (2 * frogDirection));
      if (!this.obstruct(entityIndex, 3, 14, 16))
        entity.setFace(7);
    }

    if (entity.getFace() == 3 && this.monsterframe == 0)
      entity.incy(-10);
    else if (entity.getFace() >= 4 && entity.getFace() <= 5) { // jumping
      entity.incy(-(6 - entity.getFace()));
      entity.setSpecframe(13 + (2 * frogDirection));
      frogDirection = 10;
    } else if (entity.getFace() >= 6 && entity.getFace() <= 7) { // falling
      entity.incy(entity.getFace() - 5);
      entity.setSpecframe(13 + (2 * frogDirection));
      if (this.obstruct(entityIndex, 3, 12, 26))
        entity.setFace(1);
      frogDirection = 10;
    }

    if (entity.getFace() >= 8) {
      entity.incy(10);
      entity.setFace(0);
    }

    if (this.monsterframe == 0) {
      entity.setFace(entity.getFace() + 1);
    }

    // Check if player attacks the frog
    if (this.attackEnemy(entityIndex, 14, 26))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx(), entity.gety() + 10 - frogDirection, 14, 24))
      AkActions.hitPlayer(1);
  }

  /**
   * Process SeaHorse enemy behavior
   */
  private static processSeaHorse(entityIndex: number, entity: any): void {
    // Set animation frame (frames 37-38)
    entity.setSpecframe(37 + Math.floor(this.monsterframe / 6));

    // Movement based on face direction (circular pattern)
    if (entity.getFace() == 0)
      entity.incy(1);
    if (entity.getFace() == 1)
      entity.incx(-1);
    if (entity.getFace() == 2)
      entity.incx(-1);
    if (entity.getFace() == 3)
      entity.incy(1);
    if (entity.getFace() == 4)
      entity.incy(-1);
    if (entity.getFace() == 5)
      entity.incx(1);
    if (entity.getFace() == 6)
      entity.incx(1);
    if (entity.getFace() == 7)
      entity.incy(-1);

    // Reset face after completing circle
    if (entity.getFace() >= 8)
      entity.setFace(0);

    // Advance face every 12 frames
    if (this.monsterframe == 0) {
      entity.setFace(entity.getFace() + 1);
    }

    // Check if player attacks the seahorse
    if (this.attackEnemy(entityIndex, 11, 15))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx(), entity.gety(), 11, 15))
      AkActions.hitPlayer(1);
  }

  /**
   * Process BigFish enemy behavior
   */
  private static processBigFish(entityIndex: number, entity: any): void {
    // Horizontal movement based on face (even = left, odd = right)
    if (entity.getFace() % 2 == 0)
      entity.incx(-2);
    if (entity.getFace() % 2 == 1)
      entity.incx(2);

    // Vertical movement based on face
    if (entity.getFace() == 0 || entity.getFace() == 1)
      entity.incy(3);  // Moving down
    if (entity.getFace() == 2 || entity.getFace() == 3)
      entity.incy(-3); // Moving up

    // Collision detection with walls
    if (this.obstruct(entityIndex, 1, 24, 16)) { // Right wall
      entity.setFace(entity.getFace() - 1);
    }
    if (this.obstruct(entityIndex, 0, 24, 16)) { // Left wall
      entity.setFace(entity.getFace() + 1);
    }

    // Advance face every 12 frames
    if (this.monsterframe == 0) {
      entity.setFace(entity.getFace() + 2);
    }

    // Keep face in valid range (0-3)
    if (entity.getFace() > 3)
      entity.setFace(entity.getFace() % 2);

    // Ensure face stays within bounds after collision adjustments
    if (entity.getFace() < 0)
      entity.setFace(entity.getFace() + 4);
    if (entity.getFace() > 3)
      entity.setFace(entity.getFace() % 4);

    // Calculate animation frame
    let cc = (22 - ((entity.getFace() % 2) * 2)) + Math.floor(this.monsterframe / 6);
    if (cc < 0)
      cc = 0;
    entity.setSpecframe(cc);

    // Check if player attacks the big fish
    if (this.attackEnemy(entityIndex, 24, 16))
      this.killEnemy(entityIndex, 'BigDust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx(), entity.gety(), 22, 15))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Bat enemy behavior
   */
  private static processBat(entityIndex: number, entity: any): void {
    // Limit face direction to 0 or 1 (left/right)
    if (entity.getFace() > 1)
      entity.setFace(1);

    // Horizontal movement with collision detection
    if (entity.getFace() == 0 && !this.obstruct(entityIndex, 0, 15, 12))
      entity.incx(-2);
    if (entity.getFace() == 1 && !this.obstruct(entityIndex, 1, 15, 12))
      entity.incx(2);

    // Wall collision detection (turn around when hitting walls)
    if (this.obstruct(entityIndex, 1, 14, 10))
      entity.setFace(0); // Turn left when hitting right wall
    if (this.obstruct(entityIndex, 0, 14, 10))
      entity.setFace(1); // Turn right when hitting left wall

    // Vertical bobbing movement
    if (this.monsterframe < 6)
      entity.incy(2);  // Move down for first half
    else
      entity.incy(-2); // Move up for second half

    // Set animation frame (30-31, changes every 6 frames)
    entity.setSpecframe(30 + Math.floor(this.monsterframe / 6));

    // Check if player attacks the bat
    if (this.attackEnemy(entityIndex, 15, 16))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx() + 2, entity.gety(), 12, 8))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Owl enemy behavior
   */
  private static processOwl(entityIndex: number, entity: any): void {
    // Limit face direction to 0 or 1 (left/right)
    if (entity.getFace() > 1)
      entity.setFace(1);

    // Horizontal movement with collision detection (slower than bat)
    if (entity.getFace() == 0 && !this.obstruct(entityIndex, 0, 15, 16))
      entity.incx(-1);
    if (entity.getFace() == 1 && !this.obstruct(entityIndex, 1, 15, 16))
      entity.incx(1);

    // Wall collision detection (turn around when hitting walls)
    if (this.obstruct(entityIndex, 1, 15, 14))
      entity.setFace(0); // Turn left when hitting right wall
    if (this.obstruct(entityIndex, 0, 15, 14))
      entity.setFace(1); // Turn right when hitting left wall

    // Gravity - fall if no ground beneath
    if (!this.obstruct(entityIndex, 3, 15, 16))
      entity.incy(2);

    // Set animation frame (28-29, changes every 6 frames)
    entity.setSpecframe(28 + Math.floor(this.monsterframe / 6));

    // Check if player attacks the owl
    if (this.attackEnemy(entityIndex, 15, 15))
      this.killEnemy(entityIndex, 'Dust');

    // Check collision with player
    if (this.akiddCollision(1, entity.getx(), entity.gety(), 15, 15))
      AkActions.hitPlayer(1);
  }

  /**
   * Process Dust death animation (Java Dust processing)
   */
  private static processDust(entityIndex: number, entity: any): void {
    const face = entity.getFace();

    if (face === 0) {
      entity.setSpecframe(53); // small dust
    } else if (face === 1) {
      entity.setSpecframe(54); // big dust
    } else if (face === 2) {
      entity.setSpecframe(53); // small dust
    } else {
      // Animation complete - remove entity
      entity.destroy();
    }

    if (this.monsterframe === 0) {
      entity.setFace(entity.getFace() + 1);
    }
  }

  /**
   * Process BigDust death animation (Java BigDust processing)
   */
  private static processBigDust(entityIndex: number, entity: any): void {
    const face = entity.getFace();

    if (face === 0) {
      entity.setSpecframe(53); // small dust
    } else if (face === 1) {
      entity.setSpecframe(54); // big dust
    } else if (face === 2) {
      entity.setSpecframe(55); // huge dust
    } else if (face === 3) {
      entity.setSpecframe(54); // big dust
    } else if (face === 4) {
      entity.setSpecframe(53); // small dust
    } else {
      // Animation complete - remove entity
      entity.destroy();
    }

    if (this.monsterframe === 0) {
      entity.setFace(entity.getFace() + 1);
    }
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
   * Check if player is attacking this enemy (Java punch method)
   */
  private static attackEnemy(entityIndex: number, wx: number, wy: number): boolean {
    const player = MainEngine.getPlayer();
    const entities = MainEngine.getEntities();
    const entity = entities[entityIndex];

    if (!player || !entity) return false;

    // Get movement system to check action and condition
    const scene = MainEngine.getCurrentScene();
    const movement = (scene as any).movement;
    if (!movement) return false;

    const action = movement.getAction();
    const condition = movement.getCondition();

    // Get entity and player positions (used by both punch and projectile checks)
    const playerX = player.getx();
    const playerY = player.gety();
    const playerFace = player.getFace();
    const entityX = entity.getx();
    const entityY = entity.gety();

    // Check punching, moto, or star conditions
    if (action === Action.PUNCHING || condition === Condition.MOTO || condition === Condition.STAR) {

      // Check punch area collision
      if ((playerX + (playerFace * 24)) >= entityX &&
          (playerX + (playerFace * 24)) <= entityX + wx &&
          (playerY + 14) >= entityY &&
          (playerY + 14) <= entityY + wy) {
        return true;
      }
    }

    // Check bracelet and projectile attacks
    const hasBrac = AkCore.getHasBrac();
    if (hasBrac || condition === Condition.HELI || condition === Condition.SURF) {
      const sprites = AkSprites.getActiveSprites();
      for (let i = 0; i < sprites.length; i++) {
        const spriteData = sprites[i];
        if (spriteData.energy > 0 && spriteData.type >= 12 && spriteData.type <= 15) { // bracelet and firing
          if (this.collision(spriteData.x, spriteData.y, 8, 8, entityX, entityY, wx, wy)) {
            // Destroy the sprite by setting energy to 0
            AkSprites.destroySprite(i);
            return true;
          }
        }
      }
    }

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
   * Kill enemy and create death effect (Java killEnemy method)
   */
  private static killEnemy(entityIndex: number, dustType: string): void {
    const entities = MainEngine.getEntities();
    const entity = entities[entityIndex];
    if (!entity) return;

    // Stop entity movement (entitystop equivalent)
    entity.clearWaypoints();

    // Set death animation state
    entity.setFace(0);
    entity.setSpecframe(52);
    entity.setSpeed(0);
    entity.setName(dustType);

    // Play hit sound effect (snd[7])
    MainEngine.getCurrentScene()!.sound.play('snd_hit');

    console.log(`Enemy ${entityIndex} killed, converted to ${dustType}`);

    // TODO: Add score when scoring system is ready
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