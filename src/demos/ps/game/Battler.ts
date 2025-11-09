/**
 * Battler - Abstract Battle Entity
 * Direct port of Battler.java - Base class for all entities that can participate in battle
 */

// Forward declarations for types that will be implemented later
export interface PSEffect {
  // Will be defined when we port PSEffect
}

export interface Spell {
  // Will be defined when we port PSLibSpell
}

export interface Item {
  // Will be defined when we port Item
}

export interface MenuCHR {
  // Will be defined when we port MenuCHR
}

export interface MenuLabelBox {
  // Will be defined when we port MenuLabelBox
}

export enum Action {
  // Will be defined when we port PSBattle
  ATTACK = 'ATTACK',
  SPELL = 'SPELL',
  ITEM = 'ITEM',
  RUN = 'RUN'
}

export abstract class Battler {
  // Abstract methods that must be implemented by subclasses
  public abstract getName(): string;
  public abstract getAtk(): number;
  public abstract getDef(): number;
  public abstract getAgi(): number;
  public abstract getMental(): number;
  public abstract getStr(): number;

  public abstract getHp(): number;
  public abstract getMaxHp(): number;
  public abstract setHp(hp: number): void;

  public abstract getLevel(): number;

  // Battle only variables (transient in Java - not serialized)
  public boost: number = 0;
  public weak: number = 0;
  public paralyzed: number = 0;
  public position: number = 0;
  public target: Battler | null = null;

  public precedence: number = 0;
  public naturalOrder: number = 0;

  public action: Action | null = null;
  public effect: PSEffect | null = null;
  public usedSpell: Spell | null = null;
  public usedItem: Item | null = null;
  public sprite: MenuCHR | null = null;
  public enemyBox: MenuLabelBox | null = null;

  /**
   * Get sprite - direct port of Java getSprite()
   */
  public getSprite(): MenuCHR | null {
    return this.sprite;
  }

  /**
   * Clean battle state - direct port of Java clean()
   */
  public clean(): void {
    this.paralyzed = 0;
    this.boost = 0;
  }

  /**
   * Get natural order of battlers - direct port of Java getNaturalOrder()
   */
  public static getNaturalOrder(battlers: Battler[]): number[] {
    const ret: number[] = [];
    const marked: boolean[] = new Array(battlers.length).fill(false);

    for (let i = 0; i < battlers.length; i++) {
      let min = Number.MAX_SAFE_INTEGER;
      let minIndex = -1;

      for (let j = 0; j < battlers.length; j++) {
        if (marked[j]) {
          continue;
        }
        if (min === Number.MAX_SAFE_INTEGER || battlers[j].naturalOrder <= battlers[minIndex].naturalOrder) {
          min = battlers[j].naturalOrder;
          minIndex = j;
        }
      }

      marked[minIndex] = true;
      ret.push(minIndex);
    }

    return ret;
  }

  /**
   * Get natural order comparator - direct port of Java getNaturalComparator()
   */
  public static getNaturalComparator(): (a: Battler, b: Battler) => number {
    return (arg0: Battler, arg1: Battler) => {
      return arg0.naturalOrder - arg1.naturalOrder;
    };
  }

  /**
   * Get precedence comparator - direct port of Java getPrecedenceComparator()
   */
  public static getPrecedenceComparator(): (a: Battler, b: Battler) => number {
    return (arg0: Battler, arg1: Battler) => {
      return arg1.precedence - arg0.precedence;
    };
  }
}