/**
 * Abion Village Script
 * TypeScript port of Abion.java
 */

import { PSGame } from '../PSGame';
import { Flags } from '../game/GameData';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, SpecialEntity, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';

export class Abion {

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH_VILLAGE, SpecialEntity.PRIEST);
    await PSGame.Church(2);
    await PSMenu.endScene();
  }

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.WHITE);
    await PSGame.Hospital(2);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.GREEN);
    if (!PSGame.hasFlag(Flags.DEFEAT_DRMAD)) {
      await PSMenu.Stext(PSGame.getString("Abion_Shop_Close"));
    } else {
      await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
        PSGame.getItem(OriginalItem.Inventory_Flash),
        PSGame.getItem(OriginalItem.Inventory_Magic_Hat),
        PSGame.getItem(OriginalItem.Inventory_Light_Pendant)
      ]);
    }
    await PSMenu.endScene();
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.BLUE);
    if (!PSGame.hasFlag(Flags.DEFEAT_DRMAD)) {
      await PSMenu.Stext(PSGame.getString("Abion_Shop_Close"));
    } else {
      await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
        PSGame.getItem(OriginalItem.Inventory_Monomate),
        PSGame.getItem(OriginalItem.Inventory_Dimate),
        PSGame.getItem(OriginalItem.Quest_Polymeteral)
      ]);
    }
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
    if (!PSGame.hasFlag(Flags.DEFEAT_DRMAD)) {
      await PSMenu.Stext(PSGame.getString("Abion_Shop_Close"));
    } else {
      await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
        PSGame.getItem(OriginalItem.Weapon_Wood_Cane),
        PSGame.getItem(OriginalItem.Armor_Diamond_Mail),
        PSGame.getItem(OriginalItem.Shield_Laser_Barrier)
      ]);
    }
    await PSMenu.endScene();
  }

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Abion_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, EntityType.VILLA_MAN_BLOND, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Abion_House_2"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Abion_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Abion_People_Ent2"));
    PSGame.EntFinish();
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Abion_People_Ent3"));
    PSGame.EntFinish();
  }

  public static async tunnel_in(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.ABION_DUNGEON_IN);
  }

  public static async tunnel_out(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.ABION_DUNGEON_OUT);
  }

  public static async drmad(): Promise<void> {
    if (PSGame.hasFlag(Flags.DEFEAT_DRMAD)) {
      await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.NONE);
      await PSMenu.instance.waitAnyButton();
      await PSMenu.endScene();
      return;
    }

    // Pre-battle confrontation with Dr. Mad
    await PSMenu.startScene(PSSceneType.VILLAGE_HOUSE, SpecialEntity.NONE);
    if (await PSMenu.Prompt(PSGame.getString("Abion_DrMad"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Abion_DrMadYes"));
      PSGame.getParty().getMember(1)?.setHp(0);
    } else {
      await PSMenu.StextLast(PSGame.getString("Abion_DrMadNo"));
    }

    // TODO: Battle system not implemented yet - would fight PS1Enemy.DR_MAD here.
    // On WIN: PSGame.setFlag(Flags.DEFEAT_DRMAD) and grant the Laconian Pot chest.
    console.log("Abion: Dr. Mad battle not implemented yet");

    PSGame.getParty().reallocate();
    await PSMenu.endScene();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.ABION), CityHelper.getY(City.ABION));
  }
}
