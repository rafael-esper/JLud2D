package demos.ps.maps;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import static demos.ps.oo.PSGame.*;
import static core.Script.*;
import domain.Entity;
import demos.ps.oo.City;
import demos.ps.oo.Dungeon;
import demos.ps.oo.PSGame;
import demos.ps.oo.Item;
import demos.ps.oo.PSMenu;
import demos.ps.oo.PSGame.Planet;
import demos.ps.oo.PSLibItem.OriginalItem;
import demos.ps.oo.PSMenu.*;

public class Spaceport1 {

	
	public static void camineet() {
		PSMenu.Stext(getString("Camineet_People_Cop_Pass"));
		mapswitch(Planet.PALMA,72,46);
	}
	
	public static void parolit() {
		PSMenu.Stext(getString("Parolit_People_Cop_Pass"));
		mapswitch(Planet.PALMA,70,48);
	}
	
	
	public static void food_shop() {
		PSMenu.startScene(Scene.SHOP_FOOD, EntityType.CITY_WMN_BLOND, EntityClothes.BLUE);
		Shop(getString("Shop_Pharmacy_Welcome"), false, new Item[]{	getItem(OriginalItem.Inventory_Monomate),
																		getItem(OriginalItem.Inventory_Dimate)});
		PSMenu.endScene();
	}

	public static void passport() {
		PSMenu.startScene(Scene.BLUE_HOUSE, EntityType.CITY_WMN_BLOND, EntityClothes.GREEN);

		if(PSMenu.Prompt(getString("Spaceport_Passport_Intro"), getYesNo()) == 1) {
			
			if(PSMenu.PromptNext(getString("Spaceport_Passport_Yes"), getYesNo()) == 1) {
				PSMenu.StextLast(getString("Spaceport_Passport_IllegalYes"));
			}
			else {
				
				if(PSMenu.PromptNext(getString("Spaceport_Passport_IllegalNo"), getYesNo()) == 1) {
					PSMenu.StextLast(getString("Spaceport_Passport_IllnessYes"));
				}
				else {
					if(PSMenu.PromptNext(getString("Spaceport_Passport_IllnessNo"), getYesNo()) == 1) {
						if(PSGame.getParty().mst >= 100) {
							PSMenu.StextLast(getString("Spaceport_Passport_PayYes"));
							PSGame.getParty().addQuestItem(getItem(OriginalItem.Quest_Passport));
							PSGame.getParty().mst-=100;
						} else {
							PSMenu.StextLast(getString("Spaceport_Passport_PayNoMesetas"));
						}
					}
					else {
						PSMenu.StextLast(getString("Spaceport_Passport_PayNo"));
					}
				}
			}
		}
		else {
			PSMenu.StextLast(getString("Spaceport_Passport_No"));	
		}
		
		PSMenu.endScene();
	}
	
	
	public static void manhole() {
		if(PSGame.hasFlag(Flags.GOT_NOAH)) {
			mapswitch(Dungeon.GOTHIC_PASSAGEWAY_IN);
		}
	}
	
	public static void robot_in() {
		EntStart();
		if(PSGame.hasFlag(Flags.GOT_HAPSBY)) {
			PSMenu.Stext(getString("Spaceport_People_Cop_Closed"));
			if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Passport))) {
				PSMenu.StextLast(getString("Spaceport_People_Cop_TakePassport"));
				PSGame.getParty().removeItem(getItem(OriginalItem.Quest_Passport));
			}
			EntFinish();
			return;
		}
		
		if(PSMenu.Prompt(getString("Spaceport_People_Cop"), getYesNo()) == 1) {
			if(PSGame.getParty().hasQuestItem(getItem(OriginalItem.Quest_Passport))) {
				PSMenu.StextLast(getString("Spaceport_People_Cop_Yes"));
				PSGame.warp(7,11, true);
				entities.get(player).setFace(Entity.SOUTH);
				screen.fadeIn(30, true);
			}
			else {
				PSMenu.StextLast(getString("Spaceport_People_Cop_YesLie"));	
			}
		}
		else {
			PSMenu.StextLast(getString("Spaceport_People_Cop_No"));			
		}
		EntFinish();		
	}	

	public static void robot_out() {
		EntStart();
		PSMenu.Stext(getString("Spaceport_People_Cop_Yes"));
		PSGame.warp(5,12, true);
		entities.get(player).setFace(Entity.SOUTH);
		screen.fadeIn(30, true);
		EntFinish();
	}	
	
	public static void spaceship() {
		PSMenu.startScene(Scene.SPACESHIP, EntityType.CITY_MAN_BLOND, EntityClothes.BLUE);
		if(PSMenu.Prompt(getString("Spaceport_Shuttle"), getYesNo()) == 1) {
			PSGame.spaceshipRoutineStart(City.CAMINEET, City.PASEO);
		}
		PSMenu.endScene(Outcome.FADE_HOUSE);
	}	
	
	public static void ent1() {
		EntStart();
		PSMenu.Stext(getString("Spaceport_People_Ent1"));
		EntFinish();
	}
	public static void ent2() {
		EntStart();
		PSMenu.Stext(getString("Spaceport_People_Ent2"));
		EntFinish();
	}
	public static void ent3() {
		EntStart();
		PSMenu.Stext(getString("Spaceport_People_Ent3"));
		EntFinish();
	}
	
	
	
}
