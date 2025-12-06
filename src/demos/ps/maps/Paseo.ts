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
import { PS1Image } from '../game/PSLibImage';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, LargeEntity } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
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

            // TODO: Party member system not implemented yet
            // PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), PS1Image.PORTRAIT_MYAU, "chars/myau.chr"));
            // PSGame.getParty().getMember(1).advanceLevel();
            // PSGame.getParty().getMember(1).advanceLevel();
            // PSGame.getParty().getMember(1).heal();

            // TODO: Cinematic system not implemented yet
            // PSMenu.instance.back = new VImage(screen.width, screen.height);
            // PSMenu.instance.entitySprite = null;
            // await PSGame.playMusic(PS1Music.STORY);
            // await ScriptEngine.fadeout(75, false);

            // PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_1")]);
            // PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_2")]);
            // PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_3")]);
            // PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_4")]);
            // PSMenu.cinematicText(PSGame.getImage(PS1Image.CINE_ALIS), [PSGame.getString("Cinematic_Myau_5")]);
            // await PSGame.findAndPlayMusic();
            // PSGame.getParty().reallocate();

            console.log("Paseo: Myau recruited - party member and cinematic system not implemented yet");
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
    await PSGame.mapswitch(Dungeon.GOVERNOR_IN);
  }

  public static async tunnel_2(): Promise<void> {
    await PSGame.mapswitch(Dungeon.GOVERNOR_OUT);
  }

  public static async rest_house(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BROWN, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Paseo_Governor_RestHouseBefore"));
    PSGame.playSound(PS1Sound.RESTHOUSE);
    await ScriptEngine.fadeout(100, false);
    PSGame.getParty().healAll(false);
    PSGame.playSound(PS1Sound.CURE);
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

      // TODO: End game routine not implemented yet
      // PSGame.endGameRoutine();
      console.log("Paseo: End game sequence triggered - endGameRoutine not implemented yet");
      await PSMenu.endScene();
      return;
    } else if (PSGame.hasFlag(Flags.DEFEAT_LASSIC)) {
      await PSMenu.startScene(PSSceneType.PALACE, SpecialEntity.NONE);
      await PSMenu.Stext(PSGame.getString("Paseo_Mansion_Darkfalz"));
      PSGame.playSound(PS1Sound.TRAP_FALL);
      await ScriptEngine.fadeout(25, false);

      // TODO: VImage system not implemented yet
      // PSMenu.instance.back = new VImage(screen.width, screen.height);

      await PSGame.mapswitch(Dungeon.DARKFALZ_DUNGEON);
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

      // TODO: VImage and scene management system not implemented yet
      // const palace = PSMenu.instance.back;
      // PSMenu.instance.back = new VImage(screen.width, screen.height);

      await PSMenu.startScene(PSSceneType.SCREEN, SpecialEntity.NONE);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Dream"));

      // TODO: Battle system not implemented yet
      // const battle = new PSBattle();
      // await battle.startBattle([PSGame.getEnemy(PS1Enemy.SACCUBUS)], PS1Music.BATTLE);

      PSGame.getParty().healAll(true);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_BadDream"));

      // TODO: Scene restoration not implemented yet
      // PSMenu.instance.back = palace;

      await PSMenu.startSceneWithLargeEntity(PSSceneType.SCREEN, LargeEntity.GOVERNOR);
      await PSMenu.StextLast(PSGame.getString("Paseo_Governor_Greet"));
      PSGame.setFlag(Flags.MET_GOVERNOR);

      console.log("Paseo: Governor dream sequence - battle system and scene management not implemented yet");
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