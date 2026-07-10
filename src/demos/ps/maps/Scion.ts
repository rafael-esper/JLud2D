/**
 * Scion City Script
 * TypeScript port of Scion.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { GameType, Flags } from '../game/GameData';

export class Scion {

  public static async hospital(): Promise<void> {
    await PSMenu.startScene(PSSceneType.HOSPITAL, EntityType.CITY_WMN_BLOND, EntityClothes.WHITE);
    await PSGame.Hospital(1);
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Armor_Light_Suit),
      PSGame.getItem(OriginalItem.Armor_Iron_Armor),
      PSGame.getItem(OriginalItem.Armor_Titanium_Mail)
    ]);
    await PSMenu.endScene();
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);

    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
        await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
          PSGame.getItem(OriginalItem.Inventory_Flash),
          PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
          PSGame.getItem(OriginalItem.Quest_Secret_Thing)
        ]);
      } else {
        await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
          PSGame.getItem(OriginalItem.Inventory_Flash),
          PSGame.getItem(OriginalItem.Inventory_Escape_Cloth)
        ]);
      }
    } else if (PSGame.getGameType() === GameType.PS_START_AS_ODIN) {
      await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
        PSGame.getItem(OriginalItem.Inventory_Flash),
        PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
        PSGame.getItem(OriginalItem.Quest_Compass)
      ]);
    }

    await PSMenu.endScene();
  }

  // Java's secret_item() lives in PSMenuShop.ts here - the shop's buy flow
  // handles the ItemType.SECRET "hack" inline instead of Script.callfunction

  public static async house1(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Scion_House_1"));
    await PSMenu.endScene();
  }

  public static async house2(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Scion_House_2"));
    await PSMenu.endScene();
  }

  public static async house3(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Scion_House_3"));
    await PSMenu.endScene();
  }

  public static async house4(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    if (!PSGame.hasFlag(Flags.GOT_MYAU) && PSGame.getGameType() === GameType.PS_ORIGINAL) {
      await PSMenu.Stext(PSGame.getString("Scion_House_4_PreMyau"));
    } else {
      await PSMenu.Stext(PSGame.getString("Scion_House_4_AfterMyau"));
    }
    await PSMenu.endScene();
  }

  public static async house5(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    await PSMenu.Stext(PSGame.getString("Scion_House_5"));
    await PSMenu.endScene();
  }

  public static async house6(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    if (!PSGame.hasFlag(Flags.GOT_MYAU) && PSGame.getGameType() === GameType.PS_ORIGINAL) {
      await PSMenu.Stext(PSGame.getString("Scion_House_6_PreMyau"));
    } else {
      await PSMenu.Stext(PSGame.getString("Scion_House_6_AfterMyau"));
    }
    await PSMenu.endScene();
  }

  public static async house7(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenu.Stext(PSGame.getString("Scion_House_7"));
    await PSMenu.endScene();
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Scion_People_Ent1"));
    PSGame.EntFinish();
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Scion_People_Ent2"));
    PSGame.EntFinish();
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, CityHelper.getX(City.SCION), CityHelper.getY(City.SCION));
  }
}