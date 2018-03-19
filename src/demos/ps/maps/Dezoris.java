package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import static demos.ps.oo.PSGame.*;
import static demos.ps.oo.PSGame.getString;
import domain.Entity;
import domain.VImage;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibEnemy.GenericEnemy;
import demos.ps.oo.PSLibEnemy.PS1Enemy;
import demos.ps.oo.PSLibEnemy.PS4Enemy;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.Scene;

public class Dezoris {

	private static final Logger log = LogManager.getLogger(Dezoris.class);

	public static void startmap()   {
		current_map.setHorizontalWrappable(true);
		current_map.setVerticalWrappable(true); 
		cameratracking = 1;
		
		if(PSGame.getgotox() == 171 && PSGame.getgotoy() == 72) {	// Luveno Spaceship 
			PSGame.spaceshipRoutineAnimation("space/spaceship2.chr");
			return;
		}		
		
		PSGame.planetAllocate();
		
		screen.fadeIn(30, true);
		
		PSGame.transportOn();
		
		log.info("Dezoris::mapinit");
		
	}

	public static void near_ice() {
		weak_ice();
		int rand = random(0, 255);
		if(rand <= 12) {
			plains_stormfly_lich_stalker_ammonite();			
		}		
	}
	public static void near_ice_pines() {
		weak_ice();
		int rand = random(0, 255);
		if(rand <= 12) {
			forest_lich_stalker_vampire();
		}
	}
	
	public static void weak_ice() {
		PSGame.breakIce();
		
		int rand = random(0, 255);
		if(rand <= 8) {
			plains_mammoth_frostman();			
		}		
		
		
	}
	
	public static void cave_bortevo_south() {
		PSGame.mapswitch(Dungeon.BORTEVO_IN);
	}
	public static void cave_bortevo_north() {
		PSGame.mapswitch(Dungeon.BORTEVO_OUT);
	}
	
	public static void skure() {
		PSGame.mapswitch(City.SKURE_ENTRANCE, 16, 14);
	}
	public static void aukba() {
		PSGame.mapswitch(City.AUKBA_ENTRANCE, 12, 16);
	}

