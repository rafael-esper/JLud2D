/**
 * Aukba_tunnel - Dungeon Script
 * TypeScript port of Aukba_tunnel.java
 */

import { PSGame } from '../PSGame';
import { City } from '../game/City';
import { PS1Enemy } from '../game/PSLibEnemy';
import { MainEngine } from '../../../core/MainEngine';

export class Aukba_tunnel {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Aukba_tunnel);
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.BL_SLIME, PS1Enemy.VAMPIRE_LORD, PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST]);
      dungeon.setFixedEnemies(0, [PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST]);
      await dungeon.startDungeon();
    }
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.AUKBA_ENTRANCE, 13, 14);
  }

  public static async aukba(): Promise<void> {
    await PSGame.mapswitchToCity(City.AUKBA, 21, 21);
  }
}
