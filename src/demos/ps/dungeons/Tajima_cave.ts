/**
 * Tajima_cave - Dungeon Script (Tajim's cave)
 * TypeScript port of Tajima_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { Battler } from '../game/Battler';
import { EnemyBattler } from '../battle/EnemyBattler';
import { MainEngine } from '../../../core/MainEngine';

export class Tajima_cave {

  // Monsters (1): owl bear, red slime, e.farmer, tarantul
  // Monsters (2): wight, sphinx, serpent, batallion
  // Monsters (3): skeleton, vampire, amundsen, red dragon

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Tajima_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.WIGHT, PS1Enemy.DRAINER_CRAB, PS1Enemy.MOTA_SHOOTER, PS1Enemy.SKULL_EN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.WIGHT, PS1Enemy.SPHINX, PS1Enemy.NESSIE, PS1Enemy.ZOMBIE, PS1Enemy.DRAINER_CRAB]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.DRAINER_CRAB, PS1Enemy.AMUNDSEN, PS1Enemy.RD_DRAGN, PS1Enemy.WIZARD]);

      dungeon.setFixedEnemies(0, [PS1Enemy.WIGHT, PS1Enemy.SKULL_EN, PS1Enemy.SKULL_EN]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.WIGHT, PS1Enemy.BATALION, PS1Enemy.ZOMBIE]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.DRAINER_CRAB, PS1Enemy.WIZARD, PS1Enemy.DRAINER_CRAB]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST1, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Armor_White_Cloak));
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST2, 3000, Trapped.NO_TRAP, null);
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Wood_Cane));
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST5, 0, Trapped.EXPLOSION, null);
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST7, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST8, 500, Trapped.NO_TRAP, null);
  }

  public static async chest9(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST9, 0, Trapped.EXPLOSION, null);
  }

  public static async chest10(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST10, 0, Trapped.ARROW, null);
  }

  public static async chest11(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST11, 100, Trapped.NO_TRAP, null);
  }

  public static async chest12(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST12, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Weapon_Titanium_Sword));
  }

  public static async chest13(): Promise<void> {
    await PSGame.chestFlag(Chest.TAJIMA_CAVE_CHEST13, 0, Trapped.EXPLOSION, null);
  }

  public static async tajima(): Promise<void> {
    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    const tajima = PSLibEnemy.getEnemyByEnum(PS1Enemy.TARZIMAL)!;
    const noah = PSGame.getParty().getMember(3);
    await tajima.loadCHR(currentScene);
    await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, tajima.getChr());

    if (PSGame.hasFlag(Flags.DEFEAT_TAJIMA)) {
      await PSMenu.StextLast(PSGame.getString("Tajim_Return"));
    } else if (!noah) {
      // Party doesn't have a 4th member yet - nothing happens (Java would NPE)
      await PSMenu.instance.waitAnyButton();
    } else {
      // If Noah is dead
      if (noah.getHp() <= 0) {
        if (await PSMenu.Prompt(PSGame.getString("Tajim_WithoutLutz"), PSGame.getYesNo()) === 1) {
          await PSMenu.StextLast(PSGame.getString("Tajim_WithoutLutzYes"));
        } else {
          await PSMenu.StextLast(PSGame.getString("Tajim_WithoutLutzNo"));
        }
      }
      // If Noah is alive
      else {
        await PSMenu.StextLast(PSGame.getString("Tajim_Intro"));
        await PSGame.playMusic(PS1Music.BATTLE);
        const battle = new PSBattle();
        const battlerList: Battler[] = [];
        battlerList.push(noah);
        battlerList.push(new EnemyBattler(tajima));
        PSMenu.instance.entitySprite = null;
        const battleResult = await battle.startBattleWithBattlers(battlerList);
        await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, tajima.getChr());
        if (battleResult === BattleOutcome.WIN) {
          await PSMenu.StextLast(PSGame.getString("Tajim_Victory"));
          noah.addItem(PSGame.getItem(OriginalItem.Armor_Frad_Cloak));
          PSGame.setFlag(Flags.DEFEAT_TAJIMA);
        } else {
          await PSMenu.StextLast(PSGame.getString("Tajim_Defeat"));
          noah.setHp(1);
        }
      }
    }

    await PSMenu.endScene();
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(23, 12, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(5, 12, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(20, 26, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(28, 12, false);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.MOTAVIA, 20, 73);
  }
}
