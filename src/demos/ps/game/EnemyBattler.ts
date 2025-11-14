/**
 * EnemyBattler - Enemy Battle Entity
 * Direct port of EnemyBattler.java - Extends Battler for enemy entities in combat
 */

import { Battler } from './Battler';
import { Enemy, EnemyType } from './Enemy';

export class EnemyBattler extends Battler {
  private enemy: Enemy;
  private hp: number;

  constructor(enemy: Enemy) {
    super();
    this.enemy = enemy;
    this.hp = enemy.hp;
  }

  public getEnemy(): Enemy {
    return this.enemy;
  }

  // Abstract methods implementation - direct port from Java
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

  // Where to place the enemy sprite
  public getVerticalPos(): number {
    return this.enemy.vertical;
    // return 110 + enemy.vertical +20-(enemy.getChr().fysize/2);
  }

  // Where the player weapon animation / magic animation connects
  public getContactPos(): number {
    return this.enemy.contact;
    // return 110 + enemy.vertical + enemy.getChr().hh;
  }
}