package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static core.Script.*;
import static demos.ps.oo.PSGame.*;
import core.Script;
import demos.ps.Phantasy;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSGame.Flags;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSMenu.EntityClothes;
import demos.ps.oo.PSMenu.EntityType;
import demos.ps.oo.PSMenu.LargeEntity;
import demos.ps.oo.PSMenu.NecroType;
import demos.ps.oo.PSMenu.Outcome;
import demos.ps.oo.PSMenu.Scene;
import demos.ps.oo.PSMenu.SpecialEntity;
import demos.ps.oo.PartyMember;

public class Gothic {

	private static final Logger log = LogManager.getLogger(Gothic.class);

	public static void startmap() {
		Phantasy.startmap();
		
		// Moves entity away from spaceship area
		if(PSGame.hasFlag(Flags.SPACESHIP_AREA)) {
			current_map.setobs(13,  14,  0);
			entitymove(0, "L1 U1 F0");
		}
	}
	
	public static void hospital() {
		PSMenu.startScene(Scene.HOSPITAL_VILLAGE, EntityType.VILLA_WMN_BLOND, EntityClothes.WHITE);
		PSGame.Hospital(1);
		PSMenu.endScene();
	}
	
	public static void church() {
		PSMenu.startScene(Scene.CHURCH_VILLAGE, SpecialEntity.PRIEST);
		PSGame.Church(1);
		PSMenu.endScene();
	}	
	

