/**
 * AkActions - Alex Kidd Action System
 * Handles punching, events, and zone processing for the AK demo
 * Port of Java punch/event system
 */

import { MainEngine } from '../../core/MainEngine';
import { Condition, Status, Action } from './AkMovement';

export class AkActions {
  // Punch-related state
  private static pdelay: number = 0;
  private static hasBrac: boolean = false;
  private static zx: number = 0;
  private static zy: number = 0;

  // Additional action state
  private static tdelay: number = 0;

  // Game state
  private static Gold: number = 0;

  // Constants for zones and tiles
  private static readonly ZONE_GOLD1 = 1;
  private static readonly ZONE_GOLD2 = 2;
  private static readonly ZONE_ROCK = 3;
  private static readonly ZONE_STAR = 4;
  private static readonly ZONE_RICE = 5;
  private static readonly ZONE_SWIM = 6;
  private static readonly ZONE_ITEM = 7;
  private static readonly ZONE_SKULL = 8;
  private static readonly ZONE_DEATH = 9;
  private static readonly ZONE_WIND_IN = 10;
  private static readonly ZONE_WIND_OUT = 11;
  private static readonly ZONE_STAIR = 12;
  private static readonly ZONE_MOTO_SHOP = 13;
  private static readonly ZONE_BRACELET = 14;
  private static readonly ZONE_HELI_SHOP = 15;

  private static readonly TILE_LAYER = 1;
  private static readonly TILE_GOLD_BIG = 12;    // Example tile ID for big gold
  private static readonly TILE_GOLD_SMALL = 13;  // Example tile ID for small gold
  private static readonly NULL_ZONE = 0
  private static readonly NULL_TILE = 0

  // Player dimensions for collision
  private static playerDimensions = {
    x: 0, y: 0, width: 0, height: 0
  };

  /**
   * Punch action (Java punch method)
   */
  public static punch(
    state: Status,
    condition: Condition,
    velocity: number,
    friction: number,
    action: Action
  ): { velocity: number; action: Action } {
    console.log(`AkActions: punch() called - state=${state}, condition=${condition}, velocity=${velocity}, pdelay=${this.pdelay}`);

    let newVelocity = velocity;
    let newAction = action;
    let ge: number, he: number = 0;

    if (state === Status.WALKING) {
      if (condition === Condition.WALK) {
        newVelocity = friction * velocity / 10;
        console.log(`AkActions: velocity adjusted for walking: ${newVelocity}`);
      }
    }

    if (this.pdelay === 0 && condition !== Condition.HELI && condition !== Condition.SURF) {
      console.log(`AkActions: Starting punch action`);
      if (!this.hasBrac) {
        //FIXME this.playsound(this.snd[3]);
      }
      this.unpress(1);
      newAction = Action.PUNCHING;

      const player = MainEngine.getPlayer();
      if (player) {
        console.log(`AkActions: Player at (${player.getx()}, ${player.gety()}), face=${player.getFace()}`);
        ge = this.getpunch(player.getFace() * 32, condition);
        console.log(`AkActions: getpunch returned zone: ${ge}`);
        if (ge >= 3 && ge <= 8) { // Events that are processed by punch
          console.log(`AkActions: Calling event ${ge}`);
          this.callEvent(ge);
        } else {
          console.log(`AkActions: No event triggered (zone ${ge} out of range 3-8)`);
        }
      } else {
        console.log(`AkActions: No player found`);
      }
    }

    this.pdelay++;

    if (condition === Condition.HELI || condition === Condition.SURF) {
      he = 9;
    }

    if (this.pdelay >= 6 + he) {
      console.log(`AkActions: Punch completed, resetting pdelay`);
      this.pdelay = 0;
      if (newAction === Action.PUNCHING) {
        newAction = Action.NONE;
      }
    }

    console.log(`AkActions: punch() result - velocity=${newVelocity}, action=${newAction}, pdelay=${this.pdelay}`);
    return { velocity: newVelocity, action: newAction };
  }

  /**
   * Get punch collision detection (Java getpunch method)
   */
  private static getpunch(HoOffset: number, condition: Condition): number {
    console.log(`AkActions: getpunch() called - HoOffset=${HoOffset}, condition=${condition}`);

    let a: number, UpOffset: number;
    UpOffset = 16;

    if (condition === Condition.MOTO) {
      UpOffset -= 12;
      console.log(`AkActions: MOTO condition, UpOffset adjusted to ${UpOffset}`);
    }

    const player = MainEngine.getPlayer();
    const currentMap = MainEngine.getCurrentMap();

    if (!player || !currentMap) {
      console.log(`AkActions: getpunch() - missing player or map`);
      return 0;
    }

    this.zx = (player.getx() + HoOffset) >> 4;
    console.log(`AkActions: zx calculated as ${this.zx} (from player.x=${player.getx()} + HoOffset=${HoOffset})`);

    for (a = UpOffset; a < 28; a += 2) {
      this.zy = (player.gety() + a) >> 4;
      const zone = currentMap.getzone(this.zx, this.zy);
      console.log(`AkActions: checking position (${this.zx}, ${this.zy}) [a=${a}], zone=${zone}`);

      if (zone >= 3) {
        console.log(`AkActions: getpunch() found zone ${zone} at (${this.zx}, ${this.zy})`);
        return zone; // to avoid gold sacks
      }
    }

    console.log(`AkActions: getpunch() found no zones, returning 0`);
    return 0;
  }

