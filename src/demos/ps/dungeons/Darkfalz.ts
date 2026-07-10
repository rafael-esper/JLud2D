/**
 * Darkfalz - Dungeon Script (final boss dungeon under the Governor's mansion)
 * TypeScript port of Darkfalz.java
 */

import { PSGame } from '../PSGame';
import { Flags, Trap } from '../game/GameData';
import { City } from '../game/City';
import { PSLibEnemy, PS1Enemy } from '../game/PSLibEnemy';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { Paseo } from '../maps/Paseo';
import { MainEngine } from '../../../core/MainEngine';

export class Darkfalz {

  public static async startmap(): Promise<void> {
    MainEngine.setScriptContext(Darkfalz);
    PSMenu.menuOn();
    const dungeon = PSGame.getCurrentDungeonInstance();
    if (dungeon) {
      dungeon.setRandomEnemies(0, [PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.RD_DRAGN]);
      dungeon.setRandomEnemies(-1, [PS1Enemy.NESSIE, PS1Enemy.NANO_COP, PS1Enemy.SORCERER, PS1Enemy.MAGICIAN]);
      dungeon.setRandomEnemies(-2, [PS1Enemy.NESSIE, PS1Enemy.NANO_COP, PS1Enemy.SORCERER, PS1Enemy.MAGICIAN]);

      dungeon.setFixedEnemies(0, [PS1Enemy.NANO_COP, PS1Enemy.ANDROCOP, PS1Enemy.NANO_COP]);
      dungeon.setFixedEnemies(-1, [PS1Enemy.SORCERER, PS1Enemy.MAGICIAN]);
      dungeon.setFixedEnemies(-2, [PS1Enemy.NESSIE, PS1Enemy.MAGICIAN]);

      await dungeon.startDungeon();
    }
  }

  public static async trap1(): Promise<void> {
    await PSGame.trapRoutine(Trap.DARKFALZ_TRAP1, Trap.INFO_DARKFALZ_TRAP1, 25, 1);
  }

  public static async trap2(): Promise<void> {
    await PSGame.trapRoutine(Trap.DARKFALZ_TRAP2, Trap.INFO_DARKFALZ_TRAP2, 16, 23);
  }

  public static async darkfalz(): Promise<void> {
    PSMenu.setMapOff();
    await PSGame.playMusic(PS1Music.DARKFALZ);
    await PSMenu.startScene(PSSceneType.BLACK, SpecialEntity.NONE);
    await PSMenu.instance.waitDelay(200);
    const battle = new PSBattle();

    const outcome = await battle.startBattle([PSLibEnemy.getEnemyByEnum(PS1Enemy.DARKFALZ)!], PS1Music.DARKFALZ);
    if (outcome === BattleOutcome.DEFEAT) {
      await PSGame.gameOverRoutine();
    } else {
      await PSMenu.instance.waitDelay(200);
      PSGame.setFlag(Flags.DEFEAT_DARKFALZ);
      await Paseo.governor();
    }

    // Java: PSMenu.endScene() commented out
  }

  public static async exit(): Promise<void> {
    await PSGame.mapswitchToCity(City.PASEO, 20, 7);
  }
}
