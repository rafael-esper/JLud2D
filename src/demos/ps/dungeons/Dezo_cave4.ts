/**
 * Dezo_cave4 - Dungeon Script
 * TypeScript port of Dezo_cave4.java
 */

import { PSGame } from '../PSGame';
import { Planet } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Dezo_cave4 {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Dezo_cave4);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.LICH, PS1Enemy.WYVERN, PS1Enemy.SNOW_LION, PS1Enemy.BATALION]);
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 95, 46);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 95, 37);
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(7, 8, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(3, 8, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(8, 3, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(8, 7, false);
  }
}
