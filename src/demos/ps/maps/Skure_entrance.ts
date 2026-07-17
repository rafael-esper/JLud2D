/**
 * Skure_entrance Script
 * TypeScript port of Skure_entrance.java
 */

import { PSGame } from '../PSGame';
import { Planet, City, CityHelper } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { PSSceneType, LargeEntity, PSMenu } from '../PSMenu';
import { PSOutcome } from '../menu/MenuStack';

export class Skure_entrance {

  public static async tunnel(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.SKURE_TUNNEL_IN);
  }

  public static exit(): void {
    PSGame.mapswitchToPlanet(Planet.DEZORIS, CityHelper.getX(City.SKURE_ENTRANCE), CityHelper.getY(City.SKURE_ENTRANCE));
  }

  public static async spaceship(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.ARTIC, LargeEntity.HAPSBY);
    const dest = await PSGame.hapsbyRoutine(City.SKURE);
    if (dest !== null) {
      // Close the scene onto black first — the travel chain is awaited inline
      // (Java deferred the mapswitch until after endScene)
      await PSMenu.endSceneToBlack();
      await PSGame.spaceshipRoutineStart(City.SKURE, dest);
      return;
    }
    await PSMenu.endSceneWithOutcome(PSOutcome.FADE_HOUSE);
  }
}
