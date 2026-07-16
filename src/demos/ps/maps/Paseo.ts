/**
 * Paseo City Script
 * TypeScript port of Paseo.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Sound } from '../game/PSLibSound';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, LargeEntity } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1Image } from '../game/PSLibImage';
import { PSBattle } from '../battle/PSBattle';
import { PartyMember, Gender } from '../game/PartyMember';
import { Specie } from '../game/Specie';
import { Job } from '../game/Job';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class Paseo {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL, EntityType.CITY_WMN_BROWN, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH, SpecialEntity.PRIEST);
    await PSGame.Church(1);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BROWN, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Shield_Light_Barrier),
      PSGame.getItem(OriginalItem.Armor_Spiky_Fur),
      PSGame.getItem(OriginalItem.Armor_Zirconian_Mail)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    ]);
    await PSMenu.endScene();
  }

  public static async myau_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    if (PSGame.hasFlag(Flags.GOT_MYAU)) {
      await PSMenu.Stext(PSGame.getString("Paseo_Shop_MyauAfter"));
    } else {
      if (await PSMenu.Prompt(PSGame.getString("Paseo_Shop_Myau"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextLast(PSGame.getString("Paseo_Shop_MyauYes"));
      } else {
        if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot))) {
          await PSMenu.StextLast(PSGame.getString("Paseo_Shop_MyauTradeNo"));
        } else {
          if (await PSMenu.PromptNext(PSGame.getString("Paseo_Shop_MyauNo"), PSGame.getYesNo()) === 1) {
            PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Alsuline));
            await PSMenu.StextLast(PSGame.getString("Paseo_Shop_MyauTradeYes"));
            PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot));
            PSGame.setFlag(Flags.GOT_MYAU);

            PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), PS1Image.PORTRAIT_MYAU, "Myau.anim.json"));
            PSGame.getParty().getMember(1)!.advanceLevel();
            PSGame.getParty().getMember(1)!.advanceLevel();
            PSGame.getParty().getMember(1)!.heal();

            // Java: PSMenu.instance.back = new VImage(...) - black backdrop.
            // Destroy the vendor sprite (nulling the reference alone leaks the
            // Phaser image, leaving it on screen), then fade the shop out and
            // switch to a black backdrop so the cinematic portraits draw on
            // black. A camera fade would sit on TOP of the portraits (all we'd
            // see is black), so we clear it with a fadein once the backdrop is up.
            PSMenu.instance.clearEntity();
            // A Prompt leaves its text box on the stack (see PSMenu.PromptInternal);
            // wipe those lingering vendor boxes so they don't show over the cinematic.
            PSMenu.instance.clearMenus();
            await PSGame.playMusic(PS1Music.STORY);
            await ScriptEngine.fadeout(75, false);
            PSMenu.instance.setBlackBackground();
            await ScriptEngine.fadein(1, false);

            await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_1")]);
            await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_2")]);
            await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_3")]);
            await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_4")]);
            await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_5")]);
            PSGame.findAndPlayMusic();
            await PSGame.getParty().reallocate();
          } else {
            await PSMenu.StextLast(PSGame.getString("Paseo_Shop_MyauTradeNo"));
          }
        }
      }
    }
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BROWN, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Paseo_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Paseo_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Paseo_House_3"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Ent3"));
    PSGame.EntFinish();
  }

  public static async ent4(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Ent4"));
    PSGame.EntFinish();
  }

  public static async tunnel_1(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.GOVERNOR_IN);
  }

  public static async tunnel_2(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.GOVERNOR_OUT);
  }

  public static async rest_house(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Paseo_Governor_RestHouseBefore"));
    PSGame.playSound(PS1Sound.RESTHOUSE);
    await ScriptEngine.fadeout(100, false);
    PSGame.getParty().healAll(false);
    // Rest a while on the black screen before waking up (the Java fade loop
    // provided this pause implicitly by blocking for its full duration)
    await PSMenu.instance.waitDelay(125);
    PSGame.playSound(PS1Sound.CURE);
    // Java's fadeOut is transient — the next render pops the screen back. The
    // Phaser camera fade persists until an explicit fadein, so without this
    // the closing text (and the rest of the scene) plays on a black screen.
    await ScriptEngine.fadein(1, false);
    await PSMenu.Stext(PSGame.getString("Paseo_Governor_RestHouseAfter"));
    await PSMenu.endScene();
  }

  public static async governor(): Promise<void> {
    if (PSGame.hasFlag(Flags.DEFEAT_DARKFALZ)) {
      await PSGame.playMusic(PS1Music.PALACE);
      await PSMenu.startSceneWithLargeEntity(PSSceneType.PALACE, LargeEntity.GOVERNOR);
      await PSMenu.Stext(PSGame.getString("Paseo_Governor_Darkfalz"));
      if (await PSMenu.PromptNext(PSGame.getString("Paseo_Governor_End"), PSGame.getYesNo()) === 1) {
        await PSMenu.StextNext(PSGame.getString("Paseo_Governor_EndYes"));
      } else {
        await PSMenu.StextNext(PSGame.getString("Paseo_Governor_EndNo"));
      }
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_EndOk"));

      await PSGame.endGameRoutine();
      return;
    } else if (PSGame.hasFlag(Flags.DEFEAT_LASSIC)) {
      await PSMenu.startScene(PSSceneType.PALACE, SpecialEntity.NONE);
      await PSMenu.Stext(PSGame.getString("Paseo_Mansion_Darkfalz"));
      PSGame.playSound(PS1Sound.TRAP_FALL);
      await ScriptEngine.fadeout(25, false);
      // Java: PSMenu.instance.back = new VImage(...) - black backdrop

      await PSGame.mapswitchToDungeon(Dungeon.DARKFALZ_DUNGEON);
      return;
    }

    await PSMenu.startSceneWithLargeEntity(PSSceneType.PALACE, LargeEntity.GOVERNOR);
    if (!PSGame.hasFlag(Flags.MET_GOVERNOR)) {
      await PSMenu.StextNext(PSGame.getString("Paseo_Governor_Intro"));
      PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Governor_Letter));
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Rest"));

      // Resting and dream
      PSGame.getParty().healAll(false);
      PSGame.playSound(PS1Sound.RESTHOUSE);
      await ScriptEngine.fadeout(50, false);

      // Java: back = new VImage(...) — the dream plays on a black backdrop
      // (SCREEN scenes keep whatever backdrop is set). Depth 1950 keeps the
      // black at background level so the battle enemy sprites (1994) show.
      PSMenu.instance.setBlackBackground(1950);

      await PSMenu.startScene(PSSceneType.SCREEN, SpecialEntity.NONE);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Dream"));

      const battle = new PSBattle();
      await battle.startBattle([PSLibEnemy.getEnemyByEnum(PS1Enemy.SACCUBUS)!], PS1Music.BATTLE);

      PSGame.getParty().healAll(true);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_BadDream"));

      // Java: back = palace — waking up restores the palace backdrop
      PSMenu.instance.setBackground(PSGame.getImage(PSSceneType.PALACE));
      await PSMenu.startSceneWithLargeEntity(PSSceneType.SCREEN, LargeEntity.GOVERNOR);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Greet"));
      PSGame.setFlag(Flags.MET_GOVERNOR);
    } else {
      if (PSGame.hasFlag(Flags.GOT_NOAH)) {
        await PSMenu.StextNext(PSGame.getString("Paseo_Governor_Return"));
        await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Greet"));
      } else {
        await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Greet_BeforeLutz"));
      }
    }

    await PSMenu.endScene();
  }

  public static async robot_sleep(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Cop_Passage"));
    PSGame.EntFinish();
  }

  public static async robot_exit(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Cop_Exit"));
    PSGame.EntFinish();
  }

  public static motavia(): void {
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, CityHelper.getX(City.PASEO), CityHelper.getY(City.PASEO));
  }

  public static async spaceport(): Promise<void> {
    PSGame.EntStart();
    if (PSGame.hasFlag(Flags.GOT_HAPSBY)) {
      await PSMenu.Stext(PSGame.getString("Spaceport_People_Cop_Closed"));
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Passport))) {
        await PSMenu.StextLast(PSGame.getString("Spaceport_People_Cop_TakePassport"));
        PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Passport));
      }
      PSGame.EntFinish();
      return;
    }
    if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
      await PSMenu.Stext(PSGame.getString("Camineet_People_Cop_No_Pass"));
    } else {
      await PSMenu.Stext(PSGame.getString("Paseo_People_Cop_Pass"));
      PSGame.mapswitchToPlanet(Planet.MOTAVIA, 78, 35);
    }
    PSGame.EntFinish();
  }
}