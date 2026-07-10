/**
 * Lassic_castle - Dungeon Script (Sky Castle interior)
 * TypeScript port of Lassic_castle.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { City } from '../game/City';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { MainEngine } from '../../../core/MainEngine';

export class Lassic_castle {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Lassic_castle);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.GIANT, PS1Enemy.RD_DRAGN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.WYVERN, PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.WYVERN, PS1Enemy.NANO_COP, PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setRandomEnemies(-3, [PS1Enemy.MANTICORE, PS1Enemy.SKELETON_GUARD, PS1Enemy.DEATH_KNIGHT, PS1Enemy.GR_DRAGN]);
      dungeon.setRandomEnemies(-4, [PS1Enemy.GR_SLIME, PS1Enemy.DEATH_KNIGHT]);

      dungeon.setFixedEnemies(0, [PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.HORSEMAN, PS1Enemy.MAGICIAN]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.WYVERN, PS1Enemy.MAGICIAN]);
      dungeon.setFixedEnemies(-3, [PS1Enemy.SKELETON_GUARD, PS1Enemy.DEATH_KNIGHT]);
      dungeon.setFixedEnemies(-4, [PS1Enemy.MARAUDER, PS1Enemy.REAPER]);

      await dungeon.startDungeon();
    }
  }

  public static async shadow(): Promise<void> {
    if (!PSGame.hasFlag(Flags.DEFEAT_SHADOW)) {
      const currentScene = PSGame.getCurrentScene();
      if (!currentScene) return;

      const shadow = PSLibEnemy.getEnemyByEnum(PS1Enemy.SHADOW)!;
      await shadow.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, shadow.getChr());
      await PSMenu.Stext(PSGame.getString("Dark_Castle_Shadow"));
      const battle = new PSBattle();
      if (await battle.battleScene(PSSceneType.CORRIDOR, shadow, 1) === BattleOutcome.WIN) {
        await PSMenu.Stext(PSGame.getString("Dark_Castle_Shadow_Defeat"));
        PSGame.setFlag(Flags.DEFEAT_SHADOW);
      }
      await PSMenu.endScene();
    }
  }

  public static async lassic(): Promise<void> {
    if (!PSGame.hasFlag(Flags.DEFEAT_LASSIC)) {
      const currentScene = PSGame.getCurrentScene();
      if (!currentScene) return;

      const lassic = PSLibEnemy.getEnemyByEnum(PS1Enemy.LASSIC)!;
      await lassic.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.ALTAR, lassic.getChr());
      if (await PSMenu.Prompt(PSGame.getString("Dark_Castle_Lassic"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextLast(PSGame.getString("Dark_Castle_LassicYes"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Dark_Castle_LassicNo"));
      }

      PSMenu.instance.entitySprite = null;
      const battle = new PSBattle();
      const outcome = await battle.startBattle([lassic], PS1Music.LASSIC);

      if (outcome === BattleOutcome.WIN) {
        // If Alis is Dead
        if (PSGame.getParty().getMember(0)!.getHp() <= 0) {
          await PSMenu.Stext(PSGame.getString("Baya_Malay_Nero"));
          PSGame.getParty().getMember(0)!.setHp(1);
        }

        await PSMenu.Stext(PSGame.getString("Dark_Castle_LassicVictory"));
        PSGame.setFlag(Flags.DEFEAT_LASSIC);
      }
      await PSMenu.endScene();
    } else {
      await PSMenu.startScene(PSSceneType.ALTAR, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
      await PSMenu.endScene();
    }
  }

  public static async stairs_1_down(): Promise<void> {
    await PSGame.warp(19, 6, false);
  }

  public static async stairs_1_up(): Promise<void> {
    await PSGame.warp(4, 4, false);
  }

  public static async stairs_2_down(): Promise<void> {
    await PSGame.warp(4, 24, false);
  }

  public static async stairs_2_up(): Promise<void> {
    await PSGame.warp(19, 10, false);
  }

  public static async stairs_3_down(): Promise<void> {
    await PSGame.warp(19, 27, false);
  }

  public static async stairs_3_up(): Promise<void> {
    await PSGame.warp(2, 27, false);
  }

  public static async stairs_4_down(): Promise<void> {
    await PSGame.warp(11, 41, false);
  }

  public static async stairs_4_up(): Promise<void> {
    await PSGame.warp(19, 23, false);
  }

  public static async stairs_5_down(): Promise<void> {
    await PSGame.warp(17, 41, false);
  }

  public static async stairs_5_up(): Promise<void> {
    await PSGame.warp(25, 23, false);
  }

  public static async stairs_6_down(): Promise<void> {
    await PSGame.warp(26, 27, false);
  }

  public static async stairs_6_up(): Promise<void> {
    await PSGame.warp(9, 27, false);
  }

  public static async stairs_7_down(): Promise<void> {
    await PSGame.warp(11, 24, false);
  }

  public static async stairs_7_up(): Promise<void> {
    await PSGame.warp(26, 10, false);
  }

  public static async stairs_8_down(): Promise<void> {
    await PSGame.warp(26, 6, false);
  }

  public static async stairs_8_up(): Promise<void> {
    await PSGame.warp(11, 4, false);
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.SKY_CASTLE, 21, 10);
  }
}
