/**
 * Warehouse - Dungeon Script
 * TypeScript port of Warehouse.java
 */

import { PSGame } from '../PSGame';
import { Chest, Flags, Trapped } from '../game/GameData';
import { OriginalItem } from '../game/PSLibItem';
import { City } from '../game/City';

export class Warehouse {

  public static async startmap(): Promise<void> {
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static chest1(): void {
    PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.NO_TRAP, null);
  }

  public static chestKey(): void {
    if (PSGame.hasFlag(Flags.INFO_KEY)) {
      PSGame.chestFlag(Chest.WAREHOUSE_CHESTKEY, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Dungeon_Key));
    }
  }

  public static exit(): void {
    PSGame.mapswitchToCity(City.CAMINEET, 32, 7);
  }

  public static trap(): void {
    // TODO: Implement trap routine
    // PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.EXPLOSION, null);
    // PSGame.randomBattle(PSSceneType.CORRIDOR, [PS1Enemy.SWORM]);
    // PSGame.trapRoutine(Trap.NAHARU_TRAP, Trap.INFO_NAHARU_TRAP, 11, 6);
  }
}