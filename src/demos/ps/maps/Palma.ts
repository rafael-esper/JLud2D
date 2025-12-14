/**
 * Palma - Phantasy Star Planet Palma Script
 * Direct port of Palma.java - Handles map initialization, city entrances, and battle areas
 */

import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { PSGame } from '../PSGame';
import { PSMenu } from '../PSMenu';
import { City } from '../game/City';
import { Dungeon, EntityDirection } from '../game/Dungeon';
import { PSSceneType, SpecialEntity } from '../PSMenu';
import { PS1Enemy, PS4Enemy } from '../game/PSLibEnemy';
import { OriginalItem } from '../game/PSLibItem';
import { Entity } from '../../../domain/Entity';

export class Palma {

  public static async startmap(): Promise<void> {
    const currentMap = MainEngine.getCurrentMap();
    if (currentMap) {
      currentMap.setHorizontalWrappable(true);
      currentMap.setVerticalWrappable(true);
    }
    MainEngine.setCameraTracking(1);

    if (PSGame.getgotox() === 70 && PSGame.getgotoy() === 46) { // Regular Spaceship
      if (currentMap) {
        currentMap.setRenderstring("1,2,E,R");
      }
      // PSGame.spaceshipRoutineAnimation("space/spaceship1.chr"); // TODO: Not implemented yet
      return;
    }
    if (PSGame.getgotox() === 52 && PSGame.getgotoy() === 56) { // Luveno Spaceship
      // PSGame.spaceshipRoutineAnimation("space/spaceship2.chr"); // TODO: Not implemented yet
      return;
    }

    // PSGame.planetAllocate(); // TODO: Not implemented yet

    console.log("Palma::mapinit");

    // Debug spaceport transition coordinates
    const gotox = PSGame.getgotox();
    const gotoy = PSGame.getgotoy();
    console.log(`Palma.startmap: gotox=${gotox}, gotoy=${gotoy}`);

    // Spaceport transitions with animation
    if (gotox === 81 && gotoy === 46) { // Camineet To Spaceport
      console.log("Palma.startmap: Triggering Camineet to Spaceport transition");
      await PSGame.spaceportTransition(EntityDirection.WEST, 70, City.SPACEPORT1, 28, 12);
    } else if (gotox === 72 && gotoy === 46) { // Spaceport To Camineet
      console.log("Palma.startmap: Triggering Spaceport to Camineet transition");
      await PSGame.spaceportTransition(EntityDirection.EAST, 82, City.CAMINEET, 7, 16);
    } else if (gotox === 70 && gotoy === 48) { // Spaceport To Parolit
      console.log("Palma.startmap: Triggering Spaceport to Parolit transition");
      await PSGame.spaceportTransition(EntityDirection.SOUTH, 58, City.PAROLIT, 17, 6);
    } else if (gotox === 70 && gotoy === 57) { // Parolit To Spaceport
      console.log("Palma.startmap: Triggering Parolit to Spaceport transition");
      await PSGame.spaceportTransition(EntityDirection.NORTH, 46, City.SPACEPORT1, 17, 18);
    } else {
      console.log("Palma.startmap: No spaceport transition triggered for these coordinates");
      // Continue with normal Palma map initialization for regular coordinates

      // Allocate party at goto position (spawn player)
      await PSGame.getParty().allocate(PSGame.getgotox(), PSGame.getgotoy());

      // Setup camera to center on player after spawning
      MainEngine.setupCamera();

      await ScriptEngine.fadein(30, true);

      // Enable normal gameplay after fade-in
      MainEngine.setEntitiesPaused(false);
      MainEngine.setScriptActive(false);
      PSGame.menuOn();
      PSGame.transportOff();
    }

    // PSGame.transportOn(); // TODO: Not implemented yet
  }

  public static async camineet(): Promise<void> {
    await PSGame.mapswitchToCity(City.CAMINEET, 32, 14);
  }

