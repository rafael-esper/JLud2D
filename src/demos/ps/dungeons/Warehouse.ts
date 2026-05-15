/**
 * Warehouse - Dungeon Script
 * TypeScript port of Warehouse.java
 */

import { PSGame } from '../PSGame';
import { Chest, Flags, Trapped } from '../game/GameData';
import { OriginalItem } from '../game/PSLibItem';
import { City } from '../game/City';
import { MainEngine } from '../../../core/MainEngine';

export class Warehouse {

  public static async startmap(): Promise<void> {
    // Set script context to this class so chest methods can be found
    MainEngine.setScriptContext(Warehouse);
    console.log('Warehouse: Script context set to Warehouse class');

    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.NO_TRAP, null);
  }

  public static async chestKey(): Promise<void> {
    if (PSGame.hasFlag(Flags.INFO_KEY)) {
      await PSGame.chestFlag(Chest.WAREHOUSE_CHESTKEY, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Dungeon_Key));
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.CAMINEET, 32, 7);
  }

  public static trap(): void {
    // TODO: Implement trap routine
    // PSGame.chestFlag(Chest.WAREHOUSE_CHEST1, 50, Trapped.EXPLOSION, null);
    // PSGame.randomBattle(PSSceneType.CORRIDOR, [PS1Enemy.SWORM]);
    // PSGame.trapRoutine(Trap.NAHARU_TRAP, Trap.INFO_NAHARU_TRAP, 11, 6);
  }
}