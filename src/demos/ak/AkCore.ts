/**
 * AkCore - Alex Kidd Core Character System
 * Centralizes all player state, properties, and core functionality
 * Combines energy, invincible, action, condition, and other character variables
 */

import { MainEngine } from '../../core/MainEngine';
import { Condition, Status, Action } from './AkMovement';

export class AkCore {
  // Centralized Akidd character object - use null values initially to avoid circular dependency
  private static akidd = {
    // Energy and health
    energy: 4,
    invincible: 0,

    // Movement and action state (will be initialized by ensureInitialized)
    condition: null as any,
    state: null as any,
    action: null as any,

    // Animation state
    playerframe: 0,

    // Collision dimensions
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,

    // Game state
    hasBrac: false,
    gold: 0,

    // Debug state
    debug: false
  };

  private static initialized = false;

  /**
   * Ensure the akidd object is properly initialized with enum values
   */
  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.akidd.condition = Condition.WALK;
      this.akidd.state = Status.STOPPED;
      this.akidd.action = Action.NONE;
      this.initialized = true;
    }
  }

  /**
   * Get energy level
   */
  public static getEnergy(): number {
    this.ensureInitialized();
    return this.akidd.energy;
  }

  /**
   * Set energy level
   */
  public static setEnergy(value: number): void {
    this.akidd.energy = Math.max(0, value);
  }

  /**
   * Decrement energy by 1
   */
  public static decrementEnergy(): void {
    if (this.akidd.energy > 0) {
      this.akidd.energy--;
    }
  }

  /**
   * Get invincible frames
   */
  public static getInvincible(): number {
    return this.akidd.invincible;
  }

  /**
   * Set invincible frames
   */
  public static setInvincible(value: number): void {
    this.akidd.invincible = Math.max(0, value);
  }

  /**
   * Decrement invincible frames
   */
  public static decrementInvincible(): void {
    if (this.akidd.invincible > 0) {
      this.akidd.invincible--;
    }
  }

  /**
   * Get current condition
   */
  public static getCondition(): Condition {
    this.ensureInitialized();
    return this.akidd.condition;
  }

  /**
   * Set condition
   */
  public static setCondition(condition: Condition): void {
    this.akidd.condition = condition;
  }

  /**
   * Get current state
   */
  public static getState(): Status {
    this.ensureInitialized();
    return this.akidd.state;
  }

  /**
   * Set state
   */
  public static setState(state: Status): void {
    this.akidd.state = state;
  }

  /**
   * Get current action
   */
  public static getAction(): Action {
    this.ensureInitialized();
    return this.akidd.action;
  }

  /**
   * Set action
   */
  public static setAction(action: Action): void {
    this.akidd.action = action;
  }

  /**
   * Get debug state
   */
  public static getDebug(): boolean {
    return this.akidd.debug;
  }

  /**
   * Set debug state
   */
  public static setDebug(debug: boolean): void {
    this.akidd.debug = debug;
  }

  /**
   * Set normal condition (from AkMovement)
   */
  public static setNormalCondition(newCondition: Condition): void {
    this.akidd.condition = newCondition;
  }

  /**
   * Get bracelet status
   */
  public static getHasBrac(): boolean {
    this.ensureInitialized();
    return this.akidd.hasBrac;
  }

  /**
   * Set bracelet status
   */
  public static setHasBrac(hasBrac: boolean): void {
    this.ensureInitialized();
    this.akidd.hasBrac = hasBrac;
  }

  /**
   * Get gold amount
   */
  public static getGold(): number {
    this.ensureInitialized();
    return this.akidd.gold;
  }

  /**
   * Set gold amount
   */
  public static setGold(amount: number): void {
    this.ensureInitialized();
    this.akidd.gold = amount;
  }

  /**
   * Add gold amount
   */
  public static addGold(amount: number): void {
    this.ensureInitialized();
    this.akidd.gold += amount;
  }

  /**
   * Get player collision dimensions
   */
  public static getPlayerCollisionBox(): { px: number, py: number, vx: number, vy: number } {
    return {
      px: this.akidd.px,
      py: this.akidd.py,
      vx: this.akidd.vx,
      vy: this.akidd.vy
    };
  }

  /**
   * Set player collision dimensions
   */
  private static setDimensions(px: number, py: number, vx: number, vy: number): void {
    this.akidd.px = px;
    this.akidd.py = py;
    this.akidd.vx = vx;
    this.akidd.vy = vy;
  }

  /**
   * Show player animation and set collision dimensions (moved from AkScene)
   * Returns the appropriate animation frame for the current state
   */
  public static showPlayer(): number {
    this.akidd.playerframe++;
    if (this.akidd.playerframe >= 6)
      this.akidd.playerframe = 0;

    const player = MainEngine.getPlayer();
    if (!player) return 0;

    // Check for punch action frame (from AkActions)
    if (this.akidd.action === Action.PUNCHING) {
      if (this.akidd.condition === Condition.SWIM) {
        this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
        return 17 - (player.getFace() * 3); // swimming
      } else {
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 5 - player.getFace(); // walking
      }
    }

    if (this.akidd.state === Status.STOPPED) {
      if (this.akidd.condition === Condition.WALK || this.akidd.condition === Condition.FLY) { // idle
        this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
        return 1 - player.getFace();
      }
    }

    if (this.akidd.state === Status.DUCKING || this.akidd.condition === Condition.STAR) { // ducking
      this.setDimensions(player.getx() + 12, player.gety() + 12, 8, 16);
      return 40 - player.getFace();
    }

    if (this.akidd.condition === Condition.WALK && this.akidd.state === Status.WALKING) { // running
      this.setDimensions(player.getx() + 12, player.gety() + 6, 8, 20);
      return 9 - (3 * player.getFace()) + (this.akidd.playerframe >> 1);
    }

    if (this.akidd.condition === Condition.SWIM) { // swimming
      this.setDimensions(player.getx() + 10, player.gety() + 11, 13, 12);
      return 15 - (3 * player.getFace()) + Math.floor(this.akidd.playerframe / 3);
    }

    if (this.akidd.condition === Condition.WALK && (this.akidd.state === Status.JUMPING || this.akidd.state === Status.FALLING)) {
      this.setDimensions(player.getx() + 10, player.gety() + 8, 12, 20);
      return 3 - player.getFace();
    }

    if (this.akidd.condition === Condition.HELI) {
      this.setDimensions(player.getx() + 6, player.gety() + 4, 20, 26);
      return 31 + ((1 - player.getFace()) * 4) + Math.floor(this.akidd.playerframe / 3);
    }

    if (this.akidd.condition === Condition.SURF) {
      return 27 + ((1 - player.getFace()) * 2) + Math.floor(this.akidd.playerframe / 3);
    }

    if (this.akidd.condition === Condition.MOTO) {
      if (this.akidd.state === Status.STOPPED || this.akidd.state === Status.WALKING) {
        this.setDimensions(player.getx() + 9, player.gety() + 7, 14, 20);
        return 21 + ((1 - player.getFace()) * 3) + Math.floor(this.akidd.playerframe / 3);
      } else {
        this.setDimensions(player.getx() + 9, player.gety() + 5, 14, 26);
        return 23 + ((1 - player.getFace()) * 3);
      }
    }

    return 0;
  }

  /**
   * Reset all character state
   */
  public static reset(): void {
    this.akidd.energy = 4;
    this.akidd.invincible = 0;
    this.akidd.condition = Condition.WALK;
    this.akidd.state = Status.STOPPED;
    this.akidd.action = Action.NONE;
    this.akidd.playerframe = 0;
    this.akidd.px = 0;
    this.akidd.py = 0;
    this.akidd.vx = 0;
    this.akidd.vy = 0;
    this.akidd.hasBrac = false;
    this.akidd.gold = 0;
    this.akidd.debug = false;
  }

  /**
   * Get complete akidd state (for debugging)
   */
  public static getAkiddState() {
    return { ...this.akidd };
  }
}