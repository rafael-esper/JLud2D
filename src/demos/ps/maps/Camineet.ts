/**
 * Camineet City Script
 * TypeScript port of Camineet.java
 */

import { PSGame } from '../PSGame';
import { GameType } from '../game/GameData';
import { Planet, City } from '../game/City';
import { PS1Sound } from '../game/PSLibSound';
import { PS1Image } from '../game/PSLibImage';
import { Item, OriginalItem } from '../game/Item';
import { PSSceneType, SpecialEntity, PSMenu, EntityType, EntityClothes, LargeEntity } from '../PSMenu';
import { PSCancellable } from '../menu/MenuStack';

export class Camineet {

  public static async alis(): Promise<void> {
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      PSMenu.startScene(PSSceneType.YELLOW_HOUSE, SpecialEntity.NONE);
      await PSMenu.Stext(PSGame.getString("Camineet_House_Alis"));
      PSMenu.endScene();
    } else {
      PSMenu.startSceneWithLargeEntity(PSSceneType.YELLOW_HOUSE, LargeEntity.ALIS);
      await PSMenu.Stext(PSGame.getString("Camineet_House_Alis_Odin"));
      PSMenu.endScene();
    }
  }

  public static warehouse(): void {
    // PSGame.mapswitch(Dungeon.WAREHOUSE);
    console.log("Camineet: Entering warehouse");
  }

  public static church(): void {
    PSMenu.startScene(PSSceneType.CHURCH, SpecialEntity.PRIEST);
    // PSGame.Church(1); // TODO: Implement Church method
    PSMenu.endScene();
    console.log("Camineet: Church - healing services");
  }

  public static async yellow(): Promise<void> { // house
    PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    await PSMenu.Stext(PSGame.getString("Camineet_House_Man"));
    PSMenu.endScene();
  }

  public static async oldman(): Promise<void> { // house
    PSMenu.startScene(PSSceneType.BLUE_HOUSE, SpecialEntity.OLDMAN);
    if (await PSMenu.Prompt(PSGame.getString("Camineet_House_Oldman"), PSGame.getYesNo()) === 1) {
      await PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_Yes"));
    } else {
      await PSMenu.StextNext(PSGame.getString("Camineet_House_Oldman_No"));
      await PSMenu.StextLast(PSGame.getString("Camineet_House_Oldman_NoCrisis"));
    }
    PSMenu.endScene();
    console.log("Camineet: Old man house with dialogue choice");
  }

  public static async nekise(): Promise<void> {
    PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.GREEN);
    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      // if (!PSGame.hasFlag(Flags.VISIT_NEKISE)) {
      //   PSGame.setFlag(Flags.VISIT_NEKISE);
      //   await PSMenu.StextFirst(PSGame.getString("Camineet_House_Nekise_intro"));
      //   PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot));
      //   await PSMenu.StextLast(PSGame.getString("Camineet_House_Nekise_greet"));
      // } else {
      //   await PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_greet"));
      // }
      console.log("Camineet: Nekise - first visit gives Laconian Pot");
    } else {
      await PSMenu.Stext(PSGame.getString("Camineet_House_Nekise_Odin"));
      console.log("Camineet: Nekise - Odin version");
    }
    PSMenu.endScene();
  }

  public static async suelo(): Promise<void> {
    PSMenu.startScene(PSSceneType.YELLOW_HOUSE, EntityType.VILLA_WMN_BLOND, EntityClothes.RED);

    if (PSGame.getGameType() === GameType.PS_ORIGINAL) {
      // if (!PSGame.hasFlag(Flags.VISIT_SUELO)) {
      //   PSGame.setFlag(Flags.VISIT_SUELO);
      //   await PSMenu.StextFirst(PSGame.getString("Camineet_House_Suelo_intro1"));
      //   await PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro2"));
      //   await PSMenu.StextNext(PSGame.getString("Camineet_House_Suelo_intro3"));
      //   await PSMenu.StextLast(PSGame.getString("Camineet_House_Suelo_greet"));
      // } else {
      //   await PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_greet"));
      // }
      PSGame.playSound(PS1Sound.CURE);
      PSGame.getParty().healAll(false);
      console.log("Camineet: Suelo - healing house");
    } else {
      await PSMenu.Stext(PSGame.getString("Camineet_House_Suelo_Odin"));
      console.log("Camineet: Suelo - Odin version");
    }
    PSMenu.endScene();
  }

  public static async weap_shop(): Promise<void> {
    PSMenu.startScene(PSSceneType.SHOP_WEAPON, EntityType.CITY_MAN_BLOND, EntityClothes.RED);
    // PSGame.Shop(PSGame.getString("Shop_Weapon_Welcome"), false, [
    //   PSGame.getItem(OriginalItem.Shield_Leather_Shield),
    //   PSGame.getItem(OriginalItem.Shield_Iron_Shield),
    //   PSGame.getItem(OriginalItem.Shield_Ceramic_Shield)
    // ]); // TODO: Implement Shop method
    PSMenu.endScene();
    console.log("Camineet: Weapon shop - shields for sale");
  }

  public static async food_shop(): Promise<void> {
    PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
    // PSGame.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, [
    //   PSGame.getItem(OriginalItem.Inventory_Monomate),
    //   PSGame.getItem(OriginalItem.Inventory_Dimate)
    // ]); // TODO: Implement Shop method
    PSMenu.endScene();
    console.log("Camineet: Food shop - healing items for sale");
  }

  public static async hand_shop(): Promise<void> {
    PSMenu.startScene(PSSceneType.SHOP_HAND, EntityType.CITY_MAN_BROWN, EntityClothes.GREEN);
    // PSGame.Shop(PSGame.getString("Shop_Tool_Welcome"), true, [
    //   PSGame.getItem(OriginalItem.Inventory_Flash),
    //   PSGame.getItem(OriginalItem.Inventory_Escape_Cloth),
    //   PSGame.getItem(OriginalItem.Inventory_TranCarpet)
    // ]); // TODO: Implement Shop method
    PSMenu.endScene();
    console.log("Camineet: Hand shop - tools for sale");
  }

  public static ent1(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent1"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 1");
  }

  public static ent2(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent2"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 2");
  }

  public static ent3(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent3"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 3");
  }

  public static ent4(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Ent4"));
    // PSGame.EntFinish();
    console.log("Camineet: Random citizen 4");
  }

  public static exit1(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, 84, 49);
  }

  public static exit2(): void {
    PSGame.mapswitchToPlanet(Planet.PALMA, 82, 49);
  }

  public static spaceport(): void {
    // if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Road_Pass))) {
    //   PSMenu.Stext(PSGame.getString("Camineet_People_Cop_No_Pass"));
    // } else {
    //   PSMenu.Stext(PSGame.getString("Camineet_People_Cop_Pass"));
    //   PSGame.mapswitch(Planet.PALMA, 81, 46);
    // }
    console.log("Camineet: Spaceport - need Road Pass");
  }

  public static robot1(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Cop1"));
    // PSGame.EntFinish();
    console.log("Camineet: Robot guard 1");
  }

  public static robot2(): void {
    // PSGame.EntStart();
    // PSMenu.Stext(PSGame.getString("Camineet_People_Cop2"));
    // PSGame.EntFinish();
    console.log("Camineet: Robot guard 2");
  }
}