/**
 * Motavia - Phantasy Star Planet Motavia Script
 * Direct port of Motavia.java - Handles map initialization, city entrances, and battle areas
 */

import { MainEngine } from '../../../core/MainEngine';
import { ScriptEngine } from '../../../core/ScriptEngine';
import { PSGame } from '../PSGame';
import { City } from '../game/City';
import { Dungeon } from '../game/Dungeon';
import { Chest, Flags, Trapped } from '../game/GameData';
import { OriginalItem } from '../game/PSLibItem';
import { PSLibEnemy, PS1Enemy, PS4Enemy } from '../game/PSLibEnemy';
import { PS1Music } from '../game/PSLibMusic';
import { PSSceneType, SpecialEntity, PSMenu } from '../PSMenu';
import { BattleOutcome, PSBattle } from '../battle/PSBattle';
import { EntityDirection } from '../../../domain/Entity';

export class Motavia {

  public static async startmap(): Promise<void> {
    const currentMap = MainEngine.getCurrentMap();
    if (currentMap) {
      currentMap.setHorizontalWrappable(true);
      currentMap.setVerticalWrappable(true);
    }
    MainEngine.setCameraTracking(1);

    if (PSGame.getgotox() === 79 && PSGame.getgotoy() === 43) { // Regular Spaceship
      if (currentMap) {
        currentMap.setRenderstring("1,2,E,R");
      }
      await PSGame.spaceshipRoutineAnimation("space/spaceship1.chr");
      return;
    }
    if (PSGame.getgotox() === 92 && PSGame.getgotoy() === 64) { // Luveno Spaceship
      await PSGame.spaceshipRoutineAnimation("space/spaceship2.chr");
      return;
    }

    console.log("Motavia::mapinit");

    // Debug spaceport transition coordinates
    const gotox = PSGame.getgotox();
    const gotoy = PSGame.getgotoy();
    console.log(`Motavia.startmap: gotox=${gotox}, gotoy=${gotoy}`);

    // Spaceport transitions
    if (gotox === 78 && gotoy === 35) { // Paseo To Spaceport
      console.log("Motavia.startmap: Triggering Paseo to Spaceport transition");
      await PSGame.spaceportTransition(EntityDirection.SOUTH, 42, City.SPACEPORT2, 18, 6);
    } else if (gotox === 78 && gotoy === 42) { // Spaceport To Paseo
      console.log("Motavia.startmap: Triggering Spaceport to Paseo transition");
      await PSGame.spaceportTransition(EntityDirection.NORTH, 35, City.PASEO, 20, 23);
    } else {
      console.log("Motavia.startmap: No spaceport transition triggered for these coordinates");
      // Continue with normal Motavia map initialization for regular coordinates

      // Allocate party or re-board the vehicle at goto position (Java: planetAllocate)
      await PSGame.planetAllocate();

      // Setup camera to center on player after spawning
      MainEngine.setupCamera();

      await ScriptEngine.fadein(30, true);

      // Enable normal gameplay after fade-in
      MainEngine.setEntitiesPaused(false);
      MainEngine.setScriptActive(false);
      PSGame.menuOn();
    }

    PSGame.transportOn();
  }

  public static async paseo(): Promise<void> {
    await PSGame.mapswitchToCity(City.PASEO, 8, 4);
  }

  public static async ant_lion(): Promise<void> {
    if (!PSGame.isOnTransport()) {
      await PSGame.fixedBattle(PSSceneType.DESERT, [PS1Enemy.ANT_LION]);
      PSGame.getOutOfCurrentZone();
    } else {
      // No random antlions
    }
  }

