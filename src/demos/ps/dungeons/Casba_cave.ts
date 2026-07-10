/**
 * Casba_cave - Dungeon Script
 * TypeScript port of Casba_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Flags } from '../game/GameData';
import { Planet, City } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PSSceneType } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Casba_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Casba_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.SKULL_EN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.G_SCORPI, PS1Enemy.SKULL_EN]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.SPHINX, PS1Enemy.ZOMBIE, PS1Enemy.MOTA_SHOOTER, PS1Enemy.TARANTUL]);

      dungeon.setFixedEnemies(0, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.GOLDLENS, PS1Enemy.G_SCORPI]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.ZOMBIE, PS1Enemy.RD_SLIME]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST1, 100, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST2, 0, Trapped.EXPLOSION, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST3, 100, Trapped.NO_TRAP, null);
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST4, 500, Trapped.NO_TRAP, null);
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST5, 5000, Trapped.NO_TRAP, null);
  }

  public static async red_dragon(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_CASBA_RD_DRAGON)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_DRAGN)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_CASBA_RD_DRAGON);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Light_Saber));
    }
  }

  public static async bl_dragon(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_CASBA_BL_DRAGON)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.BL_DRAGN)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_CASBA_BL_DRAGON);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.CASBA_CAVE_CHEST7, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Carbunckle_Eye));
    }
  }

  public static async stairs1_up(): Promise<void> {
    await PSGame.warp(6, 8, false);
  }

  public static async stairs1_down(): Promise<void> {
    await PSGame.warp(20, 10, false);
  }

  public static async stairs2_up(): Promise<void> {
    await PSGame.warp(17, 11, false);
  }

  public static async stairs2_down(): Promise<void> {
    await PSGame.warp(7, 27, false);
  }

  public static async stairs3_up(): Promise<void> {
    await PSGame.warp(18, 1, false);
  }

  public static async stairs3_down(): Promise<void> {
    await PSGame.warp(8, 17, false);
  }

  public static async stairs4_up(): Promise<void> {
    await PSGame.warp(8, 6, false);
  }

  public static async stairs4_down(): Promise<void> {
    await PSGame.warp(26, 2, false);
  }

  public static async stairs5_up(): Promise<void> {
    await PSGame.warp(7, 14, false);
  }

  public static async stairs5_down(): Promise<void> {
    await PSGame.warp(21, 14, false);
  }

  public static async stairs6_up(): Promise<void> {
    await PSGame.warp(15, 13, false);
  }

  public static async stairs6_down(): Promise<void> {
    await PSGame.warp(9, 25, false);
  }

  public static async stairs7_up(): Promise<void> {
    await PSGame.warp(20, 3, false);
  }

  public static async stairs7_down(): Promise<void> {
    await PSGame.warp(10, 19, false);
  }

  public static async stairs8_up(): Promise<void> {
    await PSGame.warp(10, 4, false);
  }

  public static async stairs8_down(): Promise<void> {
    await PSGame.warp(24, 4, false);
  }

  public static async casba(): Promise<void> {
    await PSGame.mapswitchToCity(City.CASBA, 26, 11);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.MOTAVIA, 71, 94);
  }
}
