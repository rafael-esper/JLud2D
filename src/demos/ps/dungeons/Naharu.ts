/**
 * Naharu - Dungeon Script (Noah's cave)
 * TypeScript port of Naharu.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Trap, Flags } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1Music } from '../game/PSLibMusic';
import { PS1Image } from '../game/PSLibImage';
import { PSSceneType, SpecialEntity, PSMenu, LargeEntity } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { PartyMember, Gender } from '../game/PartyMember';
import { Specie } from '../game/Specie';
import { Job } from '../game/Job';
import { MainEngine } from '../../../core/MainEngine';

export class Naharu {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Naharu);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.TARANTUL]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER, PS1Enemy.TARANTUL]);

      dungeon.setFixedEnemies(0, [PS1Enemy.GOLDLENS, PS1Enemy.RD_SLIME, PS1Enemy.RD_SLIME]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.N_FARMER, PS1Enemy.E_FARMER]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST1, 20, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST2, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Monomate));
  }

  public static async chest3(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST3, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest4(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST4, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest5(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST5, 0, Trapped.EXPLOSION, PSGame.getItem(OriginalItem.Inventory_Dimate));
  }

  public static async chest6(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST6, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Inventory_Flash));
  }

  public static async chest7(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST7, 50, Trapped.NO_TRAP, null);
  }

  public static async chest8(): Promise<void> {
    await PSGame.chestFlag(Chest.NAHARU_CHEST8, 2000, Trapped.NO_TRAP, null);
  }

  public static async stairs_1_2(): Promise<void> {
    await PSGame.warp(22, 12, false);
  }

  public static async stairs_2_1(): Promise<void> {
    await PSGame.warp(9, 12, false);
  }

  public static async stairs_2_3(): Promise<void> {
    await PSGame.warp(33, 10, false);
  }

  public static async stairs_3_2(): Promise<void> {
    await PSGame.warp(18, 11, false);
  }

  public static async dragon(): Promise<void> {
    let outcome = BattleOutcome.WIN;
    if (!PSGame.hasFlag(Flags.MONSTER_NAHARU_DRAGON)) {
      const battle = new PSBattle();
      outcome = await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.RD_DRAGN)!, 1);
      if (outcome === BattleOutcome.WIN) {
        PSGame.setFlag(Flags.MONSTER_NAHARU_DRAGON);
      }
    }
    if (outcome === BattleOutcome.WIN) {
      await PSGame.chestFlag(Chest.NAHARU_CHEST9, 3000, Trapped.NO_TRAP, null);
    }
  }

  public static async mota(): Promise<void> {
    const battle = new PSBattle();
    // Java: Script.random(2, 4) - inclusive on both ends
    const quantity = 2 + Math.floor(Math.random() * 3);
    await battle.battleScene(PSSceneType.CORRIDOR, PSLibEnemy.getEnemyByEnum(PS1Enemy.N_FARMER)!, quantity);
  }

  public static async trap(): Promise<void> {
    await PSGame.trapRoutine(Trap.NAHARU_TRAP, Trap.INFO_NAHARU_TRAP, 21, 12);
  }

  public static async noah(): Promise<void> {
    if (!PSGame.hasFlag(Flags.GOT_NOAH)) {
      await PSMenu.startSceneWithLargeEntity(PSSceneType.DUNGEON, LargeEntity.NOAH);

      const letter = PSGame.getItem(OriginalItem.Quest_Governor_Letter);

      await PSMenu.Stext(PSGame.getString("Maharu_Noah_NoLetter"));

      if (PSGame.getParty().hasQuestItem(letter)) {
        PSGame.getParty().removeItem(letter);

        await PSGame.playMusic(PS1Music.STORY);
        await PSMenu.startScene(PSSceneType.CORRIDOR, SpecialEntity.NONE);
        // Java: PSMenu.instance.back = new VImage(screen.width, screen.height) - black backdrop
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Noah_1")]);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_NOAH), [PSGame.getString("Cinematic_Noah_2")]);

        PSGame.setFlag(Flags.GOT_NOAH);
        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.ESPER, PSGame.getString("Name_Noah"), PS1Image.PORTRAIT_NOAH, "chars/noah.chr"));
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.advanceLevel();
        PSGame.getParty().getMember(3)!.heal();

        PSGame.getParty().setOrder([0, 3, 2, 1]);

        PSGame.findAndPlayMusic();
        await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.NONE);
      }

      await PSMenu.endScene();
    } else {
      await PSMenu.startScene(PSSceneType.DUNGEON, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
      await PSMenu.endScene();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.MOTAVIA, 36, 10);
  }
}
