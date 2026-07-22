/**
 * Abion_dungeon - Dungeon Script
 * TypeScript port of Abion_dungeon.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped } from '../game/GameData';
import { City } from '../game/City';
import { MainEngine } from '../../../core/MainEngine';

export class Abion_dungeon {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Abion_dungeon);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.ABION_CHEST1, 20, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.ABION_CHEST2, 30, Trapped.NO_TRAP, null);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.ABION, 7, 16);
  }

  public static async dr_mad(): Promise<void> {
    await PSGame.mapswitchToCity(City.ABION, 21, 16);
  }
}
