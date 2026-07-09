/**
 * Dezoris - Phantasy Star Planet Dezoris (Dezolis) overworld script
 * TypeScript port of Dezoris.java - map init, city/dungeon entrances, and battle areas.
 */

import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { PSGame } from '../PSGame';
import { City } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { OriginalItem } from '../game/PSLibItem';
import { PS1Enemy, PS4Enemy } from '../game/PSLibEnemy';
import { PSSceneType, LargeEntity, PSMenu } from '../PSMenu';

export class Dezoris {

  public static async startmap(): Promise<void> {
    const currentMap = MainEngine.getCurrentMap();
    if (currentMap) {
      currentMap.setHorizontalWrappable(true);
      currentMap.setVerticalWrappable(true);
    }
    MainEngine.setCameraTracking(1);

    if (PSGame.getgotox() === 171 && PSGame.getgotoy() === 72) { // Luveno Spaceship
      // TODO: spaceshipRoutineAnimation("space/spaceship2.chr") not implemented yet
      console.log("Dezoris.startmap: Luveno spaceship arrival animation not implemented yet");
      return;
    }

    // TODO: PSGame.planetAllocate() not implemented yet

    // Allocate party at goto position (spawn player) and fade in
    await PSGame.getParty().allocate(PSGame.getgotox(), PSGame.getgotoy());
    MainEngine.setupCamera();
    await ScriptEngine.fadein(30, true);

    MainEngine.setEntitiesPaused(false);
    MainEngine.setScriptActive(false);
    PSGame.menuOn();
    PSGame.transportOn();

    console.log("Dezoris::mapinit");
  }

  // ******************** ICE / RANDOM ENCOUNTER TILES ********************

  public static async near_ice(): Promise<void> {
    await this.weak_ice();
    const rand = ScriptEngine.random(0, 255);
    if (rand <= 12) {
      await this.plains_stormfly_lich_stalker_ammonite();
    }
  }

  public static async near_ice_pines(): Promise<void> {
    await this.weak_ice();
    const rand = ScriptEngine.random(0, 255);
    if (rand <= 12) {
      await this.forest_lich_stalker_vampire();
    }
  }

  public static async weak_ice(): Promise<void> {
    // TODO: PSGame.breakIce() (cracking-ice tile mechanic) not implemented yet
    const rand = ScriptEngine.random(0, 255);
    if (rand <= 8) {
      await this.plains_mammoth_frostman();
    }
  }

  // ******************** CITY / DUNGEON ENTRANCES ********************