  public static async loar(): Promise<void> { // 1 Loar
    await PSGame.mapswitchToCity(City.LOAR, 6, 10);
  }

  public static async parolit(): Promise<void> { // 3 Parolit
    await PSGame.mapswitchToCity(City.PAROLIT, 15, 21);
  }

  public static async eppi(): Promise<void> { // 4 Eppi
    await PSGame.mapswitchToCity(City.EPPI, 11, 16);
  }

  public static async bortevo(): Promise<void> { // 5 Bortevo
    await PSGame.mapswitchToCity(City.BORTEVO, 6, 13);
  }

  public static async gothic(): Promise<void> {
    await PSGame.mapswitchToCity(City.GOTHIC, 32, 15);
  }

  public static async scion(): Promise<void> {
    await PSGame.mapswitchToCity(City.SCION, 7, 16);
  }

  public static async naula_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.NAULA);
  }

  public static async iala_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.IALA);
  }

  public static async prison_in(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.PRISON_IN);
  }

  public static async prison_out(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.PRISON_OUT);
  }

  public static async cave_baya_in(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.CAVE_BAYA_IN);
  }

  public static async cave_baya_out(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.CAVE_BAYA_OUT);
  }

  public static async baya_malay_tower(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BAYA_MALAY);
  }

  public static async abion(): Promise<void> {
    await PSGame.mapswitchToCity(City.ABION, 20, 25);
  }

  public static async drasgow(): Promise<void> {
    await PSGame.mapswitchToCity(City.DRASGOW, 10, 13);
  }

  public static async triada(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.TRIADA);
  }

  public static async odin_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.ODIN_CAVE);
  }

  public static async cave_bortevo_south(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BORTEVO_IN);
  }

  public static async cave_bortevo_north(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.BORTEVO_OUT);
  }

  public static async medusa_tower(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.MEDUSA_TOWER);
  }

  public static async lost_island(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.LOST_ISLAND);
  }

  // *********************** BATTLE AREAS **********************************
  // TODO: Battle system not implemented yet - commenting out all battle methods

  public static async parolit_forest(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.SWORM, PS1Enemy.OWL_BEAR]); // TODO: Not implemented yet
  }

  public static async owlbear_sworm(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.SWORM, PS1Enemy.OWL_BEAR, PS1Enemy.OWL_BEAR]); // TODO: Not implemented yet
  }

  public static async owlbear_deadtree(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.DEADTREE, PS1Enemy.OWL_BEAR, PS1Enemy.OWL_BEAR]); // TODO: Not implemented yet
  }

  public static async sworm_scorpion(): Promise<void> {
    if (ScriptEngine.random(1, 6) <= 4) {
      await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION]);
    } else {
      await PSGame.fixedBattle(PSSceneType.FIELDS, [PS1Enemy.SCORPION]);
    }
  }

  public static async sworm_scorpion_maneater(): Promise<void> {
    // TODO: Battle system not implemented yet
    // if (ScriptEngine.random(1, 5) <= 4) {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.MANEATER]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.SWORM]);
    // }
  }

  public static async sworm_scorpion_deadtree(): Promise<void> {
    // TODO: Battle system not implemented yet
    // if (ScriptEngine.random(1, 5) <= 4) {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.DEADTREE]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FIELDS, [PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.SCORPION, PS1Enemy.SWORM]);
    // }
  }

  public static async beach_bigclub(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.BEACH, [PS1Enemy.BIG_CLUB]); // TODO: Not implemented yet
  }

  public static async beach_shelfish(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.BEACH, [PS1Enemy.SHELFISH]); // TODO: Not implemented yet
  }

  public static async tarantul_evildead(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.TARANTUL, PS1Enemy.EVILDEAD]); // TODO: Not implemented yet
  }

  public static async evildead_owlbear(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.EVILDEAD, PS1Enemy.OWL_BEAR]); // TODO: Not implemented yet
  }

  public static async wingeye_tarantul(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.WING_EYE, PS1Enemy.TARANTUL]); // TODO: Not implemented yet
  }

  public static async eppi_bushes(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.WING_EYE, PS1Enemy.TARANTUL, PS1Enemy.TARANTUL]); // TODO: Not implemented yet
  }

  public static async eppi_forest(): Promise<void> {
    // TODO: Quest and battle system not implemented yet
    // if (!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass))) {
    //   PSGame.transportOff();
    //   PSMenu.startScene(PSSceneType.FOREST, SpecialEntity.NONE);
    //   await PSMenu.Stext(PSGame.getString("Eppi_Lost_Woods"));
    //
    //   PSGame.getOutOfCurrentZone();
    //
    //   PSMenu.endScene();
    //
    //   PSGame.transportOn();
    // } else if (ScriptEngine.random(0, 255) < 16) {
    //   if (ScriptEngine.random(1, 6) === 1) {
    //     // await PSGame.fixedBattle(PSSceneType.FOREST, [PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WING_EYE]);
    //   } else {
    //     // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WEREBAT]);
    //   }
    // }
  }

  public static async forest_tarantul_deadtree_giantfly_owlbear(): Promise<void> { // palma main continent hard forest
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 6) === 1) {
    //   await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.TARANTUL, PS1Enemy.DEADTREE, PS1Enemy.GIANTFLY, PS1Enemy.OWL_BEAR]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FOREST, [PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION]);
    // }
  }

  public static async beach_fishman(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.BEACH, [PS1Enemy.FISHMAN]);
  }

  public static async beach_octopus(): Promise<void> {
    // await PSGame.randomBattle(PSSceneType.BEACH, [PS1Enemy.OCTOPUS]);
  }

  public static async forest_gaia(): Promise<void> { // baya malay area
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 3) <= 2) {
    //   await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.GAIA]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FOREST, [PS1Enemy.WIGHT, PS1Enemy.MARAUDER, PS1Enemy.WIGHT]);
    // }
  }

  public static async fields_marauder_horseman(): Promise<void> { // baya malay area
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 4) <= 3) {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.MARAUDER, PS1Enemy.HORSEMAN]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FIELDS, [PS1Enemy.HORSEMAN, PS1Enemy.MARAUDER, PS1Enemy.HORSEMAN]);
    // }
  }

  public static async sea_octopus(): Promise<void> { // sea near abion island
    // await PSGame.randomBattle(PSSceneType.SEA, [PS1Enemy.OCTOPUS]);
  }

  public static async sea_shelfish(): Promise<void> { // river
    // await PSGame.randomBattle(PSSceneType.SEA, [PS1Enemy.SHELFISH]);
  }

  public static async sea_fishman_bigclub_evildead(): Promise<void> { // sea near main continent
    // await PSGame.randomBattle(PSSceneType.SEA, [PS1Enemy.FISHMAN, PS1Enemy.BIG_CLUB, PS1Enemy.EVILDEAD]);
  }

  public static async sea_wyvern_evildead_octopus(): Promise<void> { // deep sea
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 5) <= 4) {
    //   await PSGame.randomBattle(PSSceneType.SEA, [PS1Enemy.WYVERN, PS1Enemy.WYVERN, PS1Enemy.WIGHT, PS1Enemy.OCTOPUS]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.SEA, [PS1Enemy.WIGHT, PS1Enemy.WYVERN, PS1Enemy.WYVERN]);
    // }
  }

  public static async forest_tarantul_skeleton_giantfly_owlbear(): Promise<void> { // near gothic
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.TARANTUL, PS1Enemy.SKELETON, PS1Enemy.GIANTFLY, PS1Enemy.OWL_BEAR]);
  }

  public static async fields_poisonplant_skeleton_evildead(): Promise<void> { // path to medusa
    // await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.POISON_PLANT, PS1Enemy.SKELETON, PS1Enemy.EVILDEAD]);
  }

  public static async forest_serpent(): Promise<void> { // near triada/medusa
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.SERPENT]);
  }

  public static async fields_poisonplant_manticor(): Promise<void> { // path to bortevo
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 5) <= 4) {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.POISON_PLANT, PS1Enemy.POISON_PLANT, PS4Enemy.RED_SCORPION, PS1Enemy.MANTICORE]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FIELDS, [PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION]);
    // }
  }

  public static async forest_ghoul_evildead_giantfly(): Promise<void> { // path to bortevo
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 5) <= 4) {
    //   await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.GHOUL, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FOREST, [PS1Enemy.SKELETON, PS1Enemy.GHOUL, PS1Enemy.EVILDEAD]);
    // }
  }

  public static async forest_vampire_manticor_skeleton_poisonplant(): Promise<void> { // abion island
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 7) <= 6) {
    //   await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.VAMPIRE, PS1Enemy.POISON_PLANT, PS1Enemy.MANTICORE, PS1Enemy.SKELETON]);
    // } else {
    //   await PSGame.fixedBattle(PSSceneType.FOREST, [PS1Enemy.SKELETON, PS1Enemy.VAMPIRE, PS1Enemy.VAMPIRE, PS1Enemy.SKELETON]);
    // }
  }

  public static async forest_vampire_skeleton_giantspider(): Promise<void> { // near abion
    // await PSGame.randomBattle(PSSceneType.FOREST, [PS1Enemy.VAMPIRE, PS1Enemy.SKELETON, PS1Enemy.GIANT_SPIDER]);
  }

  public static async fields_elephant_giant_evildead(): Promise<void> { // abion island
    // TODO: ScriptEngine.random not implemented yet
    // if (ScriptEngine.random(1, 6) <= 5) {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.ELEPHANT, PS1Enemy.GIANT, PS1Enemy.EVILDEAD]);
    // } else {
    //   await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.ELEPHANT, PS1Enemy.GIANT, PS1Enemy.ELEPHANT]);
    // }
  }

  public static async nest_giantspider_skeleton_giant(): Promise<void> { // abion island nest
    // await PSGame.randomBattle(PSSceneType.FIELDS, [PS1Enemy.GIANT_SPIDER, PS1Enemy.GIANT_SPIDER, PS1Enemy.SKELETON, PS1Enemy.GIANT]);
  }

  public static async lava(): Promise<void> {
    // TODO: Battle and random system not implemented yet
    // const rand = ScriptEngine.random(0, 255);
    // if (rand <= 16) {
    //   if (ScriptEngine.random(1, 6) <= 5) {
    //     await PSGame.randomBattle(PSSceneType.LAVA, [PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY, PS1Enemy.SERPENT]);
    //   } else {
    //     await PSGame.fixedBattle(PSSceneType.LAVA, [PS1Enemy.GIANTFLY, PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY]);
    //   }
    // }

    // TODO: Transport system not implemented yet
    // if (PSGame.isOnTransport()) {
    //   return;
    // }

    // PSGame.damageParty(2, PSSceneType.LAVA);
  }

  public static async lava_baya(): Promise<void> {
    // TODO: Battle and random system not implemented yet
    // const rand = ScriptEngine.random(0, 255);
    // if (rand <= 16) {
    //   if (ScriptEngine.random(1, 4) <= 3) {
    //     await PSGame.randomBattle(PSSceneType.LAVA, [PS1Enemy.MARMAN, PS1Enemy.TENTACLE]);
    //   } else {
    //     await PSGame.fixedBattle(PSSceneType.LAVA, [PS1Enemy.TENTACLE, PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY]);
    //   }
    // }

    // TODO: Transport system not implemented yet
    // if (PSGame.isOnTransport()) {
    //   return;
    // }

    // PSGame.damageParty(5, PSSceneType.LAVA);
  }
}