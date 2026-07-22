/**
 * Dezo_cave3 - Dungeon Script
 * TypeScript port of Dezo_cave3.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { Planet } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Dezo_cave3 {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Dezo_cave3);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.WT_DRAGN]);
      await dungeon.startDungeon();
    }
  }

  public static async chest(): Promise<void> {
    await PSGame.chestFlag(Chest.DEZO_CAVE3_CHEST, 0, Trapped.EXPLOSION, null);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 145, 70);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.DEZORIS, 143, 60);
  }
}
