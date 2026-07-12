/**
 * Eppi Village Script
 * TypeScript port of Eppi.java
 */

import { PSGame } from '../PSGame';
import { Flags, GameType } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { PS1Image } from '../game/PSLibImage';
import { PS1Music } from '../game/PSLibMusic';
import { PartyMember, Gender } from '../game/PartyMember';
import { Specie } from '../game/Specie';
import { Job } from '../game/Job';
import { ScriptEngine } from '../../../core/ScriptEngine';

export class Eppi {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Weapon_Iron_Axe),
      PSGame.getItem(OriginalItem.Weapon_Needle_Gun),
      PSGame.getItem(OriginalItem.Shield_Bronze_Shield)
    ]);
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Eppi_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Eppi_House_2"));
    await PSMenu.endScene();
  }

  public static async houseKey(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.HASHIM);
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Dungeon_Key))) {
        await PSMenu.StextLast(PSGame.getString("Eppi_House_Key_Return"));
      } else {
        if (await PSMenu.Prompt(PSGame.getString("Eppi_House_Key"), PSGame.getYesNo()) === 1) {
          await PSMenu.StextLast(PSGame.getString("Eppi_House_KeyYes"));
          PSGame.setFlag(Flags.INFO_KEY);
        } else {
          await PSMenu.StextLast(PSGame.getString("Eppi_House_KeyNo"));
        }
      }
    } else {
      // ODIN QUEST
      if (PSGame.hasFlag(Flags.GOT_MYAU)) {
        await PSMenu.Stext(PSGame.getString("Eppi_House_Key_Return"));
      } else {
        await PSMenu.Stext(PSGame.getString("Eppi_House_Key_Myau"));
        PSGame.setFlag(Flags.GOT_MYAU);

        PSGame.getParty().addMember(new PartyMember(Gender.MALE, Specie.MUSK_CAT, Job.NATURER, PSGame.getString("Name_Myau"), PS1Image.PORTRAIT_MYAU, "Myau.anim.json"));
        PSGame.getParty().getMember(1)!.advanceLevel();
        PSGame.getParty().getMember(1)!.advanceLevel();
        PSGame.getParty().getMember(1)!.heal();

        // Java: PSMenu.instance.back = new VImage(...) - black backdrop.
        // Destroy the vendor sprite (nulling the reference leaks the Phaser
        // image), fade the scene out, then switch to a black backdrop and clear
        // the camera fade so the cinematic portraits/text draw on black (a
        // lingering camera fade would sit on top and hide them). See Paseo.myau_shop.
        PSMenu.instance.clearEntity();
        // A Prompt leaves its text box on the stack (see PSMenu.PromptInternal);
        // wipe those lingering vendor boxes so they don't show over the cinematic.
        PSMenu.instance.clearMenus();
        await PSGame.playMusic(PS1Music.STORY);
        await ScriptEngine.fadeout(75, false);
        PSMenu.instance.setBlackBackground();
        await ScriptEngine.fadein(1, false);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_Odin1")]);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN), [PSGame.getString("Cinematic_Myau_Odin2")]);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_MYAU), [PSGame.getString("Cinematic_Myau_Odin3")]);
        await PSMenu.cinematicText(await PSGame.getVImage(PS1Image.CINE_ODIN), [PSGame.getString("Cinematic_Myau_Odin4")]);
        PSGame.findAndPlayMusic();
        await PSGame.getParty().reallocate();
      }
    }
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Eppi_House_3"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Eppi_House_3_Yes"));
    } else {
      await PSMenu.StextLast(PSGame.getString("Eppi_House_3_No"));
    }
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Eppi_House_4"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Eppi_People_Ent1"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.EPPI), CityHelper.getY(City.EPPI));
  }
}
