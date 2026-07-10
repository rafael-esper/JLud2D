/**
 * Odin_cave - Dungeon Script
 * TypeScript port of Odin_cave.java
 */

import { PSGame } from '../PSGame';
import { Chest, Trapped, Flags, GameType } from '../game/GameData';
import { Planet } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1CHR } from '../game/PSLibCHR';
import { PS1Image } from '../game/PSLibImage';
import { PS1Music } from '../game/PSLibMusic';
import { PS1Sound } from '../game/PSLibSound';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { MenuCHR } from '../menu/MenuCHR';
import { MenuState } from '../menu/MenuType';
import { PartyMember, Gender } from '../game/PartyMember';
import { Specie } from '../game/Specie';
import { Job } from '../game/Job';
import { EnemyBattler } from '../battle/EnemyBattler';
import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class Odin_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Odin_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE]);
      dungeon.setFixedEnemies(0, [PS1Enemy.GR_SLIME, PS1Enemy.WING_EYE]);

      await dungeon.startDungeon();
    }
  }

  public static async chest1(): Promise<void> {
    await PSGame.chestFlag(Chest.ODIN_CHEST1, 10, Trapped.NO_TRAP, null);
  }

  public static async chest2(): Promise<void> {
    await PSGame.chestFlag(Chest.ODIN_CHEST2, 20, Trapped.NO_TRAP, null);
  }

  public static async chest_compass(): Promise<void> {
    if (PSGame.getGameType() !== GameType.PS_START_AS_ODIN && PSGame.hasFlag(Flags.GOT_ODIN)) {
      await PSGame.chestFlag(Chest.ODIN_COMPASS, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Quest_Compass));
    }
    // ODIN QUEST - ALL ALIVE, LEAVES COMPASS BEHIND
    else if (PSGame.getGameType() === GameType.PS_START_AS_ODIN
        && PSGame.hasFlag(Flags.GOT_MYAU)
        && !PSGame.hasFlag(Flags.ODIN_MEDUSA_COMPASS)
        && PSGame.getParty().getMember(0)!.getHp() > 0
        && PSGame.getParty().getMember(1)!.getHp() > 0) {
      await PSMenu.StextLast(PSGame.getString("Odin_Cave_Compass"));
      PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Compass));
      PSGame.setFlag(Flags.ODIN_MEDUSA_COMPASS);
    }
  }

  public static async odin(): Promise<void> {
    const currentScene = PSGame.getCurrentScene();
    if (!currentScene) return;

    if (!PSGame.hasFlag(Flags.GOT_ODIN)) {

      const odinStatue = new MenuCHR(currentScene, 140, 100, await PSGame.getCHR(PS1CHR.ODIN_STATUE));
      PSMenu.instance.push(odinStatue);
      const alsuline = PSGame.getItem(OriginalItem.Quest_Alsuline);

      if (!PSGame.getParty().hasQuestItem(alsuline)) {
        await PSMenu.instance.waitB1();
        await PSMenu.Stext(PSGame.getString("Odin_Stone"));
        PSMenu.instance.pop(); // statue
        return;
      }

      await PSMenu.instance.waitB1();

      // Alis is dead
      if (PSGame.getParty().getMember(0)!.getHp() <= 0) {
        await PSMenu.StextFirst(PSGame.getString("Item_Use", "<player>", PSGame.getParty().getMember(1)!.getName(), "<item>", alsuline.getName()));
        await PSMenu.StextLast(PSGame.getString("Odin_Item_Myau"));
        PSMenu.instance.pop(); // statue
        return;
      }

      await PSMenu.StextFirst(PSGame.getString("Item_Use", "<player>", PSGame.getParty().getMember(0)!.getName(), "<item>", alsuline.getName()));
      await PSMenu.StextLast(PSGame.getString("Odin_Item_Alsulin"));

      PSGame.getParty().removeItem(alsuline);

      odinStatue.animate(MenuState.ANIM1);
      await PSMenu.instance.waitAnimationEnd(odinStatue);
      odinStatue.animate(MenuState.ANIM2);
      await PSMenu.instance.waitB1();

      PSMenu.instance.pop(); // statue

      await Odin_cave.odinCinematicScene();

      PSGame.setFlag(Flags.GOT_ODIN);
      PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.PALMAN, Job.FIGHTER, PSGame.getString("Name_Odin"), PS1Image.PORTRAIT_ODIN, "chars/odin.chr"));
      PSGame.getParty().getMember(2)!.advanceLevel();
      PSGame.getParty().getMember(2)!.advanceLevel();
      PSGame.getParty().getMember(2)!.advanceLevel();
      PSGame.getParty().getMember(2)!.heal();
      PSGame.getParty().setOrder([0, 2, 1]);

    }
    else if (PSGame.getGameType() === GameType.PS_START_AS_ODIN && PSGame.hasFlag(Flags.ODIN_MEDUSA_COMPASS)) {
      const medusa = PSLibEnemy.getEnemyByEnum(PS1Enemy.MEDUSA)!;
      await PSGame.playMusic(PS1Music.BATTLE);
      await medusa.loadCHR(currentScene);
      await PSMenu.startSceneWithCHR(PSSceneType.CORRIDOR, medusa.getChr());
      await PSMenu.StextLast(PSGame.getString("Odin_Cave_Medusa"));

      const attacker = new EnemyBattler(medusa);
      const enemySprite = new MenuCHR(currentScene, PSMenu.instance.entityX, PSMenu.instance.entityY, medusa.getChr());
      PSMenu.instance.push(enemySprite);

      const attackSound = attacker.getEnemy().attackSound;
      if (attackSound) PSGame.playSound(attackSound);
      enemySprite.animate(MenuState.ANIM2);
      await PSMenu.instance.waitAnimationEnd(enemySprite);
      enemySprite.animate(MenuState.READY);

      await PSMenu.StextLast(PSGame.getString("Odin_Cave_Stone"));
      PSGame.playSound(PS1Sound.ESCAPE);
      await ScriptEngine.fadeout(50, false);
      ScriptEngine.stopmusic();
      await PSMenu.endScene();
      PSMenu.instance.pop();

      const odinStatue = new MenuCHR(currentScene, 140, 100, await PSGame.getCHR(PS1CHR.ODIN_STATUE));
      PSMenu.instance.push(odinStatue);

      await PSMenu.StextFirst(PSGame.getString("Odin_Cave_Alis_Help"));
      await PSMenu.StextLast(PSGame.getString("Odin_Item_Alsulin"));

      odinStatue.animate(MenuState.ANIM1);
      await PSMenu.instance.waitAnimationEnd(odinStatue);
      odinStatue.animate(MenuState.ANIM2);
      await PSMenu.instance.waitB1();

      PSMenu.instance.pop(); // statue

      await Odin_cave.odinCinematicScene();

      PSGame.setFlag(Flags.VISIT_NEKISE);
      PSGame.setFlag(Flags.VISIT_SUELO);
      PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass));
      PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));
      PSGame.getParty().addMember(new PartyMember(Gender.FEMALE, Specie.PALMAN, Job.ADVENTURER, PSGame.getString("Name_Alis"), PS1Image.PORTRAIT_ALIS, "chars/alis.chr"));

      // Exchanges Odin per Alis
      const members = PSGame.getParty().getMembers();
      const temp = members[0];
      members[0] = members[2];
      members[2] = temp;

      for (let i = 1; i < PSGame.getParty().getMember(2)!.getLevel(); i++) {
        PSGame.getParty().getMember(0)!.advanceLevel();
      }
      PSGame.getParty().getMember(0)!.equipItem(PSGame.getItem(OriginalItem.Weapon_Titanium_Sword));
      PSGame.getParty().getMember(0)!.equipItem(PSGame.getItem(OriginalItem.Armor_Light_Suit));
      PSGame.getParty().getMember(1)!.equipItem(PSGame.getItem(OriginalItem.Armor_Spiky_Fur));
      PSGame.getParty().mst += 150;

      PSGame.getParty().setOrder([0, 2, 1]);
      PSGame.gameData.setGameType(GameType.PS_ORIGINAL);
    }
  }

  private static async odinCinematicScene(): Promise<void> {
    await PSGame.playMusic(PS1Music.STORY);
    // Java: PSMenu.instance.back = new VImage(screen.width, screen.height) - black backdrop

    await PSMenu.startScene(PSSceneType.CORRIDOR, SpecialEntity.NONE);
    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN), [PSGame.getString("Cinematic_Odin_1")]);
    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Odin_2")]);
    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN), [PSGame.getString("Cinematic_Odin_3")]);
    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Odin_4")]);
    await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN), [PSGame.getString("Cinematic_Odin_5")]);

    PSGame.findAndPlayMusic();
    await PSMenu.endScene();
    await ScriptEngine.fadeout(25, false);
  }

  public static async medusa_noise(): Promise<void> {
    if (PSGame.getGameType() === GameType.PS_START_AS_ODIN) {

      if (PSGame.hasFlag(Flags.GOT_MYAU)) {
        if (!PSGame.hasFlag(Flags.ODIN_MEDUSA_HISS)) {
          await PSMenu.StextLast(PSGame.getString("Odin_Cave_Hiss"));
          PSGame.setFlag(Flags.ODIN_MEDUSA_HISS);
        }
      }
      else {
        // Odin alone: fight medusa and die
        const medusa = PSLibEnemy.getEnemyByEnum(PS1Enemy.MEDUSA)!;
        await PSGame.startBattle(PSSceneType.CORRIDOR, medusa, 1);
      }
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 78, 66);
  }
}