	public static void hand_shop() {
		PSMenu.startScene(Scene.SHOP_HAND_VILLAGE, EntityType.VILLA_MAN_BLOND, EntityClothes.RED);
		Shop(getString("Shop_Tool_Welcome"), true, new Item[]{	getItem(OriginalItem.Inventory_Flash),
																	getItem(OriginalItem.Inventory_TranCarpet),
																	getItem(OriginalItem.Inventory_Light_Pendant)});
		PSMenu.endScene();
	}	
	
	
	public static void house() {
		if(!PSGame.hasFlag(Flags.INFO_GOTHIC_NECRO)) {
			PSMenu.startScene(Scene.RUINED_HOUSE, SpecialEntity.NONE);
			PSMenu.instance.waitAnyButton();
		}
		else {
			PSMenu.startScene(Scene.RUINED_HOUSE, EntityType.NECRO, NecroType.PALMAN);
			if(PSMenu.Prompt(getString("Gothic_Necro_Palman"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Gothic_Necro_Palman_Yes"));				
			} else {
				PSMenu.StextLast(getString("Gothic_Necro_Palman_No"));	
			}
		}
		PSMenu.endScene();
	}

	public static void luveno() {
		if(!PSGame.hasFlag(Flags.LUVENO_FREE)) {
			PSMenu.startScene(Scene.VILLAGE_HOUSE, SpecialEntity.NONE);
			PSMenu.instance.waitB1();
		} else {
			PSMenu.startScene(Scene.VILLAGE_HOUSE, SpecialEntity.LUVENO);
			if(!PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
				PSMenu.Stext(getString("Gothic_House_Luveno"));				
			}
			else {
				if(!PSGame.hasFlag(Flags.LUVENO_FEE)) {
					if(PSMenu.Prompt(getString("Gothic_House_Luveno_pos_Assistant"), getYesNo()) == 1) {
						if(PSGame.getParty().mst < 1200) {
							PSMenu.StextLast(getString("Gothic_House_Luveno_fee_NotEnough"));
						} else {
							PSGame.getParty().mst-=1200;
							PSMenu.StextLast(getString("Gothic_House_Luveno_fee_Yes"));
							PSGame.setFlag(Flags.LUVENO_FEE);
						}
					} else {
						PSMenu.StextLast(getString("Gothic_House_Luveno_fee_No"));
					}
				}
				else { // Has paid Luveno already
					if(!PSGame.hasFlag(Flags.LUVENO_WAIT1)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_work1"));
						PSGame.setFlag(Flags.LUVENO_WAIT1);
					} else if(!PSGame.hasFlag(Flags.LUVENO_WAIT2)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_work2"));
						PSGame.setFlag(Flags.LUVENO_WAIT2);
					} else if(!PSGame.hasFlag(Flags.LUVENO_WAIT3)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_work3"));
						PSGame.setFlag(Flags.LUVENO_WAIT3);
					} else if(!PSGame.hasFlag(Flags.LUVENO_READY)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_ready"));
						PSGame.setFlag(Flags.LUVENO_READY);
					} else if(!PSGame.hasFlag(Flags.GOT_HAPSBY)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_before_hapsby"));
					} else if(!PSGame.hasFlag(Flags.LUVENO_BOARD)) {
						PSMenu.StextLast(getString("Gothic_House_Luveno_with_hapsby"));
						PSGame.setFlag(Flags.LUVENO_BOARD);
					} else {
						PSMenu.StextLast(getString("Gothic_House_Luveno_after_hapsby"));
					}
				}
			}
		}

		PSMenu.endScene();
	}

	public static void assist() {
		if(!PSGame.hasFlag(Flags.GOT_ASSISTANT)) {
			PSMenu.startScene(Scene.VILLAGE_HOUSE, SpecialEntity.NONE);
			PSMenu.instance.waitB1();
		} else {
			PSMenu.startScene(Scene.VILLAGE_HOUSE, EntityType.CITY_MAN_BLOND, EntityClothes.WHITE);
			PSMenu.Stext(getString("Spaceport_Passage_Assistant"));
		}
		PSMenu.endScene();
	}

	
	public static void beggar1() {
		EntStart();
		if(!PSGame.hasFlag(Flags.LUVENO_BOARD)) {
			PSMenu.Stext(getString("Gothic_People_Ent3"));
		} else {
			PSMenu.Stext(getString("Gothic_People_Ent3_hapsby"));
			if(!PSGame.hasFlag(Flags.SPACESHIP_AREA) && !Script.TEST_SIMULATION) {
				current_map.setobs(13,  14,  0);
				entitymove(0, "L1 U1 F0");
			}
			PSGame.setFlag(Flags.SPACESHIP_AREA);
		}
		
		EntFinish();
	}
	public static void beggar2() {
		EntStart();
		if(PSMenu.Prompt(getString("Gothic_People_Ent1"), getYesNo()) == 1) {
			
			boolean foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
			if(foundCola) {
				PSMenu.StextLast(getString("Gothic_People_Ent1Yes"));				
			} else {
				PSMenu.StextLast(getString("Gothic_People_EntNotEnoughCola"));
			}
		} else {
			PSMenu.StextLast(getString("Gothic_People_Ent1No"));	
		}
		EntFinish();
	}
	public static void beggar3() {
		EntStart();
		if(PSMenu.Prompt(getString("Gothic_People_Ent2"), getYesNo()) == 1) {
			
			boolean foundCola = PSGame.findItemWithParty(OriginalItem.Inventory_Monomate, true);
			if(foundCola) {
				PSMenu.StextLast(getString("Gothic_People_Ent2Yes"));				
			} else {
				PSMenu.StextLast(getString("Gothic_People_EntNotEnoughCola"));
			}
		} else {
			PSMenu.StextLast(getString("Gothic_People_Ent2No"));	
		}
		EntFinish();
	}

	public static void tunnel() {
		mapswitch(Dungeon.GOTHIC_PASSAGEWAY_OUT);
	}

	public static void spaceship() {
		PSMenu.startScene(Scene.FOREST, LargeEntity.HAPSBY);
		PSGame.hapsbyRoutine(City.GOTHIC);
		PSMenu.endScene(Outcome.FADE_HOUSE);
	}

	public static void exit() {
		mapswitch(Planet.PALMA, City.GOTHIC.getX(), City.GOTHIC.getY());
	}

	public static void flute() {
		PSMenu.startScene(Scene.VILLA, SpecialEntity.NONE);
		PSMenu.instance.waitB1();
		if(PSGame.hasFlag(Flags.INFO_FLUTE) && !PSGame.hasFlag(Flags.GOT_FLUTE)) {
			Item flute = getItem(OriginalItem.Inventory_Soothe_Flute);
			PSMenu.StextLast(getString("Chest_Item", "<item>", flute.getName()));
			if(getParty().checkForFullAndAddItem(flute)) {
				PSGame.setFlag(Flags.GOT_FLUTE);
			}
		}
		PSMenu.endScene();		
	}
	
	
}