  public static async cave_bortevo_south(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BORTEVO_IN);
  }

  public static async cave_bortevo_north(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BORTEVO_OUT);
  }

  public static async skure(): Promise<void> {
    await PSGame.mapswitchToCity(City.SKURE_ENTRANCE, 16, 14);
  }

  public static async aukba(): Promise<void> {
    await PSGame.mapswitchToCity(City.AUKBA_ENTRANCE, 12, 16);
  }

  public static async cave1(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE1_IN);
  }

  public static async cave2(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE1_OUT);
  }

  public static async cave3(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE2_IN);
  }

  public static async cave4(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE2_OUT);
  }

  public static async cave5(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE3_IN);
  }

  public static async cave6(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE3_OUT);
  }

  public static async cave7(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE4_IN);
  }

  public static async cave8(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE4_OUT);
  }

  public static async cave_to_aukba(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE_AUKBA_IN);
  }

  public static async cave_from_aukba(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.DEZO_CAVE_AUKBA_OUT);
  }

  public static async corona_tower(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.CORONA);
  }

  public static async prism_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.PRISM_CAVE);
  }

  public static async shield_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.FROST_CAVE);
  }

  public static async guaron_morgue(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.GUARON_MORGUE);
  }

  public static async laerma_tree(): Promise<void> {
    await PSMenu.startSceneWithLargeEntity(PSSceneType.ARTIC, LargeEntity.LAERMA1);
    if (await PSMenu.instance.waitAnyButton() && PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch))) {
      const alivePlayer = PSGame.getParty().getFirstAlivePlayer();
      await PSMenu.Stext(PSGame.getString("Item_TookOut",
        "<player>", PSGame.getParty().getMember(alivePlayer)!.getName(),
        "<item>", PSGame.getItem(OriginalItem.Quest_Eclipse_Torch).getName()));

      await PSMenu.startSceneWithLargeEntity(PSSceneType.SCREEN_NOFADE, LargeEntity.LAERMA2);
      if (await PSMenu.instance.waitAnyButton()) {
        if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot))) {
          PSGame.getParty().removeItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch));
          PSGame.getParty().addQuestItem(PSGame.getItem(OriginalItem.Quest_Laerma_Berries));
          await PSMenu.Stext(PSGame.getString("Item_LaermaBerries_Pot", "<player>", PSGame.getParty().getMember(alivePlayer)!.getName()));
        } else {
          await PSMenu.Stext(PSGame.getString("Item_LaermaBerries_NoPot"));
        }
      }
    }
    await PSMenu.endScene();
  }

  // ******************** BATTLE AREAS ********************

  public static async forest_lich_stalker_vampire(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.PINES, [PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.VAMPIRE_LORD]);
    } else {
      await PSGame.fixedBattle(PSSceneType.PINES, [PS1Enemy.STALKER, PS1Enemy.LICH, PS1Enemy.STALKER]);
    }
  }

  public static async plains_dezorian_stormfly_scorpius(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.SCORPIUS, PS1Enemy.SCORPIUS, PS1Enemy.DEZORIAN,
        PS1Enemy.STORM_FLY, PS4Enemy.BLUE_SCORPION]);
    } else {
      await PSGame.fixedBattle(PSSceneType.ARTIC, [PS1Enemy.STORM_FLY, PS1Enemy.SCORPIUS, PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY]);
    }
  }

  public static async plains_dezorian_stormfly_lich(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.LICH, PS1Enemy.DEZORIAN, PS1Enemy.STORM_FLY, PS4Enemy.BLUE_SCORPION]);
    } else {
      await PSGame.fixedBattle(PSSceneType.ARTIC, [PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD, PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN]);
    }
  }

  public static async plains_lich_stalker_executor(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.EXECUTER]);
    } else {
      await PSGame.fixedBattle(PSSceneType.ARTIC, [PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.STALKER, PS1Enemy.LICH]);
    }
  }

  public static async plains_stormfly_lich_stalker_ammonite(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.STORM_FLY, PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.AMMONITE]);
    } else {
      await PSGame.fixedBattle(PSSceneType.ARTIC, [PS1Enemy.STORM_FLY, PS1Enemy.LICH, PS1Enemy.STORM_FLY]);
    }
  }

  public static async plains_lich_stalker_magician_battalion(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.MAGICIAN, PS1Enemy.BATALION]);
    } else {
      await PSGame.fixedBattle(PSSceneType.ARTIC, [PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST, PS1Enemy.DEZORIAN]);
    }
  }

  public static async forest_battalion_magician_vampire(): Promise<void> {
    await PSGame.randomBattle(PSSceneType.PINES, [PS1Enemy.BATALION, PS1Enemy.MAGICIAN, PS1Enemy.VAMPIRE_LORD]);
  }

  public static async forest_battalion_magician_marauder(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.PINES, [PS1Enemy.BATALION, PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER]);
    } else {
      await PSGame.fixedBattle(PSSceneType.PINES, [PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER]);
    }
  }

  public static async plains_marauder_frostman(): Promise<void> {
    await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.MARAUDER, PS1Enemy.MARAUDER, PS1Enemy.FROSTMAN]);
  }

  public static async forest_whitedragon(): Promise<void> {
    await PSGame.randomBattle(PSSceneType.PINES, [PS1Enemy.WT_DRAGN]);
  }

  public static async forest_marauder_magician(): Promise<void> {
    if (ScriptEngine.random(1, 4) <= 3) {
      await PSGame.randomBattle(PSSceneType.PINES, [PS1Enemy.MARAUDER, PS1Enemy.MARAUDER, PS1Enemy.MAGICIAN]);
    } else {
      await PSGame.fixedBattle(PSSceneType.PINES, [PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER]);
    }
  }

  public static async plains_mammoth_frostman(): Promise<void> {
    await PSGame.randomBattle(PSSceneType.ARTIC, [PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH, PS1Enemy.FROSTMAN,
      PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH, PS1Enemy.FROSTMAN,
      PS1Enemy.SNOW_LION]);
  }
}
