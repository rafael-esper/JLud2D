package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import static demos.ps.oo.PSGame.getItem;
import static demos.ps.oo.PSGame.mapswitch;
import core.Script;
import domain.Entity;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.Enemy;
import demos.ps.oo.PSBattle;
import demos.ps.oo.PSBattle.BattleOutcome;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSGame.Chest;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Trapped;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibEnemy.PS4Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSLibMusic.PS1Music;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;

public class Motavia {

	private static final Logger log = LogManager.getLogger(Motavia.class);


	public static void startmap()   {
		current_map.setHorizontalWrappable(true);
		current_map.setVerticalWrappable(true); 
		cameratracking = 1;
		
		if(PSGame.getgotox() == 79 && PSGame.getgotoy() == 43) {	// Regular Spaceship 
			current_map.setRenderstring("1,2,E,R");
			PSGame.spaceshipRoutineAnimation("space/spaceship1.chr");
			return;
		}
		if(PSGame.getgotox() == 92 && PSGame.getgotoy() == 64) {	// Luveno Spaceship 
			PSGame.spaceshipRoutineAnimation("space/spaceship2.chr");
			return;
		}
		
		PSGame.planetAllocate();
		
		screen.fadeIn(30, true);
		
		PSGame.transportOn();
		
		log.info("Motavia::mapinit");
		
		
		if(PSGame.getgotox() == 78 && PSGame.getgotoy() == 35) { 			// Paseo To Spaceport
			PSGame.spaceportTransition(Entity.SOUTH, 42, City.SPACEPORT2, 18,6);
		} 
		else if(PSGame.getgotox() == 78 && PSGame.getgotoy() == 42) {		// Spaceport To Paseo
			PSGame.spaceportTransition(Entity.NORTH, 35, City.PASEO, 20,23);
		}
		
		
	}

	public static void paseo() {
		PSGame.mapswitch(City.PASEO,8,4);
	}
	
	public static void ant_lion() { 
		if(!PSGame.isOnTransport()) {
			PSBattle battle = new PSBattle();
			battle.battleScene(Scene.DESERT, new Enemy[]{PSGame.getEnemy(PS1Enemy.ANT_LION)});
			PSGame.gameData.visitedEnemies.add(PS1Enemy.ANT_LION);
			PSGame.getOutOfCurrentZone();
		} else {
			// No random antlions
		}
	}
	
	public static void mirror() {
		BattleOutcome outcome = BattleOutcome.WIN;
		if(!PSGame.gameData.chestFlags.contains(Chest.MIRROR_SHIELD) && PSGame.hasFlag(Flags.INFO_PERSEUS)) {
			PSMenu.startScene(Scene.DESERT, SpecialEntity.NONE);
			PSBattle battle = new PSBattle();
			outcome = battle.startBattle(new Enemy[]{PSGame.getEnemy(PS1Enemy.ANT_LION),PSGame.getEnemy(PS1Enemy.ANT_LION),PSGame.getEnemy(PS1Enemy.ANT_LION)}, PS1Music.BATTLE);
			if(outcome == BattleOutcome.WIN) {
				PSGame.chestFlag(Chest.MIRROR_SHIELD, 0, Trapped.NO_TRAP, PSGame.getItem(OriginalItem.Shield_Mirror_Shield));				
			}
			PSMenu.endScene();
			PSGame.getOutOfCurrentZone();
		}
		else {
			ant_lion();
		}
	}

	public static void uzo() { 
		PSGame.mapswitch(City.UZO,25,15);
	}

	public static void casba_cave() { 
		mapswitch(Dungeon.CASBA_CAVE_IN);
	}

	public static void casba() {
		PSGame.mapswitch(City.CASBA,28,17);
	}

	public static void sopia() { 
		PSGame.mapswitch(City.SOPIA,14,18);
	}

	public static void tajima() {
		PSGame.mapswitch(Dungeon.TAJIMA_CAVE);
	}

	public static void naharu() {
		PSGame.mapswitch(Dungeon.NAHARU);
	}

