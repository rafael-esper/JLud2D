/**
 * Skure_tunnel - Dungeon Script
 * TypeScript port of Skure_tunnel.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { City } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Skure_tunnel {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Skure_tunnel);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.BL_SLIME, PS1Enemy.WEREBAT]);
      dungeon.setFixedEnemies(0, [PS1Enemy.WEREBAT, PS1Enemy.WING_EYE]);
      await dungeon.startDungeon();
    }
  }

  public static async chest(): Promise<void> {
    await PSGame.chestFlag(Chest.SKURE_CHEST, 500, Trapped.NO_TRAP, null);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.SKURE_ENTRANCE, 11, 11);
  }

  public static async skure(): Promise<void> {
    await PSGame.mapswitchToCity(City.SKURE, 20, 7);
  }
}