	public static void cave1() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE1_IN);
	}
	public static void cave2() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE1_OUT);
	}
	public static void cave3() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE2_IN);
	}
	public static void cave4() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE2_OUT);
	}
	public static void cave5() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE3_IN);
	}
	public static void cave6() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE3_OUT);
	}
	public static void cave7() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE4_IN);
	}
	public static void cave8() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE4_OUT);
	}
	public static void cave_to_aukba() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE_AUKBA_IN);
	}
	public static void cave_from_aukba() {
		PSGame.mapswitch(Dungeon.DEZO_CAVE_AUKBA_OUT);
	}
	public static void corona_tower() {
		PSGame.mapswitch(Dungeon.CORONA);
	}
	public static void prism_cave() {
		PSGame.mapswitch(Dungeon.PRISM_CAVE);
	}
	public static void shield_cave() {
		PSGame.mapswitch(Dungeon.FROST_CAVE);
	}
	public static void guaron_morgue() {
		PSGame.mapswitch(Dungeon.GUARON_MORGUE);
	}
	public static void laerma_tree() {
		PSMenu.startScene(Scene.ARTIC, LargeEntity.LAERMA1);
		if(PSMenu.instance.waitAnyButton() && PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Eclipse_Torch))) {
			int alivePlayer = PSGame.getParty().getFirstAlivePlayer();
			PSMenu.Stext(getString("Item_TookOut", 
					"<player>", PSGame.getParty().getMember(alivePlayer).getName(),
					"<item>", PSGame.getItem(OriginalItem.Quest_Eclipse_Torch).getName()));
			
			PSMenu.startScene(Scene.SCREEN_NOFADE, LargeEntity.LAERMA2);
			if(PSMenu.instance.waitAnyButton()) {
				if(PSGame.getParty().hasQuestItem(PSGame.getItem(OriginalItem.Quest_Laconian_Pot))) {
					PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Eclipse_Torch));
					PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Laerma_Berries));
					PSMenu.Stext(getString("Item_LaermaBerries_Pot", "<player>", PSGame.getParty().getMember(alivePlayer).getName()));		
				}
				else {
					PSMenu.Stext(getString("Item_LaermaBerries_NoPot"));					
				}
			}
		}
		PSMenu.endScene();
		
	}

	// *********************** BATTLE AREAS **********************************
	
	public static void forest_lich_stalker_vampire() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.VAMPIRE_LORD});
		} else {
			PSGame.fixedBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.STALKER, PS1Enemy.LICH, PS1Enemy.STALKER});				
		}
	}

	public static void plains_dezorian_stormfly_scorpius() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.ARTIC, new GenericEnemy[]{PS1Enemy.SCORPIUS, PS1Enemy.SCORPIUS, PS1Enemy.DEZORIAN, 
																PS1Enemy.STORM_FLY, PS4Enemy.BLUE_SCORPION});
		} else {
			PSGame.fixedBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.STORM_FLY, PS1Enemy.SCORPIUS, PS1Enemy.SCORPIUS, PS1Enemy.STORM_FLY});
		}
	}
	
	public static void plains_dezorian_stormfly_lich() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.ARTIC, new GenericEnemy[]{PS1Enemy.LICH, PS1Enemy.DEZORIAN, PS1Enemy.STORM_FLY, PS4Enemy.BLUE_SCORPION});
		}
		else {
			PSGame.fixedBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD, PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN});
		}		
	}
	
	public static void plains_lich_stalker_executor() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.EXECUTER});
		} else {
			PSGame.fixedBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.STALKER, PS1Enemy.LICH});				
		}
	}

	public static void plains_stormfly_lich_stalker_ammonite() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.STORM_FLY, PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.AMMONITE});
		} else {
			PSGame.fixedBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.STORM_FLY, PS1Enemy.LICH, PS1Enemy.STORM_FLY});				
		}
	}
	
	public static void plains_lich_stalker_magician_battalion() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.LICH, PS1Enemy.STALKER, PS1Enemy.MAGICIAN, PS1Enemy.BATALION});
		} else {
			PSGame.fixedBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.DEZORIAN, PS1Enemy.DEZORIAN, PS1Enemy.EVILHEAD, PS1Enemy.DEZO_PRIEST, PS1Enemy.DEZORIAN});				
		}
	}

	public static void forest_battalion_magician_vampire() {
		PSGame.randomBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.MAGICIAN, PS1Enemy.VAMPIRE_LORD});
	}
	
	public static void forest_battalion_magician_marauder() {
		if(random(1, 5) <=4) {
			PSGame.randomBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.BATALION, PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER});
		} else {
			PSGame.fixedBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER});				
		}
	}
	
	public static void plains_marauder_frostman() {
		PSGame.randomBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.MARAUDER, PS1Enemy.MARAUDER, PS1Enemy.FROSTMAN});
	}
	
	public static void forest_whitedragon() {
		PSGame.randomBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.WT_DRAGN});
	}	

	public static void forest_marauder_magician() {
		if(random(1, 4) <=3) {
			PSGame.randomBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.MARAUDER, PS1Enemy.MARAUDER, PS1Enemy.MAGICIAN});
		} else {
			PSGame.fixedBattle(Scene.PINES, new PS1Enemy[]{PS1Enemy.MAGICIAN, PS1Enemy.MARAUDER});
		}
	}
	
	public static void plains_mammoth_frostman() {
		PSGame.randomBattle(Scene.ARTIC, new PS1Enemy[]{PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH, PS1Enemy.FROSTMAN,
														PS1Enemy.MAMMOTH, PS1Enemy.MAMMOTH, PS1Enemy.FROSTMAN,
														PS1Enemy.SNOW_LION});
	}	
	
}
