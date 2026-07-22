/**
 * EnemyBattler - Enemy Battle Wrapper
 * TypeScript port of EnemyBattler.java - Extends Battler for enemy combat participation
 */

import { Battler } from '../game/Battler';
import { Enemy, EnemyType, HasWing } from './Enemy';

export class EnemyBattler extends Battler {
  private enemy: Enemy;
  private hp: number;

  constructor(enemy: Enemy) {
    super();
    this.enemy = enemy;
    this.hp = enemy.hp;
  }

  /**
   * Get the enemy definition
   */
  public getEnemy(): Enemy {
    return this.enemy;
  }

  // Implementation of abstract Battler methods
  public getName(): string {
    return this.enemy.getName();
  }

  public getAtk(): number {
    return this.enemy.atk;
  }

  public getDef(): number {
    return this.enemy.def;
  }

  public getHp(): number {
    return this.hp;
  }

  public getMaxHp(): number {
    return this.enemy.hp;
  }

  public getAgi(): number {
    let agi = 255 - this.enemy.run;
    if (this.enemy.type === EnemyType.UNDEAD) {
      agi = Math.floor(agi / 4);
    }
    return agi;
  }

  public getStr(): number {
    return Math.floor((this.getMaxHp() + this.getAtk()) / 2);
  }

  public getMental(): number {
    return this.enemy.getMental();
  }

  public getLevel(): number {
    return 1 + Math.floor(this.hp / 10); // Default, varies between 2 (Sworm) and 50+ (Darkfalz)
  }

  public setHp(hp: number): void {
    this.hp = hp;
  }

  /**
   * Get vertical position for enemy sprite placement
   */
  public getVerticalPos(): number {
    return this.enemy.vertical;
  }

  /**
   * Get contact position where player weapon animation / magic animation connects
   */
  public getContactPos(): number {
    return this.enemy.contact;
  }

  /**
   * Check if enemy has wings (affects certain spells/abilities)
   */
  public hasWings(): boolean {
    return this.enemy.wing === HasWing.YES;
  }

  /**
   * Get enemy type for special behavior
   */
  public getType(): EnemyType {
    return this.enemy.type;
  }

  /**
   * Check if enemy can be affected by rope/bind spells
   */
  public canBeRoped(): boolean {
    return this.enemy.rope === "YES";
  }

  /**
   * Check if enemy can be affected by protection spells
   */
  public canBeProt(): boolean {
    return this.enemy.prot === "YES";
  }

  /**
   * Check if enemy resists fire attacks
   */
  public resistsFire(): boolean {
    return this.enemy.fire === "YES";
  }

  /**
   * Check if enemy can be talked to
   */
  public canTalk(): boolean {
    return this.enemy.talk === "YES";
  }

  /**
   * Check if enemy can be chatted with (using Chat spell)
   */
  public canChat(): boolean {
    return this.enemy.chat === "YES";
  }

  /**
   * Get item drop type
   */
  public getItemDrop(): string {
    return this.enemy.item;
  }

  /**
   * Get special attack type
   */
  public getSpecialAttack(): string {
    return this.enemy.special;
  }

  /**
   * Get experience points rewarded when defeated
   */
  public getExpReward(): number {
    return this.enemy.exp;
  }

  /**
   * Get mesetas rewarded when defeated
   */
  public getMstReward(): number {
    return this.enemy.mst;
  }

  /**
   * Get special attack animation shift for X axis
   */
  public getSpecialShiftX(): number {
    return this.enemy.specialShiftX;
  }

  /**
   * Get special attack animation shift for Y axis
   */
  public getSpecialShiftY(): number {
    return this.enemy.specialShiftY;
  }

  /**
   * Get attack sound effect
   */
  public getAttackSound(): any {
    return this.enemy.attackSound;
  }

  /**
   * Check if enemy is dead
   */
  public isDead(): boolean {
    return this.hp <= 0;
  }

  /**
   * Reset enemy to full health (for encounter reuse)
   */
  public reset(): void {
    this.hp = this.enemy.hp;
    this.clean(); // Clear battle status effects
  }

  /**
   * Get enemy run chance (used for escape probability)
   */
  public getRunChance(): number {
    return this.enemy.run;
  }

  /**
   * Get trap level (used for certain dungeon mechanics)
   */
  public getTrapLevel(): number {
    return this.enemy.trap;
  }

  /**
   * Create a copy of this enemy battler (for multiple enemy encounters)
   */
  public clone(): EnemyBattler {
    const clonedEnemy = this.enemy.clone();
    const clonedBattler = new EnemyBattler(clonedEnemy);

    // Copy current battle state
    clonedBattler.hp = this.hp;
    clonedBattler.boost = this.boost;
    clonedBattler.weak = this.weak;
    clonedBattler.paralyzed = this.paralyzed;

    return clonedBattler;
  }

  /**
   * Get display string for battle UI
   */
  public toString(): string {
    return `${this.getName()} (${this.hp}/${this.getMaxHp()} HP)`;
  }

  /**
   * Compare enemies by natural order (for sorting)
   */
  public compareTo(other: EnemyBattler): number {
    return this.naturalOrder - other.naturalOrder;
  }
}