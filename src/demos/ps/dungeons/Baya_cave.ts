/**
 * Baya_cave - Dungeon Script
 * TypeScript port of Baya_cave.java
 */

import { PSGame } from '../PSGame';
import { Planet } from '../game/City';
import { MainEngine } from '../../../core/MainEngine';

export class Baya_cave {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Baya_cave);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      await dungeon.startDungeon();
    }
  }

  public static drmad(): void {
    // Nonsense: Dr.Mad is not here anymore (Java comment)
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 121, 16);
  }

  public static async nextArea(): Promise<void> {
    await PSGame.mapswitchToPlanet(Planet.PALMA, 116, 9);
  }
}