  /**
   * Call event handler (Java callEvent method)
   */
  private static callEvent(num: number): void {
    console.log(`AkActions: callEvent(${num}) called at position (${this.zx}, ${this.zy})`);

    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) {
      console.error('AkActions: No current map for event handling');
      return;
    }

    console.log(`AkActions: Event ${num} triggered at (${this.zx}, ${this.zy})`);

    // Check current tile and zone before processing
    const currentTile = currentMap.gettile(this.zx, this.zy, AkActions.TILE_LAYER);
    const currentZone = currentMap.getzone(this.zx, this.zy);
    const currentObs = currentMap.getobs(this.zx, this.zy);
    console.log(`AkActions: Before event - tile=${currentTile}, zone=${currentZone}, obs=${currentObs}`);

    switch (num) {
      case this.ZONE_GOLD1: // Gold I
        console.log(`AkActions: Processing ZONE_GOLD1 event`);
        currentMap.settile(this.zx, this.zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(this.zx, this.zy, AkActions.NULL_ZONE);
        //FIXME this.playsound(this.snd[2]);
        this.Gold += 20;
        console.log(`AkActions: Collected Gold I (+20), Total: ${this.Gold}`);
        break;

      case this.ZONE_GOLD2: // Gold II
        console.log(`AkActions: Processing ZONE_GOLD2 event`);
        currentMap.settile(this.zx, this.zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(this.zx, this.zy, AkActions.NULL_ZONE);
        //FIXME this.playsound(this.snd[2]);
        this.Gold += 10;
        console.log(`AkActions: Collected Gold II (+10), Total: ${this.Gold}`);
        break;

      case this.ZONE_ROCK: // Rock
        console.log(`AkActions: Processing ZONE_ROCK event`);
        //FIXME this.playsound(this.snd[4]);

        // Determine rock type based on background tile
        const backgroundTile = currentMap.gettile(this.zx, this.zy, 1);
        console.log(`AkActions: Background tile is ${backgroundTile}`);
        if (backgroundTile === 32 || backgroundTile === 52) {
          this.addSprite(this.zx << 4, this.zy << 4, 3); // cave rock
          console.log(`AkActions: Adding cave rock sprite`);
        } else if (backgroundTile === 65) {
          this.addSprite(this.zx, this.zy << 4, 2); // sea rock
          console.log(`AkActions: Adding sea rock sprite`);
        } else {
          this.addSprite(this.zx << 4, this.zy << 4, 1); // common rock
          console.log(`AkActions: Adding common rock sprite`);
        }

        currentMap.settile(this.zx, this.zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(this.zx, this.zy, AkActions.NULL_ZONE);
        currentMap.setobs(this.zx, this.zy, 0);
        console.log(`AkActions: Rock broken at (${this.zx}, ${this.zy}) - tile, zone, and obstruction cleared`);
        break;

      case this.ZONE_STAR: // Star
        console.log(`AkActions: Processing ZONE_STAR event`);
        //FIXME this.playsound(this.snd[5]);
        currentMap.setobs(this.zx, this.zy, 0);
        console.log(`AkActions: Star obstruction cleared`);

        // Random gold generation (0 or 1)
        const randomValue = this.random(0, 1);
        console.log(`AkActions: Random value for star: ${randomValue}`);
        if (randomValue === 0) {
          currentMap.settile(this.zx, this.zy, this.TILE_LAYER, this.TILE_GOLD_BIG);
          currentMap.setzone(this.zx, this.zy, this.ZONE_GOLD1);
          console.log(`AkActions: Star created Big Gold at (${this.zx}, ${this.zy})`);
        } else {
          currentMap.settile(this.zx, this.zy, this.TILE_LAYER, this.TILE_GOLD_SMALL);
          currentMap.setzone(this.zx, this.zy, this.ZONE_GOLD2);
          console.log(`AkActions: Star created Small Gold at (${this.zx}, ${this.zy})`);
        }

        this.addSprite(this.zx << 4, this.zy << 4, 0); // star effect
        console.log(`AkActions: Star effect sprite added`);
        break;

      case 7:
        // TODO: Handle event 7
        console.log(`AkActions: Event 7 not implemented yet`);
        break;
      case 8:
        // TODO: Handle event 8
        console.log(`AkActions: Event 8 not implemented yet`);
        break;
      default:
        console.log(`AkActions: Unhandled event ${num}`);
    }

    // Check state after processing
    const afterTile = currentMap.gettile(this.zx, this.zy, this.TILE_LAYER);
    const afterZone = currentMap.getzone(this.zx, this.zy);
    const afterObs = currentMap.getobs(this.zx, this.zy);
    console.log(`AkActions: After event - tile=${afterTile}, zone=${afterZone}, obs=${afterObs}`);
  }

  /**
   * Play sound effect
   */
  /*private static playsound(sound: Phaser.Sound.BaseSound): void {
    if (sound && typeof sound.play === 'function') {
      try {
        sound.play();
      } catch (error) {
        console.log('AkActions: Error playing sound:', error);
      }
    } else {
      console.log('AkActions: Sound not loaded, undefined, or invalid');
    }
  }*/

  /**
   * Unpress button (placeholder)
   */
  private static unpress(button: number): void {
    // TODO: Implement button unpress logic
    console.log(`AkActions: Unpress button ${button}`);
  }


  /**
   * Reset punch delay (useful for testing/debugging)
   */
  public static resetPunchDelay(): void {
    this.pdelay = 0;
  }

  /**
   * Set bracelet status
   */
  public static setHasBrac(hasBrac: boolean): void {
    this.hasBrac = hasBrac;
  }

  /**
   * Get current punch delay (for debugging)
   */
  public static getPunchDelay(): number {
    return this.pdelay;
  }

  /**
   * Handle showPlayer punch action logic
   */
  public static getPlayerFrame(action: Action, condition: Condition): number | null {
    const player = MainEngine.getPlayer();
    if (!player) return null;

    if (action === Action.PUNCHING) { // punching
      if (condition === Condition.SWIM) {
        this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
        return 17 - (player.getFace() * 3); // swimming
      } else {
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 5 - player.getFace(); // walking
      }
    }

    return null; // No special frame for punch action
  }

  /**
   * Handle punch controls logic (after switch condition)
   */
  public static handlePunchControls(
    condition: Condition,
    b1: boolean,
    left: boolean,
    right: boolean,
    state: Status,
    velocity: number,
    friction: number,
    action: Action
  ): { state: Status; velocity: number; action: Action } {
    let newState = state;
    let newVelocity = velocity;
    let newAction = action;

    if (condition !== Condition.MOTO && condition !== Condition.STAR && condition !== Condition.ROPE) {
      if (b1 || this.pdelay > 0) { // punch, bracelete, tiro (button b1)
        if (this.tdelay === 0) {
          const punchResult = this.punch(newState, condition, newVelocity, friction, newAction);
          newVelocity = punchResult.velocity;
          newAction = punchResult.action;
        }
        if (this.pdelay === 2) {
          const player = MainEngine.getPlayer();
          if (player) {
            if (this.hasBrac && condition === Condition.WALK) {
              this.addSprite(
                player.getx() + (player.getFace() * 30),
                player.gety() + 14,
                12 + player.getFace()
              ); // bracelete
            }
            if (condition === Condition.HELI || condition === Condition.SURF) {
              this.addSprite(
                player.getx() + (player.getFace() * 30),
                player.gety() + 14,
                14 + player.getFace()
              ); // tiro
            }
          }
        }
      }
      if (!left && !right && newState === Status.WALKING && condition !== Condition.SURF) {
        newState = Status.STOPPED;
        newVelocity = friction * newVelocity / 10;
      }
      if (newAction === Action.TREMBLING || this.tdelay > 0) {
        newAction = this.tremble(newAction);
      }
    }

    return { state: newState, velocity: newVelocity, action: newAction };
  }

  /**
   * Set player collision dimensions (Java setDimensions method)
   */
  private static setDimensions(x: number, y: number, width: number, height: number): void {
    this.playerDimensions.x = x;
    this.playerDimensions.y = y;
    this.playerDimensions.width = width;
    this.playerDimensions.height = height;
  }

  /**
   * Add sprite (bracelet, shot, etc.) (Java addSprite method)
   */
  private static addSprite(x: number, y: number, spriteId: number): void {
    // TODO: Implement sprite creation logic
    console.log(`AkActions: AddSprite at (${x}, ${y}) with ID ${spriteId}`);
    // This would create a sprite at the specified position with the given sprite ID
  }

  /**
   * Handle trembling action (Java tremble method)
   */
  private static tremble(action: Action): Action {
    // TODO: Implement tremble logic
    console.log(`AkActions: Tremble action`);

    this.tdelay++;
    if (this.tdelay >= 10) { // Example duration
      this.tdelay = 0;
      if (action === Action.TREMBLING) {
        return Action.NONE;
      }
    }

    return action;
  }

  /**
   * Get player dimensions (for external access)
   */
  public static getPlayerDimensions() {
    return { ...this.playerDimensions };
  }

  /**
   * Get/Set tdelay for external access
   */
  public static getTdelay(): number {
    return this.tdelay;
  }

  public static setTdelay(value: number): void {
    this.tdelay = value;
  }

  /**
   * Random number generator (Java random method)
   */
  private static random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get current gold amount
   */
  public static getGold(): number {
    return this.Gold;
  }

  /**
   * Set gold amount
   */
  public static setGold(amount: number): void {
    this.Gold = amount;
  }

  /**
   * Reset all action states
   */
  public static reset(): void {
    this.pdelay = 0;
    this.tdelay = 0;
    this.hasBrac = false;
    this.zx = 0;
    this.zy = 0;
    this.Gold = 0;
    this.playerDimensions = { x: 0, y: 0, width: 0, height: 0 };
  }
}