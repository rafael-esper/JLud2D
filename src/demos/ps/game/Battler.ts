/**
 * Battler - Abstract Battle Entity
 * Base class for all entities that can participate in battle
 */

import { Action } from './PSBattle';
import { PSEffect } from './PSEffect';
import { Spell } from './PSLibSpell';
import { Item } from './Item';
import { MenuCHR } from '../menu/MenuCHR';
import { MenuLabelBox } from '../menu/MenuLabelBox';

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
   * Get sprite
   */
  public getSprite(): MenuCHR | null {
    return this.sprite;
  }

  /**
   * Clean battle state
   */
  public clean(): void {
    this.paralyzed = 0;
    this.boost = 0;
  }

  /**
   * Get natural order of battlers
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
   * Get natural order comparator
   */
  public static getNaturalComparator(): (a: Battler, b: Battler) => number {
    return (arg0: Battler, arg1: Battler) => {
      return arg0.naturalOrder - arg1.naturalOrder;
    };
  }

  /**
   * Get precedence comparator
   */
  public static getPrecedenceComparator(): (a: Battler, b: Battler) => number {
    return (arg0: Battler, arg1: Battler) => {
      return arg1.precedence - arg0.precedence;
    };
  }
}