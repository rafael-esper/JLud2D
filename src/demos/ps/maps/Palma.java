package demos.ps.maps;

import static core.Script.*;
import static demos.ps.oo.PSGame.getString;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import core.Script;
import demos.ps.oo.*;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibEnemy.PS4Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import domain.Entity;

public class Palma {

	private static final Logger log = LogManager.getLogger(Palma.class);

	public static void startmap()   {
		current_map.setHorizontalWrappable(true);
		current_map.setVerticalWrappable(true); 
		cameratracking = 1;

		if(PSGame.getgotox() == 70 && PSGame.getgotoy() == 46) {	// Regular Spaceship 
			current_map.setRenderstring("1,2,E,R");
			PSGame.spaceshipRoutineAnimation("space/spaceship1.chr");
			return;
		}
		if(PSGame.getgotox() == 52 && PSGame.getgotoy() == 56) {	// Luveno Spaceship 
			PSGame.spaceshipRoutineAnimation("space/spaceship2.chr");
			return;
		}
		
		PSGame.planetAllocate();
		
		screen.fadeIn(30, true);
		
		log.info("Palma::mapinit");
		
		
		if(PSGame.getgotox() == 81 && PSGame.getgotoy() == 46) { 			// Camineet To Spaceport
			PSGame.spaceportTransition(Entity.WEST, 70, City.SPACEPORT1, 28,12);
		} 
		else if(PSGame.getgotox() == 72 && PSGame.getgotoy() == 46) {		// Spaceport To Camineet
			PSGame.spaceportTransition(Entity.EAST, 82, City.CAMINEET, 7,16);
		}
		else if(PSGame.getgotox() == 70 && PSGame.getgotoy() == 48) {		// Spaceport To Parolit
			PSGame.spaceportTransition(Entity.SOUTH, 58, City.PAROLIT, 17,6);
		}
		else if(PSGame.getgotox() == 70 && PSGame.getgotoy() == 57) {		// Parolit To Spaceport
			PSGame.spaceportTransition(Entity.NORTH, 46, City.SPACEPORT1, 17,18);
		}
		
		PSGame.transportOn();
	}

	public static void camineet() {
		PSGame.mapswitch(City.CAMINEET,32,14);
	}
	
	public static void  loar() { // 1 Loar
		PSGame.mapswitch(City.LOAR,6,10);
	}

	public static void  parolit() { // 3 Parolit
		PSGame.mapswitch(City.PAROLIT,15,21);
	}

	public static void eppi() { // 4 Eppi
		PSGame.mapswitch(City.EPPI,11,16);
	}

	public static void bortevo() { // 5 Bortevo
		PSGame.mapswitch(City.BORTEVO,6,13);
	}

	public static void gothic() {
		PSGame.mapswitch(City.GOTHIC,32,15);
	}

	public static void scion() {
		PSGame.mapswitch(City.SCION,7,16);
	}

	public static void naula_cave() {
		PSGame.mapswitch(Dungeon.NAULA);
	}
	public static void iala_cave() {
		PSGame.mapswitch(Dungeon.IALA);
	}
	public static void prison_in() {
		PSGame.mapswitch(Dungeon.PRISON_IN);
	}
	public static void prison_out() {
		PSGame.mapswitch(Dungeon.PRISON_OUT);
	}
	public static void cave_baya_in() {
		PSGame.mapswitch(Dungeon.CAVE_BAYA_IN);
	}
	public static void cave_baya_out() {
		PSGame.mapswitch(Dungeon.CAVE_BAYA_OUT);
	}

	public static void baya_malay_tower() {
		PSGame.mapswitch(Dungeon.BAYA_MALAY);
	}
	
	public static void abion() {
		PSGame.mapswitch(City.ABION,20,25);
	}

	public static void drasgow() {
		PSGame.mapswitch(City.DRASGOW,10,13);
	}
	
	public static void triada() {
		PSGame.mapswitch(Dungeon.TRIADA);
	}

	public static void odin_cave() {
		PSGame.mapswitch(Dungeon.ODIN_CAVE);
	}

	public static void cave_bortevo_south() {
		PSGame.mapswitch(Dungeon.BORTEVO_IN);
	}
	public static void cave_bortevo_north() {
		PSGame.mapswitch(Dungeon.BORTEVO_OUT);
	}

	public static void medusa_tower() {
		PSGame.mapswitch(Dungeon.MEDUSA_TOWER);		
	}
	