	public static void gas() {
		int rand = random(0, 255);
		if(rand <= 16) {
			sorcerer_zombie_reaper_wight();			
		}		
		
		if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_GasClear))) {
			return;
		}
		
		PSGame.damageParty(30, Scene.GAS);
	}
	
	public static void tonoe() {
		PSGame.mapswitch(City.TONOE,6,13);
	}
	
	public static void scorpion_motavians() {
		if(Script.random(1, 12) <= 11) {
			PSGame.randomBattle(Scene.DESERT, new GenericEnemy[]{PS1Enemy.G_SCORPI, PS1Enemy.G_SCORPI, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER});
		} else {
			PSGame.randomBattle(Scene.DESERT, new GenericEnemy[]{PS4Enemy.YELLOW_SCORPION});
		}
	}

	public static void oasis() {
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.G_SCORPI, PS1Enemy.E_FARMER, PS1Enemy.N_FARMER});
		} else {
			PSGame.randomBattle(Scene.DESERT, new GenericEnemy[]{PS4Enemy.YELLOW_SCORPION});
		}
	}

	public static void crawlers() {
		PSGame.randomBattle(Scene.DESERT, new GenericEnemy[]{PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS4Enemy.YELLOW_SCORPION});
	}

	public static void crawler_barbarian() { // path to naharu and around casba
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.CRAWLER, PS1Enemy.CRAWLER, PS1Enemy.BARBRIAN});
	}

	public static void leech_goldlens() { // near naharu and central island
		if(Script.random(1, 4) <= 3) {
			PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.LEECH, PS1Enemy.GOLDLENS});
		}
		else {
			PSGame.fixedBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.GOLDLENS, PS1Enemy.LEECH, PS1Enemy.GOLDLENS});
		}
	}

	public static void sandworm() { // south lake
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.SANDWORM});
	}
	
	public static void sandworm_nfarmer() { // near tonoe
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.SANDWORM, PS1Enemy.SANDWORM, PS1Enemy.N_FARMER, PS1Enemy.MOTA_SHOOTER});
	}
	
	public static void leech_efarmer() { // near uzo
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.LEECH, PS1Enemy.LEECH, PS1Enemy.E_FARMER, PS1Enemy.MOTA_SHOOTER});
		} else {
			PSGame.fixedBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.CRAWLER, PS1Enemy.LEECH, PS1Enemy.CRAWLER, PS1Enemy.LEECH});
		}
	}
	
	public static void skullen_manticor_efarmer() { // near casba
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.E_FARMER, PS1Enemy.MANTICORE, PS1Enemy.SKULL_EN, PS1Enemy.MOTA_SHOOTER});
	}
	
	public static void sorcerer_manticor_skullen() { // central area 
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.MANTICORE, PS1Enemy.SKULL_EN});
		} else {
			PSGame.fixedBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.SKULL_EN, PS1Enemy.SORCERER, PS1Enemy.SKULL_EN});
		}
	}
	
	public static void sorcerer_amundsen() { // near gas
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.SORCERER, PS1Enemy.AMUNDSEN});
	}
	
	public static void sorcerer_zombie_reaper_wight() { // gas
		switch(Script.random(1, 7)) {
			case 1: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.REAPER, PS1Enemy.WIGHT});break;
			case 2: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.ZOMBIE, PS1Enemy.WIGHT});break;
			case 3: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.WIGHT});break;
			case 4: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.REAPER});break;
			case 5: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.SORCERER});break;
			default: PSGame.fixedBattle(Scene.GAS, new PS1Enemy[]{PS1Enemy.ZOMBIE});break;
		}
	}
	
	public static void golem_leech_amundsen() { // near tarzimal
		PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.LEECH, PS1Enemy.AMUNDSEN});
	}

	public static void golem_oliphant() { // path to tarzimal
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.GOLEM, PS1Enemy.OLIPHANT});
		} else {
			PSGame.fixedBattle(Scene.DESERT, new PS1Enemy[]{PS1Enemy.OLIPHANT, PS1Enemy.GOLEM, PS1Enemy.OLIPHANT});
		}
	}
	
	public static void sea() {
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.NESSIE, PS1Enemy.AMMONITE, PS1Enemy.WIGHT});
		} else {
			PSGame.fixedBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.AMMONITE, PS1Enemy.NESSIE, PS1Enemy.AMMONITE});
		}
	}
	
}
