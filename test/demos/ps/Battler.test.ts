/**
 * Direct port of test/demos/ps/oo/BattlerTest.java — Battler.getNaturalOrder()
 * sorts battler indices ascending by naturalOrder. The Java version only
 * printed the result for manual inspection; here we assert on it instead.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { Battler } from '../../../src/demos/ps/game/Battler';
import { EnemyBattler } from '../../../src/demos/ps/battle/EnemyBattler';
import { Enemy } from '../../../src/demos/ps/battle/Enemy';
import { PSLibEnemy, PS1Enemy, GenericEnemy } from '../../../src/demos/ps/game/PSLibEnemy';

describe('Battler.getNaturalOrder (port of BattlerTest.java)', () => {
  let enemyLib: Map<GenericEnemy, Enemy>;

  beforeAll(() => {
    enemyLib = PSLibEnemy.initializeOriginalEnemies();
  });

  function battlerFor(enemy: PS1Enemy, naturalOrder: number): Battler {
    const b = new EnemyBattler(enemyLib.get(enemy)!);
    b.naturalOrder = naturalOrder;
    return b;
  }

  /** The order returned indexes back into `battlers`, ascending by naturalOrder. */
  function assertAscendingByNaturalOrder(battlers: Battler[]): void {
    const order = Battler.getNaturalOrder(battlers);
    expect(order).toHaveLength(battlers.length);
    expect(new Set(order).size).toBe(battlers.length); // a permutation, no repeats/gaps

    for (let i = 1; i < order.length; i++) {
      expect(battlers[order[i - 1]].naturalOrder).toBeLessThanOrEqual(battlers[order[i]].naturalOrder);
    }
  }

  it('sorts battlers already in ascending order', () => {
    assertAscendingByNaturalOrder([
      battlerFor(PS1Enemy.SWORM, 1),
      battlerFor(PS1Enemy.MANEATER, 2),
      battlerFor(PS1Enemy.SCORPION, 3),
      battlerFor(PS1Enemy.OWL_BEAR, 4),
      battlerFor(PS1Enemy.GR_SLIME, 5),
    ]);
  });

  it('sorts battlers given in descending order', () => {
    assertAscendingByNaturalOrder([
      battlerFor(PS1Enemy.SWORM, 5),
      battlerFor(PS1Enemy.MANEATER, 4),
      battlerFor(PS1Enemy.SCORPION, 3),
      battlerFor(PS1Enemy.OWL_BEAR, 2),
      battlerFor(PS1Enemy.GR_SLIME, 1),
    ]);
  });

  it('sorts battlers given in random order', () => {
    assertAscendingByNaturalOrder([
      battlerFor(PS1Enemy.SWORM, 5),
      battlerFor(PS1Enemy.MANEATER, 3),
      battlerFor(PS1Enemy.SCORPION, 2),
      battlerFor(PS1Enemy.OWL_BEAR, 1),
      battlerFor(PS1Enemy.GR_SLIME, 4),
    ]);
  });
});
