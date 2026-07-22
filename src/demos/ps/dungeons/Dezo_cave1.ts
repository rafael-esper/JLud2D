/**
 * Dezo_cave1 - Dungeon Script
 * TypeScript port of Dezo_cave1.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { Planet } from '../game/City';
import { PS1Enemy, PS4Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Dezo_cave1 {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Dezo_cave1);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.SCORPIUS, PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.GHOUL, PS4Enemy.BLUE_SCORPION]);
      dungeon.setFixedEnemies(0, [PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY, PS1Enemy.STORM_FLY]);
      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.DEZO_CAVE1_CHEST1, 0, Trapped.ARROW, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.DEZO_CAVE1_CHEST2, 100, Trapped.NO_TRAP, null);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 182, 92);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 164, 92);
  }
}
