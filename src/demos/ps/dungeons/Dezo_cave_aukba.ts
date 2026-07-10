/**
 * Dezo_cave_aukba - Dungeon Script
 * TypeScript port of Dezo_cave_aukba.java
 */

import { PSGame } from '../PSGame';
import { Planet } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Dezo_cave_aukba {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Dezo_cave_aukba);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION]);
      dungeon.setFixedEnemies(0, [PS1Enemy.BATALION, PS1Enemy.LICH, PS1Enemy.BATALION]);
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 172, 50);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 179, 34);
  }
}
