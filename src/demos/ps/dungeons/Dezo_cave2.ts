/**
 * Dezo_cave2 - Dungeon Script
 * TypeScript port of Dezo_cave2.java
 */

import { PSGame } from '../PSGame';
import { Planet } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Dezo_cave2 {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Dezo_cave2);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.ZOMBIE]);
      dungeon.setFixedEnemies(0, [PS1Enemy.ZOMBIE, PS1Enemy.BATALION, PS1Enemy.ZOMBIE, PS1Enemy.ZOMBIE]);
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 159, 86);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 150, 80);
  }
}
