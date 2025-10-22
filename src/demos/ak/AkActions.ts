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

  // Additional action state
  private static tdelay: number = 0;

  // Game state
  private static Gold: number = 0;

  // Constants for zones and tiles
  static readonly ZONE_GOLD1 = 1;
  static readonly ZONE_GOLD2 = 2;
  static readonly ZONE_ROCK = 3;
  static readonly ZONE_STAR = 4;
  static readonly ZONE_RICE = 5;
  static readonly ZONE_SWIM = 6;
  static readonly ZONE_ITEM = 7;
  static readonly ZONE_SKULL = 8;
  static readonly ZONE_DEATH = 9;
  static readonly ZONE_WIND_IN = 10;
  static readonly ZONE_WIND_OUT = 11;
  static readonly ZONE_STAIR = 12;
  static readonly ZONE_MOTO_SHOP = 13;
  static readonly ZONE_BRACELET = 14;
  static readonly ZONE_HELI_SHOP = 15;

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

    let newVelocity = velocity;
    let newAction = action;
    let ge: number, he: number = 0;

    if (state === Status.WALKING) {
      if (condition === Condition.WALK) {
        newVelocity = friction * velocity / 10;
      }
    }

    if (this.pdelay === 0 && condition !== Condition.HELI && condition !== Condition.SURF) {
      if (!this.hasBrac) {
        //FIXME this.playsound(this.snd[3]);
      }
      this.unpress(1);
      newAction = Action.PUNCHING;

      const player = MainEngine.getPlayer();
      if (player) {

        // Calculate punch coordinates
        const HoOffset = player.getFace() * 32;
        const zx = (player.getx() + HoOffset) >> 4;
        const zy = (player.gety() + 16) >> 4; // Use same offset as getpunch loop start


        ge = this.getpunch(HoOffset, condition, zx, zy);
        if (ge >= 3 && ge <= 8) { // Events that are processed by punch
          this.callEvent(ge, zx, zy);
        } 
      } 
    }

    this.pdelay++;

    if (condition === Condition.HELI || condition === Condition.SURF) {
      he = 9;
    }

    if (this.pdelay >= 6 + he) {
      this.pdelay = 0;
      if (newAction === Action.PUNCHING) {
        newAction = Action.NONE;
      }
    }

    return { velocity: newVelocity, action: newAction };
  }

  /**
   * Get punch collision detection (Java getpunch method)
   */
  private static getpunch(HoOffset: number, condition: Condition, zx: number, zy: number): number {

    let a: number, UpOffset: number;
    UpOffset = 12;

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

    for (a = UpOffset; a < 32; a += 2) {
      const currentZy = (player.gety() + a) >> 4;
      const zone = currentMap.getzone(zx, currentZy);

      if (zone >= 3) {
        return zone; // to avoid gold sacks
      }
    }

    return 0;
  }

  /**
   * Call event handler (Java callEvent method)
   */
  public static callEvent(num: number, zx: number, zy: number): void {

    const currentMap = MainEngine.getCurrentMap();
    if (!currentMap) {
      console.error('AkActions: No current map for event handling');
      return;
    }

    console.log(`AkActions: Event ${num} triggered at (${zx}, ${zy})`);

    switch (num) {
      case this.ZONE_GOLD1: // Gold I
        currentMap.settile(zx, zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(zx, zy, AkActions.NULL_ZONE);
        //FIXME this.playsound(this.snd[2]);
        this.Gold += 20;
        console.log(`AkActions: Collected Gold I (+20), Total: ${this.Gold}`);
        break;

      case this.ZONE_GOLD2: // Gold II
        currentMap.settile(zx, zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(zx, zy, AkActions.NULL_ZONE);
        //FIXME this.playsound(this.snd[2]);
        this.Gold += 10;
        break;

      case this.ZONE_ROCK: // Rock
        //FIXME this.playsound(this.snd[4]);

        // Determine rock type based on background tile
        const backgroundTile = currentMap.gettile(zx, zy, 1);
        if (backgroundTile === 32 || backgroundTile === 52) {
          this.addSprite(zx << 4, zy << 4, 3); // cave rock
        } else if (backgroundTile === 65) {
          this.addSprite(zx, zy << 4, 2); // sea rock
        } else {
          this.addSprite(zx << 4, zy << 4, 1); // common rock
        }

        currentMap.settile(zx, zy, AkActions.TILE_LAYER, AkActions.NULL_TILE);
        currentMap.setzone(zx, zy, AkActions.NULL_ZONE);
        currentMap.setobs(zx, zy, 0);
        console.log(`AkActions: Rock broken at (${zx}, ${zy}) - tile, zone, and obstruction cleared`);
        break;

      case this.ZONE_STAR: // Star
        console.log(`AkActions: Processing ZONE_STAR event`);
        //FIXME this.playsound(this.snd[5]);
        currentMap.setobs(zx, zy, 0);

        // Random gold generation (0 or 1)
        const randomValue = this.random(0, 1);
        console.log(`RBP: Random value for star: ${randomValue}`);
        if (randomValue === 0) {
          currentMap.settile(zx, zy, this.TILE_LAYER, this.TILE_GOLD_BIG);
          currentMap.setzone(zx, zy, this.ZONE_GOLD1);
          console.log(`AkActions: Star created Big Gold at (${zx}, ${zy})`);
        } else {
          currentMap.settile(zx, zy, this.TILE_LAYER, this.TILE_GOLD_SMALL);
          currentMap.setzone(zx, zy, this.ZONE_GOLD2);
          console.log(`AkActions: Star created Small Gold at (${zx}, ${zy})`);
        }

        this.addSprite(zx << 4, zy << 4, 0); // star effect
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
    this.Gold = 0;
    this.playerDimensions = { x: 0, y: 0, width: 0, height: 0 };
  }
}