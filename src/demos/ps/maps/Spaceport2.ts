/**
 * Spaceport2 City Script
 * TypeScript port of Spaceport2.java
 */

import { PSGame } from '../PSGame';
import { Planet, City } from '../game/City';
import { PSSceneType, EntityType, EntityClothes, PSMenu } from '../PSMenu';

export class Spaceport2 {

  /**
   * Quick transport to Paseo city
   */
  public static async paseo(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_People_Cop_Pass"));
    PSGame.EntFinish();
    PSGame.mapswitchToPlanet(Planet.MOTAVIA, 78, 42);
  }

  /**
   * Interactive spaceship service between Paseo and Camineet
   */
  public static async spaceship(): Promise<void> {
    await PSMenu.startScene(PSSceneType.SPACESHIP, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);

    if (await PSMenu.Prompt(PSGame.getString("Paseo_Spaceport_Shuttle"), PSGame.getYesNo()) === 1) {
      // Travel to Spaceport1 on Palma
      await PSGame.mapswitchToCity(City.SPACEPORT1, 7, 6);
    }

    await PSMenu.endScene();
  }

  /**
   * Generic NPC 1
   */
  public static async ent1(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_Spaceport_Ent1"));
    PSGame.EntFinish();
  }

  /**
   * Generic NPC 2
   */
  public static async ent2(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_Spaceport_Ent2"));
    PSGame.EntFinish();
  }

  /**
   * Generic NPC 3
   */
  public static async ent3(): Promise<void> {
    PSGame.EntStart();
    await PSMenu.Stext(PSGame.getString("Paseo_Spaceport_Ent3"));
    PSGame.EntFinish();
  }
}