  public static async mirror(): Promise<void> {
    if (!PSGame.gameData.chestFlags.has(Chest.MIRROR_SHIELD) && PSGame.hasFlag(Flags.INFO_PERSEUS)) {
      await PSMenu.startScene(PSSceneType.DESERT, SpecialEntity.NONE);
      const battle = new PSBattle();
      const antLion = PSLibEnemy.getEnemyByEnum(PS1Enemy.ANT_LION)!;
      const outcome = await battle.startBattle([antLion, antLion, antLion], PS1Music.BATTLE);
      if (outcome === BattleOutcome.WIN) {
        await PSGame.chestFlag(Chest.MIRROR_SHIELD, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Mirror_Shield));
      }
      await PSMenu.endScene();
      PSGame.getOutOfCurrentZone();
    } else {
      await this.ant_lion();
    }
  }

  public static async uzo(): Promise<void> {
    await PSGame.mapswitchToCity(City.UZO, 25, 15);
  }

  public static async casba_cave(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.CASBA_CAVE_IN);
  }

  public static async casba(): Promise<void> {
    await PSGame.mapswitchToCity(City.CASBA, 28, 17);
  }

  public static async sopia(): Promise<void> {
    await PSGame.mapswitchToCity(City.SOPIA, 14, 18);
  }

  public static async tajima(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.TAJIMA_CAVE);
  }

  public static async naharu(): Promise<void> {
    await PSGame.mapswitchToDungeon(Dungeon.NAHARU);
  }

  public static async gas(): Promise<void> {
    const rand = ScriptEngine.random(0, 255);
    if (rand <= 16) {
      await this.sorcerer_zombie_reaper_wight();
    }

    if (PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_GasClear))) {
      return;
    }

    await PSGame.damageParty(30, PSSceneType.GAS);
  }

  public static async tonoe(): Promise<void> {
    await PSGame.mapswitchToCity(City.TONOE, 6, 13);
  }

  public static async scorpion_motavians(): Promise<void> {
    if (ScriptEngine.random(1, 12) <= 11) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.G_SCORPI, PS1Enemy.G_SCORPI, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER]);
    } else {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS4Enemy.YELLOW_SCORPION]);
    }
  }

  public static async oasis(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.G_SCORPI, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER]);
    } else {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS4Enemy.YELLOW_SCORPION]);
    }
  }

  public static async crawlers(): Promise<void> {
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS4Enemy.YELLOW_SCORPION]);
  }

  public static async crawler_barbarian(): Promise<void> { // path to naharu and around casba
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS1Enemy.BARBRIAN]);
  }

  public static async leech_goldlens(): Promise<void> { // near naharu and central island
    if (ScriptEngine.random(1, 4) <= 3) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.LEECH, PS1Enemy.GOLDLENS]);
    } else {
      await PSGame.fixedBattle(PSSceneType.DESERT, [PS1Enemy.GOLDLENS, PS1Enemy.LEECH, PS1Enemy.GOLDLENS]);
    }
  }

  public static async sandworm(): Promise<void> { // south lake
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.SANDWORM]);
  }

  public static async sandworm_nfarmer(): Promise<void> { // near tonoe
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.SANDWORM, PS1Enemy.SANDWORM, PS1Enemy.N_FARMER, PS1Enemy.MOTA_SHOOTER]);
  }

  public static async leech_efarmer(): Promise<void> { // near uzo
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.LEECH, PS1Enemy.LEECH, PS1Enemy.E_FARMER, PS1Enemy.MOTA_SHOOTER]);
    } else {
      await PSGame.fixedBattle(PSSceneType.DESERT, [PS1Enemy.CRAWLER, PS1Enemy.LEECH, PS1Enemy.CRAWLER, PS1Enemy.LEECH]);
    }
  }

  public static async skullen_manticor_efarmer(): Promise<void> { // near casba
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.E_FARMER, PS1Enemy.MANTICORE, PS1Enemy.SKULL_EN, PS1Enemy.MOTA_SHOOTER]);
  }

  public static async sorcerer_manticor_skullen(): Promise<void> { // central area
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.SORCERER, PS1Enemy.MANTICORE, PS1Enemy.SKULL_EN]);
    } else {
      await PSGame.fixedBattle(PSSceneType.DESERT, [PS1Enemy.SKULL_EN, PS1Enemy.SORCERER, PS1Enemy.SKULL_EN]);
    }
  }

  public static async sorcerer_amundsen(): Promise<void> { // near gas
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.SORCERER, PS1Enemy.AMUNDSEN]);
  }

  public static async sorcerer_zombie_reaper_wight(): Promise<void> { // gas
    switch (ScriptEngine.random(1, 7)) {
      case 1: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.WIGHT, PS1Enemy.REAPER, PS1Enemy.WIGHT]); break;
      case 2: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.WIGHT, PS1Enemy.ZOMBIE, PS1Enemy.WIGHT]); break;
      case 3: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.WIGHT, PS1Enemy.WIGHT]); break;
      case 4: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.REAPER]); break;
      case 5: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.SORCERER]); break;
      default: await PSGame.fixedBattle(PSSceneType.GAS, [PS1Enemy.ZOMBIE]); break;
    }
  }

  public static async golem_leech_amundsen(): Promise<void> { // near tarzimal
    await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.LEECH, PS1Enemy.AMUNDSEN]);
  }

  public static async golem_oliphant(): Promise<void> { // path to tarzimal
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.DESERT, [PS1Enemy.GOLEM, PS1Enemy.OLIPHANT]);
    } else {
      await PSGame.fixedBattle(PSSceneType.DESERT, [PS1Enemy.OLIPHANT, PS1Enemy.GOLEM, PS1Enemy.OLIPHANT]);
    }
  }

  public static async sea(): Promise<void> {
    if (ScriptEngine.random(1, 5) <= 4) {
      await PSGame.randomBattle(PSSceneType.SEA, [PS1Enemy.NESSIE, PS1Enemy.AMMONITE, PS1Enemy.WIGHT]);
    } else {
      await PSGame.fixedBattle(PSSceneType.SEA, [PS1Enemy.AMMONITE, PS1Enemy.NESSIE, PS1Enemy.AMMONITE]);
    }
  }
}