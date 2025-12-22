/**
 * Camineet City Script
 * TypeScript port of Camineet.java
 */

import { PSGame } from '../PSGame';
import { GameType, Flags } from '../game/GameData';
import { Planet, City } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { PS1Sound } from '../game/PSLibSound';
import { PS1Image } from '../game/PSLibImage';
import { Item } from '../game/Item';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, LargeEntity } from '../PSMenu';
import { PSCancellable } from '../menu/MenuStack';
import { PSMenuShop } from '../PSMenuShop';
import { PS1Enemy } from '../game/PSLibEnemy';

export class Camineet {

  public static async alis(): Promise<void> {
    await PSGame.fixedBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION])

    /*if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, SpecialEntity.NONE);
      await PSMenu.Stext(PSGame.getString("Camineet_House_Alis"));
      await PSMenu.endScene();
    } else {
      await PSMenu.startSceneWithLargeEntity(PSSceneType.YELLOW_HOUSE, LargeEntity.ALIS);
      await PSMenu.Stext(PSGame.getString("Camineet_House_Alis_Odin"));
      await PSMenu.endScene();
    }*/
  }

  public static async warehouse(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.WAREHOUSE);
  }

  public static async church(): Promise<void> {
    await PSMenu.startScene(PSSceneType.CHURCH, SpecialEntity.PRIEST);
    await PSGame.Church(1); // Cost multiplier of 1 for Camineet
    await PSMenu.endScene();
  }

  public static async yellow(): Promise<void> { // house
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Camineet_House_Man"));
    await PSMenu.endScene();
  }

  public static async oldman(): Promise<void> { // house
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Camineet_House_Oldman"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_Yes"));
    } else {
      await PSMenu.StextNext(PSGame.getString("Camineet_House_Oldman_No"));
      await PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_NoCrisis"));
    }
    await PSMenu.endScene();
    console.log("Camineet: Old man house with dialogue choice");
  }

  public static async nekise(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      if (!PSGame.hasFlag(Flags.VISIT_NEKISE)) {
         PSGame.setFlag(Flags.VISIT_NEKISE);
         await PSMenu.StextFirst(PSGame.getString("Camineet_House_Nekise_intro"));
         PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot));
         await PSMenu.StextLast(PSGame.getString("Camineet_House_Nekise_greet"));
      } else {
         await PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_greet"));
      }
      console.log("Camineet: Nekise - first visit gives Laconian Pot");
    } else {
      await PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_Odin"));
      console.log("Camineet: Nekise - Odin version");
    }
    await PSMenu.endScene();
  }

  public static async suelo(): Promise<void> {
    await PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.RED);

    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      if (!PSGame.hasFlag(Flags.VISIT_SUELO)) {
        PSGame.setFlag(Flags.VISIT_SUELO);
        await PSMenu.StextFirst(PSGame.getString("Camineet_House_Suelo_intro1"));
        await PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro2"));
        await PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro3"));
        await PSMenu.StextLast(PSGame.getString("Camineet_House_Suelo_greet"));
      } else {
        await PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_greet"));
      }
      PSGame.playSound(PS1Sound.CURE);
      PSGame.getParty().healAll(false);
      console.log("Camineet: Suelo - healing house");
    } else {
      await PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_Odin"));
      console.log("Camineet: Suelo - Odin version");
    }
    await PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenuShop.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Shield_Leather_Shield),
      PSGame.getItem(OriginalItem.Shield_Iron_Shield),
      PSGame.getItem(OriginalItem.Shield_Ceramic_Shield)
    ]);
    await PSMenu.endScene();
    console.log("Camineet: Weapon shop - shields for sale");
  }

  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate)
    ]);
    await PSMenu.endScene();
    console.log("Camineet: Food shop - healing items for sale");
  }

  public static async hand_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    await PSMenuShop.Shop(PSGame.getString("Shop_Tool_Welcome"), true, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Flash),
      PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
      PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    ]);
    await PSMenu.endScene();
    console.log("Camineet: Hand shop - tools for sale");
  }

  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Ent1"));
    PSGame.EntFinish();
    console.log("Camineet: Random citizen 1");
  }

  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Ent2"));
    PSGame.EntFinish();
    console.log("Camineet: Random citizen 2");
  }

  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Ent3"));
    PSGame.EntFinish();
    console.log("Camineet: Random citizen 3");
  }

  public static async ent4(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Ent4"));
    PSGame.EntFinish();
    console.log("Camineet: Random citizen 4");
  }

  public static exit1(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, 84, 49);
  }

  public static exit2(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, 82, 49);
  }

  public static async spaceport(): Promise<void> {
    PSGame.EntStart();
    if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
      await PSMenu.Stext(PSGame.getString("Camineet_People_Cop_No_Pass"));
    } else {
      await PSMenu.Stext(PSGame.getString("Camineet_People_Cop_Pass"));
      PSGame.mapswitchToPlanet(Planet.PALMA, 81, 46);
    }
    PSGame.EntFinish();
  }

  public static async robot1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.StextLast(PSGame.getString("Camineet_People_Cop1"));
    PSGame.EntFinish();
    console.log("Camineet: Robot guard 1");
  }

  public static async robot2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.StextLast(PSGame.getString("Camineet_People_Cop2"));
    PSGame.EntFinish();
    console.log("Camineet: Robot guard 2");
  }
}