	public static void lost_island() {
		PSGame.mapswitch(Dungeon.LOST_ISLAND);		
	}
	
	
	// *********************** BATTLE AREAS **********************************
	
	public static void parolit_forest() {
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.OWL_BEAR});
	}
	
	public static void owlbear_sworm() {
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.OWL_BEAR, PS1Enemy.OWL_BEAR});
	}

	public static void owlbear_deadtree() {
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.DEADTREE, PS1Enemy.OWL_BEAR, PS1Enemy.OWL_BEAR});
	}

	public static void sworm_scorpion() {
		if(Script.random(1, 6) <= 4) {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.SCORPION});
		}
		else {
			PSGame.fixedBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SCORPION});
		}
	}

	public static void sworm_scorpion_maneater() {
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.MANEATER});
		}
		else {
			PSGame.fixedBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.SWORM});
		}
	}

	public static void sworm_scorpion_deadtree() {
		if(Script.random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.DEADTREE});
		}
		else {
			PSGame.fixedBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.SWORM, PS1Enemy.SCORPION, PS1Enemy.SCORPION, PS1Enemy.SWORM});
		}
		
	}
	
	public static void beach_bigclub() {
		PSGame.randomBattle(Scene.BEACH, new PS1Enemy[]{PS1Enemy.BIG_CLUB});
	}
	public static void beach_shelfish() {
		PSGame.randomBattle(Scene.BEACH, new PS1Enemy[]{PS1Enemy.SHELFISH});
	}

	public static void tarantul_evildead() {
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.TARANTUL, PS1Enemy.EVILDEAD});
	}
	public static void evildead_owlbear() {
		PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.EVILDEAD, PS1Enemy.OWL_BEAR});
	}
	
	public static void wingeye_tarantul() {
		PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.TARANTUL});
	}
	public static void eppi_bushes() {
		PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.TARANTUL, PS1Enemy.TARANTUL});
	}	
	
	public static void eppi_forest() {

		if(!PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Compass))) {
		
			PSGame.transportOff();
			PSMenu.startScene(Scene.FOREST, SpecialEntity.NONE);
			PSMenu.Stext(getString("Eppi_Lost_Woods"));

			PSGame.getOutOfCurrentZone();
			
			PSMenu.endScene();
			
			PSGame.transportOn();
		}
		else if(random(0, 255) < 16) {
			if(random(1, 6) == 1) {
				PSGame.fixedBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WING_EYE});
			}
			else {
				PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.WING_EYE, PS1Enemy.WEREBAT, PS1Enemy.WEREBAT});			
			}
		}
	}

	public static void forest_tarantul_deadtree_giantfly_owlbear() { // palma main continent hard forest
		if(random(1, 6) == 1) {
			PSGame.randomBattle(Scene.FOREST, new GenericEnemy[]{PS1Enemy.TARANTUL, PS1Enemy.DEADTREE, PS1Enemy.GIANTFLY, PS1Enemy.OWL_BEAR});
		}
		else {
			PSGame.fixedBattle(Scene.FOREST, new GenericEnemy[]{PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION});
		}

	}

	public static void beach_fishman() {
		PSGame.randomBattle(Scene.BEACH, new PS1Enemy[]{PS1Enemy.FISHMAN});	
	}

	public static void beach_octopus() {
		PSGame.randomBattle(Scene.BEACH, new PS1Enemy[]{PS1Enemy.OCTOPUS});		
	}

	public static void forest_gaia() { // baya malay area
		if(random(1, 3) <=2) {
			PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.GAIA});
		}
		else {
			PSGame.fixedBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.MARAUDER, PS1Enemy.WIGHT});
		}		
	}

	public static void fields_marauder_horseman() { // baya malay area
		if(random(1, 4) <=3) {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.MARAUDER, PS1Enemy.HORSEMAN});
		}
		else {
			PSGame.fixedBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.HORSEMAN, PS1Enemy.MARAUDER, PS1Enemy.HORSEMAN});
		}
	}

	public static void sea_octopus() { // sea near abion island
		PSGame.randomBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.OCTOPUS});		
	}
	public static void sea_shelfish() { // river
		PSGame.randomBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.SHELFISH});		
	}
	public static void sea_fishman_bigclub_evildead() { // sea near main continent
		PSGame.randomBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.FISHMAN, PS1Enemy.BIG_CLUB, PS1Enemy.EVILDEAD});		
	}
	public static void sea_wyvern_evildead_octopus() { // deep sea
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.WYVERN, PS1Enemy.WYVERN, PS1Enemy.WIGHT, PS1Enemy.OCTOPUS});
		}
		else {
			PSGame.fixedBattle(Scene.SEA, new PS1Enemy[]{PS1Enemy.WIGHT, PS1Enemy.WYVERN, PS1Enemy.WYVERN});
		}
	}
	
	public static void forest_tarantul_skeleton_giantfly_owlbear() { // near gothic
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.TARANTUL, PS1Enemy.SKELETON, PS1Enemy.GIANTFLY, PS1Enemy.OWL_BEAR});
	}
	
	public static void fields_poisonplant_skeleton_evildead() { // path to medusa
		PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.POISON_PLANT, PS1Enemy.SKELETON, PS1Enemy.EVILDEAD});
	}
	
	public static void forest_serpent() { // near triada/medusa
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.SERPENT});		
	}

	public static void fields_poisonplant_manticor() { // path to bortevo
		if(random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.FIELDS, new GenericEnemy[]{PS1Enemy.POISON_PLANT, PS1Enemy.POISON_PLANT, PS4Enemy.RED_SCORPION, PS1Enemy.MANTICORE});
		} else {
			PSGame.fixedBattle(Scene.FIELDS, new GenericEnemy[]{PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION, PS4Enemy.RED_SCORPION});
		}
	}
	
	public static void forest_ghoul_evildead_giantfly() { // path to bortevo
		if(random(1, 5) <= 4) {
			PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.GHOUL, PS1Enemy.EVILDEAD, PS1Enemy.GIANTFLY});
		}
		else {
			PSGame.fixedBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.GHOUL, PS1Enemy.EVILDEAD});
		}
		
	}

	public static void forest_vampire_manticor_skeleton_poisonplant() { // abion island
		if(random(1, 7) <= 6) {
			PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.VAMPIRE, PS1Enemy.POISON_PLANT, PS1Enemy.MANTICORE, PS1Enemy.SKELETON});
		}
		else {
			PSGame.fixedBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.SKELETON, PS1Enemy.VAMPIRE, PS1Enemy.VAMPIRE, PS1Enemy.SKELETON});
		}
	}

	public static void forest_vampire_skeleton_giantspider() { // near abion
		PSGame.randomBattle(Scene.FOREST, new PS1Enemy[]{PS1Enemy.VAMPIRE, PS1Enemy.SKELETON, PS1Enemy.GIANT_SPIDER});		
	}
	
	public static void fields_elephant_giant_evildead() { // abion island
		if(random(1, 6) <= 5) {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.ELEPHANT, PS1Enemy.GIANT, PS1Enemy.EVILDEAD});
		}
		else {
			PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.ELEPHANT, PS1Enemy.GIANT, PS1Enemy.ELEPHANT});
		}
	}

	public static void nest_giantspider_skeleton_giant() { // abion island nest
		PSGame.randomBattle(Scene.FIELDS, new PS1Enemy[]{PS1Enemy.GIANT_SPIDER, PS1Enemy.GIANT_SPIDER, PS1Enemy.SKELETON, PS1Enemy.GIANT});
	}	

	
	public static void lava() {

		int rand = random(0, 255);
		if(rand <= 16) {
			if(random(1, 6)<=5) {
				PSGame.randomBattle(Scene.LAVA, new PS1Enemy[]{PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY, PS1Enemy.SERPENT});
			}
			else {
				PSGame.fixedBattle(Scene.LAVA, new PS1Enemy[]{PS1Enemy.GIANTFLY, PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY});
			}
			
		}		
		
		if(PSGame.isOnTransport()) {
			return;
		}
		
		PSGame.damageParty(2, Scene.LAVA);
	}
	
	public static void lava_baya() {

		int rand = random(0, 255);
		if(rand <= 16) {
			if(random(1, 4) <=3) {
				PSGame.randomBattle(Scene.LAVA, new PS1Enemy[]{PS1Enemy.MARMAN, PS1Enemy.TENTACLE});
			}
			else {
				PSGame.fixedBattle(Scene.LAVA, new PS1Enemy[]{PS1Enemy.TENTACLE, PS1Enemy.MARMAN, PS1Enemy.MARMAN, PS1Enemy.GIANTFLY});
			}
		}		
		
		if(PSGame.isOnTransport()) {
			return;
		}
		
		PSGame.damageParty(5, Scene.LAVA);
	}
	
	
	
}
