/**
 * Spaceport1 City Script
 * TypeScript port of Spaceport1.java
 */

import { PSGame } from '../PSGame';
import { Planet, City } from '../game/City';
import { Flags } from '../game/GameData';
import { OriginalItem } from '../game/PSLibItem';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';
import { PSMenuShop } from '../PSMenuShop';
import { Dungeon } from '../game/Dungeon';
import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { EntityDirection } from '../../../domain/Entity';

export class Spaceport1 {

  /**
   * Quick transport to Camineet city
   */
  public static async camineet(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Camineet_People_Cop_Pass"));
    PSGame.EntFinish();
    PSGame.mapswitchToPlanet(Planet.PALMA, 72, 46);
  }

  /**
   * Quick transport to Parolit city
   */
  public static async parolit(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Parolit_People_Cop_Pass"));
    PSGame.EntFinish();
    PSGame.mapswitchToPlanet(Planet.PALMA, 70, 48);
  }

  /**
   * Interactive spaceship service between Camineet and Paseo
   */
  public static async spaceship(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SPACESHIP, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);

    if (await PSMenu.Prompt(PSGame.getString("Spaceport_Shuttle"), PSGame.getYesNo()) === 1) {
      await PSMenu.endScene();
      // Travel to Spaceport2 on Motavia
      await PSGame.mapswitchToCity(City.SPACEPORT2, 17, 18);
    } else {
      await PSMenu.endScene();
    }
  }

  /**
   * Food shop selling basic healing items
   */
  public static async food_shop(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SHOP_FOOD, EntityType.CITY_WMN_BLOND, EntityClothes.BLUE);
    await PSMenuShop.Shop(PSGame.getString("Shop_Pharmacy_Welcome"), false, PSGame.getParty(), [
      PSGame.getItem(OriginalItem.Inventory_Monomate),
      PSGame.getItem(OriginalItem.Inventory_Dimate)
    ]);
    await PSMenu.endScene();
    console.log("Spaceport1: Food shop - healing items for sale");
  }

  /**
   * Passport office with complex dialogue tree and 100 meseta cost
   */
  public static async passport(): Promise<void> {
    await PSMenu.startScene(PSSceneType.BLUE_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.GREEN);

    // Stage 1: Want a passport?
    const wantPassport = await PSMenu.Prompt(
      PSGame.getString("Spaceport_Passport_Intro"),
      PSGame.getYesNo()
    );

    if (wantPassport !== 1) { // Not "Yes"
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_No"));
      await PSMenu.endScene();
      return;
    }

    // Stage 2: Illegal activities?
    const illegalActivities = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_Yes"),
      PSGame.getYesNo()
    );

    if (illegalActivities === 1) { // "Yes" to illegal activities
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_IllegalYes"));
      await PSMenu.endScene();
      return;
    }

    // Stage 3: Any illness?
    const illness = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_IllegalNo"),
      PSGame.getYesNo()
    );

    if (illness === 1) { // "Yes" to illness
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_IllnessYes"));
      await PSMenu.endScene();
      return;
    }

    // Stage 4: Payment (100 mesetas)
    const payment = await PSMenu.PromptNext(
      PSGame.getString("Spaceport_Passport_IllnessNo"),
      PSGame.getYesNo()
    );

    if (payment !== 1) { // Not "Yes" to payment
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_PayNo"));
      await PSMenu.endScene();
      return;
    }

    // Check if player has enough money
    const party = PSGame.getParty();
    if (party.getMesetas() < 100) {
      await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_PayNoMesetas"));
      await PSMenu.endScene();
      return;
    }

    // All conditions met - issue passport
    party.removeMesetas(100);
    party.addQuestItem(PSGame.getItem(OriginalItem.Quest_Passport));
    await PSMenu.StextLast(PSGame.getString("Spaceport_Passport_PayYes"));

    await PSMenu.endScene();
    console.log("Spaceport1: Passport issued for 100 mesetas");
  }

  /**
   * Security checkpoint to enter restricted area
   */
  public static async robot_in(): Promise<void> {
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

    if (await PSMenu.Prompt(PSGame.getString("Spaceport_People_Cop"), PSGame.getYesNo()) === 1) {
      if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Passport))) {
        await PSMenu.StextLast(PSGame.getString("Spaceport_People_Cop_Yes"));
        PSGame.EntFinish();
        await ScriptEngine.fadeout(30, true);
        // Warp player to restricted area (7, 11 in tiles = 7*16, 11*16 in pixels)
        const player = MainEngine.getPlayer();
        if (player) {
          player.setxy(7 * 16, 11 * 16);
          player.setFace(EntityDirection.SOUTH);

          // Set up camera and fade in
          MainEngine.setCameraTracking(1);
          MainEngine.setupCamera();
          await ScriptEngine.fadein(30, true);
          return;
        }
      } else {
        await PSMenu.StextLast(PSGame.getString("Spaceport_People_Cop_YesLie"));
      }
    } else {
      await PSMenu.StextLast(PSGame.getString("Spaceport_People_Cop_No"));
    }

    PSGame.EntFinish();
  }

  /**
   * Exit from restricted area back to main spaceport
   */
  public static async robot_out(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Cop_Yes"));
    PSGame.EntFinish();
    await ScriptEngine.fadeout(30, true);
    // Warp player back to main area (5, 12 in tiles = 5*16, 12*16 in pixels)
    const player = MainEngine.getPlayer();
    if (player) {
      player.setxy(5 * 16, 12 * 16);
      player.setFace(EntityDirection.SOUTH);

      // Set up camera and fade in
      MainEngine.setCameraTracking(1);
      MainEngine.setupCamera();
      await ScriptEngine.fadein(30, true);
    }
  }

  /**
   * Secret entrance to Gothic Passageway (requires GOT_NOAH flag)
   */
  public static async manhole(): Promise<void> {
    if (PSGame.hasFlag(Flags.GOT_NOAH)) {
      await PSGame.mapswitchToDungeon(Dungeon.GOTHIC_PASSAGEWAY_IN);
    }
  }

  /**
   * Generic NPC 1
   */
  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent1"));
    PSGame.EntFinish();
  }

  /**
   * Generic NPC 2
   */
  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent2"));
    PSGame.EntFinish();
  }

  /**
   * Generic NPC 3
   */
  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Spaceport_People_Ent3"));
    PSGame.EntFinish();
  }
}